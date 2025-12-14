# 테스팅 가이드

## 개요

이 문서는 프로젝트의 테스트 전략, 도구, 그리고 베스트 프랙티스를 다룹니다.

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
│  Property-Based Tests (fast-check)          │
│  ├─ 무작위 입력값 기반 속성 검증              │
│  └─ 엣지 케이스 자동 탐색                    │
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

#### 4. fast-check

- **역할**: Property-Based Testing (속성 기반 테스트)
- **패키지**: `fast-check`
- **용도**: 무작위 입력값으로 "모든 경우에 대해 참이어야 하는 규칙" 검증

#### 5. Storybook

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
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── button.test.tsx      # Unit + Property-Based 테스트
│   │       └── button.stories.tsx   # Storybook 스토리
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

### 2. Property-Based 테스트 (Property-Based Tests)

**개념**: 특정 예시가 아닌 "모든 경우에 대해 참이어야 하는 규칙(속성)"을 검증하는 테스트 방식

**대상**:

- 다양한 입력 조합이 있는 컴포넌트 (variant, shape 등)
- 엣지 케이스가 많은 유틸리티 함수
- 일관성이 보장되어야 하는 스타일/동작

**도구**: fast-check + Vitest

**작성 위치**: 테스트 대상과 같은 디렉토리에 `.test.tsx`

**핵심 개념**:

```typescript
// Arbitrary: 무작위 값을 생성하는 생성기
const variantArb = fc.constantFrom<ButtonVariant>('primary', 'default', 'danger', 'link');
const shapeArb = fc.constantFrom<ButtonShape>('fill', 'outline');

// Property: 모든 입력에 대해 참이어야 하는 규칙
fc.assert(
  fc.property(variantArb, shapeArb, (variant, shape) => {
    // 이 블록은 무작위 variant, shape 조합으로 여러 번 실행됨
    const { unmount } = render(<Button variant={variant} shape={shape}>Test</Button>);
    const button = screen.getByRole('button');

    // 검증: 모든 조합에서 다크 모드 클래스가 포함되어야 함
    expect(button.className).toMatch(/dark:/);

    // 중요: 각 반복 후 unmount 호출하여 DOM 정리
    unmount();
  }),
  { numRuns: 50 } // 50회 반복 테스트
);
```

**작성 예시** (실제 Button 컴포넌트 테스트):

