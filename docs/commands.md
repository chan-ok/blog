# 명령어 레퍼런스

현재 개발과 검증에 사용하는 명령을 정리합니다.

## 개발과 빌드

```bash
pnpm dev          # Vite 개발 서버
pnpm build        # 프로덕션 빌드
pnpm preview      # dist 미리보기
```

## 타입·린트·포맷

```bash
pnpm typecheck    # tsgo -p . --noEmit
pnpm lint         # oxlint src
pnpm lint:error   # oxlint --quiet src
pnpm lint:fix     # oxlint --fix src
pnpm fmt          # oxfmt src
```

`fmt`와 `lint:fix`는 파일을 수정할 수 있습니다.

## Vitest

```bash
pnpm test
pnpm test:once
pnpm test:once src/entities/markdown/util/get-markdown.test.ts
pnpm test:once -t "production"
```

`test`는 watch 모드, `test:once`는 1회 실행입니다. 현재 unit project는 `src` 아래의 `*.test.*`, `*.spec.*`를 Node 환경에서 찾습니다.

커버리지 provider는 현재 설치되어 있지 않습니다. 필요할 때 `@vitest/coverage-v8` 또는 `@vitest/coverage-istanbul`을 명시적으로 추가한 뒤 별도 스크립트를 구성합니다.

## Playwright

브라우저 binary가 없는 환경에서는 먼저 설치합니다.

```bash
pnpm exec playwright install chromium
```

프로젝트 내 반응형 브라우저 테스트 실행:

```bash
pnpm exec playwright test --config playwright.config.ts
```

현재 Playwright용 package script는 없습니다. `tests/browser`의 테스트와 루트 설정 파일을 직접 실행합니다.

## 설치와 감사

```bash
pnpm install
pnpm install --frozen-lockfile
pnpm audit --audit-level=low
```

## Git 훅이 실행하는 명령

- pre-commit: `pnpm exec lint-staged`, `git diff --cached --check`
- pre-push: `typecheck`, `lint:error`, `test:once`, 전체 의존성 low 이상 audit, `build`

설정과 사용 맥락은 [development.md](./development.md)를 참고하세요.
