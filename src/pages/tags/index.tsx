import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tags/")({
  component: Tags,
});

function Tags() {
  const 태그목록 = [
    { 이름: "React", 글수: 15, 색상: "blue" },
    { 이름: "TypeScript", 글수: 12, 색상: "green" },
    { 이름: "JavaScript", 글수: 8, 색상: "yellow" },
    { 이름: "Vite", 글수: 5, 색상: "purple" },
    { 이름: "개발환경", 글수: 7, 색상: "gray" },
    { 이름: "웹개발", 글수: 20, 색상: "red" },
    { 이름: "프론트엔드", 글수: 18, 색상: "indigo" },
    { 이름: "성능최적화", 글수: 6, 색상: "pink" },
  ];

  const 색상클래스 = {
    blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    green: "bg-green-100 text-green-800 hover:bg-green-200",
    yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    gray: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    red: "bg-red-100 text-red-800 hover:bg-red-200",
    indigo: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">모든 태그</h1>
        <p className="text-gray-600">
          관심 있는 주제별로 글을 찾아보세요.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-sm font-medium">정렬:</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              글 수 순
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
              이름 순
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {태그목록
          .sort((a, b) => b.글수 - a.글수)
          .map((태그) => (
            <Link
              key={태그.이름}
              to="/tags/$tagName"
              params={{ tagName: 태그.이름 }}
              className={`block p-4 rounded-lg border transition-all ${
                색상클래스[태그.색상 as keyof typeof 색상클래스]
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{태그.이름}</h3>
                <span className="text-sm opacity-75">{태그.글수}개</span>
              </div>
              <p className="text-sm mt-2 opacity-75">
                {태그.이름} 관련 글 {태그.글수}개를 확인하세요
              </p>
            </Link>
          ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">인기 태그 TOP 3</h2>
        <div className="space-y-3">
          {태그목록
            .sort((a, b) => b.글수 - a.글수)
            .slice(0, 3)
            .map((태그, 인덱스) => (
              <div key={태그.이름} className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full font-bold text-sm">
                  {인덱스 + 1}
                </span>
                <Link
                  to="/tags/$tagName"
                  params={{ tagName: 태그.이름 }}
                  className="flex-1 hover:text-blue-600"
                >
                  <span className="font-medium">{태그.이름}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({태그.글수}개 글)
                  </span>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}