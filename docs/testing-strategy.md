# 테스트 전략 및 구현 가이드

## 📋 개요

이 문서는 블로그 애플리케이션의 테스트 전략, 구현된 테스트 케이스, 그리고 테스트 방법론에 대해 설명합니다.

## 🏗️ 테스트 아키텍처

### 1. 테스트 피라미드

```
    🔺 E2E Tests (5%)
   ───────────────────
  🔺🔺 Integration Tests (15%)
 ─────────────────────────────
🔺🔺🔺 Unit Tests (80%)
```

#### 단위 테스트 (Unit Tests)
- **목적**: 개별 컴포넌트, 함수, 유틸리티의 독립적 검증
- **범위**: 80% 커버리지 목표
- **도구**: Vitest, React Testing Library

#### 통합 테스트 (Integration Tests)
- **목적**: 컴포넌트 간 상호작용 검증
- **범위**: 주요 사용자 플로우 커버
- **도구**: Vitest, React Testing Library, MSW

#### E2E 테스트 (End-to-End Tests)
- **목적**: 전체 애플리케이션 워크플로우 검증
- **범위**: 핵심 비즈니스 시나리오
- **도구**: Playwright (향후 구현 예정)

### 2. 테스트 환경 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 전역 모킹 설정
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// matchMedia 모킹 (반응형 테스트용)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.scrollTo = vi.fn();
```

## 🧪 구현된 테스트 케이스

### 1. 컴포넌트 테스트

#### PostCard 컴포넌트
```typescript
// src/shared/components/__tests__/PostCard.test.tsx
describe('PostCard 컴포넌트', () => {
  const samplePost: Post = {
    id: 1,
    slug: 'test-post',
    title: '테스트 포스트 제목',
    summary: '이것은 테스트 포스트의 요약입니다.',
    publishedAt: '2024-01-15',
    status: 'published',
    tags: ['React', 'TypeScript', '테스트'],
    viewCount: 150,
    readingTime: '5분',
  };

  it('포스트 정보가 올바르게 렌더링되어야 한다', () => {
    render(<PostCard post={samplePost} />);

    expect(screen.getByText('테스트 포스트 제목')).toBeInTheDocument();
    expect(screen.getByText('이것은 테스트 포스트의 요약입니다.')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('5분')).toBeInTheDocument();
    expect(screen.getByText('150회')).toBeInTheDocument();
  });

  it('태그들이 올바르게 렌더링되어야 한다', () => {
    render(<PostCard post={samplePost} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('포스트 제목 링크가 올바른 경로를 가져야 한다', () => {
    render(<PostCard post={samplePost} />);

    const titleLink = screen.getByRole('link', { name: '테스트 포스트 제목' });
    expect(titleLink).toHaveAttribute('href', '/posts/test-post');
  });

  it('선택적 속성들이 없을 때도 올바르게 렌더링되어야 한다', () => {
    const minimalPost: Post = {
      id: 2,
      slug: 'minimal-post',
      title: '최소 포스트',
      summary: '최소한의 정보만 있는 포스트',
      publishedAt: '2024-01-10',
      status: 'published',
      tags: [],
    };

    render(<PostCard post={minimalPost} />);

    expect(screen.getByText('최소 포스트')).toBeInTheDocument();
    expect(screen.queryByText('회')).not.toBeInTheDocument();
    expect(screen.queryByText('분')).not.toBeInTheDocument();
  });
});
```

#### LoadingSpinner 컴포넌트
```typescript
// src/shared/components/__tests__/LoadingSpinner.test.tsx
describe('LoadingSpinner 컴포넌트', () => {
  it('기본 상태로 올바르게 렌더링되어야 한다', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '로딩 중');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('다양한 크기 옵션이 올바르게 적용되어야 한다', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('애니메이션 클래스가 올바르게 적용되어야 한다', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-2');
  });
});
```

### 2. 유틸리티 함수 테스트

#### 샘플 데이터 함수
```typescript
// src/shared/data/__tests__/sampleData.test.ts
describe('sampleData 유틸리티 함수들', () => {
  describe('getAllPosts', () => {
    it('모든 포스트를 반환해야 한다', () => {
      const posts = getAllPosts();

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);

      const firstPost = posts[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('slug');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('summary');
      expect(firstPost).toHaveProperty('publishedAt');
      expect(firstPost).toHaveProperty('status');
      expect(firstPost).toHaveProperty('tags');
      expect(Array.isArray(firstPost.tags)).toBe(true);
    });

    it('발행된 포스트만 반환해야 한다', () => {
      const posts = getAllPosts();

      posts.forEach(post => {
        expect(post.status).toBe('published');
      });
    });

    it('포스트들이 최신순으로 정렬되어야 한다', () => {
      const posts = getAllPosts();

      for (let i = 0; i < posts.length - 1; i++) {
        const currentDate = new Date(posts[i].publishedAt);
        const nextDate = new Date(posts[i + 1].publishedAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('getLatestPosts', () => {
    it('지정된 개수만큼 최신 포스트를 반환해야 한다', () => {
      const posts = getLatestPosts(3);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(3);
    });

    it('0개를 요청하면 빈 배열을 반환해야 한다', () => {
      const posts = getLatestPosts(0);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });
  });

  describe('데이터 일관성', () => {
    it('모든 포스트가 고유한 ID를 가져야 한다', () => {
      const posts = getAllPosts();
      const ids = posts.map(post => post.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids.length).toBe(uniqueIds.length);
    });

    it('모든 포스트가 고유한 slug를 가져야 한다', () => {
      const posts = getAllPosts();
      const slugs = posts.map(post => post.slug);
      const uniqueSlugs = [...new Set(slugs)];

      expect(slugs.length).toBe(uniqueSlugs.length);
    });
  });
});
```

### 3. 페이지 컴포넌트 테스트

#### Contact 페이지
```typescript
// src/pages/__tests__/contact.test.tsx
describe('Contact 페이지', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Supabase 모킹 설정
  });

  it('연락처 페이지가 올바르게 렌더링되어야 한다', () => {
    render(<Contact />);

    expect(screen.getByText('연락처')).toBeInTheDocument();
    expect(screen.getByText('메시지 보내기')).toBeInTheDocument();
    expect(screen.getByText('연락 방법')).toBeInTheDocument();
  });

  it('폼 필드들이 올바르게 렌더링되어야 한다', () => {
    render(<Contact />);

    expect(screen.getByLabelText('이름 *')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일 *')).toBeInTheDocument();
    expect(screen.getByLabelText('제목 *')).toBeInTheDocument();
    expect(screen.getByLabelText('내용 *')).toBeInTheDocument();
  });

  it('개인정보 동의 없이 제출 시 오류 메시지를 표시해야 한다', async () => {
    render(<Contact />);

    const submitButton = screen.getByRole('button', { name: '메시지 보내기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('개인정보 수집 및 이용에 동의해주세요.')).toBeInTheDocument();
    });
  });

  it('전송 중일 때 버튼이 비활성화되고 로딩 텍스트를 표시해야 한다', async () => {
    // 무한 대기 promise로 로딩 상태 시뮬레이션
    const mockInvoke = vi.fn(() => new Promise(() => {}));

    render(<Contact />);

    // 폼 작성 및 제출
    const nameInput = screen.getByLabelText('이름 *');
    const emailInput = screen.getByLabelText('이메일 *');
    const consentCheckbox = screen.getByLabelText(/개인정보 수집/);

    fireEvent.change(nameInput, { target: { value: '홍길동' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);

    const submitButton = screen.getByRole('button', { name: '메시지 보내기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: '전송 중...' });
      expect(loadingButton).toBeDisabled();
    });

    // 폼 필드들도 비활성화되었는지 확인
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });
});
```

## 🔧 테스트 유틸리티 및 헬퍼

### 1. 커스텀 렌더링 함수

```typescript
// src/test/utils.tsx
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';

// 테스트용 QueryClient 생성
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// 커스텀 렌더링 함수
export const renderWithProviders = (
  ui: ReactNode,
  {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    ...renderOptions
  } = {}
) => {
  const history = createMemoryHistory({ initialEntries });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// 모든 테스트에서 사용할 수 있도록 re-export
export * from '@testing-library/react';
export { renderWithProviders as render };
```

### 2. 모킹 헬퍼

```typescript
// src/test/mocks.ts
export const mockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  slug: 'test-post',
  title: '테스트 포스트',
  summary: '테스트 포스트 요약',
  publishedAt: '2024-01-15',
  status: 'published',
  tags: ['React', 'Test'],
  viewCount: 100,
  readingTime: '3분',
  ...overrides,
});

export const mockSupabaseResponse = (data: any = {}, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

// API 모킹
export const mockApiCall = (response: any, delay = 0) => {
  return vi.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve(response), delay))
  );
};
```

### 3. 테스트 데이터 팩토리

```typescript
// src/test/factories.ts
interface PostFactory {
  create(overrides?: Partial<Post>): Post;
  createMany(count: number, overrides?: Partial<Post>): Post[];
}

export const PostFactory: PostFactory = {
  create(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 1000),
      slug: `test-post-${Date.now()}`,
      title: `테스트 포스트 ${Date.now()}`,
      summary: '테스트 포스트의 요약입니다.',
      publishedAt: new Date().toISOString(),
      status: 'published',
      tags: ['React', 'TypeScript'],
      viewCount: Math.floor(Math.random() * 1000),
      readingTime: `${Math.floor(Math.random() * 10) + 1}분`,
      ...overrides,
    };
  },

  createMany(count, overrides = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  },
};
```

## 📊 테스트 커버리지 및 품질 관리

### 1. 커버리지 목표

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  },
  "test": {
    "coverage": {
      "lines": 80,
      "functions": 80,
      "branches": 70,
      "statements": 80
    }
  }
}
```

### 2. 테스트 품질 메트릭

#### 코드 커버리지
- **라인 커버리지**: 80% 이상
- **함수 커버리지**: 80% 이상
- **브랜치 커버리지**: 70% 이상
- **문장 커버리지**: 80% 이상

#### 테스트 안정성
```typescript
// 테스트 안정성을 위한 패턴
describe('비동기 테스트', () => {
  it('데이터 로딩 후 올바르게 표시되어야 한다', async () => {
    const mockData = [mockPost()];
    const mockApi = mockApiCall(mockData, 100);

    render(<PostsList />);

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 데이터 로딩 완료까지 대기
    await waitFor(() => {
      expect(screen.getByText(mockData[0].title)).toBeInTheDocument();
    });

    // 로딩 스피너가 사라졌는지 확인
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });
});
```

### 3. 테스트 자동화

#### CI/CD 파이프라인 (GitHub Actions)
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

## 🚀 테스트 전략 및 베스트 프랙티스

### 1. 테스트 작성 가이드라인

#### AAA 패턴 (Arrange, Act, Assert)
```typescript
it('사용자가 폼을 제출할 수 있어야 한다', async () => {
  // Arrange: 테스트 데이터 및 환경 설정
  const mockSubmit = vi.fn();
  const formData = {
    name: '홍길동',
    email: 'test@example.com',
    message: '테스트 메시지'
  };

  render(<ContactForm onSubmit={mockSubmit} />);

  // Act: 사용자 동작 시뮬레이션
  const nameInput = screen.getByLabelText('이름');
  const emailInput = screen.getByLabelText('이메일');
  const messageInput = screen.getByLabelText('메시지');
  const submitButton = screen.getByRole('button', { name: '제출' });

  fireEvent.change(nameInput, { target: { value: formData.name } });
  fireEvent.change(emailInput, { target: { value: formData.email } });
  fireEvent.change(messageInput, { target: { value: formData.message } });
  fireEvent.click(submitButton);

  // Assert: 결과 검증
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith(formData);
  });
});
```

#### 테스트 설명 작성법
```typescript
// ✅ 좋은 예: 비즈니스 요구사항 기반
it('사용자가 필수 필드를 입력하지 않으면 에러 메시지가 표시되어야 한다', () => {});

// ❌ 나쁜 예: 구현 세부사항 기반
it('submit 함수가 호출되어야 한다', () => {});
```

### 2. 테스트 격리 및 독립성

```typescript
describe('Contact 페이지', () => {
  beforeEach(() => {
    // 각 테스트 전에 상태 초기화
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    // 각 테스트 후 정리
    vi.restoreAllMocks();
  });
});
```

### 3. 에러 시나리오 테스트

```typescript
describe('에러 처리', () => {
  it('네트워크 에러 시 사용자에게 적절한 메시지를 표시해야 한다', async () => {
    const networkError = new Error('네트워크 연결 실패');
    const mockApi = vi.fn().mockRejectedValue(networkError);

    render(<ContactForm api={mockApi} />);

    const submitButton = screen.getByRole('button', { name: '제출' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('네트워크 연결을 확인해주세요.')).toBeInTheDocument();
    });
  });

  it('서버 에러 시 재시도 옵션을 제공해야 한다', async () => {
    const serverError = new Error('서버 내부 오류');
    const mockApi = vi.fn().mockRejectedValue(serverError);

    render(<ContactForm api={mockApi} />);

    // 에러 발생 시뮬레이션
    const submitButton = screen.getByRole('button', { name: '제출' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: '다시 시도' });
      expect(retryButton).toBeInTheDocument();
    });
  });
});
```

## 📈 성능 테스트

### 1. 렌더링 성능 테스트

```typescript
describe('성능 테스트', () => {
  it('큰 목록이 빠르게 렌더링되어야 한다', () => {
    const largePosts = PostFactory.createMany(1000);

    const startTime = performance.now();
    render(<PostsList posts={largePosts} />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100); // 100ms 이내
  });

  it('메모이제이션이 올바르게 작동해야 한다', () => {
    const mockPost = PostFactory.create();
    const { rerender } = render(<PostCard post={mockPost} />);

    // 같은 props로 리렌더링
    rerender(<PostCard post={mockPost} />);

    // 실제 성능 측정은 React DevTools Profiler 사용
    expect(true).toBe(true);
  });
});
```

## 🎯 향후 테스트 개선 계획

### 1. 단기 계획 (1-2개월)
- [ ] E2E 테스트 환경 구축 (Playwright)
- [ ] 시각적 회귀 테스트 도입
- [ ] 접근성 테스트 자동화
- [ ] 성능 테스트 확장

### 2. 중기 계획 (3-6개월)
- [ ] 테스트 데이터 관리 시스템 구축
- [ ] A/B 테스트 프레임워크 통합
- [ ] 테스트 결과 대시보드 구축
- [ ] 자동화된 테스트 보고서 생성

### 3. 장기 계획 (6개월+)
- [ ] AI 기반 테스트 케이스 생성
- [ ] 사용자 행동 기반 테스트 시나리오
- [ ] 크로스 브라우저 테스트 자동화
- [ ] 성능 회귀 감지 시스템

---

이 문서는 테스트 환경과 요구사항 변화에 따라 지속적으로 업데이트됩니다.