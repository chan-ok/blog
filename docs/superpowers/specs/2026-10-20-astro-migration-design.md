# Astro 기반 React·Vue·Svelte 블로그 전환 설계

- 작성일: 2026-10-20
- 상태: 사용자 승인 완료(2026-10-20), 구현 계획 작성
- 대상: `chan-ok/blog`, 별도 콘텐츠 저장소 `chan-ok/blog-content`

## 목적과 합의된 제약

전환의 주목적은 Markdown 콘텐츠 작성·관리 개선이다. 사용자는 별도
`blog-content` 저장소와 Obsidian 작성 방식을 유지하며, 최종적으로 콘텐츠 push가
Netlify 재빌드·배포로 이어지는 흐름을 원한다.

추가 요구사항은 Astro를 공통 기반으로 같은 블로그 전체를 React, Vue, Svelte로
각각 구현하고 URL로 구현체를 선택하는 것이다. 홈·글 목록·글 상세·소개 전체가
대상이며, 각 구현체의 헤더·푸터·언어 선택과 상호작용도 포함한다. 한 페이지에
세 구현체를 동시에 나란히 표시하는 기능은 이번 범위에 포함하지 않는다.

사용자의 추가 지시에 따라 **배포 연동은 가장 마지막에 설정**한다.
Netlify Build Hook, GitHub Actions의 비밀값과 서비스 설정은 사용자가 나중에
수동으로 입력한다. 현재 전환의 완료 조건에 실제 자동 배포 성공을 포함하지 않는다.

기존 디자인, 한국어·일본어 URL, 시스템 다크 모드, Markdown 표현과 공개 정책은
유지하는 것으로 설계한다. CMS, 검색, 댓글, 새 언어 및 디자인 개편은 범위 밖이다.

## 단계와 완료 범위

### 1단계: Astro 전환과 로컬 검증

- `blog`를 Astro 정적 사이트로 전환한다.
- 동일한 콘텐츠·디자인·기능을 가진 React·Vue·Svelte 전체 화면을 각각 구현한다.
- URL이 선택한 프레임워크로 화면을 서버 렌더링하고 필요한 클라이언트 런타임을 로딩한다.
- 개발과 로컬 프로덕션 빌드는 이미 체크아웃된 콘텐츠 디렉터리를 입력으로 받는다.
- Obsidian에서 글·메타데이터·이미지를 수정한 뒤 push 없이 미리본다.
- Astro에서 Markdown 수집, 메타데이터 검증, 목록·목차·상세 페이지 생성을 수행한다.
- 빌드 결과와 개발 화면, 공개 정책, 기존 URL 및 인터랙션을 검증한다.
- 운영 전환 전이므로 `blog-content`의 기존 인덱스 생성 스크립트와 Actions는 유지한다.
  기존 운영 React 사이트가 읽는 `index.json`을 먼저 없애지 않는다.
- Netlify 배포 설정, Build Hook 호출 workflow, 원격 콘텐츠 체크아웃 자동화는 변경하지 않는다.
  현재 SPA fallback 설정이 남아 있으므로 이 단계 결과를 운영 배포 준비 완료로 표현하지 않는다.

### 2단계: 마지막 배포 전환

1단계 검증 후 별도로 진행한다. 콘텐츠 커밋 고정 수집, 정적 사이트용 Netlify 설정,
콘텐츠 push에 따른 Build Hook 호출을 연결한다. 사용자는 필요한 설정값을 수동으로
입력하며, 비밀값을 채팅·브라우저 번들·저장소에 넣지 않는다.

새 사이트의 배포 검증을 마친 뒤 기존 인덱스 생성 자동화와 더 이상 쓰이지 않는
`index.json` 관리 단계를 제거한다. 전환 전까지 기존 운영 흐름을 유지한다.
이 문서는 해당 단계의 즉시 실행이나 외부 설정 변경을 승인하는 문서가 아니다.

## 애플리케이션 구조

Astro 파일 기반 라우팅과 정적 HTML 생성을 사용하고 공식 React·Vue·Svelte
통합을 설치한다. Node.js 24와 pnpm 11.18.0을 유지하며, Astro와 각 통합의 안정
버전·peer 의존성 호환성은 구현 시 공식 문서와 실제 설치로 확인한다.
React는 유지하고 Vue·Svelte를 추가한다. 전체 의존성을 무관하게 업그레이드하지 않는다.

