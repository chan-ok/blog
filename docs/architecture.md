# 아키텍처 가이드

이 문서는 현재 소스 트리를 기준으로 애플리케이션 구조와 콘텐츠 흐름을 설명합니다. 설치와 실행은 [development.md](./development.md), 강제할 의존성 규칙은 [architecture-rules.md](./architecture-rules.md)를 참고하세요.

## 전체 구조

```text
src/
├── app/
│   ├── main.tsx
│   ├── globals.css
│   └── routes/
├── entities/
│   └── markdown/
├── features/
│   └── post/
└── shared/
    ├── components/
    ├── locale/
    ├── types/
    └── util/
```

의존성은 아래 방향으로만 흐릅니다.

```text
app → features → entities → shared
```

- `app`: 앱 진입점, 파일 기반 라우트, 페이지 조합
- `features`: 포스트 카드, 목록, 목차, 공개성 정책 같은 사용자 기능
- `entities`: Markdown 데이터 모델, 경로·frontmatter 파싱, 렌더링
- `shared`: 제한된 원격 fetch, 레이아웃, 로케일, 범용 UI와 유틸

모든 레이어는 필요한 하위 레이어를 건너뛰어 직접 사용할 수 있지만 상위 레이어를 import할 수 없습니다. 세부 규칙은 [architecture-rules.md](./architecture-rules.md)에 있습니다.

## 라우팅과 데이터 로딩

TanStack Router가 `src/app/routes`를 파일 기반 라우트로 사용합니다.

| 경로               | 역할                             |
| ------------------ | -------------------------------- |
| `/`                | `/ko`로 이동                     |
| `/$locale`         | 공통 Header·Footer와 로케일 제공 |
| `/$locale/`        | 소개 블록과 최근 포스트 4개      |
| `/$locale/about`   | 외부 프로필 README 렌더링        |
| `/$locale/posts`   | 포스트 목록                      |
| `/$locale/posts/*` | 포스트 상세, 목차, 메타데이터    |

지원 로케일은 `ko`, `ja`입니다. 유효하지 않은 로케일과 프로덕션 비공개 상세 경로는 404로 처리합니다. 라우트 loader가 데이터를 가져오고 React `Suspense`와 `use()`가 비동기 화면을 구성합니다.

## 콘텐츠 리포지터리

애플리케이션과 포스트 콘텐츠는 분리되어 있습니다.

- [`blog`](https://github.com/chan-ok/blog): UI, 라우팅, 렌더링, 공개성 정책
- [`blog-content`](https://github.com/chan-ok/blog-content): 로케일별 포스트와 `index.json`

홈과 목록은 `VITE_GIT_RAW_URL`을 기준으로 `/<locale>/index.json`을 가져옵니다. 상세 페이지는 GitHub Raw의 `blog-content/main`을 사용하며, About 페이지는 별도 프로필 리포지터리의 로케일 README를 사용합니다.

## Markdown 파이프라인

상세 콘텐츠의 처리 순서는 다음과 같습니다.

```text
라우트 경로
  → 경로 정규화·검증
  → HTTPS Raw URL 생성
  → .mdx 요청, 실패 시 .md 재시도
  → YAML frontmatter 파싱
  → Zod 부분 스키마 검증
  → react-markdown 렌더링
```

경로 파서는 절대 경로, `.`·`..`, 제어 문자, 잘못된 인코딩, 과도한 길이를 거부합니다. 기준 URL도 자격 증명·query·fragment가 없는 HTTPS URL만 허용합니다.

frontmatter는 YAML mapping만 허용하며 본문과 frontmatter에 크기 제한을 둡니다. `react-markdown`은 원격 MDX를 JavaScript로 평가하지 않고 raw HTML도 건너뜁니다. 현재 렌더러가 지원하는 확장은 다음과 같습니다.

- GFM 표·목록·링크
- heading slug와 자동 앵커
- highlight.js 코드 하이라이팅
- Obsidian 이미지 문법과 상대 이미지 경로
- INFO·WARNING·DANGER·SUCCESS callout
- Mermaid 다이어그램

Mermaid는 필요할 때 동적으로 불러오며 `securityLevel: 'strict'`로 렌더링합니다. 생성된 SVG는 DOMPurify로 정화한 뒤 삽입합니다.

## 포스트 공개성

`src/features/post/util/post-visibility.ts`가 목록과 상세의 정책을 한 곳에서 판정합니다.

| 환경     | 목록                                        | 상세                                   |
| -------- | ------------------------------------------- | -------------------------------------- |
| 프로덕션 | `published: true`, `test`·`draft` 태그 없음 | 목록과 동일, 아니면 404                |
| 개발     | `published: true`                           | 미발행·초안도 직접 URL로 미리보기 가능 |

이 정책은 콘텐츠 노출 규칙이지 인증·인가 수단이 아닙니다. 원본 콘텐츠가 공개 리포지터리에 있다면 숨긴 포스트도 원본 URL에서는 접근될 수 있습니다.

## 빌드와 배포

Vite 설정은 TanStack Router 코드 분할, React Compiler, Tailwind CSS, 이미지 최적화를 적용합니다. React, TanStack, Markdown, highlight, i18n 등 큰 의존성은 빌드 청크로 나눕니다. Netlify는 `pnpm build` 결과인 `dist`를 배포하고 SPA fallback redirect를 사용합니다.

## 관련 문서

- [개발 가이드](./development.md)
- [보안 가이드](./security.md)
- [코드 스타일](./code-style.md)
- [안티패턴](./anti-patterns.md)
