import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/manage")({
  component: PostManagement,
});

function PostManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [sortOrder, setSortOrder] = useState("최신순");

  const postList = [
    {
      id: 1,
      title: "React 기초 알아보기",
      status: "발행됨",
      viewCount: 145,
      commentCount: 5,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      tags: ["React", "JavaScript"],
    },
    {
      id: 2,
      title: "TypeScript로 시작하는 타입 안전 개발",
      status: "임시저장",
      viewCount: 0,
      commentCount: 0,
      createdAt: "2024-01-14",
      updatedAt: "2024-01-14",
      tags: ["TypeScript", "React"],
    },
    {
      id: 3,
      title: "Vite로 빠른 개발 환경 구축하기",
      status: "발행됨",
      viewCount: 98,
      commentCount: 3,
      createdAt: "2024-01-13",
      updatedAt: "2024-01-13",
      tags: ["Vite", "개발환경"],
    },
    {
      id: 4,
      title: "모던 CSS 기법들",
      status: "예약발행",
      viewCount: 0,
      commentCount: 0,
      createdAt: "2024-01-12",
      updatedAt: "2024-01-12",
      tags: ["CSS", "웹디자인"],
    },
  ];

  const filteredPostList = postList
    .filter(post =>
      (statusFilter === "전체" || post.status === statusFilter) &&
      (searchTerm === "" || post.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "최신순") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === "오래된순") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === "조회수순") return b.viewCount - a.viewCount;
      return 0;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "발행됨":
        return <span className="w-2 h-2 bg-green-500 rounded-full"></span>;
      case "임시저장":
        return <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>;
      case "예약발행":
        return <span className="w-2 h-2 bg-blue-500 rounded-full"></span>;
      default:
        return <span className="w-2 h-2 bg-gray-500 rounded-full"></span>;
    }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">글 관리</h1>
          <Link
            to="/admin/write"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            새 글 작성
          </Link>
        </div>
        <p className="text-gray-600">작성한 모든 글을 관리하고 편집하세요.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="글 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="statusFilter" className="sr-only">상태 필터</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="전체">모든 상태</option>
                  <option value="발행됨">발행됨</option>
                  <option value="임시저장">임시저장</option>
                  <option value="예약발행">예약발행</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortOrder" className="sr-only">정렬</label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="최신순">최신순</option>
                  <option value="오래된순">오래된순</option>
                  <option value="조회수순">조회수순</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPostList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                조건에 맞는 글이 없습니다
              </h3>
              <p className="text-gray-500">
                다른 검색어나 필터를 사용해보세요.
              </p>
            </div>
          ) : (
            filteredPostList.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(post.status)}
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.status === "발행됨"
                          ? "bg-green-100 text-green-800"
                          : post.status === "임시저장"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>작성: {post.createdAt}</span>
                      <span>•</span>
                      <span>수정: {post.updatedAt}</span>
                      <span>•</span>
                      <span>조회수: {post.viewCount}</span>
                      <span>•</span>
                      <span>댓글: {post.commentCount}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {post.status === "발행됨" && (
                      <Link
                        to="/posts/$slug"
                        params={{ slug: post.title }}
                        className="px-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        보기
                      </Link>
                    )}
                    <button className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                      편집
                    </button>
                    <button className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                      복제
                    </button>
                    <button className="px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium">
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredPostList.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 {filteredPostList.length}개의 글이 있습니다
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  이전
                </button>
                <button className="px-3 py-2 bg-blue-500 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">글 통계</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">총 글 수</span>
              <span className="font-semibold">{postList.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">발행된 글</span>
              <span className="font-semibold text-green-600">
                {postList.filter(post => post.status === "발행됨").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">임시저장</span>
              <span className="font-semibold text-yellow-600">
                {postList.filter(post => post.status === "임시저장").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">예약발행</span>
              <span className="font-semibold text-blue-600">
                {postList.filter(post => post.status === "예약발행").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">React 기초 알아보기 발행</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">TypeScript 글 임시저장</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">CSS 글 예약발행 설정</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              모든 임시저장 글 삭제
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              글 내보내기 (JSON)
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              태그 일괄 수정
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded text-sm">
              백업 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}