Markdown은 **Astro 7의 기본 processor인 Sätteri**를 사용한다. 공식
`@astrojs/markdown-satteri` 통합을 기준으로 하며 별도의 unified 렌더러를 새로 만들지
않는다. Sätteri는 Rust로 파싱·컴파일하고 JavaScript의 mdast/hast 플러그인으로
확장한다. 기존 remark/rehype 플러그인은 그대로 호환된다고 가정하지 않고, 필요한
Obsidian·callout·URL 변환을 Sätteri 플러그인으로 이식하고 테스트한다.

Sätteri 전용 설정과 Astro 공통 Markdown 설정은 구분한다. `satteri()`에는
`SatteriProcessorOptions`의 플러그인·features만 전달하며, 코드 하이라이트 설정은
Astro의 `markdown.syntaxHighlight`·`markdown.shikiConfig`에 둔다. 문자열용
`createSatteriMarkdownProcessor()`에는 두 설정을 합쳐 전달한다. 단일 설정 객체를
두 API에 그대로 넣어 지원하지 않는 옵션이 무시되도록 하지 않는다.

공통 기능은 `features: { gfm: true, smartPunctuation: false }`로 고정한다.
따옴표·하이픈·말줄임표의 기존 표현을 보존하기 위한 선택이며, Astro의 smart
punctuation 기본 활성 동작에 의존하지 않는다. 하이라이트는 Shiki를 사용하고
`excludeLangs: ['math', 'mermaid']`를 양쪽 렌더러에 동일하게 적용한다.

### Astro 7 템플릿 기본 동작

`compressHTML: 'jsx'`를 명시하고 의미 있는 인라인 공백은 `.astro` 템플릿에서
`{' '}` 등으로 표현한다. Astro의 옵션이 React·Vue·Svelte 자체 템플릿의 공백
규칙까지 같게 만든다고 가정하지 않는다. 세 화면의 실제 텍스트·간격을 비교한다.

Astro 템플릿은 기본이자 유일한 Rust 컴파일러로 빌드한다. 제거된
`experimental.rustCompiler` 설정을 추가하지 않는다. non-void 태그를 닫고 유효한
HTML 중첩을 작성하며, 컴파일러나 브라우저의 자동 구조 보정에 기대지 않는다.
초기 HTML과 hydration 이후 DOM을 비교하고, CSS 직렬화 문자열 대신 실제 스타일을 검증한다.

### 구현 방식

화면 전체를 각 프레임워크의 페이지 컴포넌트로 구현하는 방식을 채택한다. Astro는
라우트·HTML 문서 head·콘텐츠 로딩·페이지 props 구성을 담당한다. 각 페이지의
헤더, 푸터, 홈, 목록, 상세, 소개와 상호작용은 선택한 프레임워크가 담당한다.

대안으로 Astro 화면에 일부 프레임워크 위젯만 배치하면 중복은 줄지만 전체 화면을
각각 구현한다는 목적에 맞지 않는다. 세 개의 독립 SPA를 구성하면 콘텐츠 처리와
라우팅·배포도 중복되므로 채택하지 않는다.

```text
src/
  pages/
    index.astro
    404.astro
    [locale]/
      index.astro
      about.astro
      posts/
        index.astro
        [...slug].astro
    [framework]/
      [locale]/
        index.astro
        about.astro
        posts/
          index.astro
          [...slug].astro
  layouts/
    DocumentLayout.astro
  components/
    FrameworkPage.astro
  frameworks/
    react/         # .tsx 페이지·레이아웃·표시 컴포넌트·상호작용
    vue/           # .vue 페이지·레이아웃·표시 컴포넌트·상호작용
    svelte/        # .svelte 페이지·레이아웃·표시 컴포넌트·상호작용
  content.config.ts
  lib/
    content/       # 외부 디렉터리 수집, 스키마, 경로·공개 정책, 이미지 처리
    markdown/      # 비실행 Markdown 변환과 확장 문법
    i18n/          # ko/ja 사전과 URL 생성
    presentation/  # 공통 페이지 데이터 계약, 경로 생성, 메타데이터
    browser/       # Clipboard, Mermaid 정화 등 프레임워크 독립 로직
  styles/          # 세 구현체가 공유하는 디자인 토큰과 스타일
```

