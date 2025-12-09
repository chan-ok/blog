# 테스팅 가이드

## 개요

이 문서는 프로젝트의 테스트 전략, 도구, 그리고 베스트 프랙티스를 다룹니다. 현재 테스트 코드가 완전히 작성되지 않은 상태이므로, 이 문서는 향후 테스트 작성 시 참고할 가이드라인으로 활용됩니다.

## 테스트 스택

### 테스트 도구

```
┌─────────────────────────────────────────────┐
│            테스트 피라미드                    │
├─────────────────────────────────────────────┤
│  E2E Tests (Playwright)        [적음]       │
│  ├─ 사용자 플로우                            │
│  └─ 크로스 브라우저                          │
├─────────────────────────────────────────────┤
│  Integration Tests (Vitest)    [중간]       │
│  ├─ 컴포넌트 통합                            │
│  └─ API 통합                                │
├─────────────────────────────────────────────┤
│  Unit Tests (Vitest)           [많음]       │
│  ├─ 유틸리티 함수                            │
│  ├─ 커스텀 훅                                │
│  └─ 비즈니스 로직                            │
├─────────────────────────────────────────────┤
│  Component Tests                             │
│  ├─ Storybook (시각적 테스트)                │
│  └─ Testing Library (상호작용)               │
└─────────────────────────────────────────────┘
```

### 설치된 도구

#### 1. Vitest

- **역할**: 유닛 테스트 및 통합 테스트
- **실행**: `pnpm test`
- **설정**: `vitest.config.ts`

#### 2. Playwright

- **역할**: E2E 테스트
- **실행**: `pnpm e2e`
- **설정**: `playwright.config.ts`

#### 3. Testing Library

- **역할**: 컴포넌트 테스트
- **패키지**: `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`

#### 4. Storybook

- **역할**: 컴포넌트 시각적 테스트 및 문서화
- **실행**: `pnpm storybook`
- **통합**: Chromatic (시각적 회귀 테스트)

## 테스트 전략

### 1. 유닛 테스트 (Unit Tests)

**대상**:

- 유틸리티 함수
- 커스텀 훅
- 비즈니스 로직
- 스키마 검증 (Zod)

**작성 위치**: 테스트 대상과 같은 디렉토리에 `.test.ts` 또는 `.spec.ts`

**예시 구조**:

```
src/
├── shared/
│   ├── lib/
│   │   ├── date-utils.ts
│   │   └── date-utils.test.ts
│   └── hooks/
│       ├── use-breakpoint.ts
│       └── use-breakpoint.test.ts
```

**작성 예시**:

```typescript
// src/shared/lib/date-utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, parseDate } from './date-utils';

describe('formatDate', () => {
  it('should format date in ko locale', () => {
    const date = new Date('2025-12-06');
    expect(formatDate(date, 'ko')).toBe('2025년 12월 6일');
  });

  it('should format date in en locale', () => {
    const date = new Date('2025-12-06');
    expect(formatDate(date, 'en')).toBe('December 6, 2025');
  });
});
```

### 2. 컴포넌트 테스트 (Component Tests)

**대상**:

- UI 컴포넌트
- 사용자 상호작용
- 조건부 렌더링

**도구**: Testing Library + Vitest

**작성 위치**: 컴포넌트와 같은 디렉토리

**작성 예시**:

```typescript
// src/shared/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### 3. 통합 테스트 (Integration Tests)

**대상**:

- Feature 레벨 통합 (여러 컴포넌트 + 로직)
- API 통합
- 데이터 흐름

**작성 예시**:

```typescript
// src/features/contact/contact-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from './contact-form';

// Mock fetch
global.fetch = vi.fn();

describe('ContactForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit form successfully', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'sent' }),
    } as Response);

    render(<ContactForm />);

    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/message/i), 'Test Message');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/mail', expect.any(Object));
    });

    // Verify success message
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    render(<ContactForm />);

    // Submit without filling
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    // Verify error messages
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### 4. E2E 테스트 (End-to-End Tests)

**대상**:

- 주요 사용자 플로우
- 크리티컬 경로
- 크로스 브라우저 호환성

**도구**: Playwright

**작성 위치**: `e2e/` 디렉토리

**작성 예시**:

```typescript
// e2e/contact.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should submit contact form successfully', async ({ page }) => {
    // Navigate to contact page
    await page.goto('/ko/contact');

    // Fill form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'Test Message');

    // Wait for Turnstile
    await page.waitForSelector('[data-turnstile="success"]');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('should navigate between locales', async ({ page }) => {
    await page.goto('/ko');

    // Switch to English
    await page.click('[data-testid="locale-switcher"]');
    await page.click('text=English');

    // Verify URL changed
    await expect(page).toHaveURL('/en');
  });
});
```

### 5. 시각적 테스트 (Visual Tests)

**도구**: Storybook + Chromatic

**작성 위치**: `src/stories/` 또는 컴포넌트와 같은 디렉토리에 `.stories.tsx`

**작성 예시**:

```typescript
// src/shared/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
```

## 테스트 실행

### 명령어

```bash
# 유닛/통합 테스트 (Watch 모드)
pnpm test

# 테스트 1회 실행
pnpm test:run

# 커버리지 확인
pnpm coverage

# E2E 테스트
pnpm e2e

# E2E UI 모드
pnpm e2e:ui

# Storybook 실행
pnpm storybook

# Storybook 빌드
pnpm build-storybook
```

### CI/CD에서 실행

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test:run

      - name: Run E2E tests
        run: pnpm e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 테스트 커버리지

