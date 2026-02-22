# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## beads 사용 규칙

### LOCK 재시도 규칙

beads는 내부적으로 Dolt DB를 사용하며, 동시 접근 시 LOCK 충돌로 `panic: nil pointer dereference` 오류가 발생할 수 있습니다.

> 🚨 **LOCK 파일은 어떤 상황에서도 절대 수동 삭제하지 마세요.**
> stale LOCK처럼 보여도, 다른 프로세스가 사용 중일 수 있습니다.
> **`find ... | xargs rm -f` 패턴은 영구 금지입니다.**
>
> LOCK은 반드시 자동으로 해제됩니다. **재시도(최대 10회)만으로 충분합니다.**
> bd 명령이 응답하지 않는 것처럼 보여도 이것은 **정상 동작**입니다. 기다리세요.

**오류 발생 시 반드시 이 패턴으로 재시도 (최대 10회 / 2초 간격):**

```bash
for i in $(seq 1 10); do
  sleep 2
  bd <명령어>
  # panic/nil pointer 오류가 없으면 break
  break
done
```

### 단일 명령어 원칙

**`|`, `&&`, `;`으로 명령어를 연결하지 마세요.** 한 번에 1개의 명령어만 실행합니다.

```bash
# ✅ 올바른 방법 — 명령어 1개씩 순차 실행
bd list
bd show blog-abc123
bd close blog-abc123

# ❌ 금지 — 파이프/체이닝 사용
bd list | grep blog
find .beads -name "LOCK" | xargs rm -f
bd show blog-abc123 && bd close blog-abc123
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
