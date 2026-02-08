# AI 코딩 에이전트 가이드

## 📋 목차

- [개요](#개요)
- [대상](#대상)
- [프로젝트 정보](#프로젝트-정보)
- [명령어](#명령어)
- [코드 스타일](#코드-스타일)
- [아키텍처 규칙](#아키텍처-규칙)
- [테스팅](#테스팅)
- [보안](#보안)
- [언어 및 문서화](#언어-및-문서화)
- [커밋 규칙](#커밋-규칙)
- [AI 답변 검증](#ai-답변-검증)
- [자주 하는 실수](#자주-하는-실수)
- [참고 문서](#참고-문서)

## 개요

이 문서는 AI 코딩 에이전트(Claude, GitHub Copilot, Cursor 등)가 이 프로젝트에서 코드를 작성할 때 따라야 할 규칙과 가이드라인을 정의합니다. 프로젝트의 코드 품질과 일관성을 유지하기 위한 필수 지침입니다.

## 대상

### ✅ 포함 대상

- AI 코딩 에이전트 (Claude, GitHub Copilot, Cursor, Amazon Kiro 등)
- AI와 협업하는 개발자가 AI에게 제공할 컨텍스트로 활용
- 코드 작성, 테스트, 리팩토링 시 참고

### ❌ 제외 대상

- 처음 프로젝트를 설정하는 개발자 → [development.md](./development.md) 참고
- 프로젝트 구조를 이해하고 싶은 경우 → [architecture.md](./architecture.md) 참고
- 프로젝트 이력을 확인하고 싶은 경우 → [project-log.md](./project-log.md) 참고

## 프로젝트 정보

### 기술 스택

- **프레임워크**: React 19, TanStack Router v1, Vite v7, TypeScript 5
- **스타일링**: Tailwind CSS v4
- **국제화**: i18next
- **상태 관리**: Zustand
- **검증**: Zod v4
- **콘텐츠**: MDX (gray-matter + rehype/remark)
- **테스팅**: Vitest, Playwright, Storybook, fast-check
- **배포**: Netlify

### 아키텍처

Feature-Sliced Design (FSD) 패턴 사용

```
routes → widgets → features → entities → shared
```

### 리포지터리 구조

- **blog** (현재): React + TanStack Router 애플리케이션
- **blog-content**: MDX 콘텐츠 저장소 (분리됨)

## 명령어

### 개발 서버

```bash
pnpm dev              # Vite 개발 서버 (localhost:5173)
pnpm dev:server       # Netlify Functions와 함께 시작 (localhost:8888)
pnpm build            # 프로덕션 빌드
pnpm preview          # 프로덕션 빌드 미리보기
```

### 린트/포맷팅

```bash
pnpm lint             # ESLint 실행
pnpm fmt              # Prettier 포맷팅
pnpm tsc --noEmit     # TypeScript 타입 체크
```

### 테스트 ⭐

```bash
# 전체 테스트
pnpm test             # Vitest (Watch 모드)
pnpm test run         # Vitest (1회 실행, CLI 옵션)
pnpm coverage         # 커버리지 리포트

# 단일 파일 테스트
pnpm test button.test.tsx

# 이름 필터
pnpm test -t "다크 모드"
pnpm test -t "클릭 시 onClick 호출"

# 프로젝트 필터
pnpm test --project=unit
pnpm test --project=storybook
```

### E2E 테스트

```bash
pnpm e2e:ui           # Playwright E2E 테스트 (UI 모드)
```

### Storybook

```bash
pnpm storybook        # Storybook 개발 서버 (localhost:6006)
pnpm build-storybook  # Storybook 빌드
```

## 코드 스타일

### Import 순서 (4단계)

```typescript
// 1. React/TanStack Router
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';

// 2. 외부 라이브러리
import { z } from 'zod';
import { create } from 'zustand';

// 3. 내부 모듈 (@/*)
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/util/date-utils';
import { useTheme } from '@/shared/hooks/use-theme';

// 4. 타입 import
import type { Post } from '@/shared/types';
import type { Locale } from '@/shared/config/i18n';
```

### TypeScript

#### 지시사항

- **strict 모드** 사용
- **any 타입 금지** - 명확한 타입 정의 필수
- **타입 가드 선호** - 타입 단언(as) 최소화
- **제네릭 활용** - 중복 함수 대신 제네릭 사용

#### 예제

```typescript
// ❌ Bad - any 타입
function processData(data: any) {
  return data.value;
}

// ✅ Good - 명확한 타입
interface Data {
  value: string;
  count: number;
}

function processData(data: Data) {
  return data.value;
}

// ❌ Bad - 타입 단언
const element = document.getElementById('app') as HTMLDivElement;

// ✅ Good - 타입 가드
const element = document.getElementById('app');
if (element instanceof HTMLDivElement) {
  // element는 HTMLDivElement로 추론됨
}

// ✅ Good - 제네릭 활용
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### 명명 규칙

| 대상            | 규칙             | 예시                                      |
| --------------- | ---------------- | ----------------------------------------- |
| 컴포넌트        | PascalCase       | `Button`, `PostCard`, `ContactForm`       |
| 함수/변수       | camelCase        | `formatDate`, `userName`, `isLoading`     |
| 상수            | UPPER_SNAKE_CASE | `API_URL`, `MAX_COUNT`, `DEFAULT_LOCALE`  |
| 타입/인터페이스 | PascalCase       | `User`, `PostMetadata`, `ContactFormData` |
| 파일명          | kebab-case       | `post-card.tsx`, `use-theme.ts`           |

### 컴포넌트 구조 (6단계)

#### 지시사항

컴포넌트는 다음 순서로 작성:

1. 타입 정의
2. 커스텀 훅
3. 파생 값 계산
4. 이벤트 핸들러
5. 이펙트
6. 렌더링

#### 예제

```typescript
// 1. 타입 정의
interface ComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

// 2. 컴포넌트
export function Component({ title, description, onAction }: ComponentProps) {
  // 2-1. 훅 (상태, 커스텀 훅)
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  // 2-2. 파생 값 (useMemo 등)
  const displayTitle = title.toUpperCase();

  // 2-3. 이벤트 핸들러
  const handleClick = () => {
    setIsOpen(true);
    onAction?.();
  };

  // 2-4. 이펙트
  useEffect(() => {
    // 사이드 이펙트
  }, []);

  // 2-5. 조건부 렌더링
  if (!title) {
    return null;
  }

  // 2-6. 렌더링
  return (
    <div>
      <h1>{displayTitle}</h1>
      {description && <p>{description}</p>}
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

### Tailwind CSS 순서 (8단계)

#### 지시사항

Tailwind 클래스는 다음 순서로 작성:

1. Layout (레이아웃)
2. Size (크기)
3. Spacing (여백)
4. Typography (타이포그래피)
5. Visual (시각적 요소)
6. Interaction (상호작용)
7. Responsive (반응형)
8. Dark Mode (다크 모드)

#### 예제

```typescript
// 실제 프로젝트 예시
export function PostCard({ title, excerpt, tags }: PostCardProps) {
  return (
    <article
      className="
        flex flex-col
        w-full max-w-md
        p-6 gap-4
        text-gray-900
        rounded-xl shadow-sm bg-white border border-gray-100
        hover:shadow-md hover:border-gray-200
        transition-all duration-200
        dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700
      "
    >
      <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
      <p className="text-gray-600 line-clamp-3 dark:text-gray-400">{excerpt}</p>
    </article>
  );
}
```

#### 주의사항

- ⚠️ 인라인 스타일 사용 금지 (`style={{ ... }}`)
- ⚠️ 매직 넘버 대신 상수 사용
- ⚠️ 중첩된 삼항 연산자 지양

## 아키텍처 규칙

### FSD 레이어 의존성

#### 지시사항

```
routes → widgets → features → entities → shared
```

- **routes/**: 라우팅, widgets/features/entities/shared import 가능
- **widgets/**: 복합 UI, features/entities/shared import 가능
- **features/**: 비즈니스 기능, entities/shared만 import 가능
- **entities/**: 도메인 엔티티, shared만 import 가능
- **shared/**: 공유 리소스, 다른 레이어 import 불가

#### 주의사항

- ❌ **역방향 import 금지** (예: shared → features)
- ❌ **features/ 간 import 금지** (예: features/post → features/contact)
- ❌ **features/ 내부에서 widgets/ import 금지**

### 경로 별칭

```typescript
// ✅ Good - 절대 경로 사용
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/util/date-utils';

// ❌ Bad - 상대 경로
import { Button } from '../../../shared/components/ui/button';
```

### 파일 명명

| 파일 종류    | 규칙                  | 예시                            |
| ------------ | --------------------- | ------------------------------- |
| 컴포넌트     | `PascalCase.tsx`      | `Button.tsx`, `PostCard.tsx`    |
| 유틸리티     | `kebab-case.ts`       | `date-utils.ts`, `sanitize.ts`  |
| 테스트       | `*.test.tsx`          | `button.test.tsx`               |
| Storybook    | `*.stories.tsx`       | `button.stories.tsx`            |
| 타입         | `*.types.ts`          | `post.types.ts`                 |
| 스키마 (Zod) | `*.schema.ts`         | `contact-form.schema.ts`        |
| 훅           | `use-*.ts`            | `use-theme.ts`, `use-resize.ts` |
| 설정         | `*.config.ts`         | `vitest.config.ts`              |
| 인덱스       | `index.ts` (re-export | export만)                       |

## 테스팅

### TDD 원칙

#### 지시사항

1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소 코드 작성
3. **Refactor**: 코드 리팩토링 후 테스트 재실행

#### 예제

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

#### 주의사항

- ❌ 테스트를 우회하는 방법 사용 금지
- ❌ 하드코딩으로 테스트 통과 금지
- ❌ 테스트 없이 코드 작성 금지

### Property-based 테스트

#### 지시사항

다양한 입력 조합이 있는 컴포넌트나 엣지 케이스가 많은 함수에 사용:

- fast-check + Vitest 사용
- **Arbitrary**: 무작위 값 생성기 정의
- **Property**: 모든 입력에 대해 참이어야 하는 규칙 검증
- **numRuns**: 30-50회 권장
- **unmount 필수**: 각 반복 후 DOM 정리

#### 예제

```typescript
import fc from 'fast-check';

// Arbitrary 정의
const variantArb = fc.constantFrom<ButtonVariant>('primary', 'default', 'danger', 'link');
const shapeArb = fc.constantFrom<ButtonShape>('fill', 'outline');

// Property 검증
it('모든 variant/shape 조합에서 다크 모드 클래스 포함', () => {
  fc.assert(
    fc.property(variantArb, shapeArb, (variant, shape) => {
      const { unmount } = render(
        <Button variant={variant} shape={shape}>Test</Button>
      );
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      unmount(); // 각 반복 후 DOM 정리 필수
    }),
    { numRuns: 30 }
  );
});
```

#### 주의사항

- ⚠️ Property-Based 테스트에서는 **각 반복 후 unmount() 필수**
- ⚠️ 일반 Unit 테스트에서는 unmount() 불필요 (자동 cleanup)

### 테스트 프로젝트

```bash
# 유닛 테스트
pnpm test --project=unit

# Storybook 인터랙션 테스트
pnpm test --project=storybook

# E2E 테스트
pnpm e2e:ui
```

### 테스트 커버리지 목표

- **전체**: 80% 이상
- **유틸리티 함수**: 90% 이상
- **비즈니스 로직**: 85% 이상
- **UI 컴포넌트**: 70% 이상

## 보안

### 환경 변수

#### 지시사항

- **클라이언트 노출 가능**: `VITE_*` 접두사
- **서버 전용**: Netlify Functions 환경 변수 (접두사 없음)
- **하드코딩 금지**: 환경 변수 사용 필수

#### 예제

```typescript
// ✅ Good - Netlify Functions에서 서버 환경 변수
const secretKey = process.env.TURNSTILE_SECRET_KEY;

// ✅ Good - 클라이언트에서 VITE_ 변수
const siteKey = process.env.VITE_TURNSTILE_SITE_KEY;

// ❌ Bad - 하드코딩
const apiKey = 're_xxxxxxxxxxxxxxxxxxxx';
```

#### 주의사항

- ⚠️ `.env.local` 파일은 Git에 커밋 금지
- ⚠️ 서버 환경 변수를 클라이언트에 노출 금지

### 입력 검증

#### 지시사항

- **Zod 스키마** 검증 필수
- **사용자 입력 sanitize** - DOMPurify 사용 (`isomorphic-dompurify`)

#### 예제

```typescript
import { z } from 'zod';
import { sanitizeInput } from '@/shared/util/sanitize';

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
```

### XSS 방지

#### 지시사항

- React 기본 이스케이프 신뢰
- `dangerouslySetInnerHTML` 사용 금지 (MDX 제외)
- MDX는 `gray-matter + rehype/remark` + rehype/remark 플러그인 사용

#### 주의사항

- ⚠️ 사용자 입력을 직접 렌더링하지 말 것
- ⚠️ MDX 콘텐츠도 외부 리포지터리에서 가져오므로 sanitization 중요

## 언어 및 문서화

### 한글 사용 ⭐

#### 지시사항

- **문서 (.md)**: 한국어 필수
- **코드 주석**: 한국어 강력 권장
- **커밋 메시지**: 한국어 필수
- **에러 메시지**: 사용자 대면 메시지는 i18n

### 영어 사용

#### 지시사항

- **변수/함수명**: 영어 (camelCase, PascalCase)
- **타입명**: 영어 (PascalCase)

### 예제

```typescript
// ✅ Good - 한국어 주석, 영어 변수명
// 사용자 인증 상태 확인
const isAuthenticated = checkAuth();

// 포스트 목록을 날짜순으로 정렬
const sortedPosts = posts.sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// ❌ Bad - 영어 주석
// Check user authentication status
const isAuthenticated = checkAuth();
```

### 커밋 메시지 예제

```bash
# ✅ Good - 한국어 커밋 메시지
feat(button): 다크 모드 스타일 추가

- primary variant 색상 적용
- focus-visible 링 개선

# ❌ Bad - 영어 커밋 메시지
feat(button): add dark mode styles
```

## 커밋 규칙

### 형식

```
type(scope): 한국어 제목

- 한국어 본문
- 변경 사항 설명
```

### Type

| Type       | 설명             | 예시                                  |
| ---------- | ---------------- | ------------------------------------- |
| `feat`     | 새 기능          | `feat(post): 태그 필터링 추가`        |
| `fix`      | 버그 수정        | `fix(contact): 이메일 검증 오류 수정` |
| `refactor` | 리팩토링         | `refactor(header): 네비게이션 분리`   |
| `test`     | 테스트 추가/수정 | `test(button): 클릭 테스트 추가`      |
| `docs`     | 문서 수정        | `docs(readme): 설치 가이드 업데이트`  |
| `style`    | 코드 스타일      | `style: Prettier 포맷팅 적용`         |
| `chore`    | 빌드/설정 변경   | `chore(deps): React 19.2.3 업데이트`  |

### Scope 예시

- 기능/컴포넌트: `button`, `post`, `contact`, `header`
- 의존성: `deps`
- 설정: `config`, `vitest`, `storybook`

## AI 답변 검증

### 정보 정확성

#### 지시사항

- ✅ 실제 파일/함수 확인
- ✅ 공식 문서와 대조
- ❌ 환각(hallucination) 경계 - 존재하지 않는 함수/API 확인

### 재사용성

#### 지시사항

- 기존 컴포넌트/유틸 우선 재사용
- 중복 코드 생성 지양
- 프로젝트에 이미 설치된 라이브러리 활용

### 오버엔지니어링 방지

#### 지시사항

- 현재 요구사항에 집중
- 불필요한 추상화 지양
- YAGNI (You Aren't Gonna Need It) 원칙 준수
- KISS (Keep It Simple, Stupid) 원칙 준수

### 검증 프로세스

1. **즉시 검증**: AI 답변 직후 체크리스트 확인
2. **코드 적용 전**: 관련 항목 집중 검증
3. **실행 테스트**: 코드 적용 후 동작 확인
4. **반복**: 문제 발견 시 수정 요청

## 자주 하는 실수

### 안티패턴

```typescript
// ❌ Bad - any 타입 사용
function processData(data: any) { ... }

// ❌ Bad - useEffect 의존성 배열 누락
useEffect(() => {
  fetchData(userId);
}, []); // userId 누락!

// ❌ Bad - 중첩된 삼항 연산자
const result = a ? b ? c : d : e;

// ❌ Bad - features/ 간 import
// src/features/contact/ui/form.tsx
import { PostCard } from '@/features/post/ui/card'; // 금지!

// ❌ Bad - 하드코딩된 문자열 (i18n 사용해야 함)
<button>Submit</button> // 다국어 지원 불가

// ✅ Good
<button>{t('common.submit')}</button>
```

### FSD 레이어 위반

```typescript
// ❌ Bad - shared에서 features import
// src/shared/util/post-utils.ts
import { PostCard } from '@/features/post'; // 금지!

// ❌ Bad - entities에서 features import
// src/entities/markdown/util.ts
import { formatPost } from '@/features/post'; // 금지!

// ✅ Good - 올바른 방향
// src/features/post/ui/card.tsx
import { renderMDX } from '@/entities/markdown'; // OK
import { Button } from '@/shared/components/ui/button'; // OK
```

### 테스트 안티패턴

```typescript
// ❌ Bad - 하드코딩으로 테스트 통과
it('should return user name', () => {
  const result = getUserName();
  expect(result).toBe('John'); // 하드코딩된 값!
});

// ❌ Bad - Property-Based 테스트에서 unmount 누락
it('should apply styles', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      render(<Button variant={variant}>Test</Button>);
      // unmount() 누락 - DOM 정리 안 됨!
    })
  );
});

// ✅ Good
it('should apply styles', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      unmount(); // 필수!
    })
  );
});
```

## 참고 문서

- [development.md](./development.md) - 개발 시작 및 환경 설정
- [architecture.md](./architecture.md) - FSD 구조 상세 설명
- [project-log.md](./project-log.md) - 프로젝트 이력 및 의사결정
