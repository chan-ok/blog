> 이 문서의 상위 문서: [agents.md](./agents.md)

# 에이전트별 권한 분리 가이드

## 개요

보안 강화를 위해 각 에이전트의 역할에 맞게 권한을 분리하였습니다. 이를 통해:

- 최소 권한 원칙 (Principle of Least Privilege) 적용
- 에이전트별 명확한 책임 범위 정의
- 민감 정보 노출 및 데이터 손실 위험 최소화

## 권한 분리 원칙

### 1. master-orchestrator

**역할**: 조율자 (Orchestrator)
**책임**: 작업 분석 및 subagent 호출

**허용 권한**:

- ✅ Task tool (subagent 호출, `"*": "allow"`)
- ✅ 파일 읽기 (소스 코드, 문서, 설정 파일, `.env` 제외)
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ GitHub 읽기 (`gh pr view`, `gh pr checks`)
- ✅ 디렉토리 생성 (`mkdir .worktrees/*`)
- ✅ `sleep *`, `ls`, `wc`, `webfetch`

**제한 권한**:

- ❌ 파일 쓰기 (`write: { "*": "deny" }`)
- ❌ 파일 수정 (`edit: { "*": "deny" }`)
- ❌ 소스 코드 작성/수정 (feature-developer/test-specialist에 위임)
- ❌ Git 쓰기 작업 (git-guardian에 위임)
- ❌ GitHub 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 2. feature-developer

**역할**: 기능 개발자
**책임**: 새로운 기능 구현

**허용 권한**:

- ✅ 파일 읽기/쓰기/수정 (global 권한 따름)
- ✅ 테스트/린트/타입체크 실행 (`pnpm test`, `pnpm lint`, `pnpm tsc`, `pnpm coverage`)
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ GitHub 읽기 (`gh pr view`, `gh pr checks`)
- ✅ `ls`, `wc`
- ✅ 기타 bash 명령 (사용자 확인 필요, `"*": "ask"`)

**제한 권한**:

- ❌ git add/commit (git-guardian에 위임)
- ❌ 테스트 파일 작성 (test-specialist에 위임)
- ❌ 문서 수정 (doc-manager에 위임)
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ GitHub PR 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 3. test-specialist

**역할**: 테스트 엔지니어
**책임**: 테스트 코드 작성 및 검증

**허용 권한**:

- ✅ 파일 읽기/쓰기/수정 (global 권한 따름)
- ✅ 테스트/커버리지/린트/타입체크 실행 (`pnpm test`, `pnpm coverage`, `pnpm lint`, `pnpm tsc`)
- ✅ Storybook 실행 (`pnpm storybook`, `pnpm build-storybook`)
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ GitHub 읽기 (`gh pr view`, `gh pr checks`)
- ✅ `ls`, `wc`
- ✅ 기타 bash 명령 (사용자 확인 필요, `"*": "ask"`)

**제한 권한**:

- ❌ git add/commit (git-guardian에 위임)
- ❌ 소스 코드 수정 (feature-developer에 위임)
- ❌ 문서 수정 (doc-manager에 위임)
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ GitHub PR 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 4. lint-formatter

**역할**: 포맷팅 및 린트 전문가
**책임**: 코드 스타일 자동 수정 (동작 변경 없음)

**허용 권한**:

- ✅ 파일 읽기 (`"*": "allow"`, `.env/.env.*` 제외)
- ✅ 파일 수정 (Edit, 사용자 확인 필요): `src/**/*.ts`, `src/**/*.tsx`, `*.config.ts` (기본값 `"*": "deny"`, 허용 패턴만 ask)
- ✅ `pnpm fmt`, `pnpm lint`, `pnpm tsc` 실행
- ✅ Git 읽기 명령 (`git status`, `git diff`)
- ✅ `ls`, `wc`
- ✅ 기타 bash 명령 (사용자 확인 필요, `"*": "ask"`)

**제한 권한**:

- ❌ 파일 쓰기 (Write 금지, `"*": "deny"`, Edit만 허용)
- ❌ git add/commit (git-guardian에 위임)
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ .env 파일 접근