TanStack Router 중심의 진입점과 locale provider를 Astro 라우트와 URL 기반 locale로
대체한다. 각 프레임워크 내부에 별도 SPA 라우터를 추가하지 않고 일반 링크로
페이지를 이동한다. React Compiler와 전역 상태 라이브러리는 실제 사용처를
확인하고 필요하지 않으면 제거한다.

같은 데이터를 각 구현체에서 임의로 재해석하지 않도록 직렬화 가능한 공통 페이지
모델을 정의한다. locale, 활성 메뉴, 내비게이션 링크, 목록, 글 메타데이터, 정화된
본문 HTML, 목차와 번역 문자열을 공통 계층에서 만든다. UI 컴포넌트·이벤트·상태와
수명 주기는 React hooks, Vue Composition API, Svelte의 반응성으로 각각 구현한다.
서로 다른 프레임워크의 UI 컴포넌트를 감싸서 같은 구현으로 취급하지 않는다.

Markdown 변환·정화, URL 생성, 날짜 표시 규칙, 공개 정책, 번역 사전과 CSS는
공유한다. 기존 React UI는 재사용 가능한 부분을 이관하며, Vue·Svelte 구현도
동일한 화면·접근성 계약을 따른다. 각 구현체의 루트를 정적 HTML로 렌더링한 뒤
hydrate하므로 JavaScript 없이도 본문과 링크를 읽을 수 있다. 선택하지 않은
프레임워크의 클라이언트 런타임을 함께 로딩하지 않는지 빌드·브라우저에서 검증한다.
기존 테스트를 정리할 때는 먼저 대응하는 대체 검증을 확보한다.

### 프레임워크 선택 URL

| 화면 | React | Vue | Svelte |
| --- | --- | --- | --- |
| 홈 | `/react/ko/` | `/vue/ko/` | `/svelte/ko/` |
| 글 목록 | `/react/ko/posts/` | `/vue/ko/posts/` | `/svelte/ko/posts/` |
| 글 상세 | `/react/ko/posts/<slug>/` | `/vue/ko/posts/<slug>/` | `/svelte/ko/posts/<slug>/` |
| 소개 | `/react/ko/about/` | `/vue/ko/about/` | `/svelte/ko/about/` |

`ja`에도 같은 경로 구성을 적용한다. UI 내 이동은 선택한 프레임워크와 locale을
유지한다. 언어를 바꿔도 프레임워크는 유지한다. 세 프레임워크로 바꾸는 링크를
헤더에 제공해 동일한 locale·화면·글 경로로 이동할 수 있게 한다. 변경 링크는
JavaScript가 없어도 동작하는 실제 URL이며 프레임워크 선택을 전역 저장소에 숨기지 않는다.

기존 `/ko`, `/ja`, `about`, `posts`와 상세 URL은 React 기본 화면으로 계속 제공한다.
기존 링크를 외부 배포 redirect 설정에 의존하지 않고 Astro 정적 페이지로 보존한다.
기존 경로에서 내부 탐색할 때도 prefix 없는 경로를 유지하고, 명시적 프레임워크
선택 때만 prefix 경로로 전환한다. 세 구현체의 같은 콘텐츠는 기존 prefix 없는
URL을 canonical로 사용하며, 현재 구현체의 주소는 실제 내비게이션 URL에 반영한다.
지원하지 않는 framework 값은 404로 처리한다. 성능 비교 대시보드나 측정 기능은 추가하지 않는다.

## 콘텐츠 수집과 작성 흐름

`BLOG_CONTENT_DIR`은 콘텐츠 루트를 가리키는 서버 전용 설정으로 둔다.
명시한 경로를 우선하고, 없으면 프로젝트 옆의 `../blog-content`를 사용한다.
기본 경로를 찾지 못하면 조용히 빈 사이트를 생성하지 않고 원인과 설정 방법을 알린다.
브라우저가 GitHub Raw의 인덱스나 글 본문을 가져오는 방식은 제거한다.

