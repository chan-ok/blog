# TDD 기반 개발 프로세스

이 문서는 Test-Driven Development (TDD) 기반의 개발 프로세스와 의사결정 기록 절차를 설명합니다.

## 🎯 TDD 핵심 원칙

### 기본 사이클: Red → Green → Refactor

```
1. 🔴 RED: 실패하는 테스트 작성
2. 🟢 GREEN: 테스트를 통과하는 최소한의 코드 작성
3. 🔵 REFACTOR: 코드 품질 개선 (기능 변경 없이)
```

### 절대 규칙
- ❌ **테스트 없이 프로덕션 코드 작성 금지**
- ❌ **실패하지 않는 테스트 작성 금지**
- ❌ **테스트를 우회하는 구현 금지**
- ✅ **모든 테스트가 통과해야만 다음 단계 진행**

## 🛠️ Vitest 설정 및 환경

### 기본 설정
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

### 테스트 환경 설정
```typescript
// src/test/setup.ts
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// 모든 테스트 전에 실행
beforeEach(() => {
  vi.clearAllMocks();
});

// 모든 테스트 후에 정리
afterEach(() => {
  vi.restoreAllMocks();
});
```

## 📋 TDD 프로세스 상세 가이드

### 1단계: 🔴 RED - 실패하는 테스트 작성

#### 기능 요구사항 분석
새로운 기능을 구현하기 전에 **모든 가능한 시나리오**를 테스트로 작성합니다.

```typescript
// 예시: 블로그글 작성 기능
// src/features/글작성/블로그글작성.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 블로그글작성폼 } from './블로그글작성폼';
import * as 블로그글API from '@/entities/블로그글/api/블로그글API';

// API 모킹
vi.mock('@/entities/블로그글/api/블로그글API');

describe('블로그글 작성 기능', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🔴 RED: 실패하는 테스트들', () => {
    it('제목이 비어있으면 에러 메시지를 표시해야 한다', async () => {
      // Arrange
      render(<블로그글작성폼 />);
      const 저장버튼 = screen.getByRole('button', { name: '저장' });

      // Act
      fireEvent.click(저장버튼);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
      });
    });

    it('내용이 비어있으면 에러 메시지를 표시해야 한다', async () => {
      // Arrange
      render(<블로그글작성폼 />);
      const 제목입력 = screen.getByLabelText('제목');
      const 저장버튼 = screen.getByRole('button', { name: '저장' });

      // Act
      fireEvent.change(제목입력, { target: { value: '테스트 제목' } });
      fireEvent.click(저장버튼);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('내용을 입력해주세요')).toBeInTheDocument();
      });
    });

    it('제목이 100자를 초과하면 에러 메시지를 표시해야 한다', async () => {
      // Arrange
      const 긴제목 = 'a'.repeat(101);
      render(<블로그글작성폼 />);
      const 제목입력 = screen.getByLabelText('제목');

      // Act
      fireEvent.change(제목입력, { target: { value: 긴제목 } });
      fireEvent.blur(제목입력);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('제목은 100자 이하로 입력해주세요')).toBeInTheDocument();
      });
    });

    it('올바른 데이터로 작성시 API가 호출되어야 한다', async () => {
      // Arrange
      const 작성API모킹 = vi.mocked(블로그글API.블로그글작성하기);
      작성API모킹.mockResolvedValue({
        아이디: 'test-id',
        제목: '테스트 제목',
        내용: '테스트 내용',
        작성일자: new Date().toISOString(),
        수정일자: new Date().toISOString(),
        작성자아이디: 'user-id',
        태그목록: [],
        발행상태: '임시저장' as const,
      });

      render(<블로그글작성폼 />);

      // Act
      fireEvent.change(screen.getByLabelText('제목'), {
        target: { value: '테스트 제목' }
      });
      fireEvent.change(screen.getByLabelText('내용'), {
        target: { value: '테스트 내용' }
      });
      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      // Assert
      await waitFor(() => {
        expect(작성API모킹).toHaveBeenCalledWith({
          제목: '테스트 제목',
          내용: '테스트 내용',
          태그목록: [],
          발행상태: '임시저장',
        });
      });
    });

    it('API 에러 발생시 에러 메시지를 표시해야 한다', async () => {
      // Arrange
      const 작성API모킹 = vi.mocked(블로그글API.블로그글작성하기);
      작성API모킹.mockRejectedValue(new Error('서버 에러'));

      render(<블로그글작성폼 />);

      // Act
      fireEvent.change(screen.getByLabelText('제목'), {
        target: { value: '테스트 제목' }
      });
      fireEvent.change(screen.getByLabelText('내용'), {
        target: { value: '테스트 내용' }
      });
      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('글 저장에 실패했습니다')).toBeInTheDocument();
      });
    });
  });
});
```

