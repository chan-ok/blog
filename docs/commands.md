# 명령어 레퍼런스

```bash
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 4321
pnpm typecheck
pnpm lint:error
pnpm test:once
pnpm build
pnpm verify:build
pnpm preview --host 127.0.0.1 --port 4322
```

`typecheck`는 Astro checker → TypeScript → vue-tsc → svelte-check를 실행합니다. `test`는 Vitest watch, `test:once`는 네트워크·기존 dist 없이 실행 가능한 단위 테스트와 HTML validator 테스트입니다. `verify:build`는 반드시 방금 생성한 dist의 경로·공개 정책·canonical·이미지·HTML 중첩·서버 경로 부재를 검사합니다.

```bash
pnpm lint
pnpm lint:fix
pnpm fmt
pnpm fmt:check
pnpm audit --audit-level=low
pnpm peers check
```

`fmt`, `lint:fix`는 파일을 수정합니다. SFC 포맷은 Prettier와 Astro/Svelte 플러그인, 나머지 소스 포맷은 oxfmt가 담당합니다. 커버리지 provider는 설치되어 있지 않습니다.

```bash
pnpm exec playwright install chromium
pnpm exec playwright test --config playwright.config.ts
pnpm exec playwright test --config playwright.fixture.config.ts
```

첫 설정은 실제 vault의 페이지·반응형 화면·Mermaid 정화를 검사합니다. 두 번째는 테스트가 만든 임시 vault와 About 문서로 상호작용·비실행 Markdown·JavaScript 없는 탐색·프로덕션 런타임 분리·자동 갱신을 검사합니다. 실제 콘텐츠는 수정하지 않습니다. 설치된 브라우저는 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`으로 지정할 수 있습니다.

공유 캐시를 사용하는 개발 서버·타입 검사·빌드는 동시에 실행하지 않습니다. 브라우저 테스트는 자체 서버와 프로세스 종료를 관리합니다.

Husky pre-commit은 lint-staged와 diff 검사를, pre-push는 타입·린트·단위 테스트·전체 의존성 low 이상 audit·빌드를 실행합니다. 배포·push는 자동으로 수행하지 않습니다.