Astro Content Layer의 사용자 정의 loader가 `ko`, `ja` 아래 `.md`·`.mdx`를 직접
읽는다. 파일 내용은 동일한 비실행 Markdown 파이프라인으로 처리하며, `.mdx`를
Astro MDX 컴파일러에 넘겨 JSX·JavaScript를 실행하지 않는다. `en`, `index.json`,
Obsidian 설정, `.space` 등 숨김 디렉터리는 게시물로 수집하지 않는다.

파일의 확장자와 관계없이 본문 문자열을 Sätteri의 Markdown 경로로 전달한다.
문자열용 공식 `createSatteriMarkdownProcessor()`와 Astro의 Markdown 설정이 같은
플러그인·기능·하이라이트 값을 각 API의 설정 위치에 맞게 사용하도록 공통화한다.
MDX-to-JavaScript 컴파일·평가 경로는 사용하지 않는다.

frontmatter의 제목·날짜·태그·공개 여부·요약·썸네일·시리즈를 검증한다. 기존 파일을
일괄 변환하거나 새 필수 필드를 요구하지 않는다. `path`는 파일 위치에서 유도하므로
Obsidian에서 같은 정보를 중복 입력하지 않는다. 썸네일 명시값이 없으면 기존처럼
본문의 첫 지원 이미지를 사용한다. 메타데이터 오류와 URL 충돌은 파일명을 포함해
진단하고 빌드를 실패시킨다. 네트워크 오류를 빈 콘텐츠로 바꾸지 않는다.

개발 서버는 checkout 밖 콘텐츠 디렉터리의 추가·수정·삭제를 감지해 컬렉션과
렌더링 결과를 갱신한다. 단순 Vite 기본 감시에 기대지 않고 외부 경로 변경을 검증한다.
초안 미리보기는 개발 모드에서만 제공한다. 로컬 프로덕션 빌드에는 운영 공개 정책을 적용한다.

주된 갱신 경로는 공식 LoaderContext watcher·store API를 사용한다. 커스텀 이미지
integration에서 HMR 전송이 필요하면 Vite Environment API의
`server.environments.client.hot.send()`를 사용한다. `astro:build:setup` hook은
environment를 포함하는 한 호출로 처리하고 target별 호출이라고 가정하지 않는다.
파일 변경 후 HTTP 응답과 이미 열려 있는 브라우저 화면의 갱신을 모두 확인한다.

## URL과 공개 정책

- `/`는 `/ko`로 이동한다. `/ko`, `/ja`, 각 `about`, `posts` 경로를 유지한다.
- 글 경로는 기존과 같이 로케일 아래 상대 폴더를 보존하고, 파일 확장자를 제거하며,
  파일명 공백을 `_`로 바꾼다. Astro 기본 slug 정규화로 한글·대소문자·폴더를 변경하지 않는다.
- 코드에서 경로와 제목을 분리하며, 경로 충돌 시 한쪽을 조용히 덮어쓰지 않는다.
- 실제 checkout의 글 경로와 기존 인덱스를 비교해 링크 호환성을 검증한다.
- 운영에서는 `published: true`이고 정확히 `test`, `draft` 태그가 없는 글만 목록과
  상세 산출물에 포함한다. 제외된 글의 본문·메타데이터를 HTML·데이터 파일에 내보내지 않는다.
- 개발 목록은 `published: true`인 글을 표시하고, 개발 상세는 미발행 글도 허용한다.
- 지원하지 않는 locale과 존재하지 않는 글은 404로 처리한다.
- 홈 최근 글과 현재 목록 크기·정렬을 유지한다. 페이지네이션 등 새 기능은 추가하지 않는다.

## Markdown, 이미지와 상호작용

GFM 표·목록, 제목 앵커, 코드 하이라이트, 코드 복사, Obsidian 이미지와 callout,
Mermaid, 반응형 목차를 유지한다. 제목 앵커와 목차는 같은 렌더링 결과에서 생성한다.
언어·프레임워크 변경은 일반 링크로 제공하고, 해당 URL 축만 변경하는 공통 규칙을 사용한다.