### 2단계: 🟢 GREEN - 테스트 통과하는 코드 작성

#### 최소한의 구현으로 테스트 통과시키기

```typescript
// src/features/글작성/블로그글작성폼.tsx
import { useState } from 'react';
import { 블로그글작성하기 } from '@/entities/블로그글/api/블로그글API';

interface 폼데이터 {
  제목: string;
  내용: string;
}

interface 에러상태 {
  제목: string;
  내용: string;
  일반: string;
}

export function 블로그글작성폼() {
  const [폼데이터, set폼데이터] = useState<폼데이터>({
    제목: '',
    내용: '',
  });

  const [에러상태, set에러상태] = useState<에러상태>({
    제목: '',
    내용: '',
    일반: '',
  });

  const [로딩중, set로딩중] = useState(false);

  function 입력값검증(데이터: 폼데이터): 에러상태 {
    const 에러들: 에러상태 = {
      제목: '',
      내용: '',
      일반: '',
    };

    if (!데이터.제목.trim()) {
      에러들.제목 = '제목을 입력해주세요';
    } else if (데이터.제목.length > 100) {
      에러들.제목 = '제목은 100자 이하로 입력해주세요';
    }

    if (!데이터.내용.trim()) {
      에러들.내용 = '내용을 입력해주세요';
    }

    return 에러들;
  }

  async function 폼제출처리() {
    set에러상태({ 제목: '', 내용: '', 일반: '' });

    const 유효성검사결과 = 입력값검증(폼데이터);

    if (유효성검사결과.제목 || 유효성검사결과.내용) {
      set에러상태(유효성검사결과);
      return;
    }

    set로딩중(true);

    try {
      await 블로그글작성하기({
        제목: 폼데이터.제목,
        내용: 폼데이터.내용,
        태그목록: [],
        발행상태: '임시저장',
      });
    } catch (error) {
      set에러상태(prev => ({
        ...prev,
        일반: '글 저장에 실패했습니다',
      }));
    } finally {
      set로딩중(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); 폼제출처리(); }}>
      <div>
        <label htmlFor="제목">제목</label>
        <input
          id="제목"
          type="text"
          value={폼데이터.제목}
          onChange={(e) => set폼데이터(prev => ({ ...prev, 제목: e.target.value }))}
          onBlur={() => {
            const 에러 = 입력값검증({ ...폼데이터, 제목: 폼데이터.제목 });
            set에러상태(prev => ({ ...prev, 제목: 에러.제목 }));
          }}
        />
        {에러상태.제목 && <div>{에러상태.제목}</div>}
      </div>

      <div>
        <label htmlFor="내용">내용</label>
        <textarea
          id="내용"
          value={폼데이터.내용}
          onChange={(e) => set폼데이터(prev => ({ ...prev, 내용: e.target.value }))}
        />
        {에러상태.내용 && <div>{에러상태.내용}</div>}
      </div>

      {에러상태.일반 && <div>{에러상태.일반}</div>}

      <button type="submit" disabled={로딩중}>
        {로딩중 ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}
```

### 3단계: 🔵 REFACTOR - 리팩토링

