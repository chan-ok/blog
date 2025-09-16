# 코드 포맷 규칙

이 문서는 프로젝트의 일관된 코드 스타일과 네이밍 컨벤션을 정의합니다.

## 🎯 핵심 원칙

1. **영어 식별자**: 모든 변수명, 함수명, 클래스명, 타입명은 영어로 작성
2. **한국어 텍스트**: 주석, UI 텍스트, 에러 메시지, 문서는 한국어로 작성
3. **일관성**: 팀 전체가 동일한 규칙 적용
4. **가독성**: 명확하고 이해하기 쉬운 코드
5. **타입 안전성**: TypeScript를 활용한 엄격한 타입 정의

## 📁 파일 및 폴더 네이밍

### 폴더명: kebab-case (케밥 케이스)
```
✅ 올바른 예시
src/
├── blog-editor/
├── user-auth/
├── shared-components/
└── api-client/

❌ 잘못된 예시
src/
├── BlogEditor/      (파스칼케이스 금지)
├── user_auth/       (스네이크케이스 금지)
├── sharedComponents/ (카멜케이스 금지)
└── APICLIENT/       (대문자 금지)
```

### 파일명 규칙

#### React 컴포넌트: PascalCase (파스칼 케이스)
```typescript
✅ 올바른 예시
Header.tsx
BlogEditor.tsx
UserProfile.tsx
NavBar.tsx

❌ 잘못된 예시
header.tsx
blogEditor.tsx
user-profile.tsx
nav_bar.tsx
```

#### 일반 파일: camelCase (카멜 케이스)
```typescript
✅ 올바른 예시
userAPI.ts
blogUtils.ts
authService.ts
dateFormatter.ts

❌ 잘못된 예시
UserAPI.ts
blog-utils.ts
auth_service.ts
DATE_FORMATTER.ts
```

#### 설정 파일: kebab-case (케밥 케이스)
```
✅ 올바른 예시
vite.config.ts
tailwind.config.js
eslint.config.ts
prettier.config.js
```

## 🔤 변수 및 함수 네이밍

### 변수명: camelCase + 영어
```typescript
✅ 올바른 예시
const userName = "김개발";
const blogPostList = [];
const maxFileSize = 1024;
let currentPageNumber = 1;
const isLoggedIn = true;

❌ 잘못된 예시
const user_name = "김개발";        // 스네이크케이스
const BlogList = [];              // 파스칼케이스
const 사용자이름 = "김개발";       // 한글 식별자
const UserName = "김개발";         // 파스칼케이스
```

### 함수명: camelCase + 영어 동사
```typescript
✅ 올바른 예시
function getUserInfo() { }
function createBlogPost(content: string) { }
function navigateToPage(path: string) { }
const validateData = (input: unknown) => { };

❌ 잘못된 예시
function GetUserInfo() { }         // 파스칼케이스
function blog_create() { }         // 스네이크케이스
function userInfo() { }            // 동사 없음
const 사용자정보가져오기 = () => { }; // 한글 식별자
```

### 상수명: SCREAMING_SNAKE_CASE + 영어
```typescript
✅ 올바른 예시
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_PAGE_SIZE = 20;
const ERROR_MESSAGES = {
  LOGIN_FAILED: "로그인에 실패했습니다",
  FILE_SIZE_EXCEEDED: "파일 크기가 너무 큽니다"
} as const;

❌ 잘못된 예시
const maxUploadSize = 10 * 1024 * 1024;  // 카멜케이스
const api_base_url = "https://...";       // 소문자 스네이크케이스
const 최대_업로드_크기 = 1024;            // 한글 식별자
```

## ⚛️ React 컴포넌트 규칙

### 컴포넌트명: PascalCase + 영어
```typescript
✅ 올바른 예시
export function Header() {
  return <header>...</header>;
}

export function BlogEditor() {
  return <div>...</div>;
}

export const UserProfile = () => {
  return <div>...</div>;
};

❌ 잘못된 예시
export function header() { }       // 소문자 시작
export function blogEditor() { }   // 카멜케이스
export function 헤더() { }         // 한글 식별자
export function Blog_Editor() { }  // 스네이크케이스
```

### Props 인터페이스
```typescript
✅ 올바른 예시
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

❌ 잘못된 예시
interface 헤더Props { }            // 한글 식별자
interface Header_Props { }         // 스네이크케이스
interface headerProps { }          // 소문자 시작
```

