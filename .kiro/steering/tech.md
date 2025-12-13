# 기술 스택

## 코어 프레임워크

- **Next.js 16.0.7** - App Router를 사용하는 React 프레임워크
- **React 19.2.1** - React Compiler 활성화
- **TypeScript 5** - 엄격한 타입 체킹

## 스타일링 & UI

- **Tailwind CSS v4** - 유틸리티 우선 CSS 프레임워크
- **Base UI Components** - Headless UI 컴포넌트 라이브러리
- **lucide-react** - 아이콘 라이브러리

## 콘텐츠 & 마크다운

- **MDX** - JSX를 지원하는 Markdown
- **next-mdx-remote-client** - GitHub Raw URL에서 원격 MDX 렌더링
- **rehype-highlight** - 코드 블록 구문 강조
- **remark-gfm** - GitHub Flavored Markdown 지원
- **remark-frontmatter** - Front-matter 파싱

## 데이터 & 상태

- **Zustand** - 경량 상태 관리
- **Zod v4** - 스키마 검증
- **axios** - HTTP 클라이언트
- **cookies-next** - 쿠키 관리

## 폼 & 이메일

- **Resend** - 이메일 전송 서비스
- **Cloudflare Turnstile** - 봇 방지

## 테스팅

- **Vitest** - 브라우저 모드를 지원하는 유닛 테스트 프레임워크
- **Playwright** - E2E 테스팅
- **Testing Library** - 컴포넌트 테스팅 유틸리티
- **Storybook 10** - 컴포넌트 문서화 및 비주얼 테스팅
- **Chromatic** - 비주얼 회귀 테스팅

## 코드 품질

- **ESLint 9** - Next.js, Vitest, Storybook 플러그인을 사용한 린팅
- **Prettier** - 코드 포맷팅 (싱글 쿼트, ES5 trailing commas)
- **Husky** - Git hooks
- **lint-staged** - Pre-commit 린팅

## 배포

- **Netlify** - 호스팅 및 서버리스 함수
- **@netlify/plugin-nextjs** - Next.js 통합
- **Netlify Functions** - 서버리스 API 엔드포인트

## 주요 명령어

```bash
# 개발
pnpm dev              # Next.js 개발 서버 시작 (localhost:3000)
pnpm dev:server       # Netlify Functions와 함께 시작 (localhost:8888)

# 빌드
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버 시작

# 코드 품질
pnpm lint             # ESLint 실행
pnpm fmt              # Prettier 포맷팅

# 테스팅
pnpm test             # Vitest 유닛 테스트 실행
pnpm coverage         # 테스트 커버리지 리포트 생성
pnpm e2e              # Playwright E2E 테스트 실행
pnpm e2e:ui           # UI와 함께 E2E 테스트 실행

# Storybook
pnpm storybook        # Storybook 개발 서버 시작 (localhost:6006)
pnpm build-storybook  # 배포용 Storybook 빌드
```

## 경로 별칭

- `@/*` - `./src/*`로 매핑

## 모듈 시스템

- **Type**: ESM (ES Modules)
- **Target**: ES2017
- **Module Resolution**: bundler

## 기술 선택 시 주의사항 (과거 시행착오)

### MDX 렌더링

> next/mdx는 내부 폴더 import 방식에서만 `set-mdx-components.ts`가 적용됨

- 원격 파일(GitHub Raw URL) 로딩 시 **next-mdx-remote-client** 사용 필수
- next/mdx는 원격 방식에서 동작하지 않음

### 상태 관리 & 영속성

> proxy.ts를 거치는 과정에서 쿠키를 읽지 못하는 문제 발생

| 용도            | 권장 방식              | 비권장                |
| --------------- | ---------------------- | --------------------- |
| 테마 (다크모드) | Zustand + localStorage | 쿠키                  |
| 언어 설정       | URL 경로 + Zustand     | NEXT_LOCALE 쿠키 단독 |

- SSR 환경에서 쿠키 접근이 필요하면 proxy.ts 로직 확인 필수

### 보안

> Cloudflare Turnstile 없이 배포 시 AI 봇 스팸 발생 경험

- Contact 폼 등 외부 입력이 있는 기능은 **봇 방지를 초기부터 적용**
- Resend 요금 폭탄 방지를 위해 rate limiting 고려

### 초기 설정

> 앞으로 사용할 예정인 라이브러리 환경설정에 과도한 시간 투자 경험

- 초반에는 필요한 환경설정만 빠르게 구축
- 실행 및 배포 가능한 구조를 먼저 만들고, 이후 점진적으로 추가
