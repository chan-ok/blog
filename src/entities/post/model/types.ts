/**
 * 블로그 글 엔티티 타입 정의
 * 마크다운 기반 블로그 글 관리
 */

/**
 * 글 발행 상태
 */
export type PostStatus = 'draft' | 'published' | 'archived';

/**
 * 정렬 옵션
 */
export type SortOption = 'latest' | 'oldest' | 'views' | 'title';

/**
 * 기본 블로그 글 인터페이스
 */
/**
 * 글 목록용 축약 정보
 */
export interface BlogPostListItem {
  /** 고유 식별자 */
  id: string;
  /** 글 제목 */
  title: string;
  /** URL 슬러그 (SEO 친화적) */
  slug: string;
  /** 글 요약 (메타 설명용) */
  summary: string;
  /** 태그 목록 */
  tags: string[];
  /** 발행 상태 */
  status: PostStatus;
  /** 공개 여부 */
  published: boolean;
  /** 생성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
  /** 조회수 */
  viewCount: number;
  /** 예상 읽기 시간 (분) */
  readingTime: number;
  /** 대표 이미지 URL (선택사항) */
  featuredImageUrl?: string;
}

/**
 * 전체 블로그 글 인터페이스
 */
export interface BlogPost {
  /** 고유 식별자 */
  id: string;
  /** 글 제목 */
  title: string;
  /** URL 슬러그 (SEO 친화적) */
  slug: string;
  /** 마크다운 형식 본문 */
  content: string;
  /** 글 요약 (메타 설명용) */
  summary: string;
  /** 태그 목록 */
  tags: string[];
  /** 발행 상태 */
  status: PostStatus;
  /** 공개 여부 */
  published: boolean;
  /** 작성자 ID */
  authorId: string;
  /** 생성 일시 */
  createdAt: Date;
  /** 수정 일시 */
  updatedAt: Date;
  /** 조회수 */
  viewCount: number;
  /** 예상 읽기 시간 (분) */
  readingTime: number;
  /** 대표 이미지 URL (선택사항) */
  featuredImageUrl?: string;
  /** 메타 키워드 (SEO용) */
  metaKeywords?: string[];
}

/**
 * 글 작성 요청 데이터
 */
export interface PostCreateRequest {
  /** 글 제목 */
  title: string;
  /** 마크다운 내용 */
  content: string;
  /** 글 요약 */
  summary: string;
  /** 태그 목록 */
  tags: string[];
  /** 대표 이미지 URL (선택사항) */
  featuredImageUrl?: string;
  /** 메타 키워드 (선택사항) */
  metaKeywords?: string[];
  /** 즉시 발행 여부 (기본값: false) */
  publishImmediately?: boolean;
}

/**
 * 글 수정 요청 데이터
 */
export interface PostUpdateRequest {
  /** 수정할 제목 (선택사항) */
  title?: string;
  /** 수정할 내용 (선택사항) */
  content?: string;
  /** 수정할 요약 (선택사항) */
  summary?: string;
  /** 수정할 태그 목록 (선택사항) */
  tags?: string[];
  /** 수정할 상태 (선택사항) */
  status?: PostStatus;
  /** 발행 상태 변경 (선택사항) */
  published?: boolean;
  /** 대표 이미지 URL 변경 (선택사항) */
  featuredImageUrl?: string;
  /** 메타 키워드 변경 (선택사항) */
  metaKeywords?: string[];
}

/**
 * 글 목록 조회 옵션
 */
export interface PostListOptions {
  /** 페이지 번호 (1부터 시작) */
  page?: number;
  /** 페이지 크기 (기본값: 10) */
  size?: number;
  /** 정렬 방식 */
  sort?: SortOption;
  /** 태그 필터 */
  tag?: string;
  /** 검색어 (제목, 내용, 요약에서 검색) */
  searchTerm?: string;
  /** 발행된 글만 조회 */
  publishedOnly?: boolean;
  /** 특정 작성자 글만 조회 */
  authorId?: string;
  /** 특정 상태의 글만 조회 */
  status?: PostStatus;
}

/**
 * 글 목록 응답
 */
export interface PostListResponse {
  /** 글 목록 */
  posts: BlogPost[];
  /** 전체 글 수 */
  total: number;
  /** 현재 페이지 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 이전 페이지 존재 여부 */
  hasPrev: boolean;
}

/**
 * 글 상세 조회 응답 (조회수 증가 포함)
 */
export interface PostDetailResponse {
  /** 글 정보 */
  post: BlogPost;
  /** 이전 글 정보 (선택사항) */
  prevPost?: {
    id: string;
    title: string;
    slug: string;
  };
  /** 다음 글 정보 (선택사항) */
  nextPost?: {
    id: string;
    title: string;
    slug: string;
  };
  /** 관련 글 목록 (태그 기반) */
  relatedPosts?: BlogPost[];
}

/**
 * 마크다운 에디터 상태
 */
export interface EditorState {
  /** 현재 편집 중인 글 */
  currentPost: BlogPost | null;
  /** 마크다운 내용 */
  markdownContent: string;
  /** 미리보기 HTML */
  previewHtml: string;
  /** 자동 저장 중 여부 */
  isAutoSaving: boolean;
  /** 마지막 자동 저장 시간 */
  lastSavedAt?: Date;
  /** 변경사항 있음 여부 */
  hasChanges: boolean;
}

/**
 * 이미지 업로드 요청
 */
export interface ImageUploadRequest {
  /** 업로드할 파일 */
  file: File;
  /** 이미지 설명 (alt 텍스트) */
  description?: string;
  /** 글 ID (연관성 표시용) */
  postId?: string;
}

/**
 * 이미지 업로드 응답
 */
export interface ImageUploadResponse {
  /** 업로드된 이미지 URL */
  imageUrl: string;
  /** 썸네일 URL (선택사항) */
  thumbnailUrl?: string;
  /** 파일 크기 (바이트) */
  fileSize: number;
  /** 이미지 크기 정보 */
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * 글 통계 정보
 */
export interface PostStats {
  /** 전체 글 수 */
  totalPosts: number;
  /** 발행된 글 수 */
  publishedPosts: number;
  /** 임시저장 글 수 */
  draftPosts: number;
  /** 총 조회수 */
  totalViews: number;
  /** 인기 태그 목록 */
  popularTags: Array<{
    tagName: string;
    usageCount: number;
  }>;
  /** 월별 작성 통계 */
  monthlyStats: Array<{
    month: string; // YYYY-MM 형식
    postCount: number;
  }>;
}