### Hook 네이밍
```typescript
✅ 올바른 예시
function useUserInfo() {
  // 사용자 정보 관련 로직
}

function useBlogPostList(pageNumber: number) {
  // 블로그 글 목록 관련 로직
}

function useAuthState() {
  // 로그인 상태 관리 로직
}

❌ 잘못된 예시
function use사용자정보() { }        // 한글 식별자
function userInfoHook() { }        // use 접두사 없음
function use_user_info() { }       // 스네이크케이스
```

## 📝 TypeScript 타입 정의

### 타입/인터페이스명: PascalCase + 영어
```typescript
✅ 올바른 예시
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

❌ 잘못된 예시
interface 사용자정보 { }           // 한글 식별자
interface user_info { }           // 스네이크케이스
type blogStatus = "draft";         // 카멜케이스
```

### 제네릭 타입 매개변수
```typescript
✅ 올바른 예시
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

❌ 잘못된 예시
interface API응답<데이터타입> { }   // 한글 식별자
interface ApiResponse<T> { }       // 단순한 T 대신 의미있는 이름 사용 권장
```

## 🚀 TanStack Router 사용 규칙

이 프로젝트는 TanStack Router를 사용하며, 다음 규칙을 따라야 합니다.

### Link 컴포넌트 사용 규칙

동적 라우팅 파라미터가 있는 경우, 템플릿 리터럴 대신 정적 URL + params 패턴을 사용해야 합니다.

```typescript
✅ 올바른 예시
import { Link } from "@tanstack/react-router";

// 게시글 상세 페이지로 이동
<Link
  to="/posts/$slug"
  params={{ slug: post.slug }}
  className="hover:text-blue-600"
>
  {post.title}
</Link>

// 태그 페이지로 이동
<Link
  to="/tags/$tagName"
  params={{ tagName: tag.name }}
  className="tag-link"
>
  {tag.name}
</Link>

// 사용자 프로필 페이지로 이동
<Link
  to="/users/$userId"
  params={{ userId: user.id }}
>
  {user.name}
</Link>

❌ 잘못된 예시
// 템플릿 리터럴 사용 금지
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

### 라우팅 파일 구조

TanStack Router는 파일 기반 라우팅을 사용합니다:

```
src/pages/
├── index.tsx              // / 경로
├── about.tsx              // /about 경로
├── posts/
│   ├── index.tsx          // /posts 경로
│   └── $slug.tsx          // /posts/[slug] 동적 경로
├── tags/
│   ├── index.tsx          // /tags 경로
│   └── $tagName.tsx       // /tags/[tagName] 동적 경로
└── admin/
    ├── index.tsx          // /admin 경로
    └── manage.tsx         // /admin/manage 경로
```

### 동적 라우팅 파라미터 네이밍

파일명과 파라미터명은 camelCase를 사용합니다:

```typescript
✅ 올바른 예시
// 파일: src/pages/posts/$slug.tsx
export const Route = createFileRoute("/posts/$slug")({
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams(); // slug 파라미터 사용
}

// 파일: src/pages/users/$userId.tsx
export const Route = createFileRoute("/users/$userId")({
  component: UserProfile,
});

function UserProfile() {
  const { userId } = Route.useParams(); // userId 파라미터 사용
}

❌ 잘못된 예시
// 스네이크케이스나 하이픈 사용 금지
// src/pages/posts/$post-slug.tsx  ❌
// src/pages/posts/$post_slug.tsx  ❌
```

### 프로그래매틱 네비게이션

useNavigate 훅을 사용할 때도 동일한 패턴을 따릅니다:

```typescript
✅ 올바른 예시
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

❌ 잘못된 예시
function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // 템플릿 리터럴 사용 금지
    navigate({ to: `/posts/${slug}` }); // ❌
  };
}
```

### 검색 파라미터 처리

검색 파라미터는 search 속성을 사용합니다:

```typescript
✅ 올바른 예시
<Link
  to="/posts"
  search={{ page: 1, category: "tech" }}
>
  기술 글 보기
</Link>

// 또는 네비게이션에서
navigate({
  to: "/posts",
  search: { page: pageNumber, tag: selectedTag }
});

