# 보안 가이드

이 프로젝트의 주요 보안 경계는 브라우저 환경 변수와 외부 리포지터리에서 가져오는 Markdown입니다.

## 환경 변수

- `VITE_*`는 빌드 결과와 브라우저에서 볼 수 있는 공개 설정으로 취급합니다.
- `VITE_GIT_RAW_URL`에는 비밀값을 넣지 않습니다.
- 토큰, 비밀번호, 개인 키는 소스·문서·테스트 fixture와 `.env.local`에 커밋하지 않습니다.
- 현재 애플리케이션에는 서버 함수나 비밀키가 필요한 인증·메일 폼이 없습니다.

pre-commit 훅은 비밀정보를 자동 검사하지 않습니다. `lint-staged`와 staged diff 공백 검사만 수행하므로 커밋 전에 변경 내용을 직접 확인해야 합니다.

## 원격 Markdown 신뢰 경계

포스트와 About 콘텐츠는 네트워크에서 가져옵니다. 원격 저장소 변경은 애플리케이션 배포 없이 화면에 반영될 수 있으므로 콘텐츠 저장소 쓰기 권한과 리뷰 절차를 보호해야 합니다.

현재 파이프라인은 다음 방어를 적용합니다.

- 기준 URL은 자격 증명·query·fragment가 없는 HTTPS만 허용
- 원격 요청은 credential·referrer 없이 수행하고 redirect를 거부하며 5초 뒤 중단
- 경로는 한 번 decode한 뒤 절대 경로, traversal, 제어 문자, 과도한 길이를 거부
- Markdown 본문은 2 MiB, frontmatter는 64 KiB로 제한
- 원격 응답은 스트리밍 중 2 MiB를 넘으면 다운로드를 중단
- YAML mapping만 허용하고 alias 수와 중복 key를 제한
- frontmatter를 Zod 스키마로 검증
- `react-markdown`으로 렌더링하고 raw HTML은 `skipHtml`로 제외
- 원격 `.mdx`의 JSX·JavaScript를 컴파일하거나 실행하지 않음

렌더러에 `rehype-raw`나 런타임 MDX 평가를 추가하면 이 신뢰 모델이 달라집니다. 그런 변경은 별도 위협 검토와 회귀 테스트가 필요합니다.

## Mermaid와 HTML 삽입

Mermaid만 렌더링 결과 SVG를 `dangerouslySetInnerHTML`로 삽입합니다. 다이어그램은 Mermaid `securityLevel: 'strict'`와 변경할 수 없는 secure 설정으로 생성합니다. 결과는 DOMPurify의 SVG profile로 정화한 뒤, 외부 리소스를 부를 수 있는 CSS와 URL 속성을 한 번 더 제거합니다.

새 `dangerouslySetInnerHTML` 사용, 사용자 정의 URL 처리, HTML 허용 플러그인은 기본적으로 금지합니다. 꼭 필요하면 허용할 요소·속성·프로토콜을 좁히고 악성 입력 테스트를 추가하세요.

## 배포 보안 헤더

`netlify.toml`은 모든 경로에 CSP, HSTS, COOP, Permissions Policy, Referrer Policy, MIME sniffing 방지, framing 방지 헤더를 적용합니다.

- 스크립트는 동일 출처에서만 로드
- Markdown 요청은 동일 출처와 `raw.githubusercontent.com`만 허용
- 이미지는 동일 출처, `data:`, `raw.githubusercontent.com`, `skillicons.dev`만 허용
- object와 외부 frame 삽입은 차단

콘텐츠나 이미지 호스트를 바꾸면 URL 검증과 CSP 허용 목록을 함께 변경해야 합니다. Mermaid SVG와 현재 컴포넌트의 인라인 스타일 때문에 `style-src 'unsafe-inline'`이 남아 있으며, 새 인라인 스크립트까지 허용하는 근거가 아닙니다. 이를 제거하려면 Mermaid 출력과 인라인 style 속성을 먼저 대체하고 브라우저 회귀 테스트를 통과시켜야 합니다.

## 포스트 공개 정책

프로덕션에서는 `published: true`이고 `test`, `draft` 태그가 없는 포스트만 목록과 상세에서 보입니다. 개발 상세는 미발행 콘텐츠 미리보기를 허용합니다.

이 정책은 UI 노출 제어일 뿐 접근 통제가 아닙니다. 공개 `blog-content` 리포지터리의 원본 파일을 비밀 저장소처럼 사용하면 안 됩니다.

## 의존성

- `pnpm-lock.yaml`을 함께 검토하고 CI에서는 frozen lockfile을 사용합니다.
- pre-push는 설치된 모든 의존성의 low 이상 취약점을 `pnpm audit --audit-level=low`로 검사합니다.
- `pnpm-workspace.yaml`의 `minimumReleaseAge` 정책과 예외 목록을 바꿀 때는 공급망 위험을 검토합니다.
- 보안 패치를 위해 override나 예외를 추가하면 근거와 제거 조건을 기록합니다.

## 변경 전 체크

- 외부 URL·경로·frontmatter 검증을 우회하지 않았는가?
- raw HTML 또는 실행 가능한 MDX를 다시 허용하지 않았는가?
- DOM에 삽입하는 HTML·SVG가 정화되는가?
- `VITE_*`에 비밀값을 요구하지 않는가?
- 공개성 정책이 목록과 상세에 함께 적용되는가?
- 악성·경계 입력 테스트가 포함되었는가?
