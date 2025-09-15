import { Link } from "@tanstack/react-router";
import type { PostCardProps, BlogPostCardProps } from "../types";
import TagBadge from "./TagBadge";

/**
 * 글을 카드 형태로 표시하는 재사용 가능한 컴포넌트
 * 홈페이지, 글 목록, 태그별 목록 등에서 사용됩니다.
 */
export default function PostCard({ post, showFullContent = false, className = "" }: PostCardProps | BlogPostCardProps) {
  // 한국어 타입과 영어 타입 모두 지원하기 위한 헬퍼 함수
  const getPostTitle = (post: any) => post.title || post.제목;
  const getPostSlug = (post: any) => post.slug || post.슬러그;
  const getPostSummary = (post: any) => post.summary || post.요약;
  const getPostPublishedAt = (post: any) => post.publishedAt || (post.생성일자 ? post.생성일자.toISOString().split('T')[0] : '');
  const getPostUpdatedAt = (post: any) => post.updatedAt || (post.수정일자 ? post.수정일자.toISOString().split('T')[0] : '');
  const getPostTags = (post: any) => post.tags || post.태그목록 || [];
  const getPostContent = (post: any) => post.content || post.내용;
  const getPostViewCount = (post: any) => post.viewCount || post.조회수;
  const getPostReadingTime = (post: any) => post.readingTime || (post.읽기시간 ? `${post.읽기시간}분` : '');
  const containerClass = showFullContent
    ? `prose prose-lg mx-auto ${className}`
    : `border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow ${className}`;

  if (showFullContent) {
    return (
      <article className={containerClass}>
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{getPostTitle(post)}</h1>
          <div className="mb-4 flex items-center space-x-4 text-gray-600">
            <time>{getPostPublishedAt(post)}</time>
            <span>•</span>
            <span>작성자: 관리자</span>
            {getPostReadingTime(post) && (
              <>
                <span>•</span>
                <span>{getPostReadingTime(post)} 읽기</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {getPostTags(post).map((tag: string) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </header>

        <div className="prose max-w-none">
          {getPostContent(post) ? <div dangerouslySetInnerHTML={{ __html: getPostContent(post) }} /> : <p>{getPostSummary(post)}</p>}
        </div>

        <footer className="mt-12 border-t pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="mb-2 font-semibold">관련 글</h4>
              <ul className="space-y-1 text-sm text-blue-600">
                <li>
                  <a href="#" className="hover:underline">
                    이전 글: React 기초
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    다음 글: TypeScript 심화
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-sm text-gray-600">{getPostUpdatedAt(post) && <p>마지막 수정: {getPostUpdatedAt(post)}</p>}</div>
          </div>
        </footer>
      </article>
    );
  }

  return (
    <article className={containerClass}>
      <header className="mb-4">
        <h3 className="mb-2 text-xl font-semibold">
          <Link to="/posts/$slug" params={{ slug: getPostSlug(post) }} className="text-gray-900 transition-colors hover:text-blue-600">
            {getPostTitle(post)}
          </Link>
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <time>{getPostPublishedAt(post)}</time>
          {getPostReadingTime(post) && (
            <>
              <span>•</span>
              <span>{getPostReadingTime(post)} 읽기</span>
            </>
          )}
          {getPostViewCount(post) !== undefined && (
            <>
              <span>•</span>
              <span>{getPostViewCount(post)}회 조회</span>
            </>
          )}
        </div>
      </header>

      <p className="mb-4 line-clamp-3 text-gray-600">{getPostSummary(post)}</p>

      <footer className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {getPostTags(post).slice(0, 3).map((tag: string) => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {getPostTags(post).length > 3 && <span className="text-xs text-gray-500">+{getPostTags(post).length - 3}개</span>}
        </div>
        <Link
          to="/posts/$slug"
          params={{ slug: getPostSlug(post) }}
          className="text-sm text-blue-600 transition-colors hover:underline"
        >
          더 읽기 →
        </Link>
      </footer>
    </article>
  );
}
