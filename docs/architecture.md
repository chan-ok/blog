# 아키텍처

Astro 7이 파일 라우팅·콘텐츠 수집·정적 HTML과 SEO head를 생성합니다. 페이지는 구체적인 React, Vue, Svelte 컴포넌트 하나를 `client:load`로 hydrate합니다. 초기 HTML에 본문과 탐색 링크가 있어 JavaScript 없이도 읽을 수 있습니다.

```text
src/pages → layouts/DocumentLayout + components/FrameworkPage
                                      ↓
                           frameworks/{react,vue,svelte}
                                      ↓
                 lib/presentation (PageModel·URL·번역)
                                      ↓
          lib/content (vault·정책·자산) + lib/markdown (Sätteri)
```

`lib/browser`는 Mermaid의 strict 설정과 SVG 정화를 제공합니다. 코드 복사·목차·프로필 로딩 상태와 DOM 수명 주기는 각 UI 프레임워크가 직접 관리합니다. 세 UI는 공통 CSS와 직렬화 가능한 `PageModel`만 공유하며 서로의 컴포넌트를 import하지 않습니다.

`src/content.config.ts`의 custom loader가 외부 vault를 읽고 변경 시 Content Layer store를 갱신합니다. 공식 store 갱신으로 개발 브라우저가 자동 새로고침됩니다. `sourcePath`·원문은 서버에만 남고 선택한 글의 정화된 HTML과 공개 데이터만 island props에 들어갑니다.

문자열 렌더러와 Astro Markdown 설정은 `createSharedMarkdownOptions()`·`createSatteriOptions()`를 공유합니다. `@astrojs/markdown-satteri`의 공식 문자열 API와 Sätteri visitor를 사용합니다. Obsidian 이미지를 AST에서 수집·검증한 뒤 URL을 먼저 바꿔 Astro 내부 이미지 마커를 방지합니다. HAST lazy node는 `structuredClone()` 대신 공식 visitor mutation API로 다룹니다.

`src/integrations/content-assets.ts`는 검증된 참조 이미지의 해시 파일만 개발에서 제공하고 빌드 출력에 복사합니다. 전용 staging은 빌드 시작 시 비우므로 초안 미리보기 이미지가 운영 산출물에 섞이지 않습니다.

기존 `src/app`, TanStack Router, 원격 index 소비와 React Markdown 파이프라인은 제거했습니다. `src/shared/util`에는 재사용하는 URL·fetch 제한·문자 검증만 남습니다. 배포 자동화는 마지막 수동 단계입니다.