**중요**: lint-formatter는 **코드 동작을 변경하지 않고** 포맷팅과 린트 오류만 수정합니다.

### 5. doc-manager

**역할**: 문서 관리자
**책임**: 프로젝트 문서 및 에이전트 프롬프트(.agents/agents/\*.md)의 정확성과 최신성을 관리

**허용 권한**:

- ✅ 파일 읽기 (`"*": "allow"`, `.env/.env.*` 제외)
- ✅ 문서 파일 쓰기/수정 (`docs/**/*.md`, `.worktrees/**/docs/**/*.md`)
- ✅ 에이전트 프롬프트 쓰기/수정 (`.agents/agents/*.md`)
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ GitHub 읽기 (`gh pr view`, `gh pr checks`)
- ✅ 디렉토리 생성 (`mkdir docs/*`)
- ✅ `ls`, `wc`
- ✅ 기타 bash 명령 (사용자 확인 필요, `"*": "ask"`)

**제한 권한**:

- ❌ 소스 코드 쓰기/수정 (`write/edit: { "*": "deny" }`, 문서/에이전트 파일만 허용)
- ❌ git add/commit (git-guardian에 위임)
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ GitHub PR 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 6. git-guardian

**역할**: Git 워크플로우 관리자
**책임**: 안전한 Git 작업 수행

**허용 권한**:

- ✅ 파일 읽기 (`.env` 제외, `.git/config`, `.git/HEAD`, `.git/MERGE_HEAD` 허용)
- ✅ 모든 Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ Git fetch (`git fetch origin`, `git fetch --all`)
- ✅ Git config 읽기 (`git config --get *`)
- ✅ Git branch 생성/전환 (`git checkout -b *`, `git checkout develop`, `git checkout main`)
- ✅ 타임스탬프 브랜치 생성 (`TIMESTAMP=$(date +%Y%m%d-%H%M%S) && git checkout -b *`)
- ✅ Git add (사용자 확인 필요): `git add *`, `git add .`, `git add -A`, `git add src/**/*`, `git add docs/*.md`, `git add .agents/agents/*.md`, `git add *.config.ts`, `git add opencode.json`
- ✅ **git commit (사용자 확인 필요)**: `git commit -m *` — **유일하게 git commit이 가능한 에이전트**
- ✅ Git stash 관리 (`git stash`, `git stash pop`, `git stash list`)
- ✅ Git stash drop (사용자 확인 필요, `"ask"`)
- ✅ Git worktree 관리 (`git worktree add *`, `git worktree list`, `git worktree remove *` (ask))
- ✅ Git merge (사용자 확인 필요): `git merge --no-ff *`
- ✅ Git merge 중단 (`git merge --abort`)
- ✅ Git reset (`git reset HEAD *`)
- ✅ Git rm 캐시 (`git rm --cached .env*`, `git rm --cached node_modules/*`)
- ✅ `rm -f .git/index.lock` (잠금 파일 제거)
- ✅ `ls`
- ✅ **git push (사용자 확인 필요)**: `git push *` — **유일하게 git push가 가능한 에이전트** (global deny를 에이전트 레벨 override)

**제한 권한**:

- ❌ 파일 쓰기/수정 (읽기 전용, `write/edit: { "*": "deny" }`)
- ❌ git reset --hard (global deny)
- ❌ git rebase (global deny)
- ❌ git config 쓰기 (커밋 위조 방지)

**중요**: git-guardian은 **Git 작업 전용**이며, 파일 수정은 하지 않습니다. **git commit과 git push가 가능한 유일한 에이전트**입니다.

### 7. github-helper

**역할**: GitHub 통합 관리자
**책임**: PR, Issue, CI/CD 관리

**허용 권한**:

- ✅ 파일 읽기 (`"*": "allow"`, `.env/.env.*` 제외)
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ `ls`
- ✅ PR 관리: `gh pr create` (ask), `gh pr view`, `gh pr list`, `gh pr checks`, `gh pr comment` (ask), `gh pr merge` (ask)
- ✅ Issue 관리: `gh issue create` (ask), `gh issue view`, `gh issue list`
- ✅ CI/CD 모니터링: `gh run list`, `gh run view`
- ✅ GitHub API: `gh api repos/*/*/pulls/*/comments`

