import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tags/$tagName")({
  component: TagDetail,
});

function TagDetail() {
  const { tagName } = Route.useParams();

  const 태그별글목록 = {
    React: [
      {
        slug: "react-기초",
        제목: "React 기초 알아보기",
        요약: "React의 기본 개념과 컴포넌트 작성 방법을 알아봅니다.",
        작성일: "2024-01-15",
        태그: ["React", "JavaScript"],
      },
      {
        slug: "react-hooks-완전정복",
        제목: "React Hooks 완전 정복",
        요약: "useState, useEffect부터 커스텀 훅까지 모든 것을 다룹니다.",
        작성일: "2024-01-20",
        태그: ["React", "Hooks"],
      },
    ],
    TypeScript: [
      {
        slug: "typescript-시작하기",
        제목: "TypeScript로 시작하는 타입 안전 개발",
        요약: "TypeScript의 기본 문법과 React와 함께 사용하는 방법을 다룹니다.",
        작성일: "2024-01-10",
        태그: ["TypeScript", "React"],
      },
    ],
    JavaScript: [
      {
        slug: "modern-javascript",
        제목: "모던 JavaScript 핵심 정리",
        요약: "ES6+ 문법과 최신 JavaScript 기능들을 정리했습니다.",
        작성일: "2024-01-08",
        태그: ["JavaScript", "ES6"],
      },
    ],
  };

  const 현재태그글목록 = 태그별글목록[tagName as keyof typeof 태그별글목록] || [];

  return (
    <div className="py-8">
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/tags" className="hover:text-blue-600">
            태그
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{tagName}</span>
        </nav>

        <div className="flex items-center space-x-4 mb-4">
          <h1 className="text-4xl font-bold">#{tagName}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {현재태그글목록.length}개 글
          </span>
        </div>

        <p className="text-gray-600">
          "{tagName}" 태그가 포함된 모든 글을 확인하세요.
        </p>
      </div>

      {현재태그글목록.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            아직 글이 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            "{tagName}" 태그에 해당하는 글이 아직 작성되지 않았습니다.
          </p>
          <Link
            to="/posts"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다른 글 둘러보기
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="정렬" className="text-sm font-medium">
                정렬:
              </label>
              <select
                id="정렬"
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="최신순">최신순</option>
                <option value="오래된순">오래된순</option>
                <option value="제목순">제목순</option>
              </select>
            </div>

            <Link
              to="/tags"
              className="text-blue-600 text-sm hover:underline"
            >
              ← 모든 태그 보기
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {현재태그글목록.map((글) => (
              <article
                key={글.slug}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <header className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link
                      to="/posts/$slug"
                      params={{ slug: 글.slug }}
                      className="text-gray-900 hover:text-blue-600"
                    >
                      {글.제목}
                    </Link>
                  </h2>
                  <time className="text-sm text-gray-500">{글.작성일}</time>
                </header>

                <p className="text-gray-600 mb-4 line-clamp-3">{글.요약}</p>

                <footer className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {글.태그.map((태그) => (
                      <Link
                        key={태그}
                        to="/tags/$tagName"
                        params={{ tagName: 태그 }}
                        className={`px-2 py-1 rounded text-xs ${
                          태그 === tagName
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {태그}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/posts/$slug"
                    params={{ slug: 글.slug }}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    더 읽기 →
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">관련 태그</h3>
        <div className="flex flex-wrap gap-2">
          {["React", "TypeScript", "JavaScript", "Vite", "개발환경"]
            .filter((태그) => 태그 !== tagName)
            .map((태그) => (
              <Link
                key={태그}
                to="/tags/$tagName"
                params={{ tagName: 태그 }}
                className="px-3 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50"
              >
                {태그}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}