# Features Layer 가이드

이 폴더는 Feature Slice Design (FSD) 아키텍처의 **Features Layer**입니다.

## 🎯 Features Layer의 역할

### 책임
- **기능별 비즈니스 로직**: 사용자 시나리오 구현
- **UI와 데이터 연결**: 컴포넌트와 엔티티 계층 연결
- **상태 관리**: 기능별 클라이언트 상태 관리
- **사용자 인터랙션**: 폼, 이벤트 처리 등

### 허용되는 의존성
- ✅ Entities layer 사용
- ✅ Shared layer 사용
- ✅ 다른 Features (신중하게)

### 금지사항
- ❌ Pages layer에 의존
- ❌ App layer에 의존

## 📁 폴더 구조

```
src/features/
├── CLAUDE.md                     # 이 파일
├── auth/                         # 로그인/로그아웃 기능
│   ├── CLAUDE.md                 # 인증 기능 가이드
│   ├── components/               # 인증 관련 컴포넌트
│   │   ├── LoginForm.tsx         # 로그인 폼
│   │   ├── SignupForm.tsx        # 회원가입 폼
│   │   └── UserMenu.tsx          # 사용자 드롭다운 메뉴
│   ├── hooks/                    # 인증 관련 훅
│   │   └── useAuthForm.ts        # 인증 폼 로직
│   └── utils/                    # 인증 유틸리티
│       └── AuthGuard.tsx         # 라우트 보호 컴포넌트
├── post/                         # 블로그 글 관련 기능
│   ├── editor/                   # 글 작성/편집
│   │   ├── CLAUDE.md
│   │   ├── components/
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── Preview.tsx
│   │   │   └── PostForm.tsx
│   │   ├── hooks/
│   │   │   └── usePostEditor.ts
│   │   └── utils/
│   │       └── markdownTransform.ts
│   └── list/                     # 글 목록 조회
│       ├── CLAUDE.md
│       ├── components/
│       │   ├── PostList.tsx
│       │   ├── PostCard.tsx
│       │   ├── Pagination.tsx
│       │   └── SearchFilter.tsx
│       ├── hooks/
│       │   └── usePostList.ts
│       └── utils/
│           └── listSorting.ts
└── markdown-viewer/              # 마크다운 렌더링
    ├── CLAUDE.md
    ├── components/
    │   ├── MarkdownRenderer.tsx
    │   ├── CodeHighlighter.tsx
    │   └── TocGenerator.tsx
    ├── hooks/
    │   └── useMarkdown.ts
    └── utils/
        └── markdownParser.ts
```

## 🔨 구현 패턴

### 1. 컴포넌트 구조
```typescript
// features/post/editor/components/PostForm.tsx
import { usePostEditor } from '../hooks/usePostEditor';
import { PostCreateInput } from '@/entities/post/model/types';

interface PostFormProps {
  initialData?: Partial<PostCreateInput>;
  onComplete?: (postId: string) => void;
}

export function PostForm({ initialData, onComplete }: PostFormProps) {
  const {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
  } = usePostEditor({
    initialData,
    onComplete,
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 구현 */}
    </form>
  );
}
```

### 2. 커스텀 훅 패턴
```typescript
// features/post/editor/hooks/usePostEditor.ts
import { useState } from 'react';
import { useCreatePost } from '@/entities/post/hooks/usePost';
import { validatePostData } from '@/entities/post/model/validation';

interface UsePostEditorOptions {
  initialData?: Partial<PostCreateInput>;
  onComplete?: (postId: string) => void;
}

export function usePostEditor(options: UsePostEditorOptions = {}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tagList: [],
    status: 'draft' as const,
    ...options.initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreatePost();

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 에러 상태 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    const validationErrors = validatePostData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const newPost = await createMutation.mutateAsync(formData);
      options.onComplete?.(newPost.id);
    } catch (error) {
      console.error('글 작성 실패:', error);
    }
  };

  return {
    formData,
    errors,
    loading: createMutation.isLoading,
    updateField,
    handleSubmit,
  };
}
```

### 3. 유틸리티 함수
```typescript
// features/markdown-viewer/utils/markdownParser.ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownOptions {
  syntaxHighlighting?: boolean;
  generateToc?: boolean;
  lazyLoadImages?: boolean;
}

export function markdownToHtml(
  markdownContent: string,
  options: MarkdownOptions = {}
): string {
  // Marked 설정
  marked.setOptions({
    highlight: options.syntaxHighlighting ? highlightCode : undefined,
    breaks: true,
    gfm: true,
  });

  // 마크다운을 HTML로 변환
  const htmlContent = marked(markdownContent);

  // XSS 방지를 위한 sanitize
  const safeHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id'],
  });

  return options.lazyLoadImages ? applyLazyLoading(safeHtml) : safeHtml;
}

function highlightCode(code: string, language: string): string {
  // 문법 하이라이팅 라이브러리 (예: Prism.js) 적용
  return code;
}

function applyLazyLoading(html: string): string {
  return html.replace(/<img/g, '<img loading="lazy"');
}
```

