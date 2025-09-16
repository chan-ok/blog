# TDD-Based Development Process

This document describes the Test-Driven Development (TDD) process and decision recording procedures.

## 🎯 Core TDD Principles

### Basic Cycle: Red → Green → Refactor

```
1. 🔴 RED: Write failing test
2. 🟢 GREEN: Write minimal code to pass test
3. 🔵 REFACTOR: Improve code quality (without changing functionality)
```

### Absolute Rules
- ❌ **No production code without tests**
- ❌ **No tests that don't fail initially**
- ❌ **No implementation that bypasses tests**
- ✅ **All tests must pass before proceeding to next step**

## 🛠️ Vitest Setup and Environment

### Basic Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
});
```

### Test Environment Setup
```typescript
// src/test/setup.ts
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Run before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
```

## 📋 Detailed TDD Process Guide

### Step 1: 🔴 RED - Write Failing Tests

#### Feature Requirements Analysis
Write tests for **all possible scenarios** before implementing new features.

```typescript
// Example: Blog post creation feature
// src/features/post-creation/PostCreationForm.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostCreationForm } from './PostCreationForm';
import * as postAPI from '@/entities/post/api/postAPI';

// API mocking
vi.mock('@/entities/post/api/postAPI');

describe('Blog post creation feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔴 RED: Failing tests', () => {
    it('should display error message when title is empty', async () => {
      // Arrange
      render(<PostCreationForm />);
      const saveButton = screen.getByRole('button', { name: 'Save' });

      // Act
      fireEvent.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Please enter a title')).toBeInTheDocument();
      });
    });

    it('should display error message when content is empty', async () => {
      // Arrange
      render(<PostCreationForm />);
      const titleInput = screen.getByLabelText('Title');
      const saveButton = screen.getByRole('button', { name: 'Save' });

      // Act
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });
      fireEvent.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Please enter content')).toBeInTheDocument();
      });
    });

    it('should display error message when title exceeds 100 characters', async () => {
      // Arrange
      const longTitle = 'a'.repeat(101);
      render(<PostCreationForm />);
      const titleInput = screen.getByLabelText('Title');

      // Act
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.blur(titleInput);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Title must be 100 characters or less')).toBeInTheDocument();
      });
    });

    it('should call API when creating post with valid data', async () => {
      // Arrange
      const createPostMock = vi.mocked(postAPI.createPost);
      createPostMock.mockResolvedValue({
        id: 'test-id',
        title: 'Test Title',
        content: 'Test Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: 'user-id',
        tagList: [],
        status: 'draft' as const,
      });

      render(<PostCreationForm />);

      // Act
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'Test Title' }
      });
      fireEvent.change(screen.getByLabelText('Content'), {
        target: { value: 'Test Content' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      // Assert
      await waitFor(() => {
        expect(createPostMock).toHaveBeenCalledWith({
          title: 'Test Title',
          content: 'Test Content',
          tagList: [],
          status: 'draft',
        });
      });
    });

    it('should display error message when API fails', async () => {
      // Arrange
      const createPostMock = vi.mocked(postAPI.createPost);
      createPostMock.mockRejectedValue(new Error('Server error'));

      render(<PostCreationForm />);

      // Act
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'Test Title' }
      });
      fireEvent.change(screen.getByLabelText('Content'), {
        target: { value: 'Test Content' }
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Failed to save post')).toBeInTheDocument();
      });
    });
  });
});
```

### Step 2: 🟢 GREEN - Write Code to Pass Tests

#### Minimal Implementation to Pass Tests

```typescript
// src/features/post-creation/PostCreationForm.tsx
import { useState } from 'react';
import { createPost } from '@/entities/post/api/postAPI';

interface FormData {
  title: string;
  content: string;
}

interface ErrorState {
  title: string;
  content: string;
  general: string;
}

