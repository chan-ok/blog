# 공통 컴포넌트 문서

## 📋 개요

이 문서는 블로그 애플리케이션에서 사용되는 공통 컴포넌트들의 사용법, API, 그리고 디자인 원칙에 대해 설명합니다.

## 🧩 컴포넌트 목록

### 1. PostCard

포스트 목록에서 사용되는 카드 형태의 컴포넌트입니다.

#### 사용법
```typescript
import { PostCard } from '@/shared/components';

function PostsList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

#### Props
```typescript
interface PostCardProps {
  post: Post;
  className?: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  tags: string[];
  viewCount?: number;
  readingTime?: string;
}
```

#### 특징
- **반응형 디자인**: 모바일부터 데스크톱까지 대응
- **접근성**: ARIA 라벨, 키보드 네비게이션 지원
- **호버 효과**: 사용자 상호작용 향상
- **상태 표시**: draft, published 등 포스트 상태 시각화

### 2. LoadingSpinner

비동기 작업 중 로딩 상태를 표시하는 컴포넌트입니다.

#### 사용법
```typescript
import { LoadingSpinner } from '@/shared/components';

function DataComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        text="데이터를 불러오는 중..."
        className="min-h-[200px]"
      />
    );
  }

  return <div>데이터 내용</div>;
}
```

#### Props
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}
```

#### 크기 옵션
- `sm`: 16px (w-4 h-4) - 버튼 내부 등
- `md`: 32px (w-8 h-8) - 기본 크기
- `lg`: 48px (w-12 h-12) - 페이지 로딩 등

### 3. EmptyState

데이터가 없거나 검색 결과가 없을 때 표시되는 컴포넌트입니다.

#### 사용법
```typescript
import { EmptyState } from '@/shared/components';

function SearchResults({ results, query }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="검색 결과가 없습니다"
        description={`"${query}"에 해당하는 글을 찾을 수 없습니다.`}
        actionText="모든 글 보기"
        actionHref="/posts"
      />
    );
  }

  return <div>{/* 검색 결과 */}</div>;
}
```

#### Props
```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}
```

#### 사용 시나리오
- 빈 포스트 목록
- 검색 결과 없음
- 필터링 결과 없음
- 오류 발생 시 대체 화면

### 4. PageHeader

페이지 상단의 제목과 설명을 표시하는 컴포넌트입니다.

#### 사용법
```typescript
import { PageHeader } from '@/shared/components';

function AboutPage() {
  return (
    <>
      <PageHeader
        title="소개"
        description="개발자로서의 여정과 경험을 공유합니다."
        className="mb-8"
      />
      <div>{/* 페이지 내용 */}</div>
    </>
  );
}
```

#### Props
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}
```

### 5. TagBadge

태그를 표시하는 배지 컴포넌트입니다.

#### 사용법
```typescript
import { TagBadge } from '@/shared/components';

function PostTags({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <TagBadge
          key={tag}
          tag={tag}
          variant="blue"
          href={`/tags/${tag}`}
        />
      ))}
    </div>
  );
}
```

#### Props
```typescript
interface TagBadgeProps {
  tag: string;
  variant?: 'gray' | 'blue' | 'green' | 'yellow' | 'red';
  href?: string;
  className?: string;
}
```

#### 색상 변형
- `gray`: 기본 회색 (중립적)
- `blue`: 파란색 (기술 관련)
- `green`: 초록색 (성공, 완료)
- `yellow`: 노란색 (주의, 진행중)
- `red`: 빨간색 (중요, 경고)

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* Primary Colors */
--color-blue-500: #3b82f6;
--color-blue-600: #2563eb;

/* Neutral Colors */
--color-gray-100: #f3f4f6;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-900: #111827;

/* Semantic Colors */
--color-green-100: #dcfce7;
--color-green-700: #15803d;
--color-red-100: #fee2e2;
--color-red-700: #b91c1c;
```

