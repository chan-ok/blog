# 아키텍처 규칙

- Astro 페이지가 `PageModel`을 만들고 `DocumentLayout`에서 head, `FrameworkPage`에서 해당 프레임워크의 전체 UI를 선택합니다.
- `frameworks/react`, `vue`, `svelte`는 서로 import하지 않습니다. 상태·이벤트·수명 주기는 각각의 공식 API로 구현합니다.
- 공통 콘텐츠·URL·번역·Markdown 정책은 `lib`에 둡니다. `lib`는 프레임워크 UI에 의존하지 않습니다.
- 파일 읽기·외부 fetch·Content Layer는 서버 전용입니다. 브라우저에는 vault 경로나 비공개 데이터가 들어가지 않아야 합니다.
- Markdown은 공식 Sätteri AST visitor로 변환하고 마지막 allowlist 정화를 거칩니다. `dangerouslySetInnerHTML`, `v-html`, `{@html}`은 그 결과만 받습니다.
- Markdown visitor는 네이티브 lazy node의 직렬화·복제에 의존하지 않습니다. 공식 context API로 수정합니다.
- 프레임워크·언어 전환은 실제 링크입니다. 공통 route helper가 slug와 나머지 URL 축을 유지합니다.
- 자산은 파일 경로·바이트 형식·크기를 검증한 뒤 digest URL로 제공합니다. 사용자 `public` 영역을 정리하지 않습니다.
- 새로운 SPA router나 브라우저 GitHub Raw 콘텐츠 수집을 추가하지 않습니다.
- 서버·타입 검사·빌드는 순서대로 실행합니다. 독립 프로세스는 별도 캐시와 출력을 사용합니다.

검증 명령은 [commands.md](commands.md), 테스트 책임은 [검증 대응표](reviews/2026-10-20-astro-implementation-validation.md)에 있습니다.