## 🔄 Features 간 상호작용

### 허용되는 패턴
```typescript
// ✅ 다른 feature의 컴포넌트 사용 (신중하게)
import { UserMenu } from '@/features/auth/components/UserMenu';

export function PostEditorPage() {
  return (
    <div>
      <header>
        <UserMenu />
      </header>
      <main>
        <PostForm />
      </main>
    </div>
  );
}
```

### 추천하는 패턴 (Shared를 통한 연결)
```typescript
// shared/components/layout/AdminLayout.tsx
import { UserMenu } from '@/features/auth/components/UserMenu';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <UserMenu />
      </header>
      <main>{children}</main>
    </div>
  );
}

// features/post/editor/components/PostEditorPage.tsx
import { AdminLayout } from '@/shared/components/layout/AdminLayout';

export function PostEditorPage() {
  return (
    <AdminLayout>
      <PostForm />
    </AdminLayout>
  );
}
```

## 📊 상태 관리 패턴

### 1. 로컬 상태 (useState)
```typescript
// 단순한 폼 상태, UI 상태
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('preview');
```

### 2. 서버 상태 (TanStack Query)
```typescript
// 서버에서 가져오는 데이터
const { data: postList } = usePostList(searchCondition);
const createPost = useCreatePost();
```

### 3. 전역 상태 (React Context)
```typescript
// features/auth/context/AuthContext.tsx
import { createContext, useContext } from 'react';
import { useCurrentUser } from '@/entities/user/hooks/useUser';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: currentUser, isLoading } = useCurrentUser();

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## 🧪 테스트 전략

### 1. 컴포넌트 테스트
```typescript
// features/post/editor/__tests__/PostForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PostForm } from '../components/PostForm';

// Mock entities
vi.mock('@/entities/post/hooks/usePost');

describe('PostForm', () => {
  it('제목과 내용을 입력하고 저장할 수 있다', async () => {
    const onComplete = vi.fn();

    render(<PostForm onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '테스트 글 제목' }
    });
    fireEvent.change(screen.getByLabelText('내용'), {
      target: { value: '테스트 글 내용' }
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('new-post-id');
    });
  });
});
```

### 2. 훅 테스트
```typescript
// features/post/editor/__tests__/usePostEditor.test.ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePostEditor } from '../hooks/usePostEditor';

describe('usePostEditor', () => {
  it('필드 업데이트가 정상 작동한다', () => {
    const { result } = renderHook(() => usePostEditor());

    act(() => {
      result.current.updateField('title', '새 제목');
    });

    expect(result.current.formData.title).toBe('새 제목');
  });
});
```

## 🚀 성능 최적화

### 1. 컴포넌트 분할
```typescript
// 큰 컴포넌트를 작은 단위로 분할
const MarkdownEditor = lazy(() => import('./MarkdownEditor'));
const Preview = lazy(() => import('./Preview'));

export function PostForm() {
  return (
    <div>
      <Suspense fallback={<div>에디터 로딩 중...</div>}>
        <MarkdownEditor />
      </Suspense>
      <Suspense fallback={<div>미리보기 로딩 중...</div>}>
        <Preview />
      </Suspense>
    </div>
  );
}
```

### 2. 메모이제이션
```typescript
// 불필요한 리렌더링 방지
const OptimizedPostCard = memo(function PostCard({ postInfo }: { postInfo: Post }) {
  return (
    <article>
      <h2>{postInfo.title}</h2>
      <p>{postInfo.summary}</p>
    </article>
  );
});

// 비싼 계산 캐싱
function useMarkdownPreview(markdownContent: string) {
  return useMemo(() => {
    return markdownToHtml(markdownContent);
  }, [markdownContent]);
}
```

## 📋 개발 체크리스트

새로운 기능 추가 시:

- [ ] 기능의 책임이 명확한가?
- [ ] 적절한 entities를 사용하는가?
- [ ] 상태 관리 전략이 적절한가?
- [ ] 컴포넌트가 재사용 가능하게 설계되었는가?
- [ ] 에러 처리가 포함되어 있는가?
- [ ] 테스트가 작성되어 있는가?
- [ ] 성능 최적화가 고려되었는가?
- [ ] 접근성이 고려되었는가?

## 🔗 의존성 규칙 요약

```
Features Layer 의존성:
- ✅ Entities ← Features
- ✅ Shared ← Features
- ✅ Features ← Features (신중하게)
- ❌ Features → Pages
- ❌ Features → App
```

각 기능별 상세 가이드는 해당 폴더의 CLAUDE.md를 참조하세요.