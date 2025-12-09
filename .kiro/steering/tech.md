# 기술 스택

## 코어 프레임워크

- **Next.js 16** - App Router를 사용하는 React 프레임워크
- **React 19** - React Compiler 활성화
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
- `#/*` - `./contents/*`로 매핑

## 모듈 시스템

- **Type**: ESM (ES Modules)
- **Target**: ES2017
- **Module Resolution**: bundler
