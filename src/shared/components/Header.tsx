import { Route as homeRoute } from "@/pages/index";
import { Route as aboutRoute } from "@/pages/about/index";
import { Route as postsRoute } from "@/pages/posts/index";
import { Route as contactRoute } from "@/pages/contact";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export default function Header() {
  const [모바일메뉴열림, set모바일메뉴열림] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">개발 블로그</h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to={homeRoute.to}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              activeProps={{ className: "text-blue-600 font-medium" }}
            >
              홈
            </Link>
            <Link
              to={aboutRoute.to}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              activeProps={{ className: "text-blue-600 font-medium" }}
            >
              소개
            </Link>
            <Link
              to={postsRoute.to}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              activeProps={{ className: "text-blue-600 font-medium" }}
            >
              글 목록
            </Link>
            <Link
              to="/tags"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              activeProps={{ className: "text-blue-600 font-medium" }}
            >
              태그
            </Link>
            <Link
              to={contactRoute.to}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              activeProps={{ className: "text-blue-600 font-medium" }}
            >
              연락처
            </Link>
            <Link
              to="/admin"
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
            >
              관리자
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => set모바일메뉴열림(!모바일메뉴열림)}
            aria-label="메뉴 토글"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {모바일메뉴열림 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {모바일메뉴열림 && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to={homeRoute.to}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onClick={() => set모바일메뉴열림(false)}
                activeProps={{ className: "text-blue-600 bg-blue-50 font-medium" }}
              >
                홈
              </Link>
              <Link
                to={aboutRoute.to}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onClick={() => set모바일메뉴열림(false)}
                activeProps={{ className: "text-blue-600 bg-blue-50 font-medium" }}
              >
                소개
              </Link>
              <Link
                to={postsRoute.to}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onClick={() => set모바일메뉴열림(false)}
                activeProps={{ className: "text-blue-600 bg-blue-50 font-medium" }}
              >
                글 목록
              </Link>
              <Link
                to="/tags"
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onClick={() => set모바일메뉴열림(false)}
                activeProps={{ className: "text-blue-600 bg-blue-50 font-medium" }}
              >
                태그
              </Link>
              <Link
                to={contactRoute.to}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onClick={() => set모바일메뉴열림(false)}
                activeProps={{ className: "text-blue-600 bg-blue-50 font-medium" }}
              >
                연락처
              </Link>
              <Link
                to="/admin"
                className="mx-3 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
                onClick={() => set모바일메뉴열림(false)}
              >
                관리자
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
