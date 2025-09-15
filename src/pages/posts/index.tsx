import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PostCard, EmptyState } from "@/shared/components";
import { getAllPosts } from "@/shared/data/sampleData";

export const Route = createFileRoute("/posts/")({
  component: Posts,
});

function Posts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "title">("latest");

  const allPosts = getAllPosts();

  // 검색 및 정렬 적용
  const filteredPosts = allPosts
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "latest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="py-8">
      <PageHeader
        title="모든 글"
        description="개발 경험과 학습 내용을 공유하는 글들을 모아놓았습니다."
      />

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="sortOrder" className="text-sm font-medium">
            정렬:
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "latest" | "oldest" | "title")}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="글 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={searchQuery ? "검색 결과가 없습니다" : "작성된 글이 없습니다"}
          description={searchQuery ? `"${searchQuery}"에 해당하는 글을 찾을 수 없습니다.` : "아직 작성된 글이 없습니다. 첫 번째 글을 작성해보세요."}
          actionText={searchQuery ? undefined : "글 작성하기"}
          actionHref={searchQuery ? undefined : "/admin/write"}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* 총 글 개수 표시 */}
      {filteredPosts.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          총 {filteredPosts.length}개의 글
          {searchQuery && (
            <span className="ml-2">
              ("{searchQuery}" 검색 결과)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
