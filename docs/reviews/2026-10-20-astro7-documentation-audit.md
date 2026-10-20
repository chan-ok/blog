# Astro 7 문서 전수 점검

- 점검일: 2026-10-20
- 저장소 기준 커밋: `f2cfc17`
- 대상: `/workspace/blog`, `/workspace/blog-content`의 Markdown·MDX 문서 32개
- 비교 기준: 공식 Astro 7/6 업그레이드 가이드, 현행 공식 API 문서, npm 배포본
  `astro@7.4.1`, `@astrojs/markdown-satteri@0.4.4`, `@astrojs/internal-helpers@0.13.0`
- 방법: 문서 전체의 관련 전제 검색, 활성 설계·계획의 API 대조, 배포 tarball의
  SHA-512 integrity 재검증 및 소스·타입 선언 확인. 제품 의존성 설치나 실행 검증은 포함하지 않는다.

## 결론

Astro 전환을 설명하는 활성 문서는 아래 두 개다. Sätteri 기본값 오인은 앞선
`f2cfc17`에서 이미 정정되어 이번 점검에서 미해결 항목으로 중복 집계하지 않았다.

- [전환 설계](../superpowers/specs/2026-10-20-astro-migration-design.md)
- [구현 계획](../superpowers/plans/2026-10-20-astro-multi-framework.md)

추가로 API 계약을 명확히 해야 할 사항 2개, Astro 7 기본 변경의 검증 누락 2개,
이전 버전에서 이어지는 호환성 보완 사항 3개를 찾았다. 아래 7항목 모두 현재 제품에서
재현한 버그라는 뜻은 아니다. 아직 구현 전인 계획의 모호함·검증 누락을 포함한다.
문서가 명시적으로 잘못된 기본값을 주장하는 경우와 단순 누락을 구분했다.

일반 README·개발 가이드는 현재 React/Vite 소스를 설명하고 있으므로, Astro 7과
다르다는 이유만으로 현재 문서 오류로 판단하지 않았다. 이 문서들의 전환 시 갱신
대상과 과거 기록은 뒤에 별도로 정리했다.

## A. 구현 전에 명확히 해야 하는 API 계약

### A1. 두 Sätteri API의 설정 타입을 하나로 취급할 수 있음

- 위치: 구현 계획 Task 3 Interfaces의 `createProcessorOptions()`와 Task 4 Step 3.
  점검 당시 계획 149행·199행.
- 현재 문구: `SatteriMarkdownProcessorOptions` 하나를 만들어 문자열 렌더러와
  `markdown.processor: satteri()`에 공통 설정으로 적용한다.
- 배포 API: `satteri()`는 `SatteriProcessorOptions`의 `mdastPlugins`,
  `hastPlugins`, `features`를 읽는다. 반면 `createSatteriMarkdownProcessor()`는
  여기에 `syntaxHighlight`, `shikiConfig` 등의 공통 Markdown 설정을 합친
  `SatteriMarkdownProcessorOptions`를 받는다.
- 영향: 반환값 전체를 그대로 `satteri()`에 넣는 방식으로 구현하면 코드 하이라이트
  설정 등이 무시되어 Astro 컬렉션과 문자열 렌더러의 출력이 달라질 수 있다.
  실제 코드가 아직 없으므로 현재 단계의 판단은 **API 경계의 모호함**이다.
- 수정 지침: 플러그인·features 설정과 공통 Markdown 설정을 분리한다.
  `satteri()`에는 전자만 전달하고 Astro의 `markdown`과 standalone renderer에
  공통 하이라이트 설정을 각각 적용한다. 새 구분을 함수 이름과 타입에 반영한다.
- 검증: 같은 본문에 대해 두 경로의 GFM, 문장부호, heading, 코드·Mermaid 출력이
  일치하는지 확인한다. 비기본 하이라이트 설정을 넣어 실제 적용 여부도 검증한다.
