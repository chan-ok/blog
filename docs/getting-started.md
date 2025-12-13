# 🚀 빠른 시작 가이드

> 이 문서는 프로젝트에 처음 참여하는 개발자를 위한 가이드입니다.

## 사전 요구사항

| 도구    | 버전      | 확인 명령어     |
| ------- | --------- | --------------- |
| Node.js | 20.x 이상 | `node -v`       |
| pnpm    | 9.x 이상  | `pnpm -v`       |
| Git     | 최신      | `git --version` |

### pnpm 설치

```bash
# npm으로 설치
npm install -g pnpm

# 또는 Homebrew (macOS)
brew install pnpm
```

## 프로젝트 설정

### 1. 리포지터리 클론

```bash
git clone https://github.com/chan-ok/blog.git
cd blog
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```bash
# .env.local

# 콘텐츠 리포지터리 (필수)
NEXT_PUBLIC_GIT_RAW_URL=https://raw.githubusercontent.com/chan-ok/blog-content/main

# Cloudflare Turnstile (Contact 폼용)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Resend (이메일 발송용)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

> ⚠️ `.env.local`은 절대 Git에 커밋하지 마세요!

### 4. 개발 서버 시작

```bash
# Next.js만 실행 (기본)
pnpm dev

# Netlify Functions와 함께 실행 (Contact 폼 테스트 시)
pnpm dev:server
```

- Next.js: <http://localhost:3000>
- Netlify Dev: <http://localhost:8888>

## 주요 명령어

### 개발

```bash
pnpm dev              # 개발 서버 시작
pnpm dev:server       # Netlify Functions와 함께 시작
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버 시작
```

### 코드 품질

```bash
pnpm lint             # ESLint 실행
pnpm fmt              # Prettier 포맷팅
pnpm tsc --noEmit     # TypeScript 타입 체크
```

### 테스팅

```bash
pnpm test             # Vitest (Watch 모드)
pnpm test:run         # Vitest (1회 실행)
pnpm coverage         # 커버리지 리포트
pnpm e2e              # Playwright E2E 테스트
pnpm e2e:ui           # Playwright UI 모드
```

### Storybook

```bash
pnpm storybook        # Storybook 개발 서버 (localhost:6006)
pnpm build-storybook  # Storybook 빌드
```

## 프로젝트 구조 이해하기

### FSD 레이어

이 프로젝트는 [Feature-Sliced Design](https://feature-sliced.design/) 아키텍처를 따릅니다:

```
src/
├── app/        # 라우팅 (Next.js App Router)
├── widgets/    # 복합 UI (Header, Footer)
├── features/   # 비즈니스 기능 (about, contact, post)
├── entities/   # 비즈니스 엔티티 (mdx)
└── shared/     # 공유 리소스 (hooks, components, config)
```

**의존성 방향** (위에서 아래로만 import 가능):

```
app → widgets → features → entities → shared
```

### 예시: 새 컴포넌트 추가

버튼 컴포넌트를 추가한다면:

```typescript
// src/shared/components/button/button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg ${
        variant === 'primary'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-800'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

## 첫 번째 기여

### 1. 브랜치 생성

```bash
git checkout -b feat/my-feature
```

### 2. 코드 작성

- [코드 스타일 가이드](./code-style.md) 참고
- [개발 규칙](./rule.md) 준수

### 3. 테스트 및 검증

```bash
# 코드 품질 검증
pnpm fmt
pnpm lint
pnpm tsc --noEmit

# 테스트 실행
pnpm test:run
```

### 4. 커밋

```bash
git add .
git commit -m "feat(component): add button component"
```

커밋 메시지 형식은 [Git 가이드](./git-guide.md)를 참고하세요.

### 5. PR 생성

```bash
git push origin feat/my-feature
```

GitHub에서 Pull Request를 생성합니다.

## 자주 발생하는 문제

### 빌드 에러

**증상**: `pnpm build` 실패

**해결**:

1. TypeScript 에러 확인: `pnpm tsc --noEmit`
2. ESLint 에러 확인: `pnpm lint`
3. 의존성 재설치: `rm -rf node_modules && pnpm install`

### 환경 변수 문제

**증상**: Contact 폼이 작동하지 않음

**해결**:

1. `.env.local` 파일 존재 확인
2. 환경 변수 값 확인
3. `pnpm dev:server`로 Netlify Functions 실행

### 포트 충돌

**증상**: 개발 서버가 시작되지 않음

**해결**:

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000

# 프로세스 종료
kill -9 <PID>
```

## 다음 단계

1. [개발 규칙](./rule.md) 읽기
2. [아키텍처 문서](./architecture.md)로 구조 이해하기
3. [코드 스타일 가이드](./code-style.md)로 코딩 컨벤션 익히기

---

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
