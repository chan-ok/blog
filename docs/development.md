# 개발 가이드

## 📋 목차

- [개요](#개요)
- [대상](#대상)
- [빠른 시작](#빠른-시작)
- [개발 규칙](#개발-규칙)
- [테스팅](#테스팅)
- [보안](#보안)
- [Git 워크플로우](#git-워크플로우)
- [배포](#배포)
- [문제 해결](#문제-해결)
- [참고 문서](#참고-문서)

## 개요

이 문서는 프로젝트에 처음 참여하는 개발자 또는 로컬 개발 환경을 설정하려는 개발자를 위한 필수 가이드입니다. 개발 환경 설정부터 배포까지 전체 개발 프로세스를 다룹니다.

## 대상

### ✅ 포함 대상

- 처음 프로젝트를 시작하는 개발자
- 로컬 개발 환경 설정이 필요한 경우
- 프로젝트 개발 규칙을 확인하고 싶은 경우
- 배포 프로세스를 이해하고 싶은 경우

### ❌ 제외 대상

- AI 코딩 에이전트를 위한 상세 규칙 → [agents.md](./agents.md) 참고
- 프로젝트 구조 상세 이해 → [architecture.md](./architecture.md) 참고
- 프로젝트 회고 및 의사결정 로그 확인 → [retrospective/overview.md](./retrospective/overview.md) 참고

## 빠른 시작

### 사전 요구사항

| 도구    | 버전      | 확인 명령어     |
| ------- | --------- | --------------- |
| Node.js | 22.x 이상 | `node -v`       |
| pnpm    | 10.x 이상 | `pnpm -v`       |
| Git     | 최신      | `git --version` |

#### pnpm 설치

```bash
# npm으로 설치
npm install -g pnpm

# 또는 Homebrew (macOS)
brew install pnpm
```

### 설치 및 실행

#### 1. 리포지터리 클론

```bash
git clone https://github.com/chan-ok/blog.git
cd blog
```

#### 2. 의존성 설치

```bash
pnpm install
```

#### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```bash
# .env.local

# 콘텐츠 리포지터리 (필수)
VITE_GIT_RAW_URL=https://raw.githubusercontent.com/chan-ok/blog-content/main

# Cloudflare Turnstile (Contact 폼용)
VITE_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Resend (이메일 발송용)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

> ⚠️ `.env.local`은 절대 Git에 커밋하지 마세요!

#### 4. 개발 서버 시작

```bash
# Vite 개발 서버 실행 (기본, localhost:5173)
pnpm dev

# Netlify Functions와 함께 실행 (Contact 폼 테스트 시, localhost:8888)
pnpm dev:server
```

- Vite: http://localhost:5173
- Netlify Dev: http://localhost:8888

## 개발 규칙

### 핵심 원칙 5가지

#### 1. 재사용성

새 코드를 작성하기 전에 항상 기존 코드를 확인합니다:

- 이미 존재하는 유틸리티 함수, 컴포넌트가 있는지 확인
- 프로젝트에 설치된 라이브러리로 해결 가능한지 확인
- 가능하다면 기존 코드를 수정하여 사용

#### 2. FSD 아키텍처

Feature-Sliced Design 레이어 간 의존성 규칙 엄격히 준수:

```
pages → widgets → features → entities → shared
```

- **역방향 import 금지** (예: 5-shared → 2-features)
- **features/ 간 import 금지** (예: 2-features/post → 2-features/contact)

자세한 내용은 [architecture.md](./architecture.md)를 참고하세요.

#### 3. TDD (Test-Driven Development)

새로운 코드 작성 시 TDD 사이클 따르기:

1. **Red**: 요구사항을 확인하는 테스트 코드 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 리팩토링 후 테스트 재실행

#### 4. 코드 품질

커밋 전 반드시 다음을 실행:

```bash
pnpm fmt              # Prettier 포맷팅
pnpm lint             # ESLint 검사
pnpm tsc --noEmit     # TypeScript 타입 체크
```

Husky pre-commit 훅이 자동으로 다음 4단계를 실행합니다:

1. security-scanner (민감 정보 탐지)
2. `tsc --noEmit` (타입 체크)
3. lint-staged (린트/포맷)
4. `vitest related --run` (관련 테스트)

#### 5. 보안

- 환경 변수에 민감한 정보 하드코딩 금지
- 서버 환경 변수를 클라이언트에 노출 금지
- 사용자 입력은 Zod로 검증
- `dangerouslySetInnerHTML` 사용 최소화

### 코드 스타일

상세 내용은 [agents.md](./agents.md)를 참고하세요.

**간단 요약**:

- **Import 순서**: React → 외부 → 내부(@/\*) → 타입
- **컴포넌트 구조**: 타입 → 훅 → 파생값 → 핸들러 → 이펙트 → 렌더
- **Tailwind 순서**: Layout → Size → Spacing → Typography → Visual → Interaction → Responsive → Dark Mode
- **명명 규칙**: PascalCase (컴포넌트), camelCase (함수/변수), kebab-case (파일)

## 테스팅

### 테스트 전략

#### 1. 유닛 테스트 (Vitest)

- **대상**: 컴포넌트 로직, 유틸 함수, 커스텀 훅
- **커버리지 목표**: 80%+

```bash
pnpm test             # Watch 모드
pnpm test run         # 1회 실행 (Vitest CLI 옵션)
pnpm coverage         # 커버리지 리포트

# 단일 파일 테스트
pnpm test button.test.tsx

# 이름 필터
pnpm test -t "클릭 시 onClick 호출"
```

#### 2. Storybook 테스트

- **대상**: 컴포넌트 UI, 인터랙션
- **실행**: `pnpm storybook`

#### 3. E2E 테스트 (Playwright)

- **대상**: 핵심 사용자 플로우
- **실행**: `pnpm e2e` 또는 `pnpm e2e:ui` (둘 다 `playwright test` 실행)

### TDD 실전 예제

```typescript
// 1. 실패하는 테스트 작성
describe('Button', () => {
  it('클릭 시 onClick 호출', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

// 2. 최소 코드로 통과
export function Button({ onClick, children }: Props) {
  return <button onClick={onClick}>{children}</button>;
}

// 3. 리팩토링
export function Button({ onClick, children, variant = 'primary' }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn('btn', `btn-${variant}`)}
    >
      {children}
    </button>
  );
}
```

### Property-based 테스트

다양한 입력 조합을 자동으로 테스트:

```typescript
import fc from 'fast-check';

const variantArb = fc.constantFrom<ButtonVariant>('primary', 'default', 'danger', 'link');

it('모든 variant에서 다크 모드 클래스 포함', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      unmount(); // 각 반복 후 DOM 정리 필수
    }),
    { numRuns: 30 }
  );
});
```

## 보안

### 환경 변수 관리

#### 클라이언트 vs 서버

| 접두사        | 노출 범위         | 용도                            |
| ------------- | ----------------- | ------------------------------- |
| `VITE_*`      | 클라이언트 + 서버 | 공개 가능한 설정 (사이트 키 등) |
| (접두사 없음) | 서버만            | 민감한 정보 (Secret 키 등)      |

#### 예제

```typescript
// ✅ Good - Netlify Functions에서 서버 환경 변수
const secretKey = process.env.TURNSTILE_SECRET_KEY;

// ✅ Good - 클라이언트에서 VITE_ 변수
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// ❌ Bad - 하드코딩
const apiKey = 're_xxxxxxxxxxxxxxxxxxxx';
```

#### 주의사항

- ⚠️ `.env.local` 파일은 Git에 커밋 금지
- ⚠️ 서버 환경 변수(`TURNSTILE_SECRET_KEY` 등)를 클라이언트에 노출 금지
- ⚠️ 클라이언트 환경 변수는 반드시 `VITE_` 접두사 사용

### 입력 검증

모든 사용자 입력은 Zod로 검증:

```typescript
import { z } from 'zod';
import { sanitizeInput } from '@/5-shared/util/sanitize';

// Zod 스키마 + transform으로 sanitize
export const ContactFormInputsSchema = z.object({
  from: z.string().email('Invalid email'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject length is over')
    .transform(sanitizeInput),
  message: z.string().min(1, 'Message is required').transform(sanitizeInput),
});

// 사용
const result = ContactFormInputsSchema.safeParse(formData);
if (!result.success) {
  throw new Error('유효하지 않은 입력');
}
```

### 봇 방지

Contact 폼에 Cloudflare Turnstile 적용:

- **획득**: [Cloudflare Dashboard](https://dash.cloudflare.com/)에서 Turnstile 생성
- **환경 변수**: `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- **서버 측 검증**: Netlify Functions에서 토큰 검증

### XSS 방지

- React 기본 이스케이프 신뢰
- `dangerouslySetInnerHTML` 금지 (MDX 제외)
- 사용자 입력 sanitize (`isomorphic-dompurify`)

## Git 워크플로우

### 커밋 메시지

```
type(scope): 한국어 제목

- 한국어 본문
- 변경 사항 설명
```

#### Type

| Type       | 설명             | 예시                                  |
| ---------- | ---------------- | ------------------------------------- |
| `feat`     | 새 기능          | `feat(post): 태그 필터링 추가`        |
| `fix`      | 버그 수정        | `fix(contact): 이메일 검증 오류 수정` |
| `refactor` | 리팩토링         | `refactor(header): 네비게이션 분리`   |
| `test`     | 테스트 추가/수정 | `test(button): 클릭 테스트 추가`      |
| `docs`     | 문서 수정        | `docs(readme): 설치 가이드 업데이트`  |
| `style`    | 코드 스타일      | `style: Prettier 포맷팅 적용`         |
| `chore`    | 빌드/설정 변경   | `chore(deps): React 19.2.3 업데이트`  |

#### 예시

```bash
# ✅ Good
feat(button): 다크 모드 스타일 추가

- primary variant 색상 적용
- focus-visible 링 개선

# ❌ Bad
update code  # type 없음, 설명 부족
```

### 브랜치 전략

```
type/description
```

| Type        | 용도        | 예시                        |
| ----------- | ----------- | --------------------------- |
| `feat/`     | 새 기능     | `feat/dark-mode`            |
| `fix/`      | 버그 수정   | `fix/contact-validation`    |
| `refactor/` | 리팩토링    | `refactor/header-component` |
| `test/`     | 테스트 추가 | `test/e2e-contact`          |

### 워크플로우

```bash
# 1. main에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feat/dark-mode

# 2. 개발 및 커밋
git add .
git commit -m "feat(theme): 다크 모드 토글 추가"

# 3. 푸시 및 PR 생성
git push origin feat/dark-mode
# GitHub에서 PR 생성

# 4. 머지 후 정리
git checkout main
git pull origin main
git branch -d feat/dark-mode
```

### Pre-commit Hook

커밋 시 자동으로 4단계 검사가 실행됩니다:

```bash
# .husky/pre-commit
# 1. security-scanner: 민감 정보 탐지
# 2. tsc --noEmit: 타입 체크
# 3. lint-staged: 린트/포맷
# 4. vitest related --run: 관련 테스트
```

## 배포

### Netlify 자동 배포

- **트리거**: `main` 브랜치 push 시 자동 배포
- **빌드 명령어**: `pnpm build`
- **출력 디렉토리**: `dist`

### 환경 변수 설정

Netlify Dashboard에서 설정:

1. Site settings → Environment variables
2. Add a variable
3. 다음 변수 설정:
   - `RESEND_API_KEY`
   - `VITE_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `VITE_GIT_RAW_URL`

### 배포 전 체크리스트

- [ ] 로컬에서 테스트 완료 (`pnpm dev`)
- [ ] 빌드 성공 확인 (`pnpm build`)
- [ ] Lint 통과 (`pnpm lint`)
- [ ] 포맷팅 적용 (`pnpm fmt`)
- [ ] 테스트 통과 (`pnpm test run`)

## 문제 해결

### 빌드 에러

**증상**: `pnpm build` 실패

**해결**:

```bash
# 1. TypeScript 에러 확인
pnpm tsc --noEmit

# 2. ESLint 에러 확인
pnpm lint

# 3. 의존성 재설치
rm -rf node_modules
pnpm install

# 4. 캐시 삭제
pnpm clean
pnpm install
pnpm build
```

### 환경 변수 문제

**증상**: Contact 폼이 작동하지 않음

**해결**:

1. `.env.local` 파일 존재 확인
2. 환경 변수 값 확인
3. 개발 서버 재시작 필요
4. `pnpm dev:server`로 Netlify Functions 실행

### 타입 에러

**증상**: TypeScript 에러 발생

**해결**:

```bash
# TypeScript 서버 재시작
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"

# 또는 타입 체크
pnpm tsc --noEmit
```

### 포트 충돌

**증상**: 개발 서버가 시작되지 않음

**해결**:

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :5173

# 프로세스 종료
kill -9 <PID>
```

### Contact 폼 Turnstile 에러

**증상**: Turnstile 위젯이 표시되지 않음

**해결**:

1. `VITE_TURNSTILE_SITE_KEY` 환경 변수 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. Cloudflare Dashboard에서 사이트 키 확인
4. 로컬에서는 `localhost` 도메인 허용 확인

### 콘텐츠 로딩 실패

**증상**: 포스트가 표시되지 않음

**해결**:

1. `VITE_GIT_RAW_URL` 환경 변수 확인
2. `blog-content` 리포지터리 public 설정 확인
3. `index.json` 파일 존재 확인
4. 브라우저 Network 탭에서 요청 확인

## 참고 문서

- [agents.md](./agents.md) - AI 코딩 에이전트 가이드
- [architecture.md](./architecture.md) - 프로젝트 구조 및 아키텍처
- [retrospective/overview.md](./retrospective/overview.md) - 프로젝트 회고 및 의사결정 로그