글과 About의 초기 HTML에 본문·제목·canonical·OG 메타데이터가 포함되게 한다.
About은 기존 `chan-ok/chan-ok`의 로케일 README를 빌드/개발 서버에서 읽는 방식을
유지하되, 기존 요청 제한과 실패 진단을 보존한다. About 콘텐츠를 `blog-content`로
옮기는 별도 작업은 포함하지 않는다.

콘텐츠 저장소의 참조 이미지는 검증 후 사이트의 정적 자산 경로로 제공한다.
개발에서도 이미지 변경을 확인할 수 있게 한다. 콘텐츠 폴더 전체를 `public`에
노출하지 않는다. 글 원문, 초안, Git 메타데이터 및 Obsidian 설정을 복사하지 않는다.
허용된 외부 HTTPS 이미지는 기존 정책을 유지한다.

이미지 참조는 Obsidian 변환을 적용한 Markdown AST에서 먼저 수집한다. 파일·MIME·
공개 정책 검증과 비동기 자산 등록을 끝내고, 해당 문서만의 원본 경로→공개 자산 URL
맵을 만든다. 최종 렌더링의 Sätteri mdast 이미지 플러그인은 이 맵을 사용해 상대
이미지를 `/content-assets/...` 같은 공개 루트 URL로 바꾼다. 이 변환은 Astro 내부
이미지 수집·마커 생성보다 먼저 수행한다.

독립 문자열 렌더러에서 외부 이미지를 Astro 원격 최적화 대상으로 추가하지 않는다.
기존 정책에 맞는 외부 HTTPS 이미지는 검증한 URL로 유지한다. 내부 이미지 마커를
나중에 임의 복구하는 후처리는 사용하지 않는다. 최종 정화 전후의 실제 HTML 속성에
`__ASTRO_IMAGE_`가 남지 않았는지 검사하고, 발견되면 해당 문서를 명시해 빌드를 실패시킨다.
코드 블록·일반 텍스트에 이 이름을 설명하는 것까지 차단하지 않는다.
최종 HTML의 실제 `src`, alt와 이미지 응답을 검증한다.

Mermaid는 필요한 페이지에서만 로딩하고 strict 설정 및 SVG 정화를 보존한다.
Mermaid fence는 일반 Shiki 하이라이트에서 제외하고 전용 marker와 원문을 보존한다.
목차의 활성 항목과 펼침 상태, 코드 복사의 완료 상태 및 Mermaid의 초기화·정리는
각 프레임워크에서 구현하며 DOM 조작·중복 초기화가 서로 충돌하지 않게 한다.
외부 코드나 raw HTML을 신뢰하는 방식으로 렌더러를 단순화하지 않는다.

본문 HTML은 공통 빌드 파이프라인이 Markdown AST를 변환하고 좁은 허용 목록으로
정화한 결과만 전달한다. React의 HTML 삽입, Vue의 `v-html`, Svelte의 `{@html}`에
원문 Markdown이나 미검증 외부 HTML을 넣지 않는다. 세 삽입 지점은 동일한 정화
계약을 따르고 악성 링크·HTML·스크립트 회귀 테스트를 통과해야 한다. 각 프레임워크의
hydration 뒤에도 렌더링 결과와 안전성이 유지되는지 확인한다.
Sätteri가 생성한 HTML도 자동으로 안전하다고 간주하지 않으며 최종 정화는 유지한다.

## 오류와 보안 경계

- 파일 경로·이미지 경로가 콘텐츠 루트를 벗어나는 traversal 및 symlink 탈출을 차단한다.
- 기존 본문·frontmatter 크기 제한, YAML mapping·alias 제한과 URL 검증을 보존한다.
- raw HTML, MDX import/export와 실행 가능한 표현식을 평가하지 않는다.
- Markdown 링크·이미지 URL 및 최종 HTML/SVG의 허용 범위를 검증한다.
- 기존 보안 헤더를 완화하지 않는다. Astro 스크립트와 현재 CSP의 호환성은 확인하고,
  Netlify 설정의 최종 조정은 2단계에 기록한다.
- Chromium의 환경 프록시 CA 신뢰 문제는 별도 환경 제약이다. TLS 검증 비활성화로
  우회하거나, 외부 About·이미지 로딩을 확인하지 않은 상태에서 검증 완료라고 하지 않는다.

## 1단계 검증과 완료 기준