❌ 잘못된 예시
// URL에 직접 쿼리 파라미터 포함 금지
<Link to="/posts?page=1&category=tech"> // ❌
```

## 💬 주석 및 문서화

### 함수 문서화
```typescript
✅ 올바른 예시
/**
 * 사용자의 블로그 글 목록을 가져오는 함수
 * @param 사용자아이디 - 글을 조회할 사용자의 고유 식별자
 * @param 페이지번호 - 조회할 페이지 (1부터 시작)
 * @param 페이지크기 - 한 페이지에 표시할 글 개수
 * @returns 블로그 글 목록과 페이지네이션 정보
 */
async function 블로그글목록가져오기(
  사용자아이디: string,
  페이지번호: number = 1,
  페이지크기: number = 10
): Promise<블로그글목록응답> {
  // 구현 로직...
}

❌ 잘못된 예시
/**
 * Get user blog posts
 * @param userId - user id
 * @param page - page number
 */
async function getBlogPosts() { }   // 영어 주석
```

### 인라인 주석
```typescript
✅ 올바른 예시
// 사용자가 로그인한 상태인지 확인
if (현재사용자) {
  // 인증된 사용자만 글 작성 가능
  글작성페이지로이동();
}

// TODO: 에러 처리 로직 개선 필요
// FIXME: 메모리 누수 가능성 있음

❌ 잘못된 예시
// Check if user is logged in        // 영어 주석
if (currentUser) {
  // Only authenticated users can write
  navigateToWritePage();
}
```

## 🎨 CSS 클래스명

### Tailwind CSS + BEM 스타일
```typescript
✅ 올바른 예시
<div className="블로그-에디터">
  <div className="블로그-에디터__헤더">
    <button className="블로그-에디터__저장버튼 블로그-에디터__저장버튼--활성화">
      저장
    </button>
  </div>
</div>

// CSS 모듈 사용시
const 스타일 = {
  블로그에디터: "blog-editor",
  헤더영역: "header-section",
  저장버튼: "save-button"
};

❌ 잘못된 예시
<div className="blogEditor">        // 영어 + 카멜케이스
<div className="blog_editor">       // 스네이크케이스
<div className="BlogEditor">        // 파스칼케이스
```

## 🔍 ESLint/Prettier 설정

### .eslintrc 규칙 예시
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

## ✅ 체크리스트

코드 작성 시 다음 사항을 확인하세요:

### 네이밍 규칙
- [ ] 모든 변수명이 영어 camelCase로 작성되었는가?
- [ ] 모든 함수명이 영어 camelCase + 동사로 작성되었는가?
- [ ] 모든 컴포넌트명이 영어 PascalCase로 작성되었는가?
- [ ] 모든 상수가 영어 SCREAMING_SNAKE_CASE로 작성되었는가?
- [ ] 모든 폴더명이 kebab-case로 작성되었는가?
- [ ] 모든 주석이 한국어로 작성되었는가?
- [ ] TypeScript 타입이 영어 PascalCase로 정의되었는가?
- [ ] 파일명이 규칙에 맞게 작성되었는가?
- [ ] 한글 식별자를 사용하지 않았는가?

### TanStack Router 규칙
- [ ] Link 컴포넌트에서 동적 URL을 템플릿 리터럴로 작성하지 않았는가?
- [ ] 동적 라우팅 시 정적 URL + params 패턴을 사용했는가?
- [ ] 라우팅 파라미터명이 camelCase로 작성되었는가?
- [ ] 검색 파라미터를 search 속성으로 전달했는가?

## 🚫 흔한 실수들

1. **한글 식별자 사용** - 모든 코드 식별자는 영어만 사용
2. **케이스 규칙 혼동** - 각 요소별 정확한 케이스 적용
3. **동사 생략** - 함수명에는 반드시 동사 포함
4. **약어 남용** - 명확한 전체 단어 사용 권장
5. **일관성 없는 용어** - 동일한 개념은 동일한 용어 사용
6. **TanStack Router 템플릿 리터럴** - Link 컴포넌트에서 `to={`/posts/${slug}`}` 대신 `to="/posts/$slug" params={{ slug }}` 사용
7. **라우팅 파라미터 네이밍** - snake_case나 kebab-case 대신 camelCase 사용

이 규칙들을 따라 일관성 있고 읽기 쉬운 코드를 작성해주세요.