**제한 권한**:

- ❌ 파일 쓰기/수정 (읽기 전용, `write/edit: { "*": "deny" }`)
- ❌ Git add/commit (git-guardian에 위임)
- ❌ Git push (git-guardian에 위임)
- ❌ .env 파일 접근

**중요**: github-helper는 **GitHub 작업 전용**이며, 로컬 Git 작업은 git-guardian에 위임합니다.

### 8. tech-architect

**역할**: 기술 검증자 + 보안 감사관 (Read-only Validator)
**책임**: subagent 출력물의 품질/보안 검증 — FSD 아키텍처 준수, 코드 스타일, 요구사항 정확성, 오버엔지니어링 탐지, 보안 취약점 탐지 및 민감 정보 노출 방지, 의존성 취약점 검사

**허용 권한**:

- ✅ 파일 읽기 (`"*": "allow"`, `.env/.env.*` 제외)
- ✅ 린트/타입체크 실행 (`pnpm lint`, `pnpm tsc`)
- ✅ `pnpm audit`, `pnpm audit --json` 실행
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ Git 추가 읽기 (`git show *`, `git ls-tree -r HEAD --name-only`)
- ✅ GitHub 읽기 (`gh pr view`, `gh pr checks`)
- ✅ `ls`, `wc`
- ✅ 민감 정보 패턴 검색
- ✅ 기타 bash 명령 (사용자 확인 필요, `"*": "ask"`)

**제한 권한**:

- ❌ 모든 파일 쓰기 (`write: { "*": "deny" }`)
- ❌ 모든 파일 수정 (`edit: { "*": "deny" }`)
- ❌ Git add/commit (git-guardian에 위임)
- ❌ .env 파일 접근

**중요**: tech-architect는 **읽기 전용 검증** 모드로 동작하며, 코드 품질/보안 문제 발견 시 보고만 합니다.

### 9. retrospector

**역할**: 회고 분석가
**책임**: PR/커밋에 대한 회고 분석 — 잘된 점, 개선점 식별 및 에이전트 프롬프트 개선 제안

**허용 권한**:

- ✅ 파일 읽기 (`"*": "allow"`, `.env/.env.*` 제외)
- ✅ 회고 문서 쓰기/수정 (`docs/retrospective/*.md`)
- ✅ Git 읽기 명령 (`git status`, `git diff`, `git log`, `git branch --show-current`, `git branch --list`)
- ✅ Git 추가 읽기 (`git show *`)
- ✅ GitHub 읽기 (`gh pr view`, `gh pr checks`)
- ✅ `ls`, `wc`
- ✅ 기타 bash 명령 (사용자 확인 필요, `"*": "ask"`)

**제한 권한**:

- ❌ 기본 파일 쓰기/수정 (`write/edit: { "*": "deny" }`, `docs/retrospective/*.md`만 허용)
- ❌ Git add/commit (git-guardian에 위임)
- ❌ .env 파일 접근

**중요**: retrospector는 **회고 분석 전용**이며, `docs/retrospective/*.md` 경로에만 문서를 작성할 수 있습니다.

## 권한 매트릭스