1. Astro·React·Vue·Svelte 각각을 포함하는 타입 검사, 관련 린트, 단위 테스트와
   통합 정적 빌드가 통과한다. `.vue`·`.svelte`를 검사 대상에서 누락하지 않는다.
2. 실제 `blog-content`를 읽어 세 프레임워크 × 두 locale의 홈·목록·소개와 공개 글
   HTML을 생성한다. 기존 prefix 없는 React 경로도 검증한다.
3. 대표 글의 기존 URL, 한글·공백·중첩 폴더 및 중복 slug 처리를 검증한다.
4. 운영 산출물에서 미발행·test·draft 글의 경로와 본문이 제외됨을 확인한다.
5. 개발에서 초안 직접 접근과 외부 디렉터리의 파일 추가·수정·삭제 및 이미지 갱신을 확인한다.
   실제 작성 파일을 훼손하지 않는 임시 콘텐츠 fixture도 사용한다.
6. Obsidian 이미지, callout, 표, 코드, Mermaid와 목차를 대표 콘텐츠로 검증한다.
7. 초기 HTML의 본문·메타데이터와 JavaScript 없이 읽을 수 있는 기본 탐색을 확인한다.
8. 세 프레임워크에 공통으로 적용하는 브라우저 테스트로 반응형 화면, locale·framework
   링크, 코드 복사, 목차와 Mermaid를 확인한다. 같은 입력의 콘텐츠·주요 화면이
   일치하고 hydration 오류와 불필요한 다른 프레임워크 런타임 요청이 없는지 검증한다.
   환경 문제로 막힌 검증은 통과와 구별해 보고한다.
9. 실제 개발·타입 검사·빌드 명령 및 콘텐츠 경로 설정을 문서화한다.
10. `blog-content`의 기존 운영 자동화와 외부 배포 설정이 유지되었음을 확인한다.
11. Astro와 독립 Sätteri 렌더러에 같은 비기본 설정을 적용해 옵션 무시가 없는지
    확인하고, 일반 코드 하이라이트·Mermaid·문장부호·heading 결과를 대조한다.
12. Obsidian 이미지의 정화 이후 HTML에 유효한 공개 `src`와 alt가 있고 내부 이미지
    마커·로컬 절대 경로가 없는지 확인한다. 실제 이미지 요청도 성공해야 한다.
13. 인라인 공백·문장부호·유효한 paragraph/figure 중첩을 초기 HTML과 hydration 이후
    DOM에서 검증한다. 파일 변경은 열려 있는 브라우저에서도 반영되어야 한다.

## 마지막 배포 단계의 인계 항목

- 콘텐츠 checkout 시 선택한 full SHA를 기록하고 한 빌드에서 글·이미지의 커밋을 일치시킨다.
- Netlify 빌드 입력, 정적 파일 출력, 404 처리와 SPA fallback 제거를 검증한다.
- 사용자가 Netlify Build Hook을 만들고 콘텐츠 저장소의 GitHub Actions secret으로 등록한다.
  구체적인 secret 이름과 호출 workflow는 해당 단계에서 함께 확정한다.
- 콘텐츠 push부터 실제 배포까지 확인한 뒤 기존 인덱스 생성 자동화를 제거한다.
- 수동 설정값 입력 전에는 자동 배포가 연결되었다고 주장하지 않는다.

## Markdown 기반 확인 근거

2026-10-20 공식 문서와 배포 패키지를 확인했다. Astro 공식 문서는 Astro 7부터
Sätteri가 기본 Markdown processor임을 명시하며, npm의 `astro@7.4.0`과
`astro@7.4.1`은 모두 `@astrojs/markdown-satteri@0.4.4`를 의존성으로 가진다.
이 확인은 라이브러리 선택의 근거이며 실제 프로젝트 설치·확장 호환성 검증을 뜻하지 않는다.

- [Astro Markdown processors](https://docs.astro.build/en/guides/markdown-content/#markdown-processors)
- [공식 Sätteri processor API](https://docs.astro.build/en/reference/markdown-processors/satteri/)
- [Sätteri 저장소](https://github.com/bruits/satteri)
- [Astro 7 업그레이드 가이드](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [문서 점검 및 보완 이력](../../reviews/2026-10-20-astro7-documentation-audit.md)
