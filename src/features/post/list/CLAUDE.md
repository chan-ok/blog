# Post List Feature Guide

블로그 글 목록 조회, 필터링, 검색 기능을 담당합니다.

## 🎯 주요 기능

### 구현 예정 기능
- 글 목록 조회 (페이지네이션)
- 태그별 필터링
- 제목/내용 검색
- 정렬 (최신순, 조회순, 제목순)
- 무한 스크롤 지원
- 글 카드 레이아웃

## 📁 컴포넌트 구조

```
src/features/post/list/
├── components/
│   ├── PostList.tsx         # 메인 목록 컴포넌트
│   ├── PostCard.tsx         # 개별 글 카드
│   ├── Pagination.tsx       # 페이지 내비게이션
│   ├── SearchFilter.tsx     # 검색 및 필터
│   └── EmptyState.tsx       # 글이 없을 때 표시
├── hooks/
│   ├── usePostList.ts       # 목록 조회 로직
│   └── useSearchFilter.ts   # 검색/필터 로직
└── utils/
    └── listSorting.ts       # 정렬 유틸리티
```

## 🔧 사용 예시

### 글목록 컴포넌트
```typescript
// components/PostList.tsx
import { usePostList } from '../hooks/usePostList';
import { PostCard } from './PostCard';
import { Pagination } from './Pagination';
import { SearchFilter } from './SearchFilter';

export function PostList() {
  const {
    listData,
    loading,
    searchCondition,
    updateSearchCondition,
    changePage,
  } = usePostList();

  if (loading) return <div>글 목록을 불러오는 중...</div>;

  return (
    <div className="post-list-container">
      <SearchFilter
        currentCondition={searchCondition}
        onChange={updateSearchCondition}
      />

      <div className="post-card-grid">
        {listData?.postList.map((post) => (
          <PostCard key={post.id} postInfo={post} />
        ))}
      </div>

      {listData && (
        <Pagination
          currentPage={listData.currentPage}
          totalPages={listData.totalPages}
          onPageChange={changePage}
        />
      )}
    </div>
  );
}
```

### 글카드 컴포넌트
```typescript
// components/PostCard.tsx
import { Link } from '@tanstack/react-router';
import { PostListItem } from '@/entities/post/model/types';

interface PostCardProps {
  postInfo: PostListItem;
}

export function PostCard({ postInfo }: PostCardProps) {
  return (
    <article className="post-card">
      {postInfo.featuredImageUrl && (
        <img
          src={postInfo.featuredImageUrl}
          alt={postInfo.title}
          className="post-card-image"
          loading="lazy"
        />
      )}

      <div className="post-card-content">
        <h2 className="post-card-title">
          <Link to={`/posts/${postInfo.slug}`}>
            {postInfo.title}
          </Link>
        </h2>

        <p className="post-card-summary">{postInfo.summary}</p>

        <div className="post-card-meta">
          <time dateTime={postInfo.publishedAt.toISOString()}>
            {postInfo.publishedAt.toLocaleDateString()}
          </time>
          <span className="view-count">조회 {postInfo.viewCount}회</span>
        </div>

        <div className="post-card-tags">
          {postInfo.tagList.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${tag}`}
              className="tag-link"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
```

## 📋 개발 우선순위

1. **핵심 기능**
   - [ ] 기본 목록 조회
   - [ ] 글카드 레이아웃
   - [ ] 페이지네이션
   - [ ] 반응형 그리드

2. **부가 기능**
   - [ ] 검색 기능
   - [ ] 태그 필터링
   - [ ] 정렬 옵션
   - [ ] 무한 스크롤

## 🎨 디자인 고려사항

- **그리드 레이아웃**: 데스크톱 3열, 태블릿 2열, 모바일 1열
- **이미지 최적화**: Lazy loading, 적절한 크기 조절
- **로딩 상태**: 스켈레톤 UI 또는 로딩 스피너
- **빈 상태**: 글이 없을 때 안내 메시지

상세한 데이터 조회 방법은 `/entities/블로그글/CLAUDE.md`를 참조하세요.