| 권한                   | master | feature-dev | test-spec | lint-fmt | doc-mgr | git-guard | github   | tech-arch | retro |
| ---------------------- | ------ | ----------- | --------- | -------- | ------- | --------- | -------- | --------- | ----- |
| **파일 작업**          |
| 소스 코드 읽기         | ✅     | ✅          | ✅        | ✅       | ✅      | ✅        | ✅       | ✅        | ✅    |
| 소스 코드 쓰기         | ❌     | ✅          | ✅        | ❌       | ❌      | ❌        | ❌       | ❌        | ❌    |
| 소스 코드 수정 (Edit)  | ❌     | ✅          | ✅        | ✅ (ask) | ❌      | ❌        | ❌       | ❌        | ❌    |
| 문서 쓰기/수정         | ❌     | ❌          | ❌        | ❌       | ✅      | ❌        | ❌       | ❌        | ❌    |
| 회고 문서 쓰기/수정    | ❌     | ❌          | ❌        | ❌       | ❌      | ❌        | ❌       | ❌        | ✅    |
| 에이전트 프롬프트 쓰기 | ❌     | ❌          | ❌        | ❌       | ✅      | ❌        | ❌       | ❌        | ❌    |
| .env 읽기              | ❌     | ❌          | ❌        | ❌       | ❌      | ❌        | ❌       | ❌        | ❌    |
| **테스트/빌드**        |
| pnpm test/coverage     | ❌     | ✅          | ✅        | ❌       | ❌      | ❌        | ❌       | ❌        | ❌    |
| pnpm fmt               | ❌     | ❌          | ❌        | ✅       | ❌      | ❌        | ❌       | ❌        | ❌    |
| pnpm lint/tsc          | ❌     | ✅          | ✅        | ✅       | ❌      | ❌        | ❌       | ✅        | ❌    |
| pnpm audit             | ❌     | ❌          | ❌        | ❌       | ❌      | ❌        | ❌       | ✅        | ❌    |
| pnpm storybook         | ❌     | ❌          | ✅        | ❌       | ❌      | ❌        | ❌       | ❌        | ❌    |
| **Git 읽기**           |
| git status/diff        | ✅     | ✅          | ✅        | ✅       | ✅      | ✅        | ✅       | ✅        | ✅    |
| git log                | ✅     | ✅          | ✅        | ❌       | ✅      | ✅        | ✅       | ✅        | ✅    |
| git show               | ❌     | ❌          | ❌        | ❌       | ❌      | ❌        | ❌       | ✅        | ✅    |
| git ls-tree            | ❌     | ❌          | ❌        | ❌       | ❌      | ❌        | ❌       | ✅        | ❌    |
| **Git 쓰기**           |
| git add                | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅ (ask)  | ❌       | ❌        | ❌    |
| git commit             | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅ (ask)  | ❌       | ❌        | ❌    |
| git checkout           | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅        | ❌       | ❌        | ❌    |
| git merge              | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅ (ask)  | ❌       | ❌        | ❌    |
| git push               | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅ (ask)  | ❌       | ❌        | ❌    |
| git stash              | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅        | ❌       | ❌        | ❌    |
| git worktree           | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ✅        | ❌       | ❌        | ❌    |
| **GitHub**             |
| gh pr create           | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ❌        | ✅ (ask) | ❌        | ❌    |
| gh pr view/checks      | ✅     | ✅          | ✅        | ❌       | ✅       | ✅      | ❌        | ✅       | ✅        | ✅    |
| gh pr comment          | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ❌        | ✅ (ask) | ❌        | ❌    |
| gh pr merge            | ❌     | ❌          | ❌        | ❌       | ❌       | ❌      | ❌        | ✅ (ask) | ❌        | ❌    |
| **Task Tool**          |
| task \*                | ✅     | ❌          | ❌        | ❌       | ❌      | ❌        | ❌       | ❌        | ❌    |

## 워크플로우 예시

### 예시 1: 새로운 기능 개발

```
사용자: "다크 모드 버튼 컴포넌트를 만들어줘"
  ↓
master-orchestrator (조율)
  ├─ Task → feature-developer (컴포넌트 구현)
  ├─ Task → test-specialist (테스트 작성)
  ├─ Task → lint-formatter (코드 포맷팅) - 선택적
  ├─ Task → tech-architect (품질 + 보안 검증) - 선택적
  ├─ Task → doc-manager (문서 업데이트) - 필요시
  ├─ Task → git-guardian (커밋 생성)
  └─ Task → github-helper (PR 생성)
```

### 예시 2: Git 충돌 해결

```
사용자: "git 충돌이 발생했어"
  ↓
master-orchestrator (분석)
  ↓
Task → git-guardian (충돌 해결)
  ├─ git status (충돌 파일 확인)
  ├─ 사용자에게 해결 전략 제안
  ├─ git add . (사용자 확인 후)
  └─ git commit (merge 완료)
```

### 예시 3: PR 생성

```
사용자: "PR 만들어줘"
  ↓
master-orchestrator (조율)
  ↓
Task → github-helper (PR 생성)
  ├─ git log (커밋 분석)
  ├─ git diff develop...HEAD (변경사항 분석)
  └─ gh pr create (사용자 확인 후)
```