export function PostCreationForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
  });

  const [errorState, setErrorState] = useState<ErrorState>({
    title: '',
    content: '',
    general: '',
  });

  const [loading, setLoading] = useState(false);

  function validateInput(data: FormData): ErrorState {
    const errors: ErrorState = {
      title: '',
      content: '',
      general: '',
    };

    if (!data.title.trim()) {
      errors.title = 'Please enter a title';
    } else if (data.title.length > 100) {
      errors.title = 'Title must be 100 characters or less';
    }

    if (!data.content.trim()) {
      errors.content = 'Please enter content';
    }

    return errors;
  }

  async function handleSubmit() {
    setErrorState({ title: '', content: '', general: '' });

    const validationResult = validateInput(formData);

    if (validationResult.title || validationResult.content) {
      setErrorState(validationResult);
      return;
    }

    setLoading(true);

    try {
      await createPost({
        title: formData.title,
        content: formData.content,
        tagList: [],
        status: 'draft',
      });
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        general: 'Failed to save post',
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          onBlur={() => {
            const errors = validateInput({ ...formData, title: formData.title });
            setErrorState(prev => ({ ...prev, title: errors.title }));
          }}
        />
        {errorState.title && <div>{errorState.title}</div>}
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        />
        {errorState.content && <div>{errorState.content}</div>}
      </div>

      {errorState.general && <div>{errorState.general}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Step 3: 🔵 REFACTOR - Code Quality Improvement

#### Improve Code Quality After All Tests Pass

```typescript
// Refactored version: Custom hook separation
// src/features/post-creation/hooks/usePostCreationForm.ts

import { useState } from 'react';
import { createPost } from '@/entities/post/api/postAPI';

export interface FormData {
  title: string;
  content: string;
}

export interface ErrorState {
  title: string;
  content: string;
  general: string;
}

const VALIDATION_RULES = {
  MAX_TITLE_LENGTH: 100,
} as const;

export function usePostCreationForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
  });

  const [errorState, setErrorState] = useState<ErrorState>({
    title: '',
    content: '',
    general: '',
  });

  const [loading, setLoading] = useState(false);

  function validateInput(data: FormData): ErrorState {
    const errors: ErrorState = {
      title: '',
      content: '',
      general: '',
    };

    // Title validation
    if (!data.title.trim()) {
      errors.title = 'Please enter a title';
    } else if (data.title.length > VALIDATION_RULES.MAX_TITLE_LENGTH) {
      errors.title = `Title must be ${VALIDATION_RULES.MAX_TITLE_LENGTH} characters or less`;
    }

    // Content validation
    if (!data.content.trim()) {
      errors.content = 'Please enter content';
    }

    return errors;
  }

  function updateField(field: keyof FormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function validateField(field: keyof FormData) {
    const errors = validateInput(formData);
    setErrorState(prev => ({ ...prev, [field]: errors[field] }));
  }

  async function submit() {
    setErrorState({ title: '', content: '', general: '' });

    const validationResult = validateInput(formData);
    const hasValidationErrors = Object.values(validationResult).some(Boolean);

    if (hasValidationErrors) {
      setErrorState(validationResult);
      return;
    }

    setLoading(true);

    try {
      await createPost({
        title: formData.title,
        content: formData.content,
        tagList: [],
        status: 'draft',
      });

      // Reset form after success
      setFormData({ title: '', content: '' });
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        general: 'Failed to save post',
      }));
    } finally {
      setLoading(false);
    }
  }

  return {
    formData,
    errorState,
    loading,
    updateField,
    validateField,
    submit,
  };
}
```

```typescript
// Refactored component
// src/features/post-creation/PostCreationForm.tsx

import { usePostCreationForm } from './hooks/usePostCreationForm';

export function PostCreationForm() {
  const {
    formData,
    errorState,
    loading,
    updateField,
    validateField,
    submit,
  } = usePostCreationForm();

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          onBlur={() => validateField('title')}
        />
        {errorState.title && <div>{errorState.title}</div>}
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => updateField('content', e.target.value)}
          onBlur={() => validateField('content')}
        />
        {errorState.content && <div>{errorState.content}</div>}
      </div>

      {errorState.general && <div>{errorState.general}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

## 🧪 Advanced Testing Patterns

### Integration Tests
```typescript
// src/features/post-creation/__tests__/integration.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { PostCreationPage } from '../PostCreationPage';

// MSW server setup
const server = setupServer(
  http.post('/api/posts', () => {
    return HttpResponse.json({
      id: 'test-id',
      title: 'Test Title',
      content: 'Test Content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 'user-id',
      tagList: [],
      status: 'draft',
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Post creation integration tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  function renderWithProviders(ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  }

  it('should complete entire flow successfully', async () => {
    // Arrange
    renderWithProviders(<PostCreationPage />);

    // Act
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Integration Test Title' }
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Integration Test Content' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Post saved successfully')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/post-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Post Creation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start test in logged-in state
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('can create and publish new post', async ({ page }) => {
    // Navigate to post creation page
    await page.goto('/admin/write');

    // Write post
    await page.fill('[name="title"]', 'E2E Test Post');
    await page.fill('[name="content"]', 'This is a post written by E2E test.');

    // Add tags
    await page.fill('[name="tags"]', 'E2E');
    await page.press('[name="tags"]', 'Enter');

    // Save as draft
    await page.click('button:has-text("Save Draft")');
    await expect(page.locator('.success-message')).toHaveText('Saved as draft');

    // Publish
    await page.click('button:has-text("Publish")');
    await expect(page.locator('.success-message')).toHaveText('Post published');

    // Verify published post
    await page.goto('/posts');
    await expect(page.locator('h2:has-text("E2E Test Post")')).toBeVisible();
  });
});
```

## 📊 Test Commands

### Basic Test Execution
```bash
# Run all tests
pnpm test

# Test specific file
pnpm test PostCreationForm.test.ts

# Watch mode for changes
pnpm test --watch

# Run with coverage
pnpm test --coverage

# Run in UI mode
pnpm test --ui
```

### TDD Cycle Commands
```bash
# Step 1: RED - Verify failing tests
pnpm test --run --reporter=verbose

# Step 2: GREEN - Run specific test to verify pass
pnpm test --run PostCreation --reporter=dot

# Step 3: REFACTOR - Run all tests to prevent regression
pnpm test --run --coverage
```

## ✅ TDD Checklist

### 🔴 RED Phase Checklist
- [ ] Write tests for all exception cases
- [ ] Write tests for normal cases
- [ ] Write boundary value tests
- [ ] Verify tests actually fail
- [ ] Clear and descriptive test names

### 🟢 GREEN Phase Checklist
- [ ] Verify all tests pass
- [ ] Implement with minimal code
- [ ] Avoid hardcoding or workaround implementations
- [ ] Ensure no impact on existing tests

### 🔵 REFACTOR Phase Checklist
- [ ] Maintain test passing state
- [ ] Remove code duplication
- [ ] Separate functions/classes
- [ ] Improve naming
- [ ] Optimize performance (when needed)

## 🚫 TDD Anti-patterns

### Things to Avoid

#### 1. Implementation that bypasses tests
```typescript
// ❌ Wrong example
function validatePost(title: string) {
  if (title === 'Test Title') return true; // Hardcoding just to pass test
  return false;
}

// ✅ Correct example
function validatePost(title: string) {
  return title.length > 0 && title.length <= 100; // Actual business logic
}
```

#### 2. Testing too much at once
```typescript
// ❌ Wrong example
it('entire blog post functionality should work', () => {
  // Testing create, update, delete, list all at once
});

// ✅ Correct example
describe('Blog post management', () => {
  it('can create new post', () => { });
  it('can update existing post', () => { });
  it('can delete post', () => { });
  it('can retrieve post list', () => { });
});
```

#### 3. Tests dependent on implementation details
```typescript
// ❌ Wrong example
it('useState should be called', () => {
  const spy = vi.spyOn(React, 'useState');
  render(<Component />);
  expect(spy).toHaveBeenCalled();
});

// ✅ Correct example
it('should display initial state correctly', () => {
  render(<Component />);
  expect(screen.getByText('Initial Value')).toBeInTheDocument();
});
```

## 🎯 TDD Success Tips

### 1. Start with Small Units
- Implement one feature at a time
- Break complex features into smaller units

### 2. Clear Test Names
```typescript
// ✅ Good test names
it('should display error message when title is empty')
it('should display success message when creating with valid data')
it('should show notification to user when API error occurs')
```

### 3. Use AAA Pattern
```typescript
it('test description', () => {
  // Arrange: Set up test environment
  const testData = { title: 'Test' };

  // Act: Perform actual action
  const result = executeFunction(testData);

  // Assert: Verify result
  expect(result).toBe(expectedResult);
});
```

### 4. Utilize Failure Messages
```typescript
it('user permission validation', () => {
  expect(checkUserPermission('regular_user')).toBe(false, 'Regular user should not have admin permissions');
});
```

This TDD process enables building stable and maintainable code.

---

## 📝 Decision Recording Process

### 🚨 Mandatory Rule: Use English Identifiers

**⚠️ All code identifiers must be written in English!**

- ✅ **Write in English**: Function names, variable names, class names, interface names, type names, property names
- ✅ **Write in Korean**: Comments, documentation, commit messages, UI text, error messages
- ❌ **Absolutely Forbidden**: Using Korean identifiers like `사용자`, `로그인하기`, `이메일`

### Required Information for Development Requests

All development requests must include the following information:

#### 1. Development Intent (Required)
```markdown
**Development Intent:**
- Why is this feature needed?
- What problem are we trying to solve?
- What is the expected user value?
```

#### 2. Technical Background (Optional)
```markdown
**Technical Background:**
- Current situation
- Technical constraints
- Performance/security considerations
```

#### 3. Priority (Optional)
```markdown
**Priority:**
- Urgency: High/Medium/Low
- Importance: High/Medium/Low
- Estimated time: X hours/days
```

### Development Progress Recording Procedure

#### Step 1: Pre-development Verification
- [ ] Is the development intent clear?
- [ ] Is the technical background understood?
- [ ] Were alternatives considered?

#### Step 2: Recording During Development
Record all major decisions in `docs/development-history.md`:

```markdown
#### [Task Title]

**Development Intent:**
- User request or development necessity

**Technical Background:**
- Current situation
- Problems to solve
- Technical constraints

**Changes Made:**
1. **[Category]**
   - Specific changes
   - Code examples (if needed)

**Decision Process:**
- Alternatives considered
- Reasons for selection
- Rejected alternatives and reasons

**Expected Impact:**
- Positive impact
- Precautions
- Impact on performance/security/UX

**Follow-up Tasks:**
- Related tasks
- Additional required tasks
```

#### Step 3: Record Rollbacks Too
Record failures or rollbacks as well:

```markdown
#### [Rollback Task Title]

**Rollback Reason:**
- Why was it rolled back?
- What problems occurred?

**Rollback Contents:**
- Reverted changes
- Recovery process

**Lessons Learned:**
- What was learned from this attempt
- What to try next time
```

### Collaboration Procedure with Claude Code

#### When Requesting Development
```markdown
Claude, please develop [feature name].

**Development Intent:**
- [Specific necessity and purpose]

**Technical Background:** (Optional)
- [Current situation and constraints]

**Priority:** (Optional)
- [Urgency and importance]
```

#### Claude's Response
Claude must verify:
1. Is the development intent specified?
2. Is technical background needed?
3. Should alternatives be considered?

If development intent is missing, must ask:
```markdown
Please provide the development intent:
- Why is this feature needed?
- What problem are you trying to solve?
- What is the expected user value?
```

### Decision Tracking Tools

#### Development History Documentation
- File: `docs/development-history.md`
- Purpose: Record all development decisions
- Updates: For every major change

#### Search and Reference
```bash
# Search specific feature history
grep -n "MarkdownEditor" docs/development-history.md

# Check history by date
grep -n "2025-09-16" docs/development-history.md

# Search decision process
grep -A 5 -B 5 "Decision Process" docs/development-history.md
```

### Key Checkpoints

#### Daily Checklist
- [ ] Are all changes made today recorded?
- [ ] Is the decision process clearly documented?
- [ ] Are there any learning points worth referencing in the future?

#### Weekly Review
- [ ] Is this week's development direction consistent?
- [ ] Is technical debt accumulating?
- [ ] Does documentation reflect the current state?

This procedure helps systematically accumulate development team knowledge and can be used for new developer onboarding and technical debt management.