#### 모든 테스트가 통과한 후 코드 품질 개선

```typescript
// 리팩토링된 버전: 커스텀 훅 분리
// src/features/글작성/hooks/use블로그글작성폼.ts

import { useState } from 'react';
import { 블로그글작성하기 } from '@/entities/블로그글/api/블로그글API';

export interface 폼데이터 {
  제목: string;
  내용: string;
}

export interface 에러상태 {
  제목: string;
  내용: string;
  일반: string;
}

const 유효성검사규칙 = {
  제목최대길이: 100,
} as const;

export function use블로그글작성폼() {
  const [폼데이터, set폼데이터] = useState<폼데이터>({
    제목: '',
    내용: '',
  });

  const [에러상태, set에러상태] = useState<에러상태>({
    제목: '',
    내용: '',
    일반: '',
  });

  const [로딩중, set로딩중] = useState(false);

  function 입력값검증(데이터: 폼데이터): 에러상태 {
    const 에러들: 에러상태 = {
      제목: '',
      내용: '',
      일반: '',
    };

    // 제목 검증
    if (!데이터.제목.trim()) {
      에러들.제목 = '제목을 입력해주세요';
    } else if (데이터.제목.length > 유효성검사규칙.제목최대길이) {
      에러들.제목 = `제목은 ${유효성검사규칙.제목최대길이}자 이하로 입력해주세요`;
    }

    // 내용 검증
    if (!데이터.내용.trim()) {
      에러들.내용 = '내용을 입력해주세요';
    }

    return 에러들;
  }

  function 필드업데이트(필드: keyof 폼데이터, 값: string) {
    set폼데이터(prev => ({ ...prev, [필드]: 값 }));
  }

  function 필드에러검사(필드: keyof 폼데이터) {
    const 에러 = 입력값검증(폼데이터);
    set에러상태(prev => ({ ...prev, [필드]: 에러[필드] }));
  }

  async function 제출하기() {
    set에러상태({ 제목: '', 내용: '', 일반: '' });

    const 유효성검사결과 = 입력값검증(폼데이터);
    const 유효성검사실패 = Object.values(유효성검사결과).some(Boolean);

    if (유효성검사실패) {
      set에러상태(유효성검사결과);
      return;
    }

    set로딩중(true);

    try {
      await 블로그글작성하기({
        제목: 폼데이터.제목,
        내용: 폼데이터.내용,
        태그목록: [],
        발행상태: '임시저장',
      });

      // 성공 후 폼 초기화
      set폼데이터({ 제목: '', 내용: '' });
    } catch (error) {
      set에러상태(prev => ({
        ...prev,
        일반: '글 저장에 실패했습니다',
      }));
    } finally {
      set로딩중(false);
    }
  }

  return {
    폼데이터,
    에러상태,
    로딩중,
    필드업데이트,
    필드에러검사,
    제출하기,
  };
}
```

```typescript
// 리팩토링된 컴포넌트
// src/features/글작성/블로그글작성폼.tsx

import { use블로그글작성폼 } from './hooks/use블로그글작성폼';

export function 블로그글작성폼() {
  const {
    폼데이터,
    에러상태,
    로딩중,
    필드업데이트,
    필드에러검사,
    제출하기,
  } = use블로그글작성폼();

  return (
    <form onSubmit={(e) => { e.preventDefault(); 제출하기(); }}>
      <div>
        <label htmlFor="제목">제목</label>
        <input
          id="제목"
          type="text"
          value={폼데이터.제목}
          onChange={(e) => 필드업데이트('제목', e.target.value)}
          onBlur={() => 필드에러검사('제목')}
        />
        {에러상태.제목 && <div>{에러상태.제목}</div>}
      </div>

      <div>
        <label htmlFor="내용">내용</label>
        <textarea
          id="내용"
          value={폼데이터.내용}
          onChange={(e) => 필드업데이트('내용', e.target.value)}
          onBlur={() => 필드에러검사('내용')}
        />
        {에러상태.내용 && <div>{에러상태.내용}</div>}
      </div>

      {에러상태.일반 && <div>{에러상태.일반}</div>}

      <button type="submit" disabled={로딩중}>
        {로딩중 ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}
```