### 예시 4: 회고 분석

```
사용자: "최근 PR에 대해 회고해줘"
  ↓
master-orchestrator (조율)
  ↓
Task → retrospector (회고 분석)
  ├─ git log (커밋 이력 분석)
  ├─ git show (변경사항 상세 확인)
  ├─ gh pr view (PR 정보 확인)
  └─ docs/retrospective/*.md (회고 문서 작성)
```

## 보안 개선 사항

### 1. 데이터 손실 방지

- ❌ `rm *` 전역 차단 (파일 삭제 방지)
- ❌ `cp *` 전역 차단 (의도하지 않은 복사 방지)
- ❌ `mv *` 전역 차단 (의도하지 않은 이동 방지)
- ❌ `git branch -D` 차단 (강제 삭제 방지)
- ❌ `git checkout -- file` 차단 (변경사항 버림 방지)
- ❌ `git reset --hard` 전역 차단
- ❌ `git rebase` 전역 차단
- ✅ `git stash drop` git-guardian에서 사용자 확인 후 허용 (ask)

### 2. 데이터 변질 방지

- ❌ `git config user.email` 차단 (커밋 위조 방지)
- ❌ `echo *` 전역 차단 (파일 덮어쓰기 방지)
- ✅ `git config --get` 읽기만 허용
- ✅ Git add/commit은 사용자 확인 필요 (ask)
- ✅ git commit은 **git-guardian만** 가능 (global deny, 에이전트 레벨 override)

### 3. 민감 정보 노출 방지

- ❌ `.env`, `.env.*` 파일 접근 전역 차단 (`.env.example`은 허용)
- ❌ `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt` 파일 접근 차단
- ❌ `.ssh/**`, `id_rsa*`, `id_ed25519*` 접근 차단
- ❌ `.git/**`, `.idea/**`, `.vscode/**` 접근 차단
- ❌ `dist/**`, `node_modules/**`, `pnpm-lock.yaml` 접근 차단
- ✅ tech-architect가 민감 정보 탐지
- ✅ Git add 시 .env 파일 스테이징 방지

### 4. 실행 제한

- ❌ `pnpm exec *` 전역 차단 (임의 스크립트 실행 방지)
- ❌ `git push *` 전역 차단 (git-guardian만 에이전트 레벨 override로 허용, ask)
- ❌ `task` 전역 차단 (순환 호출 방지, master-orchestrator만 개별 override로 허용)
- ✅ `rm -f .git/index.lock`만 허용 (잠금 파일 제거)

### 5. 권한 분리

- ✅ 각 에이전트는 자신의 역할에 필요한 최소 권한만 보유
- ✅ master-orchestrator는 조율만, 실제 작업은 subagent에 위임
- ✅ git-guardian과 github-helper로 Git/GitHub 작업 분리
- ✅ git commit은 git-guardian만, git push도 git-guardian만 (ask)
- ✅ tech-architect와 retrospector는 읽기 전용 (각자 전문 영역의 쓰기만 허용)

## Global Permission (모든 에이전트 공통)

```json
{
  "permission": {
    "rm *": "deny",
    "cp *": "deny",
    "mv *": "deny",
    "echo *": "deny",
    "git add *": "deny",
    "git commit *": "deny",
    "git push *": "deny",
    "git reset --hard *": "deny",
    "git rebase *": "deny",
    "pnpm exec *": "deny",
    "task": "deny",
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow",
      "*.pem": "deny",
      "*.key": "deny",
      "*.p12": "deny",
      "*.pfx": "deny",
      "*.crt": "deny",
      ".ssh/**": "deny",
      "id_rsa*": "deny",
      "id_ed25519*": "deny",
      ".git/**": "deny",
      ".idea/**": "deny",
      ".vscode/**": "deny",
      "dist/**": "deny",
      "node_modules/**": "deny",
      "pnpm-lock.yaml": "deny",
      ".DS_Store": "deny",
      "Thumbs.db": "deny"
    }
  }
}
```

## 변경 이력