```typescript
// src/shared/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
import { Button, type ButtonVariant, type ButtonShape } from './button';

// ============================================================================
// Arbitraries (무작위 값 생성기)
// ============================================================================

const variantArb = fc.constantFrom<ButtonVariant>('primary', 'default', 'danger', 'link');
const shapeArb = fc.constantFrom<ButtonShape>('fill', 'outline');
const nonLinkVariantArb = fc.constantFrom<ButtonVariant>('primary', 'default', 'danger');

// ============================================================================
// Property-Based 테스트
// ============================================================================

describe('Property: Props 전달', () => {
  /**
   * aria-label 속성이 button 요소에 올바르게 전달되는지 검증
   */
  it('should pass aria attributes to the button element', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (label) => {
        const { unmount } = render(<Button aria-label={label}>Click me</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', label);
        unmount(); // Property-Based 테스트에서는 각 반복 후 unmount 필수
      }),
      { numRuns: 50 }
    );
  });

  /**
   * className이 기존 스타일과 병합되어 전달되는지 검증
   */
  it('should pass className to the button element', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9-]*$/), // 유효한 CSS 클래스명
        variantArb,
        shapeArb,
        (customClass, variant, shape) => {
          const { unmount } = render(
            <Button variant={variant} shape={shape} className={customClass}>
              Click me
            </Button>
          );
          const button = screen.getByRole('button');
          expect(button.className).toContain(customClass);
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property: 일관된 기본 스타일 적용', () => {
  /**
   * link를 제외한 모든 variant/shape 조합에서 기본 스타일이 적용되는지 검증
   */
  it('should apply consistent base styles for non-link variants', () => {
    fc.assert(
      fc.property(nonLinkVariantArb, shapeArb, (variant, shape) => {
        const { unmount } = render(
          <Button variant={variant} shape={shape}>Test Button</Button>
        );
        const button = screen.getByRole('button');
        const className = button.className;

        expect(className).toContain('rounded-lg');  // 둥근 모서리
        expect(className).toContain('px-4');        // 수평 패딩
        expect(className).toContain('py-2');        // 수직 패딩
        expect(className).toContain('font-medium'); // 폰트 굵기
        unmount();
      }),
      { numRuns: 50 }
    );
  });
});

describe('Property: Link variant는 shape을 무시함', () => {
  /**
   * link variant는 어떤 shape을 전달해도 동일한 스타일이 적용되는지 검증
   */
  it('should apply identical styles for link variant regardless of shape', () => {
    fc.assert(
      fc.property(shapeArb, (shape) => {
        const { unmount: unmount1 } = render(
          <Button variant="link" shape={shape}>Link Button 1</Button>
        );
        const button1 = screen.getByRole('button', { name: 'Link Button 1' });
        const className1 = button1.className;

        const { unmount: unmount2 } = render(
          <Button variant="link" shape="fill">Link Button 2</Button>
        );
        const button2 = screen.getByRole('button', { name: 'Link Button 2' });
        const className2 = button2.className;

        // shape이 무시되므로 className이 동일해야 함
        expect(className1).toBe(className2);
        expect(className1).not.toContain('rounded-lg');
        expect(className1).toContain('bg-transparent');

        unmount1();
        unmount2();
      }),
      { numRuns: 50 }
    );
  });
});

describe('Property: 다크 모드 클래스 포함', () => {
  /**
   * 모든 variant/shape 조합에서 다크 모드 클래스가 포함되는지 검증
   */
  it('should include dark mode classes for all variant/shape combinations', () => {
    fc.assert(
      fc.property(variantArb, shapeArb, (variant, shape) => {
        const { unmount } = render(
          <Button variant={variant} shape={shape}>Test Button</Button>
        );
        const button = screen.getByRole('button');
        expect(button.className).toMatch(/dark:/);
        unmount();
      }),
      { numRuns: 50 }
    );
  });
});
```

**Property-Based vs Unit 테스트 비교**:

| 구분        | Unit 테스트        | Property-Based 테스트 |
| ----------- | ------------------ | --------------------- |
| 입력값      | 개발자가 직접 지정 | 무작위 자동 생성      |
| 검증 대상   | 특정 시나리오      | 모든 경우에 대한 규칙 |
| 엣지 케이스 | 수동으로 추가      | 자동 탐색             |
| 적합한 경우 | 구체적 동작 검증   | 일관성/불변성 검증    |

### 3. 컴포넌트 테스트 (Component Tests)

**대상**:

- UI 컴포넌트
- 사용자 상호작용
- 조건부 렌더링

**도구**: Testing Library + Vitest

**작성 위치**: 컴포넌트와 같은 디렉토리

**작성 예시**:

```typescript
// src/shared/components/ui/button.test.tsx (Unit 테스트 부분)
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './button';

describe('Button Component - Unit Tests', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies default variant and shape when not specified', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-gray-100');
    expect(button.className).toContain('text-gray-900');
  });

  it('applies disabled styles when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('disabled:opacity-50');
    expect(button.className).toContain('disabled:cursor-not-allowed');
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
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

**작성 위치**: 컴포넌트와 같은 디렉토리에 `.stories.tsx`

**작성 예시**:

```typescript
// src/shared/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './button';

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

// ✅ Good - Unit 테스트
it('should return formatted date in ko locale', () => { ... });

// ✅ Good - Property-Based 테스트
it('should apply consistent base styles for non-link variants', () => { ... });
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

### 7. Property-Based 테스트 작성 가이드