## 🧪 고급 테스트 패턴

### 통합 테스트
```typescript
// src/features/글작성/__tests__/통합테스트.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { 블로그글작성페이지 } from '../블로그글작성페이지';

// MSW 서버 설정
const server = setupServer(
  http.post('/api/블로그글', () => {
    return HttpResponse.json({
      아이디: 'test-id',
      제목: '테스트 제목',
      내용: '테스트 내용',
      작성일자: new Date().toISOString(),
      수정일자: new Date().toISOString(),
      작성자아이디: 'user-id',
      태그목록: [],
      발행상태: '임시저장',
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('블로그글 작성 통합 테스트', () => {
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

  it('전체 플로우가 정상적으로 동작해야 한다', async () => {
    // Arrange
    renderWithProviders(<블로그글작성페이지 />);

    // Act
    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '통합 테스트 제목' }
    });
    fireEvent.change(screen.getByLabelText('내용'), {
      target: { value: '통합 테스트 내용' }
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('글이 성공적으로 저장되었습니다')).toBeInTheDocument();
    });
  });
});
```

### E2E 테스트 (Playwright)
```typescript
// tests/e2e/블로그글작성.spec.ts

import { test, expect } from '@playwright/test';

test.describe('블로그글 작성 E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태로 테스트 시작
    await page.goto('/login');
    await page.fill('[name="이메일"]', 'admin@example.com');
    await page.fill('[name="비밀번호"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('새 글을 작성하고 발행할 수 있다', async ({ page }) => {
    // 글 작성 페이지로 이동
    await page.goto('/admin/글작성');

    // 글 작성
    await page.fill('[name="제목"]', 'E2E 테스트 글');
    await page.fill('[name="내용"]', '이것은 E2E 테스트로 작성된 글입니다.');

    // 태그 추가
    await page.fill('[name="태그"]', 'E2E');
    await page.press('[name="태그"]', 'Enter');

    // 임시저장
    await page.click('button:has-text("임시저장")');
    await expect(page.locator('.성공메시지')).toHaveText('임시저장되었습니다');

    // 발행
    await page.click('button:has-text("발행")');
    await expect(page.locator('.성공메시지')).toHaveText('글이 발행되었습니다');

    // 발행된 글 확인
    await page.goto('/posts');
    await expect(page.locator('h2:has-text("E2E 테스트 글")')).toBeVisible();
  });
});
```

## 📊 테스트 명령어

### 기본 테스트 실행
```bash
# 모든 테스트 실행
pnpm test

# 특정 파일만 테스트
pnpm test 블로그글작성.test.ts

# 변경사항 감지하여 자동 실행
pnpm test --watch

# 커버리지 포함 실행
pnpm test --coverage

# UI 모드로 실행
pnpm test --ui
```

### TDD 사이클별 명령어
```bash
# 1단계: RED - 실패하는 테스트 확인
pnpm test --run --reporter=verbose

# 2단계: GREEN - 특정 테스트만 실행하여 통과 확인
pnpm test --run 블로그글작성 --reporter=dot

# 3단계: REFACTOR - 모든 테스트 실행하여 회귀 방지
pnpm test --run --coverage
```

## ✅ TDD 체크리스트

### 🔴 RED 단계 체크리스트
- [ ] 모든 예외 상황에 대한 테스트 작성
- [ ] 정상 케이스에 대한 테스트 작성
- [ ] 경계값 테스트 작성
- [ ] 테스트가 실제로 실패하는지 확인
- [ ] 테스트 이름이 명확하고 한국어로 작성

