import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/write")({
  component: WritePost,
});

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type PublishStatus = 'idle' | 'publishing' | 'published' | 'error';

function WritePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("임시저장");
  const [category] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage("제목을 입력해주세요.");
      return;
    }

    setSaveStatus('saving');
    setErrorMessage("");

    try {
      // 여기에 실제 API 호출 로직 추가
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      console.log("글 저장:", { title, content, tags, status, category });
      setSaveStatus('saved');
      setLastSaved(new Date());

      // 2초 후 상태 초기화
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveStatus('error');
      setErrorMessage('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMessage("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setPublishStatus('publishing');
    setErrorMessage("");

    try {
      // 여기에 실제 API 호출 로직 추가
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션

      setStatus("발행됨");
      console.log("글 발행:", { title, content, tags, status: "발행됨", category });
      setPublishStatus('published');
      setLastSaved(new Date());

      // 3초 후 상태 초기화
      setTimeout(() => setPublishStatus('idle'), 3000);
    } catch (error) {
      console.error('발행 실패:', error);
      setPublishStatus('error');
      setErrorMessage('발행에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">새 글 작성</h1>
            <p className="text-gray-600">마크다운을 사용하여 글을 작성하세요.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded border ${
                previewMode
                  ? "bg-blue-100 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              {previewMode ? "편집 모드" : "미리보기"}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              임시저장
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              발행하기
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="글 제목을 입력하세요"
              className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, TypeScript, 웹개발)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              태그는 독자가 관련 글을 찾는데 도움이 됩니다.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="content" className="text-sm font-medium text-gray-700">
                  내용 (마크다운) *
                </label>
                <div className="text-xs text-gray-500">
                  {content.length} 글자
                </div>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`# 제목

여기에 글 내용을 마크다운 형식으로 작성하세요.

## 소제목

- 목록 항목 1
- 목록 항목 2

\`\`\`javascript
// 코드 예제
function hello() {
  console.log("안녕하세요!");
}
\`\`\`

**굵은 글씨** 또는 *기울임꼴*을 사용할 수 있습니다.`}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700">미리보기</span>
              </div>
              <div className="h-96 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                {content ? (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {content}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    내용을 입력하면 여기에 미리보기가 표시됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">발행 설정</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  발행 상태
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="임시저장">임시저장</option>
                  <option value="발행됨">발행됨</option>
                  <option value="예약발행">예약발행</option>
                </select>
              </div>

              <div>
                <label htmlFor="카테고리" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  id="카테고리"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">카테고리 선택</option>
                  <option value="개발">개발</option>
                  <option value="일상">일상</option>
                  <option value="리뷰">리뷰</option>
                  <option value="튜토리얼">튜토리얼</option>
                </select>
              </div>

              <div>
                <label htmlFor="썸네일" className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지
                </label>
                <input
                  type="file"
                  id="썸네일"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {lastSaved ? `마지막 저장: ${lastSaved.toLocaleString()}` : '마지막 저장: 아직 저장되지 않음'}
              {saveStatus === 'saving' && ' (저장 중...)'}
              {publishStatus === 'publishing' && ' (발행 중...)'}
              {errorMessage && <div className="text-red-500 mt-1">{errorMessage}</div>}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                임시저장
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                발행하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}