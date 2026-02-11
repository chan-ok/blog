> 이 문서의 상위 문서: [agents.md](./agents.md)

# Git Flow 가이드

## 브랜치 전략

```
main ← develop ← feature/[name]-[timestamp]
```

### main 브랜치

- 프로덕션 배포 브랜치
- 직접 수정 금지 (PR + 리뷰 필수)
- 직접 푸시 금지

### develop 브랜치

- 개발 통합 브랜치
- PR 권장
- feature 브랜치의 기준점

### feature 브랜치

- develop에서 생성
- 명명 규칙: `feature/[name]-[timestamp]`
- 예시: `feature/tag-filter-20260211-143000`
- 작업 완료 후 develop으로 PR 생성

## Worktree 기반 병렬 작업

master-orchestrator가 여러 에이전트를 병렬로 실행할 때, 각 에이전트는 격리된 worktree 환경에서 작업합니다.

### 프로세스

1. **feature branch 생성**: develop에서 feature 브랜치 생성
2. **Worktree 생성**: 각 에이전트용 worktree 생성 (`git worktree add`)
3. **독립 작업**: 에이전트가 worktree에서 독립적으로 작업 후 commit
4. **Merge**: feature branch로 merge (`--no-ff`)
5. **PR 생성**: develop으로 PR 생성
6. **정리**: worktree 정리 (`git worktree remove` + `git branch -D`)

### 장점

- 병렬 안전성 보장 (각 에이전트가 독립된 작업 디렉토리 사용)
- Git 충돌 방지
- 작업 완료 후 자동 정리

## 커밋 규칙

커밋 메시지 형식 및 언어 규칙은 [language-rules.md](./language-rules.md)를 참조하세요.
