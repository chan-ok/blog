import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MarkdownEditor } from '@/features/post/editor/components/MarkdownEditor';

export const Route = createFileRoute("/admin/write")({
  component: WritePost,
});

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function WritePost() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async (data: any) => {
    if (!data.title?.trim()) {
      setErrorMessage("제목을 입력해주세요.");
      return;
    }

    setSaveStatus('saving');
    setErrorMessage("");

    try {
      // 여기에 실제 API 호출 로직 추가
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션

      console.log("글 저장:", data);
      setSaveStatus('saved');

      // 2초 후 상태 초기화
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveStatus('error');
      setErrorMessage('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarkdownEditor onSave={handleSave} />

      {/* 상태 및 피드백 UI */}
      <div className="fixed bottom-4 right-4 z-50">
        {saveStatus === 'saved' && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            저장되었습니다!
          </div>
        )}
        {saveStatus === 'saving' && (
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            저장 중...
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}