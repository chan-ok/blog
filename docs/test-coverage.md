# 테스트 커버리지 현황

> 마지막 업데이트: 2026-03-10
> 총 테스트 파일: 46개 (E2E 2 + Unit/Component/Integration 44)

---

## 목차

1. [요약](#1-요약)
2. [E2E 테스트](#2-e2e-테스트)
3. [shared 레이어](#3-shared-레이어-5-shared)
4. [entities 레이어](#4-entities-레이어-1-entities)
5. [features 레이어](#5-features-레이어-2-features)
6. [widgets 레이어](#6-widgets-레이어-3-widgets)
7. [pages 레이어](#7-pages-레이어-4-pages)
8. [테스트 도구 및 패턴](#8-테스트-도구-및-패턴)

---

## 1. 요약

### 레이어별 파일 수

| 레이어 | 파일 수 |
| --- | --- |
| E2E | 2 |
| 5-shared | 8 |
| 1-entities | 12 |
| 2-features | 12 |
| 3-widgets | 2 |
| 4-pages | 8 |
| **합계** | **46** |

### 테스트 단위별 분포

| 단위 | 설명 | 주요 파일 |
| --- | --- | --- |
| Unit | 함수/훅 단독 검증 | sanitize, reading-time, extract-excerpt |
| Component | React 컴포넌트 렌더링/동작 | button, link, post-card, header |
| Integration | 모듈 간 상호작용 | get-markdown, mail-handler |
| E2E | 전체 사용자 플로우 | critical-paths, font-verification |
| Property-Based | 임의 입력 불변성 검증 | 대부분의 파일에 혼합 포함 (~45개 property) |

---

## 2. E2E 테스트

### `e2e/critical-paths.spec.ts`

**도구**: Playwright
**목적**: 주요 사용자 플로우 검증

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 홈 페이지 렌더링 (ko/en/ja) | 각 언어 URL 방문 | 메인 콘텐츠, 헤더, 푸터 렌더링 |
| About 페이지 | `/ko/about` 방문 | `<h2>` 헤딩 렌더링 |
| 포스트 목록 → 상세 | 첫 번째 포스트 클릭 | URL `/ko/posts/:id` 변경, MDX 렌더링 |
| 네비게이션 (Home → About/Posts/Contact) | 각 링크 클릭 | URL 변경 + 페이지 콘텐츠 렌더링 |
| 테마 전환 | 테마 토글 버튼 클릭 | aria-label 토글 확인 |
| 언어 전환 (ko → en → ja) | 언어 선택 메뉴 사용 | 새 언어 URL 확인 |

---

### `e2e/font-verification.spec.ts`

**도구**: Playwright
**목적**: 웹폰트 로드 및 적용 검증

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 한국어 폰트 | `/ko/` 방문 | Noto Sans KR 폰트 패밀리 적용 |
| 영어 폰트 | `/en/` 방문 | Inter 폰트 패밀리 적용 |
| 일본어 폰트 | `/ja/` 방문 | Noto Sans JP 폰트 패밀리 적용 |
| Google Fonts 리소스 로드 | 네트워크 요청 감지 | fonts.googleapis.com, fonts.gstatic.com 요청 확인 |

---

## 3. shared 레이어 (5-shared)

### `src/5-shared/util/sanitize.test.ts`

**단위**: Unit + Property-Based
**대상**: `sanitizeInput` (XSS 방지 입력값 소독)
**연관**: `contact-form.schema.ts`, `ContactForm` 컴포넌트

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| HTML 태그 제거 (Property) | script/img/div/style 태그 포함 임의 문자열 | HTML 태그 전부 제거 확인 |
| 안전한 콘텐츠 보존 (Property) | 알파벳·숫자·공백·구두점만 포함된 문자열 | 입력값 변경 없음 |
| 유니코드 보존 (Property) | 한글·일본어·이모지 포함 | 특수문자 외 문자 보존 |
| 멱등성 (Property) | 임의 문자열 | `sanitize(x) === sanitize(sanitize(x))` |

---

### `src/5-shared/util/build-meta.test.ts`

**단위**: Unit + Property-Based
**대상**: `buildMeta`, `buildCanonicalLink`, `getHomeDescription` 등 SEO 메타태그 생성 함수
**연관**: 각 페이지 라우트 (head 설정)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 기본 메타태그 생성 | title, description 입력 | og:title, og:description, twitter:* 포함 |
| article 전용 메타태그 | type="article" + tags/date | article:published_time, article:tag 포함 |
| website vs article 분기 | type 변경 | og:type 값 분기 |
| canonicalLink 생성 | URL 입력 | rel="canonical" href 올바름 |
| locale별 description | ko/en/ja locale | 언어별 설명 반환 |
| 항상 배열 반환 (Property) | 임의 title/description | 항상 배열, title 포함 |

---

### `src/5-shared/config/i18n/__tests__/translation.test.ts`

**단위**: Property-Based
**대상**: 다국어 번역 시스템 (ko/en/ja)
**연관**: `useTranslation` 훅, 전체 UI 텍스트

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 번역 키 완전성 (Property) | 모든 locale 탐색 | 필수 키가 ko/en/ja 모두 존재 |
| JSON 라운드트립 (Property) | 직렬화 → 역직렬화 | 동등성 유지 |
| 폴백 동작 (Property) | 누락된 키 접근 | ko(한국어)로 폴백 |

---

### `src/5-shared/components/ui/button/button.test.tsx`

**단위**: Component + Property-Based
**대상**: `Button` 컴포넌트 (4 variant × 2 shape)
**연관**: 전체 UI에서 사용하는 공통 버튼

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| children 렌더링 | 텍스트 children | 화면에 표시 |
| 기본값 | variant/shape 미지정 | variant="default", shape="fill" 적용 |
| disabled 스타일 | disabled=true | opacity 스타일 적용 |
| disabled 클릭 | disabled=true, onClick 등록 | onClick 미호출 |
| link variant는 shape 무시 (Property) | variant="link", 임의 shape | bg-transparent, px-0, py-0 적용 |
| 일관된 기본 스타일 (Property) | non-link variant 전체 | rounded-lg, px-4, py-2, font-medium 포함 |
| 다크 모드 클래스 (Property) | 모든 조합 | `dark:` 접두사 클래스 존재 |
| Props 전달 (Property) | 임의 aria-label, className 등 | DOM에 그대로 전달 |

---

### `src/5-shared/components/ui/link/link.test.tsx`

**단위**: Component + Property-Based
**대상**: `Link` 컴포넌트 (locale 자동 주입)
**연관**: 모든 내부 링크, `Header` 네비게이션

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| Locale 자동 추가 (Property) | `/about` 경로 | `/ko/about` 변환 |
| Locale 중복 방지 (Property) | `/ko/about` 경로 | 중복 추가 없음 |
| 외부 링크 (Property) | `https://example.com` | 변경 없이 전달 |
| 다국어 지원 (Property) | ko/en/ja locale | 각 locale 자동 추가 |
| 루트 경로 | `/` | `/ko/` 변환 |
| 슬래시 없는 경로 | `about` | `/ko/about` 변환 |
| 동적 locale 변경 | locale prop 변경 | href 즉시 변경 |

---

### `src/5-shared/components/ui/optimized-image/optimized-image.test.tsx`

**단위**: Component + Property-Based
**대상**: `OptimizedImage` 컴포넌트
**연관**: `PostCard`, `ImageBlock` (MDX 이미지)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 외부 이미지 렌더링 | https/http src | img 태그 렌더링 |
| 로컬 이미지 렌더링 | `/image/*` src | img 태그 렌더링 |
| Lazy Loading (기본) | priority 미지정 | loading="lazy" |
| Eager Loading | priority=true | loading="eager" |
| decoding 속성 | 항상 | decoding="async" |
| Props 전달 | width, height, className | DOM에 전달 |
| 경계 조건 | 빈 alt, 빈 className | 오류 없이 렌더링 |
| 모든 src 조합 (Property) | 임의 URL | 오류 없이 렌더링 |
| priority 조합 (Property) | 임의 boolean | loading 속성 정확 |

---

### `src/5-shared/components/error-page/error-page.test.tsx`

**단위**: Component
**대상**: `ErrorPage` 컴포넌트
**연관**: 에러 바운더리, 404/403/500 라우트

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 상태 코드별 기본 메시지 | status=404/403/500 | 적절한 메시지 표시 |
| 커스텀 title/description | props 직접 전달 | 화면에 표시 |
| onGoHome 버튼 | 클릭 | 콜백 호출 |
| onRetry 버튼 | 클릭 | 콜백 호출 |
| 접근성 | 항상 | role="alert", aria-current 등 |

---

### `src/5-shared/hooks/use-scroll-progress.test.ts`

**단위**: Unit + Property-Based
**대상**: `useScrollProgress` 훅
**연관**: `ScrollProgressBar` 컴포넌트

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 초기 상태 | scrollY=0 | progress=0 |
| 최하단 | scrollY=최대 | progress=100 |
| scroll 이벤트 반응 | window.scroll 발생 | progress 업데이트 |
| 이벤트 리스너 해제 | unmount | 리스너 제거 확인 |
| 항상 0~100 (Property) | 임의 scrollY/totalHeight | 범위 이탈 없음 |
| 짧은 페이지 (Property) | totalHeight ≤ 0 | progress=100 |

---

## 4. entities 레이어 (1-entities)

### `src/1-entities/markdown/util/get-frontmatter.test.ts`

**단위**: Unit + Property-Based + Mock API
**대상**: `getFrontmatter` (MDX frontmatter 파싱)
**연관**: `getPosts`, `getMarkdown`, 포스트 상세 페이지

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 정상 frontmatter 파싱 | title/tags/createdAt/series 포함 | 올바른 객체 반환 |
| baseUrl 전달/미전달 | baseUrl 있음/없음 | API 호출 URL 다름 |
| 파일명 변환 | 파일명에 `_` 포함 | 공백으로 치환 |
| URL 인코딩 디코딩 | 인코딩된 경로 | 디코딩 후 처리 |
| partial() | 일부 필드 누락 | 오류 없이 파싱 |
| series 처리 | series 필드 포함 | 포함하여 반환 |
| API 404 | fetch 404 응답 | 에러 처리 |
| API throw | fetch 예외 | 에러 처리 |
| 임의 조합 (Property) | 임의 title/series | 파싱 성공 |

---

### `src/1-entities/markdown/util/reading-time.test.ts`

**단위**: Unit + Property-Based
**대상**: `calculateReadingTime` (읽기 시간 계산)
**연관**: `PostCard`, `PostDetail` (읽기 시간 표시)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 빈 콘텐츠 | `""` 입력 | 1분 반환 |
| 경계값 | 500자 vs 501자 | 1분 vs 2분 (올림) |
| frontmatter 제거 | frontmatter 포함 본문 | frontmatter 제외 계산 |
| 코드블록 제거 | ` ``` ` 포함 | 코드블록 제거 후 계산 |
| 마크다운 문법 제거 | 이미지/링크/제목/리스트 | 마크다운 기호 제거 |
| 공백 정규화 | 과도한 줄바꿈 | 단어 수 정확 계산 |
| 항상 1 이상 (Property) | 임의 콘텐츠 | result ≥ 1 |
| 길이 비례 (Property) | 1000~10000자 | 2~20분 범위 |

---

### `src/1-entities/markdown/util/extract-excerpt.test.ts`

**단위**: Unit + Property-Based
**대상**: `extractExcerpt` (요약문 추출)
**연관**: `PostCard` (카드 요약), `<meta description>`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 일반 텍스트 | 마크다운 없음 | 그대로 반환 |
| frontmatter 제거 | frontmatter 포함 | 제거 후 반환 |
| 코드블록 제거 | ` ``` ` 포함 | 제거 후 반환 |
| HTML 태그 제거 | `<div>` 등 포함 | 제거 후 반환 |
| 이미지 제거 | `![alt](url)` 포함 | 제거 후 반환 |
| 링크 텍스트 추출 | `[text](url)` | `text`만 추출 |
| maxLength 처리 | 200자 초과 | `...` 추가 후 반환 |
| 결과 길이 ≤ maxLength+3 (Property) | 임의 콘텐츠 | 길이 이탈 없음 |
| 빈 문자열 멱등 (Property) | `""` 입력 | `""` 반환 |
| maxLength=0 (Property) | 0 입력 | `...` 반환 |

---

### `src/1-entities/markdown/util/get-markdown.test.ts`

**단위**: Integration + Property-Based + Mock API/MDX
**대상**: `getMarkdown` (MDX fetch → evaluate → 렌더링 객체 반환)
**연관**: `PostDetail`, `AboutPage` (MDX 렌더링)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| MDX 정상 컴파일 | 유효한 MDX | MDXContent 함수 반환 |
| baseUrl 처리 | 있음/없음 | API URL 다름 |
| 파일명 `_` → 공백 변환 | 경로에 `_` 포함 | 변환 후 fetch |
| URL 디코딩 | 인코딩 경로 | 디코딩 후 처리 |
| 본문 없는 MDX | frontmatter만 존재 | 오류 없이 처리 |
| frontmatter 없는 MDX | frontmatter 미포함 | 오류 없이 처리 |
| GFM 플러그인 | 테이블/strikethrough/task list | 올바르게 렌더링 |
| API 404/throw | fetch 실패 | 에러 처리 |
| remarkGfm 동작 | 마크다운 표 | 렌더링 확인 |
| rehypeHighlight | 코드 블록 | 하이라이트 클래스 적용 |
| rehypeSlug | 제목 태그 | id 자동 추가 |
| rehypeAutolinkHeadings | 제목 태그 | 링크 자동 추가 |
| 임의 frontmatter (Property) | 임의 title/series | 파싱 성공 + MDXContent 함수 |

---

### `src/1-entities/markdown/util/strip-markdown-syntax.test.ts`

**단위**: Unit
**대상**: `stripMarkdownSyntax` (마크다운 문법 제거)
**연관**: `extractExcerpt`, 검색/요약 기능

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 제목 제거 | `# Heading` | `Heading` 반환 |
| 강조 제거 | `**bold**`, `*italic*` | 텍스트만 반환 |
| 코드 제거 | `` `code` ``, 코드블록 | 제거 또는 빈 문자열 |
| 링크 텍스트 추출 | `[text](url)` | `text` 반환 |
| 이미지 제거 | `![alt](url)` | 제거 |
| 리스트 기호 제거 | `- item`, `1. item` | 텍스트만 반환 |

---

### `src/1-entities/markdown/util/remark-obsidian-image.test.ts`

**단위**: Unit
**대상**: `remarkObsidianImage` (Obsidian 이미지 문법 변환 플러그인)
**연관**: `getMarkdown` (MDX 파이프라인)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| Obsidian 이미지 변환 | `![[image.png]]` | 표준 MD 이미지로 변환 |
| 크기 지정 변환 | `![[image.png\|400]]` | width 속성 포함 |
| baseUrl 결합 | baseUrl 설정 | 절대 URL 생성 |
| 일반 마크다운 이미지 | `![alt](url)` | 변경 없음 |

---

### `src/1-entities/markdown/util/extract-thumbnail.test.ts`

**단위**: Unit
**대상**: `extractThumbnail` (MDX에서 첫 이미지 추출)
**연관**: `getPosts` (thumbnail 자동 추출), `PostCard`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 첫 이미지 추출 | MDX에 이미지 포함 | 첫 번째 이미지 URL 반환 |
| 이미지 없음 | 이미지 미포함 MDX | undefined 반환 |
| Obsidian 이미지 | `![[image.png]]` | URL 추출 |
| 상대 → 절대 URL | baseUrl 설정 | 절대 URL 반환 |

---

### MDX UI 컴포넌트 테스트 (7개 파일)

**단위**: Component
**위치**: `src/1-entities/markdown/ui/`
**연관**: `getMarkdown`의 MDX components 맵

| 파일 | 대상 | 주요 검증 |
| --- | --- | --- |
| `typography.test.tsx` | `H1~H6`, `P` | 헤딩 레벨별 렌더링, 스타일 |
| `blockquote.test.tsx` | `Blockquote` | 인용문 렌더링, 스타일 |
| `code.test.tsx` | `Code` (인라인) | 코드 렌더링, 폰트 스타일 |
| `code-block.test.tsx` | `CodeBlock` | 언어별 하이라이트, 복사 버튼 |
| `mermaid-diagram.test.tsx` | `MermaidDiagram` | 다이어그램 렌더링 |
| `table-wrapper.test.tsx` | `TableWrapper` | 가로 스크롤 래퍼 |
| `image-block.test.tsx` | `ImageBlock` | 이미지 + 캡션 렌더링 |

---

## 5. features 레이어 (2-features)

### `src/2-features/contact/model/contact-form.schema.test.ts`

**단위**: Unit + Integration
**대상**: `ContactFormInputsSchema` (Zod 스키마 + sanitization)
**연관**: `ContactForm` 컴포넌트, `mail-handler`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| script 태그 제거 | subject/message에 `<script>` | 제거 후 통과 |
| 이벤트 핸들러 제거 | `<img onerror=...>` | 제거 후 통과 |
| 중첩 악성 태그 제거 | 중첩된 태그 | 모두 제거 |
| 정상 텍스트 유지 | HTML 없는 텍스트 | 변경 없이 통과 |
| 유니코드 보존 | 한글/일본어/이모지 | 보존 |
| 검증 실패 | 빈 subject/message | 에러 반환 |

---

### `src/2-features/contact/__tests__/mail-handler.test.ts`

**단위**: Integration
**대상**: Netlify Functions mail handler (이메일 전송 엔드포인트)
**연관**: `ContactForm`, Resend API, Cloudflare Turnstile

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 잘못된 payload | 필수 필드 누락 | 400 응답 |
| Turnstile 검증 실패 | 토큰 무효 | 400 응답, 세부정보 미노출 |
| API key 환경 변수 | 환경 변수 없음 | 적절한 에러 처리 |

---

### `src/2-features/post/util/get-posts.test.ts`

**단위**: Unit + Mock API
**대상**: `getPosts` (포스트 목록 조회 및 필터링)
**연관**: `PostList` 페이지, `PostCardList`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| tags undefined 포스트 필터링 | tags 필드 없는 포스트 | 제외 (런타임 오류 방지) |
| DEV 환경 필터링 | DEV=true | test/draft 태그 포함 |
| 프로덕션 필터링 | DEV=false | test/draft 태그 제외 |
| published=false 제외 | 항상 | 비공개 포스트 제외 |
| createdAt 정렬 | 항상 | 내림차순 |
| pagination | page, size 파라미터 | 올바른 페이지 반환 |
| thumbnail URL 변환 | 상대 URL | 절대 URL 변환 |
| VITE_GIT_RAW_URL 없음 | env 미설정 | 빈 배열 반환 |
| API 404/throw | fetch 실패 | 빈 배열 반환 |
| series 필드 | series 포함 포스트 | 포함하여 반환 |

---

### `src/2-features/post/util/get-series-posts.test.ts`

**단위**: Unit + Mock API
**대상**: `getSeriesPosts` (시리즈 포스트 조회)
**연관**: `PostDetail` (시리즈 내비게이션)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 시리즈 포스트 반환 | series 이름 일치 | 해당 시리즈 포스트만 반환 |
| 정렬 | 시리즈 포스트 여러 개 | createdAt 오름차순 |
| 빈 시리즈 | 일치 포스트 없음 | 빈 배열 반환 |

---

### `src/2-features/post/util/get-available-tags.test.ts`

**단위**: Unit + Mock API
**대상**: `getAvailableTags` (사용 가능한 태그 목록 추출)
**연관**: `TagFilterBar`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 태그 목록 추출 | 포스트 목록 | 중복 제거된 태그 배열 |
| 정렬 | 다양한 태그 | 알파벳 오름차순 |
| 빈 태그 처리 | tags=[] 포스트 | 제외 |

---

### `src/2-features/post/__tests__/rss-handler.test.ts`

**단위**: Integration
**대상**: RSS Feed 생성 Netlify Function
**연관**: RSS 구독, SEO

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| RSS XML 생성 | 포스트 목록 있음 | 유효한 XML 반환 |
| Content-Type 헤더 | 항상 | `application/xml` |
| 포스트 항목 포함 | 각 포스트 | `<item>` 태그 포함 |
| API 실패 | fetch 오류 | 500 응답 |

---

### `src/2-features/post/ui/post-card.test.tsx`

**단위**: Component + Property-Based
**대상**: `PostCard` 컴포넌트 (basic/compact 2가지 variant)
**연관**: `PostCardList`, `PostList` 페이지

**variant="basic"**

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 기본 렌더링 | 제목/날짜/썸네일 포함 | 모두 화면에 표시 |
| 태그 칩 렌더링 | tags 있음 | 태그 칩 표시 |
| 태그 없음 | tags=[] | 태그 칩 미표시 |
| 여러 태그 | tags 다수 | 모두 표시 |
| 태그 위치 | 항상 | 날짜 아래 배치 |

**variant="compact"**

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 기본 이미지 | thumbnail 미지정 | `/image/context.png` 사용 |
| 커스텀 썸네일 | thumbnail 지정 | 해당 URL 사용 |
| 포스트 경로 | path 지정 | 올바른 href |
| 다크 모드 스타일 | 항상 | `dark:` 클래스 포함 |
| 접근성 | 항상 | article 태그, time, img alt |
| Lazy loading | 항상 | loading="lazy" |
| 임의 props (Property) | 임의 title/date/path/thumbnail/locale | 오류 없이 렌더링 |
| 날짜 형식 (Property) | 임의 날짜 | yyyy-MM-dd 형식 |

---

### `src/2-features/post/ui/post-card-list.test.tsx`

**단위**: Component
**대상**: `PostCardList` 컴포넌트
**연관**: `PostList` 페이지

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 목록 렌더링 | posts 배열 | PostCard 수량 일치 |
| 빈 목록 | posts=[] | 빈 상태 메시지 표시 |
| variant 전달 | variant 지정 | 각 PostCard에 전달 |

---

### `src/2-features/post/ui/table-of-contents.test.tsx`

**단위**: Component
**대상**: `TableOfContents` 컴포넌트
**연관**: `PostDetail` (사이드바)

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 헤딩 목록 렌더링 | headings 배열 | 각 항목 표시 |
| 활성 항목 표시 | activeId 설정 | 활성 스타일 적용 |
| 클릭 이벤트 | 항목 클릭 | 스크롤 이동 또는 콜백 |

---

### `src/2-features/post/ui/tag-filter-bar.test.tsx`

**단위**: Unit
**대상**: `TagFilterBar` 컴포넌트
**연관**: `PostList` 페이지 상단 필터

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| "전체" 링크 | 항상 | `/ko/posts` href |
| 태그별 링크 | availableTags 있음 | `/ko/posts?tags=react` href |
| 선택된 태그 강조 | selectedTag 설정 | aria-current="true" |
| 빈 태그 목록 | availableTags=[] | "전체"만 표시 |

---

### `src/2-features/post/ui/tag-chip.test.tsx`

**단위**: Component
**대상**: `TagChip` 컴포넌트
**연관**: `PostCard`, `PostDetail` 헤더

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 태그 텍스트 렌더링 | tag 문자열 | 화면에 표시 |
| 링크 href | tag 클릭 | `/ko/posts?tags={tag}` |
| 스타일 | 항상 | 배경색, 라운드 적용 |

---

### `src/2-features/post/ui/post-share-buttons.test.tsx`

**단위**: Component
**대상**: `PostShareButtons` 컴포넌트
**연관**: `PostDetail` 하단

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 공유 버튼 렌더링 | 항상 | 트위터/링크 복사 버튼 표시 |
| 링크 복사 | 클릭 | clipboard API 호출 |
| 트위터 공유 링크 | 항상 | 올바른 트위터 공유 URL |

---

## 6. widgets 레이어 (3-widgets)

### `src/3-widgets/header.test.tsx`

**단위**: Component
**대상**: `Header` 위젯
**연관**: `RootLayout`
**Mock**: `useRouterState`, `useDetectScrolled`, `useTranslation`, `ThemeToggle`, `LocaleToggle`, `Link`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| 로고 렌더링 | 항상 | "Chanho.dev" 표시 |
| 네비게이션 링크 | 항상 | About/Posts/Contact 링크 |
| ThemeToggle/LocaleToggle | 항상 | 버튼 렌더링 |
| 현재 경로 하이라이트 | pathname 일치 | `text-blue-600` 클래스 |
| 스크롤 shadow | 스크롤 감지 | shadow 클래스 추가 |
| backdrop blur | 스크롤 감지 | backdrop-blur 클래스 |
| 접근성 | 항상 | aria-label 포함 |
| 다국어 지원 | ko/en/ja | 각 locale 링크 |

---

### `src/3-widgets/footer.test.tsx`

**단위**: Component
**대상**: `Footer` 위젯
**연관**: `RootLayout`

| 테스트 | 조건 | 검증 |
| --- | --- | --- |
| footer 렌더링 | 항상 | role="contentinfo" |
| 저작권 텍스트 | 항상 | `© {연도} Chanho Kim's dev Blog...` |
| 다크 모드 | 항상 | `dark:` 클래스 포함 |

---

## 7. pages 레이어 (4-pages)

### 라우트 테스트 목록

| 파일 | 대상 라우트 | 주요 검증 |
| --- | --- | --- |
| `__root.test.tsx` | `RootLayout` | 레이아웃 렌더링, Devtools (개발 환경) |
| `$locale.test.tsx` | `LocaleLayout` | 다국어 레이아웃, Outlet 렌더링 |
| `index.test.tsx` | `/` | 루트 리다이렉트 |
| `$locale/index.test.tsx` | `/:locale/` | 홈 페이지 렌더링 |
| `$locale/about.test.tsx` | `/:locale/about` | About 페이지 렌더링 |
| `$locale/contact.test.tsx` | `/:locale/contact` | Contact 폼 렌더링 |
| `$locale/posts/index.test.tsx` | `/:locale/posts` | 포스트 목록 페이지 렌더링 |
| `$locale/posts/$.test.tsx` | `/:locale/posts/:id` | 포스트 상세 페이지 렌더링 |

**공통 Mock**: `@tanstack/react-router` (Outlet, HeadContent), TanStack Devtools, React Query Devtools

---

## 8. 테스트 도구 및 패턴

### 사용 라이브러리

| 목적 | 라이브러리 |
| --- | --- |
| 테스트 러너 | Vitest |
| React 컴포넌트 | @testing-library/react |
| 사용자 인터랙션 | @testing-library/user-event |
| Property-Based | fast-check |
| E2E | Playwright |

### Mock 전략

| 대상 | 방식 |
| --- | --- |
| API fetch | `vi.mock()` + `vi.mocked(api.get)` |
| TanStack Router | `vi.mock('@tanstack/react-router')` |
| react-i18next | `vi.mock('react-i18next')` |
| 하위 컴포넌트 | `vi.mock('@/path/to/component')` |
| 환경 변수 | `vi.stubEnv()` |

### Property-Based Testing 패턴

대부분의 Unit/Component 테스트에 fast-check를 함께 사용합니다.

```typescript
// 예시: 멱등성 검증
fc.assert(
  fc.property(fc.string(), (input) => {
    expect(sanitize(sanitize(input))).toBe(sanitize(input));
  }),
  { numRuns: 20 }
);
```

**주요 활용 영역**:
- 입력 소독 (sanitize, contact-form.schema)
- 컴포넌트 props 조합 (button, link, optimized-image, post-card)
- 마크다운 처리 (reading-time, extract-excerpt, get-markdown)
- 번역 키 완전성 (translation)
- 훅 범위 검증 (use-scroll-progress)
