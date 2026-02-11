> 이 문서의 상위 문서: [agents.md](./agents.md)

# 명령어

## 개발 서버

```bash
pnpm dev              # Vite 개발 서버 (localhost:5173)
pnpm dev:server       # Netlify Functions와 함께 시작 (localhost:8888)
pnpm build            # 프로덕션 빌드
pnpm preview          # 프로덕션 빌드 미리보기
```

## 린트/포맷팅

```bash
pnpm lint             # ESLint 실행
pnpm fmt              # Prettier 포맷팅
pnpm tsc --noEmit     # TypeScript 타입 체크
```

## 테스트 ⭐

```bash
# 전체 테스트
pnpm test             # Vitest (Watch 모드)
pnpm test run         # Vitest (1회 실행, CLI 옵션)
pnpm coverage         # 커버리지 리포트

# 단일 파일 테스트
pnpm test button.test.tsx

# 이름 필터
pnpm test -t "다크 모드"
pnpm test -t "클릭 시 onClick 호출"

# 프로젝트 필터
pnpm test --project=unit
pnpm test --project=storybook
```

## E2E 테스트

```bash
pnpm e2e              # Playwright E2E 테스트
pnpm e2e:ui           # Playwright E2E 테스트 (UI 모드)
```

## Storybook

```bash
pnpm storybook        # Storybook 개발 서버 (localhost:6006)
pnpm build-storybook  # Storybook 빌드
```
