// entities에서 타입을 가져와서 사용 (영어 네이밍 규칙 준수)
export type {
  BlogPost,
  PostStatus,
  BlogPostListItem,
  PostCreateRequest,
  PostUpdateRequest,
  PostListOptions,
  PostListResponse,
  PostStats
} from '@/entities/post/model/types';

export type {
  User,
  UserRole,
  LoginRequest,
  SignupRequest,
  UserUpdateRequest,
  AuthState
} from '@/entities/user/model/types';

// 공통 컴포넌트용 타입 (영어 네이밍)
export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export interface BlogPostCardProps {
  post: BlogPost;
  showFullContent?: boolean;
  className?: string;
}

export interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

// 임시 호환성 타입 (점진적 마이그레이션용)
/** @deprecated entities/post의 블로그글 타입을 사용하세요 */
export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  publishedAt: string;
  updatedAt?: string;
  status: 'published' | 'draft' | 'scheduled';
  tags: string[];
  viewCount?: number;
  commentCount?: number;
  readingTime?: string;
}

/** @deprecated 태그배지속성을 사용하세요 */
export interface Tag {
  name: string;
  postCount: number;
  color?: string;
  description?: string;
}

// 폼 관련 타입 (영어 네이밍)
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  agreeToPrivacyPolicy: boolean;
}

// API 응답 타입 (영어 네이밍)
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

// 임시 호환성 타입들 (점진적 마이그레이션용)
/** @deprecated PageHeaderProps를 사용하세요 */
export interface DeprecatedPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/** @deprecated BlogPostCardProps를 사용하세요 */
export interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
  className?: string;
}

/** @deprecated TagBadgeProps를 사용하세요 */
export interface DeprecatedTagBadgeProps {
  tag: string | Tag;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

/** @deprecated ContactFormData를 사용하세요 */
export interface DeprecatedContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  agreeToPrivacyPolicy: boolean;
}

/** @deprecated 블로그글작성입력을 사용하세요 */
export interface BlogPostFormData {
  title: string;
  content: string;
  tags: string;
  status: Post['status'];
  category?: string;
  thumbnail?: File;
}

/** @deprecated ApiResponse를 사용하세요 */
export interface DeprecatedApiResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

/** @deprecated PaginatedResponse를 사용하세요 */
export interface DeprecatedPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}