### 타이포그래피
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
```

### 간격 시스템
```css
/* Margin/Padding */
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }

/* Gaps */
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
```

## 🔧 개발 가이드라인

### 1. 컴포넌트 작성 원칙

#### 단일 책임 원칙
각 컴포넌트는 하나의 명확한 목적을 가져야 합니다.

```typescript
// ✅ 좋은 예: 명확한 단일 책임
function LoadingSpinner({ size, text }) {
  // 로딩 상태만 표시
}

// ❌ 나쁜 예: 여러 책임 혼재
function DataDisplay({ loading, error, data }) {
  // 로딩, 에러, 데이터 표시 모두 처리
}
```

#### 컴포지션 우선
상속보다는 컴포지션을 활용합니다.

```typescript
// ✅ 좋은 예: 컴포지션 활용
function PostPage() {
  return (
    <>
      <PageHeader title="글 제목" />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <PostContent content={post.content} />
      )}
    </>
  );
}
```

### 2. Props 설계 원칙

#### 명확한 타입 정의
```typescript
// ✅ 좋은 예: 명확한 타입과 기본값
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}: ButtonProps) {
  // 구현
}
```

#### Props 확장성
```typescript
// 기본 HTML props 확장
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```

### 3. 상태 관리 패턴

#### 상태 끌어올리기
```typescript
// 부모에서 상태 관리, 자식은 props로 받기
function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialData);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  return (
    <form>
      <FormField
        value={formData.name}
        onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
        disabled={status === 'sending'}
      />
      <SubmitButton status={status} />
    </form>
  );
}
```

### 4. 에러 처리 패턴

#### 에러 바운더리 활용
```typescript
function ErrorBoundary({ children, fallback }) {
  // 에러 캐치 및 폴백 UI 표시
}

// 사용
<ErrorBoundary fallback={<ErrorMessage />}>
  <PostCard post={post} />
</ErrorBoundary>
```

#### 사용자 친화적 에러 메시지
```typescript
const getErrorMessage = (error: Error) => {
  if (error.message.includes('network')) {
    return '네트워크 연결을 확인해주세요.';
  }
  if (error.message.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }
  return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};
```

## 🧪 테스트 가이드라인

### 1. 컴포넌트 테스트 구조

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from '../PostCard';

describe('PostCard 컴포넌트', () => {
  const mockPost = {
    id: 1,
    slug: 'test-post',
    title: '테스트 포스트',
    // ... 필수 필드들
  };

  it('포스트 정보가 올바르게 렌더링되어야 한다', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(screen.getByText(mockPost.summary)).toBeInTheDocument();
  });

  it('링크가 올바른 경로를 가져야 한다', () => {
    render(<PostCard post={mockPost} />);

    const titleLink = screen.getByRole('link', { name: mockPost.title });
    expect(titleLink).toHaveAttribute('href', `/posts/${mockPost.slug}`);
  });
});
```

### 2. 접근성 테스트

```typescript
it('접근성 요구사항을 만족해야 한다', () => {
  render(<LoadingSpinner />);

  const spinner = screen.getByRole('status');
  expect(spinner).toHaveAttribute('aria-label', '로딩 중');
});
```

### 3. 사용자 상호작용 테스트

```typescript
it('사용자 입력이 올바르게 처리되어야 한다', async () => {
  const onSubmit = vi.fn();
  render(<ContactForm onSubmit={onSubmit} />);

  const nameInput = screen.getByLabelText('이름 *');
  fireEvent.change(nameInput, { target: { value: '홍길동' } });

  const submitButton = screen.getByRole('button', { name: '메시지 보내기' });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '홍길동' })
    );
  });
});
```

## 📚 참고 자료

### 공식 문서
- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/)

### 베스트 프랙티스
- [React 베스트 프랙티스](https://react.dev/learn/thinking-in-react)
- [접근성 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [테스팅 라이브러리 가이드](https://testing-library.com/docs/)

---

이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.