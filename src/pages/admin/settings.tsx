import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

function Settings() {
  const [블로그제목, set블로그제목] = useState("개발자 블로그");
  const [블로그설명, set블로그설명] = useState("웹 개발 경험과 새로운 기술에 대한 학습 내용을 공유합니다.");
  const [작성자이름, set작성자이름] = useState("관리자");
  const [이메일, set이메일] = useState("admin@example.com");
  const [알림설정, set알림설정] = useState({
    새댓글: true,
    새구독자: true,
    시스템알림: false,
  });

  const 설정저장 = () => {
    console.log("설정 저장:", {
      블로그제목,
      블로그설명,
      작성자이름,
      이메일,
      알림설정,
    });
    alert("설정이 저장되었습니다!");
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">블로그 설정</h1>
          <p className="text-gray-600">블로그의 기본 정보와 설정을 관리하세요.</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="블로그제목" className="block text-sm font-medium text-gray-700 mb-2">
                  블로그 제목 *
                </label>
                <input
                  type="text"
                  id="블로그제목"
                  value={블로그제목}
                  onChange={(e) => set블로그제목(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="블로그 제목을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="블로그설명" className="block text-sm font-medium text-gray-700 mb-2">
                  블로그 설명
                </label>
                <textarea
                  id="블로그설명"
                  value={블로그설명}
                  onChange={(e) => set블로그설명(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="블로그에 대한 간단한 설명을 입력하세요"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="작성자이름" className="block text-sm font-medium text-gray-700 mb-2">
                    작성자 이름 *
                  </label>
                  <input
                    type="text"
                    id="작성자이름"
                    value={작성자이름}
                    onChange={(e) => set작성자이름(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="작성자 이름"
                  />
                </div>

                <div>
                  <label htmlFor="이메일" className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 이메일 *
                  </label>
                  <input
                    type="email"
                    id="이메일"
                    value={이메일}
                    onChange={(e) => set이메일(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">알림 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">새 댓글 알림</h3>
                  <p className="text-sm text-gray-500">새로운 댓글이 작성되면 이메일로 알림을 받습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={알림설정.새댓글}
                    onChange={(e) => set알림설정(prev => ({ ...prev, 새댓글: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">새 구독자 알림</h3>
                  <p className="text-sm text-gray-500">새로운 구독자가 등록되면 알림을 받습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={알림설정.새구독자}
                    onChange={(e) => set알림설정(prev => ({ ...prev, 새구독자: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">시스템 알림</h3>
                  <p className="text-sm text-gray-500">시스템 업데이트 및 보안 관련 알림을 받습니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={알림설정.시스템알림}
                    onChange={(e) => set알림설정(prev => ({ ...prev, 시스템알림: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO 설정</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="메타키워드" className="block text-sm font-medium text-gray-700 mb-2">
                  메타 키워드
                </label>
                <input
                  type="text"
                  id="메타키워드"
                  placeholder="React, TypeScript, 웹개발, 프론트엔드"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">쉼표로 구분하여 입력하세요.</p>
              </div>

              <div>
                <label htmlFor="구글애널리틱스" className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics 추적 ID
                </label>
                <input
                  type="text"
                  id="구글애널리틱스"
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">디스플레이 설정</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="페이지당글수" className="block text-sm font-medium text-gray-700 mb-2">
                  페이지당 글 수
                </label>
                <select
                  id="페이지당글수"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5">5개</option>
                  <option value="10" selected>10개</option>
                  <option value="15">15개</option>
                  <option value="20">20개</option>
                </select>
              </div>

              <div>
                <label htmlFor="댓글표시" className="block text-sm font-medium text-gray-700 mb-2">
                  댓글 표시 방식
                </label>
                <select
                  id="댓글표시"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">데이터 관리</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  데이터 내보내기
                </button>
                <button className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  백업 생성
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-red-600 mb-2">위험 구역</h3>
                <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  모든 데이터 삭제
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  이 작업은 되돌릴 수 없습니다. 신중하게 진행하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={설정저장}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}