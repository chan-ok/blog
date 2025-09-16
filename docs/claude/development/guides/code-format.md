# Code Format Rules

This document defines consistent code style and naming conventions for the project.

## 🎯 Core Principles

1. **English Identifiers**: All variable names, function names, class names, and type names must be written in English
2. **Korean Text**: Comments, UI text, error messages, and documentation in Korean
3. **Consistency**: Apply the same rules across the entire team
4. **Readability**: Clear and understandable code
5. **Type Safety**: Strict type definitions using TypeScript

## 📁 File and Folder Naming

### Folder Names: kebab-case
```
✅ Correct Examples
src/
├── blog-editor/
├── user-auth/
├── shared-components/
└── api-client/

❌ Incorrect Examples
src/
├── BlogEditor/      (PascalCase prohibited)
├── user_auth/       (snake_case prohibited)
├── sharedComponents/ (camelCase prohibited)
└── APICLIENT/       (UPPERCASE prohibited)
```

### File Naming Rules

#### React Components: PascalCase
```typescript
✅ Correct Examples
Header.tsx
BlogEditor.tsx
UserProfile.tsx
NavBar.tsx

❌ Incorrect Examples
header.tsx
blogEditor.tsx
user-profile.tsx
nav_bar.tsx
```

#### General Files: camelCase
```typescript
✅ Correct Examples
userAPI.ts
blogUtils.ts
authService.ts
dateFormatter.ts

❌ Incorrect Examples
UserAPI.ts
blog-utils.ts
auth_service.ts
DATE_FORMATTER.ts
```

#### Configuration Files: kebab-case
```
✅ Correct Examples
vite.config.ts
tailwind.config.js
eslint.config.ts
prettier.config.js
```

## 🔤 Variable and Function Naming

### Variable Names: camelCase + English
```typescript
✅ Correct Examples
const userName = "김개발";
const blogPostList = [];
const maxFileSize = 1024;
let currentPageNumber = 1;
const isLoggedIn = true;

❌ Incorrect Examples
const user_name = "김개발";        // snake_case
const BlogList = [];              // PascalCase
const 사용자이름 = "김개발";       // Korean identifier
const UserName = "김개발";         // PascalCase
```

### Function Names: camelCase + English Verb
```typescript
✅ Correct Examples
function getUserInfo() { }
function createBlogPost(content: string) { }
function navigateToPage(path: string) { }
const validateData = (input: unknown) => { };

❌ Incorrect Examples
function GetUserInfo() { }         // PascalCase
function blog_create() { }         // snake_case
function userInfo() { }            // No verb
const 사용자정보가져오기 = () => { }; // Korean identifier
```

### Constants: SCREAMING_SNAKE_CASE + English
```typescript
✅ Correct Examples
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_PAGE_SIZE = 20;
const ERROR_MESSAGES = {
  LOGIN_FAILED: "로그인에 실패했습니다",
  FILE_SIZE_EXCEEDED: "파일 크기가 너무 큽니다"
} as const;

❌ Incorrect Examples
const maxUploadSize = 10 * 1024 * 1024;  // camelCase
const api_base_url = "https://...";       // lowercase snake_case
const 최대_업로드_크기 = 1024;            // Korean identifier
```

## ⚛️ React Component Rules

### Component Names: PascalCase + English
```typescript
✅ Correct Examples
export function Header() {
  return <header>...</header>;
}

export function BlogEditor() {
  return <div>...</div>;
}

export const UserProfile = () => {
  return <div>...</div>;
};

❌ Incorrect Examples
export function header() { }       // lowercase start
export function blogEditor() { }   // camelCase
export function 헤더() { }         // Korean identifier
export function Blog_Editor() { }  // snake_case
```

### Props Interface
```typescript
✅ Correct Examples
interface HeaderProps {
  title: string;
  logoUrl?: string;
  menuItems: MenuItem[];
}

interface BlogPostProps {
  postId: string;
  title: string;
  publishedAt: Date;
  tags?: string[];
}

❌ Incorrect Examples
interface 헤더Props { }            // Korean identifier
interface Header_Props { }         // snake_case
interface headerProps { }          // lowercase start
```

