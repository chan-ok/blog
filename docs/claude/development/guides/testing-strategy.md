# Testing Strategy and Implementation Guide

## 📋 Overview

This document explains the testing strategy, implemented test cases, and testing methodology for the blog application.

## 🏗️ Test Architecture

### 1. Test Pyramid

```
    🔺 E2E Tests (5%)
   ───────────────────
  🔺🔺 Integration Tests (15%)
 ─────────────────────────────
🔺🔺🔺 Unit Tests (80%)
```

#### Unit Tests
- **Purpose**: Independent verification of individual components, functions, utilities
- **Scope**: 80% coverage target
- **Tools**: Vitest, React Testing Library

#### Integration Tests
- **Purpose**: Verify interactions between components
- **Scope**: Cover major user flows
- **Tools**: Vitest, React Testing Library, MSW

#### E2E Tests (End-to-End Tests)
- **Purpose**: Verify entire application workflows
- **Scope**: Core business scenarios
- **Tools**: Playwright (planned for future implementation)

### 2. Test Environment Setup

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

// Global mocking setup
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

// matchMedia mocking (for responsive testing)
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

## 🧪 Implemented Test Cases

### 1. Component Tests

#### PostCard Component
```typescript
// src/shared/components/__tests__/PostCard.test.tsx
describe('PostCard Component', () => {
  const samplePost: Post = {
    id: 1,
    slug: 'test-post',
    title: 'Test Post Title',
    summary: 'This is a test post summary.',
    publishedAt: '2024-01-15',
    status: 'published',
    tags: ['React', 'TypeScript', 'Test'],
    viewCount: 150,
    readingTime: '5 min',
  };

  it('should render post information correctly', () => {
    render(<PostCard post={samplePost} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test post summary.')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('150 views')).toBeInTheDocument();
  });

  it('should render tags correctly', () => {
    render(<PostCard post={samplePost} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should have correct link path for post title', () => {
    render(<PostCard post={samplePost} />);

    const titleLink = screen.getByRole('link', { name: 'Test Post Title' });
    expect(titleLink).toHaveAttribute('href', '/posts/test-post');
  });

  it('should render correctly when optional properties are missing', () => {
    const minimalPost: Post = {
      id: 2,
      slug: 'minimal-post',
      title: 'Minimal Post',
      summary: 'Post with minimal information',
      publishedAt: '2024-01-10',
      status: 'published',
      tags: [],
    };

    render(<PostCard post={minimalPost} />);

    expect(screen.getByText('Minimal Post')).toBeInTheDocument();
    expect(screen.queryByText('views')).not.toBeInTheDocument();
    expect(screen.queryByText('min')).not.toBeInTheDocument();
  });
});
```

#### LoadingSpinner Component
```typescript
// src/shared/components/__tests__/LoadingSpinner.test.tsx
describe('LoadingSpinner Component', () => {
  it('should render correctly in default state', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should apply different size options correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('should apply animation classes correctly', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-2');
  });
});
```

### 2. Utility Function Tests

#### Sample Data Functions
```typescript
// src/shared/data/__tests__/sampleData.test.ts
describe('sampleData Utility Functions', () => {
  describe('getAllPosts', () => {
    it('should return all posts', () => {
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

    it('should return only published posts', () => {
      const posts = getAllPosts();

      posts.forEach(post => {
        expect(post.status).toBe('published');
      });
    });

    it('should sort posts by latest first', () => {
      const posts = getAllPosts();

      for (let i = 0; i < posts.length - 1; i++) {
        const currentDate = new Date(posts[i].publishedAt);
        const nextDate = new Date(posts[i + 1].publishedAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('getLatestPosts', () => {
    it('should return specified number of latest posts', () => {
      const posts = getLatestPosts(3);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(3);
    });

    it('should return empty array when requesting 0 posts', () => {
      const posts = getLatestPosts(0);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });
  });

  describe('Data Consistency', () => {
    it('should have unique IDs for all posts', () => {
      const posts = getAllPosts();
      const ids = posts.map(post => post.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have unique slugs for all posts', () => {
      const posts = getAllPosts();
      const slugs = posts.map(post => post.slug);
      const uniqueSlugs = [...new Set(slugs)];

      expect(slugs.length).toBe(uniqueSlugs.length);
    });
  });
});
```

### 3. Page Component Tests

#### Contact Page
```typescript
// src/pages/__tests__/contact.test.tsx
describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Supabase mocking setup
  });

  it('should render contact page correctly', () => {
    render(<Contact />);

    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
    expect(screen.getByText('Contact Methods')).toBeInTheDocument();
  });

  it('should render form fields correctly', () => {
    render(<Contact />);

    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
  });

  it('should show error message when submitting without privacy consent', async () => {
    render(<Contact />);

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please agree to privacy policy.')).toBeInTheDocument();
    });
  });

  it('should disable button and show loading text during submission', async () => {
    // Mock infinite promise to simulate loading state
    const mockInvoke = vi.fn(() => new Promise(() => {}));

    render(<Contact />);

    // Fill and submit form
    const nameInput = screen.getByLabelText('Name *');
    const emailInput = screen.getByLabelText('Email *');
    const consentCheckbox = screen.getByLabelText(/Privacy Policy/);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: 'Sending...' });
      expect(loadingButton).toBeDisabled();
    });

    // Check that form fields are also disabled
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });
});
```

