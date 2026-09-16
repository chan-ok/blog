# 개발 가이드

## 준비

지원 환경은 Node.js 24 LTS와 pnpm 11.18.0입니다. `.nvmrc`, `engines`, `packageManager`가 로컬과 배포 환경의 도구 버전을 고정합니다.

```bash
git clone https://github.com/chan-ok/blog.git
cd blog
pnpm install
```

`pnpm install`은 `prepare` script를 통해 프로젝트의 Husky 훅도 설정합니다. CI에서는 lockfile 변경을 막기 위해 `pnpm install --frozen-lockfile`을 사용하세요.

## 환경 변수

프로젝트 루트의 `.env.local`에 콘텐츠 기준 URL을 설정합니다.

```dotenv
VITE_GIT_RAW_URL=https://raw.githubusercontent.com/chan-ok/blog-content/main
```

일반 로컬 개발에는 이 값만 필요합니다.

`VITE_*` 변수는 클라이언트에 공개될 수 있습니다. 토큰, 비밀번호, 비공개 API 키를 넣거나 커밋하지 마세요.

## 실행

```bash
pnpm dev
```

기본 주소는 `http://localhost:5173`입니다.

```bash
pnpm build
pnpm preview
```

`preview`는 먼저 생성한 `dist`를 확인할 때 사용합니다.

## 개발 흐름

1. 실제 소스와 기존 테스트를 먼저 확인합니다.
2. 동작 변경은 실패하는 Vitest 또는 Playwright 테스트로 요구사항을 고정합니다.
3. 최소 구현 후 관련 테스트를 통과시킵니다.
4. `typecheck`, `lint:error`, `test:once`, `build`를 실행합니다.
5. `git diff`와 문서·설정 변경을 검토합니다.

테스트 파일은 프로젝트 안에 둡니다.

- 단위·통합 테스트: 대상 소스 옆 `src/**/*.test.ts(x)`
- 브라우저 테스트: `tests/browser/**/*.test.ts`

테스트 assertion은 Vitest의 `expect`를 사용합니다. 브라우저 상호작용과 viewport 검증은 Playwright의 `test`, `expect`로 작성합니다.

## 테스트

### Vitest

```bash
pnpm test
pnpm test:once
pnpm test:once src/features/post/util/post-visibility.test.ts
pnpm test:once -t "production"
```

현재 Vitest 프로젝트는 `src/**/*.{test,spec}.*`를 Node 환경에서 실행합니다.

### Playwright

최초 실행 환경에 Chromium이 없다면 한 번 설치합니다.

```bash
pnpm exec playwright install chromium
```

반응형 홈 테스트는 별도 package script를 두지 않고 현재 설정 파일로 실행합니다.

```bash
pnpm exec playwright test --config playwright.config.ts
```

Playwright가 `127.0.0.1:4173`에서 개발 서버를 시작하고 `tests/browser`를 실행합니다.

## 코드 품질

```bash
pnpm typecheck
pnpm lint
pnpm lint:error
pnpm lint:fix
pnpm fmt
```

- `typecheck`: TypeScript native preview(`tsgo`)로 emit 없이 검사
- `lint`: `src` 전체 oxlint 결과 출력
- `lint:error`: error만 출력하며 pre-push에서 사용
- `lint:fix`: 가능한 lint 문제 자동 수정
- `fmt`: `src`를 oxfmt로 수정

명령어 전체 목록은 [commands.md](./commands.md)를 참고하세요.

## Git 훅

현재 훅은 다음 작업만 수행합니다.

### pre-commit

1. `lint-staged`: staged JS·TS 파일에 oxfmt와 oxlint fix
2. `git diff --cached --check`: 공백 오류 검사

### pre-push

1. `pnpm typecheck`
2. `pnpm lint:error`
3. `pnpm test:once`
4. `pnpm audit --audit-level=low`
5. `pnpm build`

pre-commit에는 비밀정보 스캐너가 없습니다. 커밋 전 `.env*`, 토큰, 개인 정보를 직접 확인해야 합니다.

## 배포

Netlify 설정은 `pnpm build`를 실행하고 `dist`를 게시합니다. 모든 경로는 SPA 진입점인 `/index.html`로 fallback됩니다. 배포 전에 로컬에서 pre-push와 같은 검증을 통과시키세요.

## 문제 해결

- 포스트가 비어 있으면 `.env.local`의 `VITE_GIT_RAW_URL`과 원격 `index.json`을 확인합니다.
- 브라우저 테스트가 실행되지 않으면 `pnpm exec playwright install chromium` 후 다시 시도합니다.
- 의존성 상태가 의심되면 먼저 `pnpm install --frozen-lockfile`로 lockfile과 설치 결과를 맞춥니다.
- 다른 프로세스가 개발 포트를 사용 중이면 해당 프로세스를 확인하거나 Vite의 `--port` 옵션으로 다른 포트를 지정합니다.

## 관련 문서

- [아키텍처](./architecture.md)
- [보안](./security.md)
- [코드 스타일](./code-style.md)
- [Git 흐름](./git-flow.md)
