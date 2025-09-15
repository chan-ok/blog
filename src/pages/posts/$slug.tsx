import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$slug")({
  component: PostDetail,
});

function PostDetail() {
  const { slug } = Route.useParams();

  return (
    <div className="py-8">
      <article className="prose prose-lg mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">글 제목 (slug: {slug})</h1>
          <div className="flex items-center space-x-4 text-gray-600 mb-4">
            <time>2024년 1월 1일</time>
            <span>•</span>
            <span>작성자: 관리자</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              React
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              TypeScript
            </span>
          </div>
        </header>

        <div className="prose max-w-none">
          <p>
            이것은 슬러그 "{slug}"에 해당하는 블로그 포스트의 상세 페이지입니다.
          </p>

          <h2>글 내용</h2>
          <p>
            실제 구현에서는 여기에 마크다운으로 작성된 글 내용이 렌더링됩니다.
            현재는 샘플 콘텐츠를 보여주고 있습니다.
          </p>

          <h3>코드 예제</h3>
          <pre className="bg-gray-100 p-4 rounded">
            <code>
{`function 안녕하세요() {
  return "반가워요!";
}`}
            </code>
          </pre>

          <h3>목록 예제</h3>
          <ul>
            <li>첫 번째 항목</li>
            <li>두 번째 항목</li>
            <li>세 번째 항목</li>
          </ul>
        </div>

        <footer className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold mb-2">관련 글</h4>
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
            <div className="text-sm text-gray-600">
              <p>마지막 수정: 2024년 1월 2일</p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}