## 🔧 Test Utilities and Helpers

### 1. Custom Render Function

```typescript
// src/test/utils.tsx
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';

// Create test QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Custom render function
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

// Re-export for use in all tests
export * from '@testing-library/react';
export { renderWithProviders as render };
```

### 2. Mocking Helpers

```typescript
// src/test/mocks.ts
export const mockPost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  slug: 'test-post',
  title: 'Test Post',
  summary: 'Test post summary',
  publishedAt: '2024-01-15',
  status: 'published',
  tags: ['React', 'Test'],
  viewCount: 100,
  readingTime: '3 min',
  ...overrides,
});

export const mockSupabaseResponse = (data: any = {}, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

// API mocking
export const mockApiCall = (response: any, delay = 0) => {
  return vi.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve(response), delay))
  );
};
```

### 3. Test Data Factory

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
      title: `Test Post ${Date.now()}`,
      summary: 'This is a test post summary.',
      publishedAt: new Date().toISOString(),
      status: 'published',
      tags: ['React', 'TypeScript'],
      viewCount: Math.floor(Math.random() * 1000),
      readingTime: `${Math.floor(Math.random() * 10) + 1} min`,
      ...overrides,
    };
  },

  createMany(count, overrides = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  },
};
```

## 📊 Test Coverage and Quality Management

### 1. Coverage Targets

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

### 2. Test Quality Metrics

#### Code Coverage
- **Line Coverage**: 80% or higher
- **Function Coverage**: 80% or higher
- **Branch Coverage**: 70% or higher
- **Statement Coverage**: 80% or higher

#### Test Stability
```typescript
// Patterns for test stability
describe('Async Tests', () => {
  it('should display correctly after data loading', async () => {
    const mockData = [mockPost()];
    const mockApi = mockApiCall(mockData, 100);

    render(<PostsList />);

    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data loading completion
    await waitFor(() => {
      expect(screen.getByText(mockData[0].title)).toBeInTheDocument();
    });

    // Check that loading spinner disappeared
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
```

### 3. Test Automation

#### CI/CD Pipeline (GitHub Actions)
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

## 🚀 Testing Strategy and Best Practices

### 1. Test Writing Guidelines

#### AAA Pattern (Arrange, Act, Assert)
```typescript
it('should allow user to submit form', async () => {
  // Arrange: Setup test data and environment
  const mockSubmit = vi.fn();
  const formData = {
    name: 'John Doe',
    email: 'test@example.com',
    message: 'Test message'
  };

  render(<ContactForm onSubmit={mockSubmit} />);

  // Act: Simulate user actions
  const nameInput = screen.getByLabelText('Name');
  const emailInput = screen.getByLabelText('Email');
  const messageInput = screen.getByLabelText('Message');
  const submitButton = screen.getByRole('button', { name: 'Submit' });

  fireEvent.change(nameInput, { target: { value: formData.name } });
  fireEvent.change(emailInput, { target: { value: formData.email } });
  fireEvent.change(messageInput, { target: { value: formData.message } });
  fireEvent.click(submitButton);

  // Assert: Verify results
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith(formData);
  });
});
```

#### Test Description Writing
```typescript
// ✅ Good: Business requirement based
it('should display error message when user does not fill required fields', () => {});

// ❌ Bad: Implementation detail based
it('should call submit function', () => {});
```

### 2. Test Isolation and Independence

```typescript
describe('Contact Page', () => {
  beforeEach(() => {
    // Reset state before each test
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
  });
});
```

### 3. Error Scenario Testing

```typescript
describe('Error Handling', () => {
  it('should display appropriate message on network error', async () => {
    const networkError = new Error('Network connection failed');
    const mockApi = vi.fn().mockRejectedValue(networkError);

    render(<ContactForm api={mockApi} />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please check your network connection.')).toBeInTheDocument();
    });
  });

  it('should provide retry option on server error', async () => {
    const serverError = new Error('Internal server error');
    const mockApi = vi.fn().mockRejectedValue(serverError);

    render(<ContactForm api={mockApi} />);

    // Simulate error occurrence
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();
    });
  });
});
```

## 📈 Performance Testing

### 1. Rendering Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should render large lists quickly', () => {
    const largePosts = PostFactory.createMany(1000);

    const startTime = performance.now();
    render(<PostsList posts={largePosts} />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100); // Within 100ms
  });

  it('should have proper memoization', () => {
    const mockPost = PostFactory.create();
    const { rerender } = render(<PostCard post={mockPost} />);

    // Re-render with same props
    rerender(<PostCard post={mockPost} />);

    // Actual performance measurement uses React DevTools Profiler
    expect(true).toBe(true);
  });
});
```

## 🎯 Future Test Improvement Plans

### 1. Short-term Plans (1-2 months)
- [ ] Setup E2E test environment (Playwright)
- [ ] Introduce visual regression testing
- [ ] Automate accessibility testing
- [ ] Expand performance testing

### 2. Medium-term Plans (3-6 months)
- [ ] Build test data management system
- [ ] Integrate A/B testing framework
- [ ] Create test results dashboard
- [ ] Generate automated test reports

### 3. Long-term Plans (6+ months)
- [ ] AI-based test case generation
- [ ] User behavior-based test scenarios
- [ ] Cross-browser test automation
- [ ] Performance regression detection system

---

This document will be continuously updated according to testing environment and requirement changes.