### Hook Naming
```typescript
✅ Correct Examples
function useUserInfo() {
  // User information related logic
}

function useBlogPostList(pageNumber: number) {
  // Blog post list related logic
}

function useAuthState() {
  // Login state management logic
}

❌ Incorrect Examples
function use사용자정보() { }        // Korean identifier
function userInfoHook() { }        // No 'use' prefix
function use_user_info() { }       // snake_case
```

## 📝 TypeScript Type Definitions

### Type/Interface Names: PascalCase + English
```typescript
✅ Correct Examples
interface UserInfo {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

type BlogPostStatus = "draft" | "published" | "private";

type SearchCondition = {
  keyword?: string;
  tags?: string[];
  author?: string;
};

❌ Incorrect Examples
interface 사용자정보 { }           // Korean identifier
interface user_info { }           // snake_case
type blogStatus = "draft";         // camelCase
```

### Generic Type Parameters
```typescript
✅ Correct Examples
interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  errorMessage?: string;
}

function transformData<TInput, TOutput>(
  input: TInput,
  transformer: (input: TInput) => TOutput
): TOutput {
  return transformer(input);
}

❌ Incorrect Examples
interface API응답<데이터타입> { }   // Korean identifier
interface ApiResponse<T> { }       // Prefer meaningful names over simple 'T'
```

## 🚀 TanStack Router Usage Rules

This project uses TanStack Router, and the following rules must be followed.

### Link Component Usage Rules

When dynamic routing parameters are present, use static URL + params pattern instead of template literals.

```typescript
✅ Correct Examples
import { Link } from "@tanstack/react-router";

// Navigate to post detail page
<Link
  to="/posts/$slug"
  params={{ slug: post.slug }}
  className="hover:text-blue-600"
>
  {post.title}
</Link>

// Navigate to tag page
<Link
  to="/tags/$tagName"
  params={{ tagName: tag.name }}
  className="tag-link"
>
  {tag.name}
</Link>

// Navigate to user profile page
<Link
  to="/users/$userId"
  params={{ userId: user.id }}
>
  {user.name}
</Link>

❌ Incorrect Examples
// Template literal usage prohibited
<Link to={`/posts/${post.slug}`}>
  {post.title}
</Link>

<Link to={`/tags/${tag.name}`}>
  {tag.name}
</Link>

<Link to={`/users/${user.id}`}>
  {user.name}
</Link>
```

### Routing File Structure

TanStack Router uses file-based routing:

```
src/pages/
├── index.tsx              // / route
├── about.tsx              // /about route
├── posts/
│   ├── index.tsx          // /posts route
│   └── $slug.tsx          // /posts/[slug] dynamic route
├── tags/
│   ├── index.tsx          // /tags route
│   └── $tagName.tsx       // /tags/[tagName] dynamic route
└── admin/
    ├── index.tsx          // /admin route
    └── manage.tsx         // /admin/manage route
```

### Dynamic Routing Parameter Naming

File names and parameter names use camelCase:

```typescript
✅ Correct Examples
// File: src/pages/posts/$slug.tsx
export const Route = createFileRoute("/posts/$slug")({
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams(); // Use slug parameter
}

// File: src/pages/users/$userId.tsx
export const Route = createFileRoute("/users/$userId")({
  component: UserProfile,
});

function UserProfile() {
  const { userId } = Route.useParams(); // Use userId parameter
}

❌ Incorrect Examples
// snake_case or hyphen usage prohibited
// src/pages/posts/$post-slug.tsx  ❌
// src/pages/posts/$post_slug.tsx  ❌
```

### Programmatic Navigation

Follow the same pattern when using useNavigate hook:

```typescript
✅ Correct Examples
import { useNavigate } from "@tanstack/react-router";

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({
      to: "/posts/$slug",
      params: { slug: "my-blog-post" }
    });
  };

  const handleTagClick = (tagName: string) => {
    navigate({
      to: "/tags/$tagName",
      params: { tagName }
    });
  };
}

❌ Incorrect Examples
function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Template literal usage prohibited
    navigate({ to: `/posts/${slug}` }); // ❌
  };
}
```