### 목표

- **전체**: 80% 이상
- **유틸리티 함수**: 90% 이상
- **비즈니스 로직**: 85% 이상
- **UI 컴포넌트**: 70% 이상

### 커버리지 확인

```bash
pnpm coverage
```

결과는 `coverage/` 디렉토리에 HTML 리포트로 생성됩니다.

### 커버리지 예외

다음 파일들은 커버리지에서 제외할 수 있습니다:

- Storybook 스토리 파일 (`*.stories.tsx`)
- 타입 정의 파일 (`*.d.ts`)
- 설정 파일 (`*.config.ts`)
- Next.js App Router 파일 (`app/**/page.tsx`, `app/**/layout.tsx`)

## 모킹 (Mocking)

### 1. 모듈 모킹

```typescript
import { vi } from 'vitest';

// 전체 모듈 모킹
vi.mock('axios');

// 부분 모킹
vi.mock('./utils', () => ({
  ...vi.importActual('./utils'),
  fetchData: vi.fn(),
}));
```

### 2. 환경 변수 모킹

```typescript
import { vi } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_GIT_RAW_URL', 'https://example.com');
});

afterAll(() => {
  vi.unstubAllEnvs();
});
```

### 3. Next.js 라우터 모킹

```typescript
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/ko',
  }),
  usePathname: () => '/ko',
}));
```

### 4. Fetch 모킹

```typescript
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'test' }),
} as Response);
```

## 베스트 프랙티스

### 1. AAA 패턴

```typescript
it('should do something', () => {
  // Arrange (준비)
  const input = 'test';

  // Act (실행)
  const result = myFunction(input);

  // Assert (검증)
  expect(result).toBe('expected');
});
```

### 2. 테스트 격리

```typescript
describe('Feature', () => {
  beforeEach(() => {
    // 각 테스트 전 초기화
    vi.clearAllMocks();
  });

  it('test 1', () => {
    // 독립적인 테스트
  });

  it('test 2', () => {
    // test 1에 의존하지 않음
  });
});
```

### 3. 명확한 테스트 이름

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should return formatted date in ko locale', () => { ... });
```

### 4. 사용자 관점에서 테스트

```typescript
// ❌ Bad - 구현 세부사항 테스트
expect(component.state.isOpen).toBe(true);

// ✅ Good - 사용자가 보는 것 테스트
expect(screen.getByRole('dialog')).toBeVisible();
```

### 5. 비동기 처리

```typescript
// waitFor 사용
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// findBy 사용 (자동 대기)
const element = await screen.findByText('Loaded');
expect(element).toBeInTheDocument();
```

### 6. 접근성 기반 쿼리

```typescript
// ❌ Bad
screen.getByTestId('submit-button');

// ✅ Good
screen.getByRole('button', { name: /submit/i });
```

## 테스트하기 어려운 경우

### 1. Turnstile Widget

Turnstile은 E2E 테스트에서만 테스트하고, 유닛/통합 테스트에서는 모킹:

```typescript
vi.mock('@/widgets/turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    useEffect(() => {
      onSuccess('mock-token');
    }, []);
    return <div data-testid="turnstile-mock" />;
  },
}));
```

### 2. MDX 렌더링

MDX 렌더링은 통합 테스트 레벨에서 테스트:

```typescript
it('should render MDX content', async () => {
  const mockMDX = '# Title\n\nContent';
  render(<MDXRenderer source={mockMDX} />);

  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Title');
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

### 3. 외부 API 호출

항상 모킹하여 테스트:

```typescript
vi.mock('@/features/post/util/get-posts', () => ({
  getPosts: vi.fn().mockResolvedValue([{ id: '1', title: 'Test Post' }]),
}));
```

## 디버깅

### Vitest

```typescript
// 디버거 사용
it('should work', () => {
  debugger; // 또는 브레이크포인트
  expect(result).toBe('expected');
});
```

### Testing Library

```typescript
import { screen } from '@testing-library/react';

// DOM 트리 출력
screen.debug();

// 특정 요소 출력
screen.debug(screen.getByRole('button'));
```

### Playwright

```typescript
// 헤드리스 모드 비활성화
test.use({ headless: false });

// 느린 모션
test.use({ slowMo: 1000 });

// 디버그 모드
await page.pause();
```

## 참고 자료

### 공식 문서

- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Storybook](https://storybook.js.org/)

### 가이드

- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

## 우선순위 테스트 작성 계획

향후 테스트 작성 시 다음 순서로 진행 권장:

### Phase 1: 유틸리티 & 비즈니스 로직

- [ ] `src/shared/lib/` 유틸리티 함수
- [ ] `src/shared/hooks/` 커스텀 훅
- [ ] Zod 스키마 검증 로직

### Phase 2: 컴포넌트

- [ ] `src/shared/ui/` 기본 UI 컴포넌트
- [ ] `src/features/*/ui/` Feature 컴포넌트
- [ ] `src/widgets/` Widget 컴포넌트

### Phase 3: 통합 기능

- [ ] Contact 폼 전체 플로우
- [ ] Posts 목록 및 상세 페이지
- [ ] 언어 전환 기능

### Phase 4: E2E

- [ ] 주요 사용자 플로우 (홈 → 포스트 → Contact)
- [ ] 다국어 네비게이션
- [ ] 폼 제출 플로우

## 관련 문서

- [개발 규칙](./rule.md) - 핵심 개발 원칙
- [코드 스타일 가이드](./code-style.md) - 코드 작성 규칙
- [아키텍처](./architecture.md) - FSD 구조

---

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
