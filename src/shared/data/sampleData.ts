import type { BlogPost } from '@/entities/post/model/types';
import type { User } from '@/entities/user/model/types';

// 샘플 작성자 정보
export const sampleAuthor: User = {
  id: 'admin-user-id',
  email: 'developer@example.com',
  name: '관리자',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date(),
};

// 블로그 설정 타입 정의
export interface BlogConfig {
  title: string;
  description: string;
  author: User;
  postsPerPage: number;
  siteUrl?: string;
}

// 샘플 블로그 설정
export const sampleBlogConfig: BlogConfig = {
  title: '개발자 블로그',
  description: '웹 개발 경험과 새로운 기술에 대한 학습 내용을 공유합니다.',
  author: sampleAuthor,
  postsPerPage: 10,
  siteUrl: 'https://myblog.example.com',
};

// 샘플 블로그글 데이터
export const sampleBlogPosts: BlogPost[] = [
  {
    id: 'blog-post-1',
    title: 'React 기초 알아보기',
    slug: 'react-basics',
    content: `# React 기초

React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.

## 컴포넌트

React의 핵심은 컴포넌트입니다. 컴포넌트는 재사용 가능한 UI 조각입니다.

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

이것이 가장 간단한 React 컴포넌트의 예입니다.`,
    summary: 'React의 기본 개념과 컴포넌트 작성 방법을 알아봅니다.',
    tags: ['React', 'JavaScript'],
    status: 'published',
    published: true,
    authorId: 'admin-user-id',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    viewCount: 145,
    readingTime: 5,
  },
  {
    id: 'blog-post-2',
    title: 'TypeScript로 시작하는 타입 안전 개발',
    slug: 'typescript-getting-started',
    content: 'TypeScript의 기본 문법과 React와 함께 사용하는 방법을 다룹니다.',
    summary: 'TypeScript의 기본 문법과 React와 함께 사용하는 방법을 다룹니다.',
    tags: ['TypeScript', 'React'],
    status: 'draft',
    published: false,
    authorId: 'admin-user-id',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14'),
    viewCount: 0,
    readingTime: 7,
  },
  {
    id: 'blog-post-3',
    title: 'Vite로 빠른 개발 환경 구축하기',
    slug: 'vite-setup',
    content: 'Vite를 사용해서 React 개발 환경을 빠르게 설정하는 방법을 알아봅니다.',
    summary: 'Vite를 사용해서 React 개발 환경을 빠르게 설정하는 방법을 알아봅니다.',
    tags: ['Vite', '개발환경'],
    status: 'published',
    published: true,
    authorId: 'admin-user-id',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    viewCount: 98,
    readingTime: 4,
  },
  {
    id: 'blog-post-4',
    title: '모던 CSS 기법들',
    slug: 'modern-css-techniques',
    content: 'CSS Grid, Flexbox, 그리고 최신 CSS 기능들을 활용한 레이아웃 기법을 살펴봅니다.',
    summary: 'CSS Grid, Flexbox, 그리고 최신 CSS 기능들을 활용한 레이아웃 기법을 살펴봅니다.',
    tags: ['CSS', '웹디자인'],
    status: 'archived',
    published: false,
    authorId: 'admin-user-id',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    viewCount: 0,
    readingTime: 6,
  },
];

// 태그 타입 정의
export interface Tag {
  name: string;
  postCount: number;
  color?: string;
  description?: string;
}

// 샘플 태그 데이터
export const sampleTags: Tag[] = [
  { name: 'React', postCount: 15, color: 'blue', description: 'React 관련 글들' },
  { name: 'TypeScript', postCount: 12, color: 'green', description: 'TypeScript 기술 및 팁' },
  { name: 'JavaScript', postCount: 8, color: 'yellow', description: 'JavaScript 기초부터 고급까지' },
  { name: 'Vite', postCount: 5, color: 'purple', description: 'Vite 빌드 도구 관련' },
  { name: '개발환경', postCount: 7, color: 'gray', description: '개발 환경 설정 및 도구' },
  { name: '웹개발', postCount: 20, color: 'red', description: '웹 개발 전반' },
  { name: '프론트엔드', postCount: 18, color: 'indigo', description: '프론트엔드 개발' },
  { name: '성능최적화', postCount: 6, color: 'pink', description: '웹 성능 최적화 기법' },
  { name: 'CSS', postCount: 9, color: 'orange', description: 'CSS 스타일링 기법' },
  { name: '웹디자인', postCount: 4, color: 'teal', description: 'UI/UX 디자인' },
];

// 특정 태그별 글 필터링 함수
export const getPostsByTag = (tagName: string): BlogPost[] => {
  return sampleBlogPosts.filter(post =>
    post.tags.some(tag => tag.toLowerCase() === tagName.toLowerCase())
  );
};

// 모든 발행글 가져오기
export const getAllPosts = (): BlogPost[] => {
  return sampleBlogPosts.filter(post => post.status === 'published');
};

// 최신 발행글 가져오기
export const getLatestPosts = (count: number = 3): BlogPost[] => {
  return sampleBlogPosts
    .filter(post => post.status === 'published')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, count);
};

// 인기 태그 가져오기
export const getPopularTags = (count: number = 4): Tag[] => {
  return sampleTags
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, count);
};

export const getTags = (): string[] => {
  return sampleTags.map(tag => tag.name);
};

export const getPostBySlug = (slug: string): BlogPost | null => {
  return sampleBlogPosts.find(post => post.slug === slug) || null;
};

// 관리자용 통계 데이터
export const getAdminStats = () => {
  const totalPosts = sampleBlogPosts.length;
  const publishedPosts = sampleBlogPosts.filter(post => post.status === 'published').length;
  const draftPosts = sampleBlogPosts.filter(post => post.status === 'draft').length;
  const archivedPosts = sampleBlogPosts.filter(post => post.status === 'archived').length;
  const totalViews = sampleBlogPosts.reduce((sum, post) => sum + post.viewCount, 0);

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalViews,
    monthlyViews: Math.floor(totalViews * 0.3), // 임시로 전체의 30%로 계산
  };
};

// 호환성을 위한 deprecated 함수들
/** @deprecated getPostsByTag를 사용하세요 */
export const 태그별글가져오기 = getPostsByTag;

/** @deprecated getLatestPosts를 사용하세요 */
export const 최신글가져오기 = getLatestPosts;

/** @deprecated getPopularTags를 사용하세요 */
export const 인기태그가져오기 = getPopularTags;

/** @deprecated getAdminStats를 사용하세요 */
export const 관리자통계가져오기 = getAdminStats;