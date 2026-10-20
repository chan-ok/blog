# Chanho's Dev Blog

Astro 7과 Sätteri를 기반으로 한국어·일본어 블로그를 React 19, Vue 3, Svelte 5로 각각 구현합니다. 콘텐츠는 별도 [blog-content](https://github.com/chan-ok/blog-content) 저장소에서 Obsidian으로 작성합니다.

## 시작하기

Node.js 24와 pnpm 11.18.0을 사용합니다. 두 저장소를 나란히 둡니다.

```bash
git clone https://github.com/chan-ok/blog.git
git clone https://github.com/chan-ok/blog-content.git
cd blog
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 4321
```

다른 콘텐츠 위치는 `BLOG_CONTENT_DIR=/absolute/path/to/vault pnpm dev`로 지정합니다. `VITE_GIT_RAW_URL`과 인덱스 생성은 필요하지 않습니다.

| 화면 | React | Vue | Svelte |
| --- | --- | --- | --- |
| 홈 | `/react/ko/` | `/vue/ko/` | `/svelte/ko/` |
| 글 목록 | `/react/ko/posts/` | `/vue/ko/posts/` | `/svelte/ko/posts/` |
| 글 상세 | `/react/ko/posts/<slug>/` | `/vue/ko/posts/<slug>/` | `/svelte/ko/posts/<slug>/` |
| 소개 | `/react/ko/about/` | `/vue/ko/about/` | `/svelte/ko/about/` |

`ja`도 같은 구조입니다. 기존 `/ko`, `/ja` 경로는 React 별칭으로 유지하며 모든 구현의 canonical은 기존 주소를 사용합니다. 프레임워크와 언어 링크는 현재 글 경로를 유지합니다. 번역이 없는 글은 404입니다.

## 콘텐츠와 미리보기

- `blog-content/ko`, `ja`의 `.md`, `.mdx`를 읽습니다. MDX JavaScript·JSX와 raw HTML은 실행하지 않습니다.
- YAML frontmatter, GFM, Shiki 코드 하이라이트·복사, Obsidian 이미지, callout, Mermaid와 목차를 지원합니다.
- 개발에서는 미발행 상세도 확인할 수 있습니다. 목록에는 `published: true`인 글을 표시합니다.
- 프로덕션에서는 `published: true`이고 정확히 `test`, `draft` 태그가 없는 글만 생성합니다.
- Obsidian의 추가·수정·삭제와 이미지 교체가 열린 개발 화면에 자동 반영됩니다.
- 참조 이미지만 MIME·경로를 검증해 `/content-assets/<digest>.<ext>`로 출력합니다. 전체 vault를 공개하지 않습니다.

## 검증

```bash
pnpm typecheck
pnpm lint:error
pnpm test:once
pnpm build
pnpm verify:build
pnpm exec playwright test --config playwright.config.ts
pnpm exec playwright test --config playwright.fixture.config.ts
```

브라우저는 `pnpm exec playwright install chromium`으로 준비하거나 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`로 설치된 Chromium을 지정합니다. 개발 서버·빌드·타입 검사는 공유 Astro 캐시를 변경하므로 순서대로 실행합니다.

## 문서와 배포 상태

[개발](docs/development.md) · [구조](docs/architecture.md) · [명령어](docs/commands.md) · [보안](docs/security.md) · [검증 대응표](docs/reviews/2026-10-20-astro-implementation-validation.md)

배포 연결은 보류했습니다. 기존 `netlify.toml`, 콘텐츠 push Actions와 Build Hook을 변경하지 않았습니다. 마지막 배포 단계에서 콘텐츠 커밋 고정·checkout, SPA fallback 제거, Astro 인라인 부트스트랩에 맞는 CSP와 수동 설정값을 함께 적용해야 합니다. 현재 설정으로 바로 운영 배포하지 않습니다.