```typescript
// Arbitrary 정의: 테스트할 값의 범위를 명확히 지정
const variantArb = fc.constantFrom<ButtonVariant>(
  'primary',
  'default',
  'danger',
  'link'
);

// numRuns 설정: 테스트 목적에 맞게 반복 횟수 조정
fc.assert(
  fc.property(variantArb, (variant) => {
    // 검증 로직
  }),
  { numRuns: 50 } // 기본값 100, 빠른 피드백을 위해 50 권장
);

// 특수 케이스 분리: link variant처럼 다른 규칙을 따르는 경우 별도 테스트
const nonLinkVariantArb = fc.constantFrom<ButtonVariant>(
  'primary',
  'default',
  'danger'
);
```

### 8. Property-Based 테스트에서 unmount 호출

Property-Based 테스트는 동일한 테스트 케이스 내에서 여러 번 렌더링을 수행합니다. 이때 각 반복(iteration)이 끝날 때마다 `unmount()`를 명시적으로 호출하여 DOM을 정리해야 합니다.

**왜 필요한가?**

- `fc.assert`는 하나의 `it` 블록 내에서 여러 번 실행됨
- Testing Library의 자동 cleanup은 `it` 블록이 끝날 때만 동작
- 명시적 `unmount()` 없이는 이전 렌더링의 요소가 DOM에 남아 테스트 간섭 발생

```typescript
// ❌ Bad - unmount 없이 Property-Based 테스트
it('should apply styles', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      // 다음 반복에서 이전 버튼이 DOM에 남아있음!
    }),
    { numRuns: 50 }
  );
});

// ✅ Good - 각 반복 후 unmount 호출
it('should apply styles', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      unmount(); // 각 반복이 끝날 때 DOM 정리
    }),
    { numRuns: 50 }
  );
});
```

**여러 컴포넌트를 렌더링하는 경우:**

```typescript
it('should apply identical styles for link variant regardless of shape', () => {
  fc.assert(
    fc.property(shapeArb, (shape) => {
      const { unmount: unmount1 } = render(
        <Button variant="link" shape={shape}>Link Button 1</Button>
      );
      const { unmount: unmount2 } = render(
        <Button variant="link" shape="fill">Link Button 2</Button>
      );

      // 검증 로직...

      // 모든 렌더링된 컴포넌트 정리
      unmount1();
      unmount2();
    }),
    { numRuns: 50 }
  );
});
```

> **참고**: 일반 Unit 테스트에서는 Testing Library가 각 `it` 블록 후 자동으로 cleanup하므로 `unmount()`를 명시적으로 호출할 필요가 없습니다. Property-Based 테스트에서만 이 패턴이 필요합니다.

### 9. 테스트 문서화

테스트 파일 상단에 테스트 종류와 목적을 명시:

```typescript
/**
 * ============================================================================
 * Button 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 종류
 *
 * 1. **Property-Based 테스트**: fast-check로 무작위 입력값 검증
 * 2. **Unit 테스트**: 특정 시나리오에 대한 구체적인 동작 검증
 *
 * ## 사용된 라이브러리
 *
 * - vitest: 테스트 러너
 * - @testing-library/react: 컴포넌트 렌더링 및 DOM 쿼리
 * - fast-check: Property-Based 테스트용 무작위 데이터 생성
 */
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

## 테스트 작성 현황 및 계획

### 작성 완료

- [x] `src/shared/components/ui/button.test.tsx` - Button 컴포넌트 (Property-Based + Unit) (2025-12-13 완료)
  - Property-Based 테스트: Props 전달, 기본 스타일, Link variant 규칙, 다크 모드
  - Unit 테스트: children 렌더링, 기본값 적용, disabled 상태

### Phase 1: 유틸리티 & 비즈니스 로직

- [ ] `src/shared/lib/` 유틸리티 함수
- [ ] `src/shared/hooks/` 커스텀 훅
- [ ] Zod 스키마 검증 로직

### Phase 2: 컴포넌트

- [ ] `src/shared/components/ui/` 기본 UI 컴포넌트 (Button 완료)
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