### 🟢 GREEN 단계 체크리스트
- [ ] 모든 테스트가 통과하는지 확인
- [ ] 최소한의 코드로 구현
- [ ] 하드코딩이나 우회 구현 피하기
- [ ] 기존 테스트에 영향 없는지 확인

### 🔵 REFACTOR 단계 체크리스트
- [ ] 테스트 통과 상태 유지
- [ ] 코드 중복 제거
- [ ] 함수/클래스 분리
- [ ] 네이밍 개선
- [ ] 성능 최적화 (필요시)

## 🚫 TDD 안티패턴

### 피해야 할 것들

#### 1. 테스트를 우회하는 구현
```typescript
// ❌ 잘못된 예시
function 블로그글검증(제목: string) {
  if (제목 === '테스트 제목') return true; // 테스트만 통과시키는 하드코딩
  return false;
}

// ✅ 올바른 예시
function 블로그글검증(제목: string) {
  return 제목.length > 0 && 제목.length <= 100; // 실제 비즈니스 로직
}
```

#### 2. 너무 많은 것을 한 번에 테스트
```typescript
// ❌ 잘못된 예시
it('블로그글 전체 기능이 동작해야 한다', () => {
  // 생성, 수정, 삭제, 목록 조회 모두 테스트
});

// ✅ 올바른 예시
describe('블로그글 관리', () => {
  it('새 글을 생성할 수 있다', () => { });
  it('기존 글을 수정할 수 있다', () => { });
  it('글을 삭제할 수 있다', () => { });
  it('글 목록을 조회할 수 있다', () => { });
});
```

#### 3. 구현 세부사항에 의존하는 테스트
```typescript
// ❌ 잘못된 예시
it('useState가 호출되어야 한다', () => {
  const spy = vi.spyOn(React, 'useState');
  render(<컴포넌트 />);
  expect(spy).toHaveBeenCalled();
});

// ✅ 올바른 예시
it('초기 상태가 올바르게 표시되어야 한다', () => {
  render(<컴포넌트 />);
  expect(screen.getByText('초기값')).toBeInTheDocument();
});
```

## 🎯 TDD 성공을 위한 팁

### 1. 작은 단위로 시작
- 한 번에 하나의 기능만 구현
- 복잡한 기능은 작은 단위로 분해

### 2. 테스트 이름을 명확하게
```typescript
// ✅ 좋은 테스트 이름
it('제목이 비어있으면 에러 메시지를 표시해야 한다')
it('올바른 데이터로 작성시 성공 메시지를 표시해야 한다')
it('API 에러 발생시 사용자에게 알림을 보여야 한다')
```

### 3. AAA 패턴 사용
```typescript
it('테스트 설명', () => {
  // Arrange: 테스트 환경 설정
  const 테스트데이터 = { 제목: '테스트' };

  // Act: 실제 동작 수행
  const 결과 = 함수실행(테스트데이터);

  // Assert: 결과 검증
  expect(결과).toBe(예상결과);
});
```

### 4. 실패 메시지 활용
```typescript
it('사용자 권한 검증', () => {
  expect(사용자권한확인('일반사용자')).toBe(false, '일반사용자는 관리자 권한이 없어야 함');
});
```

이 TDD 프로세스를 통해 안정적이고 유지보수 가능한 코드를 작성할 수 있습니다.

---

## 📝 의사결정 기록 프로세스

### 🚨 필수 규칙: 영어 식별자 사용

**⚠️ 모든 코드 식별자는 반드시 영어로 작성해야 합니다!**

- ✅ **영어로 작성**: 함수명, 변수명, 클래스명, 인터페이스명, 타입명, 프로퍼티명
- ✅ **한국어로 작성**: 주석, 문서, 커밋 메시지, UI 텍스트, 에러 메시지
- ❌ **절대 금지**: `사용자`, `로그인하기`, `이메일` 등 한글 식별자 사용

### 개발 요청 시 필수 정보

모든 개발 요청 시 다음 정보를 포함해야 합니다:

