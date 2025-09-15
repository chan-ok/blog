import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/about/")({
  component: About,
});

function About() {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold mb-6">소개</h1>

      <div className="mb-8">
        <nav className="flex space-x-4 mb-6">
          <Link
            to="/about"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            일반 소개
          </Link>
          <Link
            to="/about/resume"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            이력서
          </Link>
        </nav>
      </div>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-4">
          안녕하세요! 저는 개발자입니다.
        </p>

        <p className="text-gray-600 mb-4">
          이곳은 개발 경험과 생각을 공유하는 개인 블로그입니다.
          주로 웹 개발, 프론트엔드 기술, 그리고 새로운 기술 트렌드에 대해 다룹니다.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">관심 분야</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>React / TypeScript</li>
          <li>웹 성능 최적화</li>
          <li>사용자 경험 (UX/UI)</li>
          <li>모던 웹 개발</li>
        </ul>
      </div>

      <Outlet />
    </div>
  );
}