### Search Parameter Handling

Use the search property for search parameters:

```typescript
✅ Correct Examples
<Link
  to="/posts"
  search={{ page: 1, category: "tech" }}
>
  View Tech Articles
</Link>

// Or in navigation
navigate({
  to: "/posts",
  search: { page: pageNumber, tag: selectedTag }
});

❌ Incorrect Examples
// Direct query parameter inclusion in URL prohibited
<Link to="/posts?page=1&category=tech"> // ❌
```

## 💬 Comments and Documentation

### Function Documentation
```typescript
✅ Correct Examples
/**
 * 사용자의 블로그 글 목록을 가져오는 함수
 * @param userId - 글을 조회할 사용자의 고유 식별자
 * @param pageNumber - 조회할 페이지 (1부터 시작)
 * @param pageSize - 한 페이지에 표시할 글 개수
 * @returns 블로그 글 목록과 페이지네이션 정보
 */
async function getUserBlogPosts(
  userId: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<BlogPostListResponse> {
  // Implementation logic...
}

❌ Incorrect Examples
/**
 * Get user blog posts
 * @param userId - user id
 * @param page - page number
 */
async function getBlogPosts() { }   // English comments
```

### Inline Comments
```typescript
✅ Correct Examples
// 사용자가 로그인한 상태인지 확인
if (currentUser) {
  // 인증된 사용자만 글 작성 가능
  navigateToWritePage();
}

// TODO: 에러 처리 로직 개선 필요
// FIXME: 메모리 누수 가능성 있음

❌ Incorrect Examples
// Check if user is logged in        // English comments
if (currentUser) {
  // Only authenticated users can write
  navigateToWritePage();
}
```

## 🎨 CSS Class Names

### Tailwind CSS + BEM Style
```typescript
✅ Correct Examples
<div className="blog-editor">
  <div className="blog-editor__header">
    <button className="blog-editor__save-button blog-editor__save-button--active">
      저장
    </button>
  </div>
</div>

// When using CSS modules
const styles = {
  blogEditor: "blog-editor",
  headerSection: "header-section",
  saveButton: "save-button"
};

❌ Incorrect Examples
<div className="blogEditor">        // English + camelCase
<div className="blog_editor">       // snake_case
<div className="BlogEditor">        // PascalCase
```

## 🔍 ESLint/Prettier Configuration

### .eslintrc Rules Example
```json
{
  "rules": {
    "camelcase": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase"]
      },
      {
        "selector": "function",
        "format": ["camelCase"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

## ✅ Checklist

Check the following when writing code:

### Naming Rules
- [ ] Are all variable names written in English camelCase?
- [ ] Are all function names written in English camelCase + verb?
- [ ] Are all component names written in English PascalCase?
- [ ] Are all constants written in English SCREAMING_SNAKE_CASE?
- [ ] Are all folder names written in kebab-case?
- [ ] Are all comments written in Korean?
- [ ] Are TypeScript types defined in English PascalCase?
- [ ] Are file names written according to the rules?
- [ ] Are Korean identifiers not used?

### TanStack Router Rules
- [ ] Are dynamic URLs not written as template literals in Link components?
- [ ] Is the static URL + params pattern used for dynamic routing?
- [ ] Are routing parameter names written in camelCase?
- [ ] Are search parameters passed through the search property?

## 🚫 Common Mistakes

1. **Using Korean identifiers** - Use only English for all code identifiers
2. **Case rule confusion** - Apply correct case for each element type
3. **Omitting verbs** - Always include verbs in function names
4. **Overusing abbreviations** - Prefer clear full words
5. **Inconsistent terminology** - Use the same terms for the same concepts
6. **TanStack Router template literals** - Use `to="/posts/$slug" params={{ slug }}` instead of `to={`/posts/${slug}`}` in Link components
7. **Routing parameter naming** - Use camelCase instead of snake_case or kebab-case

Please follow these rules to write consistent and readable code.