#### 1. 개발 의도 (필수)
```markdown
**개발 의도:**
- 왜 이 기능이 필요한가?
- 어떤 문제를 해결하려는가?
- 예상되는 사용자 가치는?
```

#### 2. 기술적 배경 (선택)
```markdown
**기술적 배경:**
- 현재 상황
- 기술적 제약사항
- 성능/보안 고려사항
```

#### 3. 우선순위 (선택)
```markdown
**우선순위:**
- 긴급도: 높음/보통/낮음
- 중요도: 높음/보통/낮음
- 예상 소요시간: X시간/일
```

### 개발 진행 시 기록 절차

#### 1단계: 개발 시작 전 확인
- [ ] 개발 의도가 명확한가?
- [ ] 기술적 배경을 이해했는가?
- [ ] 대안들을 고려했는가?

#### 2단계: 개발 중 기록
모든 주요 결정사항을 `docs/development-history.md`에 기록:

```markdown
#### [작업 제목]

**개발 의도:**
- 사용자의 요청 또는 개발 필요성

**기술적 배경:**
- 현재 상황
- 해결해야 할 문제
- 기술적 제약사항

**변경 내용:**
1. **[카테고리]**
   - 구체적인 변경사항
   - 코드 예시 (필요시)

**의사결정 과정:**
- 고려한 대안들
- 선택한 이유
- 거부한 대안과 그 이유

**예상 영향:**
- 긍정적 영향
- 주의사항
- 성능/보안/UX에 미치는 영향

**후속 작업:**
- 연관된 작업
- 추가로 필요한 작업
```

#### 3단계: 롤백도 기록
실패하거나 롤백하는 경우에도 기록:

```markdown
#### [롤백 작업 제목]

**롤백 이유:**
- 왜 롤백했는가?
- 어떤 문제가 발생했는가?

**롤백 내용:**
- 되돌린 변경사항
- 복구 과정

**학습 내용:**
- 이번 시도에서 배운 것
- 다음에 시도할 방법
```

### Claude Code와의 협업 시 절차

#### 개발 요청 시
```markdown
Claude, [기능명]을 개발해줘.

**개발 의도:**
- [구체적인 필요성과 목적]

**기술적 배경:** (선택사항)
- [현재 상황과 제약사항]

**우선순위:** (선택사항)
- [긴급도와 중요도]
```

#### Claude의 응답
Claude는 다음을 확인해야 함:
1. 개발 의도가 명시되었는가?
2. 기술적 배경이 필요한가?
3. 대안을 고려해야 하는가?

개발 의도가 없으면 반드시 질문:
```markdown
개발 의도를 알려주세요:
- 왜 이 기능이 필요한가요?
- 어떤 문제를 해결하려고 하시나요?
- 예상되는 사용자 가치는 무엇인가요?
```

### 의사결정 추적 도구

#### 개발 이력 문서
- 파일: `docs/development-history.md`
- 목적: 모든 개발 의사결정 기록
- 업데이트: 모든 주요 변경사항마다

#### 검색 및 참조
```bash
# 특정 기능 관련 이력 검색
grep -n "MarkdownEditor" docs/development-history.md

# 날짜별 이력 확인
grep -n "2025-09-16" docs/development-history.md

# 의사결정 과정 검색
grep -A 5 -B 5 "의사결정 과정" docs/development-history.md
```

### 주요 체크포인트

#### 매일 확인사항
- [ ] 오늘 한 모든 변경사항이 기록되었는가?
- [ ] 의사결정 과정이 명확히 문서화되었는가?
- [ ] 향후 참고할 만한 학습 내용이 있는가?

#### 주간 검토사항
- [ ] 이번 주 개발 방향이 일관적인가?
- [ ] 기술 부채가 누적되고 있지 않은가?
- [ ] 문서화가 최신 상태를 반영하는가?

이 절차를 통해 개발팀의 지식을 체계적으로 축적하고, 신입 개발자 온보딩과 기술 부채 관리에 활용할 수 있습니다.