- 근거: [공식 Sätteri API](https://docs.astro.build/en/reference/markdown-processors/satteri/),
  배포본 `dist/processor.d.ts`, `dist/processor.js`, `dist/satteri-processor.d.ts`.

### A2. 문자열 렌더러의 이미지 마커를 일반 HTML로 간주하는 경계

- 위치: 구현 계획 Task 3 Interfaces·Step 3 및 Task 4 이미지 registry.
  점검 당시 계획 138~149행·160행·201행.
- 현재 문구: 공식 문자열 렌더러의 HTML을 공통 결과로 매핑하고, 자산 URL 변환과
  최종 정화를 수행해 세 프레임워크에 전달한다. Astro 내부 이미지 마커 처리는 명시하지 않았다.
- 배포 동작: `createSatteriMarkdownProcessor()`는 이미지 수집 뒤 내부
  `createImageMarkerPlugin()`을 실행한다. 수집된 상대 이미지 등은
  `__ASTRO_IMAGE_` 속성으로 바뀌며 원래 `src`와 일부 속성이 제거될 수 있다.
  해당 마커는 Astro의 후속 이미지 처리용이며 일반 React/Vue/Svelte HTML 삽입만으로
  완성된 이미지가 되지는 않는다.
- 영향: 렌더러의 `code`를 곧바로 정화하면 마커가 없어지고 `src`가 없는 이미지가
  남을 수 있다. 이미지를 나중에 `src`만 보고 변환하는 구현도 원본 경로를 찾지 못한다.
- 수정 지침: 안전한 vault 자산 URL을 이미지 수집·마커 생성 전에 매핑하는 방식이나,
  공식 이미지 metadata·마커의 후처리 방식을 선택해 명시한다. 단순 문자열 치환이나
  내부 마커를 무조건 신뢰하는 방식으로 보안 검증을 우회하지 않는다.
- 검증: 실제 `![[images/codingless3r.png]]`를 각 프레임워크 HTML로 렌더링했을 때
  유효한 공개 자산 `src`·alt가 남고, `__ASTRO_IMAGE_`와 로컬 절대 경로가 없어야 한다.
  정화 이후 결과와 이미지 HTTP 응답까지 확인한다.
- 근거: 배포본 `dist/satteri-processor.js`의 `createCollectImagesPlugin()`,
  `createImageMarkerPlugin()` 및 `render()`;
  [공식 처리기 소스](https://github.com/withastro/astro/blob/main/packages/markdown/satteri/src/satteri-processor.ts).

## B. Astro 7에서 새로 바뀐 기본값의 검증 누락

### B1. `compressHTML` 기본값이 `true`에서 `'jsx'`로 변경됨

- 위치: 설계의 동일 화면·디자인 유지 요구, 계획 Task 4 Astro 템플릿과 Task 7 화면 동등성 검증.
- 확인: 계획에 옛 기본값을 명시한 문장은 없지만 새 공백 처리 규칙과 검증도 없다.
- Astro 7 기본값: `.astro` 템플릿에서 인라인 요소 사이 개행이 공백으로 보존되지
  않을 수 있다. 공식 예제의 `<span>hello</span>` 다음 줄 `<em>world</em>`은
  `hello world` 대신 `helloworld`가 될 수 있다.
- 수정 지침: 새 기본값을 문서화하고 의미 있는 공백을 명시한다. 기존 동작을 위해
  `compressHTML: true`를 선택한다면 의도적인 호환성 설정임을 기록한다.
  Astro의 옵션이 Vue/Svelte 자체 템플릿의 공백 규칙까지 통일한다고 가정하지 않는다.
- 검증: Astro wrapper·404 및 프레임워크별 본문의 인라인 링크·강조·한국어/일본어
  문장 경계에서 실제 `textContent`와 시각적 간격을 확인한다.
- 근거: [Astro 7 공백 처리 변경](https://docs.astro.build/en/guides/upgrade-to/v7/#new-default-whitespace-handling-compresshtml-jsx),
  배포본 `dist/core/config/schemas/defaults.js`의 `compressHTML: "jsx"`.

### B2. Rust 컴파일러가 기본이자 유일한 컴파일러가 됨

- 위치: 계획 Task 4 `DocumentLayout.astro`·route·dispatcher 구현과 Task 7 hydration 검증.
- 확인: Go 컴파일러를 사용한다고 잘못 쓴 문장은 없지만 강화된 HTML 조건을 명시하지 않았다.
- Astro 7 변경: 닫히지 않은 non-void 태그는 오류가 되고, 잘못된 HTML 중첩을
  컴파일러가 재배치·자동 수정해 주지 않는다. CSS 직렬화 표현도 일부 달라질 수 있다.
- 수정 지침: 유효한 HTML 구조를 완료 조건으로 추가한다. Markdown의
  `<p><figure>…</figure></p>`와 코드 wrapper 등을 브라우저의 자동 보정에 맡기지 않는다.
- 검증: 컴파일 성공뿐 아니라 초기 HTML과 hydration 후 DOM 구조가 같은지 확인한다.
  닫는 태그·heading·paragraph/figure 중첩을 점검하고 CSS 색상·URL의 정확한 문자열
  일치 대신 실제 레이아웃·계산 스타일을 검사한다.
- 근거: [Astro 7 Rust 컴파일러](https://docs.astro.build/en/guides/upgrade-to/v7/#rust-compiler).

## C. Astro 7에도 적용되는 기존 기본값·API의 보완 사항

다음은 Astro 7에서 처음 생긴 변경이라고 보고하지 않는다. 기존 React/Vite 구현을
현행 Astro로 옮길 때 처리해야 하는 차이이며, 현재 계획에 정확한 조건이 빠져 있다.

### C1. 기본 smart punctuation과 기존 글 표현 보존의 관계

- 위치: 계획 Task 3 공통 Markdown 옵션과 기존 디자인·본문 보존 요구.
- 확인: Astro의 smart punctuation 기본값은 켜져 있다. 현재 React의
  `react-markdown` 설정에는 SmartyPants가 없다. Sätteri를 기본값으로 호출하면
  따옴표·`--`·`...` 등이 기존과 달라질 수 있다.
- 수정 지침: 현재 표현 보존을 위해 `features: { smartPunctuation: false }`를
  명시하는 방안을 계획에 고정한다. 반대로 활성화를 원한다면 의도적인 콘텐츠 표현
  변경으로 분리한다. deprecated `markdown.smartypants` 설정을 새로 도입하지 않는다.
- 검증: 직선 따옴표·하이픈·말줄임표·인라인 코드·코드 블록의 결과를 고정한다.
- 근거: [공식 smart punctuation 설명](https://docs.astro.build/en/guides/markdown-content/#smart-punctuation),
  `@astrojs/internal-helpers@0.13.0/dist/markdown.js`의 `smartypants: true`와
  `@astrojs/markdown-satteri@0.4.4`의 `features.smartPunctuation` 매핑.

### C2. Mermaid가 기본 하이라이트 제외 대상이라는 전제가 없음

- 위치: 계획 Task 3의 Shiki·Mermaid 처리와 Task 4 공통 Markdown 설정.
- 확인: 공식 배포본의 기본 `syntaxHighlight.excludeLangs`는 `['math']`다.
  계획은 Mermaid marker를 만들도록 하지만 Shiki 적용 순서와 제외 설정을 고정하지 않았다.
  문자열 렌더러는 사용자 HAST 플러그인보다 기본 하이라이트를 먼저 실행한다.
- 영향: Mermaid 코드 fence가 일반 하이라이트 대상으로 먼저 처리되면 원문 추출이나
  marker 판정이 달라질 수 있다. 모든 입력에서 실제 실패한다고 단정하지는 않는다.
- 수정 지침: `syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'mermaid'] }`를
  공통 설정에 명시하고 전용 Mermaid 처리를 수행한다.
- 검증: fence 원문과 Mermaid marker가 정화 뒤에도 유지되고 세 화면에서 다이어그램으로
  표시되어야 한다. 일반 코드 하이라이트와 코드 복사도 함께 확인한다.
- 근거: [공식 excludeLangs 설정](https://docs.astro.build/en/reference/configuration-reference/#markdownsyntaxhighlightexcludelangs),
  배포본 `dist/markdown.js`와 `dist/satteri-processor.js`의 플러그인 순서.

### C3. 커스텀 이미지 integration·HMR의 Vite Environment API 경계

- 위치: 계획 Task 4의 `src/integrations/content-assets.ts`와 Task 7 watcher 구현.
- 확인: watcher·store 사용은 현행 API와 맞는다. 다만 계획에 실제 HMR API와
  integration hook의 실행 단위를 지정하지 않아 옛 예제를 복사할 여지가 있다.
- Astro 6 이후 조건: `astro:build:setup`은 target별 여러 호출이 아니라 여러
  environment를 포함하는 한 호출을 받는다. HMR을 직접 전송한다면
  `server.hot.send()` 대신 `server.environments.client.hot.send()`를 사용한다.
- 수정 지침: 가능하면 공식 LoaderContext watcher·store 갱신 경로를 사용한다.
  추가 integration이 build/HMR API를 직접 쓰면 Environment API 기준을 명시한다.
- 검증: 글 추가·수정·삭제와 동일 경로 이미지 변경의 HTTP 결과뿐 아니라, 이미 열려
  있는 브라우저 화면도 자동 갱신되는지 확인한다. 중복 build 출력·listener도 확인한다.
- 근거: [Astro 6 integration·HMR 변경](https://docs.astro.build/en/guides/upgrade-to/v6/#changed-integration-hooks-and-hmr-access-patterns-integration-api),
  [현행 Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/).

## 확인했으며 오래된 사용 사례를 발견하지 않은 항목

| 사양 | 공식 기준 | 현재 문서 판정 |
| --- | --- | --- |
| Markdown 기본 engine | Astro 7 Sätteri, remark wrapper는 기본 설치에서 제외 | 앞선 정정 반영됨. remark/rehype 직접 호환을 가정하지 않음 |
| Vite | Astro 7은 Vite 8 | 계획의 Vite 8.3.4 호환성 확인 단계와 일치 |
| Node | 배포본 engines는 `>=22.22.0` | 프로젝트의 Node 24는 별도 지원 정책이며 오류 아님 |
| UI 통합·TypeScript | peer 조건을 만족해야 함 | Vue/Svelte checker와 TypeScript 6 조정이 이미 계획에 있음 |
| output·포트 | 기본 `static`, 개발 포트 4321 | 설계·계획과 일치. preview 4322는 명시적 지정 |
| Advanced routing | Astro 7 기본 활성, `src/fetch.ts` 예약 | 계획·현재 소스에 예약 파일 충돌 없음. 별도 fetch router 추가는 필요하지 않음 |
| 안정화된 설정 | `rustCompiler`, `queuedRendering`, `advancedRouting` 플래그 제거; logger/cache/routeRules는 최상위 | 해당 옛 experimental 설정을 문서에서 발견하지 않음 |
| Content Layer | custom loader와 `src/content.config.ts` 사용 가능 | 계획과 일치. `Astro.glob()`·legacy collections 사용 없음 |
| Zod | `astro/zod` 권장, `astro:content`의 z·`astro:schema`는 deprecated | 새 계획에 deprecated import 없음. 직접 `zod` 사용 자체는 오류 아님 |
| Loader schema | 동적 loader schema는 `createSchema()` 사용 | 제거된 `schema: async () => …` 예제 없음 |
| Container API | `.astro`는 Node 환경, renderer는 `/container-renderer` import | 옛 root import·jsdom Astro 렌더링 사용 지시 없음 |
| 제거 기능 | `@astrojs/db`, `<ViewTransitions />`, 옛 transition internals 등 | 활성 Astro 문서에 사용 지시 없음 |

## 별도로 보강하면 좋은 구현 경계

아래 항목은 기존 문서가 틀렸다고 판정하지 않았다. 이미 관련 검증 요구가 있거나
프로젝트가 선택한 정책이므로, 구현 시 다음 현행 사양을 함께 확인하면 된다.

- **경로 정규화:** Astro 6 이후 `Astro.url.pathname`과
  `new URL(Astro.request.url).pathname`의 인코딩 상태가 다를 수 있다. 계획의
  한 번만 encode/decode하는 원칙은 유지하되 raw 요청·params·파일 slug 경계를 명시한다.
  `getStaticPaths()`의 params는 문자열 또는 undefined이며 `slug: string[]`는
  내부 데이터형이다. catch-all params에는 join한 문자열을 넣는다.
- **환경 변수:** Astro 6 이후 `import.meta.env`는 항상 inline된다. 기존 `VITE_*`
  공개 설정을 그대로 복제하지 말고 `BLOG_CONTENT_DIR`은 서버 측 설정 경로에서 읽는다.
  계획에 이미 명시된 로컬 경로·원문·비공개 props 유출 방지 검증을 유지한다.
- **CSP:** `security.csp`는 Astro 6부터 안정 기능이고 기본은 false다. 이를 켰다는
  이유로 별도의 Netlify CSP header와 hydration script까지 자동 호환된다고 간주하지 않는다.
  공식 문서는 dev 모드에서 CSP 기능을 지원하지 않으므로 build/preview에서 검증하라고
  안내한다. 최종 배포 설정은 사용자의 지시대로 마지막에 수동 연결한다.
- **이미지 기본 서비스:** 기본 서비스는 sharp이며 SVG rasterization은 기본 비활성이다.
  계획의 사용자 정의 asset registry와 기본 image service를 같은 것으로 간주하지 않는다.
  SVG를 허용할 때의 정화·출력 정책을 실제 integration 구현과 맞춘다.

## 현재 React/Vite 문서의 전환 시 갱신 위치

아래 문서들은 아직 실제 소스와 맞는 현행 문서다. Astro 구현과 함께 갱신해야 하며
구현 전에 내용을 Astro로 바꾸어 현재 실행 명령을 잘못 안내하지 않는다.

| 문서 | 갱신할 내용 |
| --- | --- |
| [README](../../README.md) | React/Vite 스택, 5173 포트, VITE_GIT_RAW_URL, 원격 index.json 흐름 |
| [개발 가이드](../development.md) | Vite 실행·4173 browser server, tsgo, 원격 콘텐츠 설정, SPA 배포 설명 |
| [명령어](../commands.md) | Vite script·tsgo, Astro/Vue/Svelte checker와 새 실행 명령 |
| [아키텍처](../architecture.md) | FSD·TanStack 라우트, 브라우저 fetch, react-markdown, 배포 fallback |
| [아키텍처 규칙](../architecture-rules.md) | 새 디렉터리 책임·공통 데이터와 framework UI 간 의존성 |
| [에이전트 가이드](../agents.md) | 현재 스택·소스 위치·테스트·비실행 Markdown 기준 |
| [코드 스타일](../code-style.md) | React 전용 규칙·파일명, Vue/Svelte·Astro 파일 검사 |
| [안티패턴](../anti-patterns.md) | pages가 없다는 현행 설명·react-markdown 전용 설명 |
| [보안 가이드](../security.md) | 브라우저 원격 Markdown 경계에서 서버 수집·Sätteri·정화 경계로 갱신 |
| [콘텐츠 README](../../../blog-content/README.md) | 기존 인덱스 workflow는 최종 배포 전환 때 갱신. 현재 단계에서는 유지 |

회고·과거 설계·과거 구현 계획은 작성 시점의 기록이며 새 Astro 구현 지시로 해석하지
않는다. 해당 문서의 과거 사실을 Astro 7 기준으로 덮어쓰지 않는다. DESIGN.md는
디자인 정책, RTK.md는 도구 설명, 콘텐츠의 MDX 파일은 글 본문으로 구분했다.

## 점검 완료와 남은 작업

이 보고서는 변경이 필요한 위치와 수정 기준을 제시한다. 이번 점검에서 제품 코드나
기존 설계·계획의 본문은 수정하지 않았다. 구현 전에 A1·A2를 명확히 하고 B·C 항목을
검증 단계에 반영하면 된다. 실행 중의 호환성·브라우저 동작은 실제 구현 후 별도 검증해야 한다.

## 주요 공식 자료

- [Astro 7 업그레이드 가이드](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [Astro 6 업그레이드 가이드](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Astro 설정 레퍼런스](https://docs.astro.build/en/reference/configuration-reference/)
- [공식 Sätteri API](https://docs.astro.build/en/reference/markdown-processors/satteri/)
- [Astro 7.4.1 배포 metadata](https://registry.npmjs.org/astro/7.4.1)
- [Markdown Sätteri 0.4.4 배포 metadata](https://registry.npmjs.org/@astrojs%2fmarkdown-satteri/0.4.4)
