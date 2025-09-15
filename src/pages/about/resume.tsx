import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about/resume")({
  component: Resume,
});

function Resume() {
  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-3xl font-bold mb-6">이력서</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4">경력</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">프론트엔드 개발자</h4>
              <p className="text-gray-600">회사명 (2023.01 - 현재)</p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                <li>React/TypeScript 기반 웹 애플리케이션 개발</li>
                <li>사용자 경험 개선 및 성능 최적화</li>
                <li>반응형 웹 디자인 구현</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">기술 스택</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">프론트엔드</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>React</li>
                <li>TypeScript</li>
                <li>Next.js</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">백엔드</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Node.js</li>
                <li>Supabase</li>
                <li>PostgreSQL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">도구</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Git/GitHub</li>
                <li>Vite</li>
                <li>Vitest</li>
                <li>ESLint</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">학력</h3>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium">컴퓨터공학과</h4>
            <p className="text-gray-600">대학교 (2019.03 - 2023.02)</p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">연락처</h3>
          <div className="text-gray-600 space-y-2">
            <p>이메일: developer@example.com</p>
            <p>GitHub: https://github.com/username</p>
            <p>LinkedIn: https://linkedin.com/in/username</p>
          </div>
        </section>
      </div>
    </div>
  );
}