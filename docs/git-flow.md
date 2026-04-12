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

## PR 규칙

- feature 브랜치 → **develop** 으로 PR
- develop / hotfix 브랜치 → **main** 으로 PR
- feature에서 main으로 직접 PR 금지
- 브랜치에 이미 PR이 있으면 push만 하고 새 PR 생성 금지

## 커밋 규칙

커밋 메시지 형식 및 언어 규칙은 [language-rules.md](./language-rules.md)를 참조하세요.
