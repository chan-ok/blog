export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">My Blog</h1>
          <nav className="space-x-4">
            <a href="#" className="text-gray-700 hover:text-black">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-black">
              About
            </a>
            <a href="#" className="text-gray-700 hover:text-black">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/** Article List */}
        <ArticleCard
          title="첫 번째 글 제목"
          summary="블로그 글 요약이 들어갑니다. 간단한 소개글 혹은 미리보기 텍스트입니다."
        />
        <ArticleCard
          title="두 번째 글 제목"
          summary="또 다른 블로그 글 미리보기 내용이 들어갑니다."
        />
        <ArticleCard
          title="세 번째 글 제목"
          summary="간단한 글 요약 부분을 추가합니다. 클릭 시 상세 페이지로 이동하게 됩니다."
        />
      </main>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-gray-600">
        © 2025 My Blog. All rights reserved.
      </footer>
    </div>
  );
}

interface ArticleCardProps {
  title: string;
  summary: string;
}

function ArticleCard({ title, summary }: ArticleCardProps) {
  return (
    <article className="mb-6 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="mb-3 text-gray-700">{summary}</p>
      <a href="#" className="text-blue-600 hover:underline">
        더 읽기 →
      </a>
    </article>
  );
}