- **2026-02-12**: security-scanner를 tech-architect에 통합
  - security-scanner 에이전트 삭제 (5번 섹션 제거)
  - tech-architect에 보안 감사 역할 통합 (pnpm audit, git show, git ls-tree 권한 추가)
  - 권한 매트릭스에서 security 열 제거, tech-arch 열에 보안 권한 반영
  - 에이전트 수 10→9

- **2026-02-11**: 에이전트 권한 정비 4차 갱신
  - tech-architect (9번) 추가: 읽기 전용 검증 에이전트 (FSD 아키텍처, 코드 품질 검증)
  - retrospector (10번) 추가: 회고 분석 에이전트 (`docs/retrospective/*.md` 쓰기 허용)
  - doc-manager write/edit: `docs/*.md` → `docs/**/*.md`로 변경, `.worktrees/**/docs/**/*.md` 추가
  - 권한 매트릭스에 tech-arch, retro 열 추가
  - 워크플로우 예시에 tech-architect, retrospector 추가
  - 보안 섹션에 tech-architect/retrospector 권한 분리 설명 추가

- **2026-02-11**: 에이전트 권한 정비 3차 갱신
  - git-guardian git push: global deny → 에이전트 레벨 override (ask)
  - Global Permission JSON에 `"git add *": "deny"` 추가 (opencode.json 반영)
  - 권한 매트릭스 git push 열 수정 (git-guardian: ❌ → ✅ (ask))
  - 보안 섹션 git push/commit 설명 수정
  - github-helper 제한 권한에 git push 분리 명시

- **2026-02-11**: 에이전트 권한 정비 2차 갱신
  - git add: git-guardian 전용으로 통합 (다른 에이전트에서 제거)
  - pnpm test/lint/tsc/fmt: 전문 에이전트만 보유 (orchestrator/git-guardian/github-helper에서 제거)
  - mkdir docs/\*: master-orchestrator → doc-manager 이관
  - lint-formatter edit에 "\*": "deny" 기본값 추가
  - security-scanner에서 pnpm-lock.yaml 허용 제거
  - doc-manager에 mkdir docs/\*, git branch --list, gh pr checks 추가
  - github-helper에 git branch --list 추가
  - global permission에서 git add 관련 5개 항목 삭제
  - 권한 매트릭스 전면 재검증

- **2026-02-11**: opencode.json 기준 전면 갱신
  - feature-developer 복제본(a/b/c) 제거 → 단일 에이전트로 변경
  - git commit 권한 정리 (git-guardian만 보유)
  - git push 권한 정리 (global deny, 어떤 에이전트도 불가)
  - master-orchestrator write/edit deny 반영
  - git-guardian에 pnpm test/lint/tsc/fmt, rm -f .git/index.lock 등 추가
  - github-helper에 pnpm test/lint/tsc/fmt, gh pr comment 추가
  - Global Permission에 cp/mv/echo/pnpm exec deny, 민감 파일 패턴 추가
  - 권한 매트릭스 opencode.json 기준 전면 재작성

- **2026-02-09**: opencode.json 기준으로 갱신
  - doc-validator → doc-manager로 명칭 변경
  - lint-formatter 에이전트 추가
  - 에이전트 프롬프트 관리 권한 명시 (.agents/agents/\*.md)
  - 권한 매트릭스에 lint-formatter 열 추가
  - 실제 opencode.json 권한 설정 반영
  - master-orchestrator의 Git 읽기 명령 권한 추가
  - 워크플로우 예시에 lint-formatter와 doc-manager 추가

- **2026-02-08**: 초안 작성 - 에이전트별 권한 분리 완료
  - master-orchestrator: Git/코드 수정 권한 제거
  - feature-developer: 소스 코드 작성 권한 추가
  - test-specialist: 테스트 파일 작성 권한 추가
  - security-scanner: 읽기 전용 보안 검증 권한 추가
  - doc-manager: 문서 작성 권한 추가
  - git-guardian: Git 워크플로우 관리 권한 추가
  - github-helper: GitHub 통합 권한 추가

## 참고 문서

- [코딩 가이드](./agents.md)
- [opencode.json 설정 파일](../opencode.json)
