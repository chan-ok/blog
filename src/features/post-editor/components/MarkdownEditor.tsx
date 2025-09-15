import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { 글작성요청 } from '@/entities/post/model/types';

// Prism CSS 스타일 (코드 하이라이팅용)
import 'prismjs/themes/prism-tomorrow.css';

interface MarkdownEditorProps {
  initialValue?: string;
  onSave?: (data: 글작성요청 & { 발행됨: boolean }) => void;
  className?: string;
}

export function MarkdownEditor({
  initialValue = '',
  onSave,
  className = '',
}: MarkdownEditorProps) {
  const [제목, set제목] = useState('');
  const [내용, set내용] = useState(initialValue);
  const [요약, set요약] = useState('');
  const [태그문자열, set태그문자열] = useState('');
  const [저장중, set저장중] = useState(false);
  const [드래그오버, set드래그오버] = useState(false);

  const 파일입력Ref = useRef<HTMLInputElement>(null);

  // 태그 문자열을 배열로 변환
  const 태그목록 = 태그문자열
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // 마크다운 내용 변경 처리
  const handle내용변경 = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    set내용(e.target.value);
  }, []);

  // 저장 처리 (임시저장)
  const handle저장 = useCallback(() => {
    if (!onSave) return;

    const 저장데이터 = {
      제목,
      내용,
      요약,
      태그목록,
      발행됨: false, // 기본값 false
    };

    onSave(저장데이터);
  }, [제목, 내용, 요약, 태그목록, onSave]);

  // 발행 처리
  const handle발행 = useCallback(() => {
    if (!onSave) return;

    const 발행데이터 = {
      제목,
      내용,
      요약,
      태그목록,
      발행됨: true, // 발행 시 true
    };

    onSave(발행데이터);
  }, [제목, 내용, 요약, 태그목록, onSave]);

  // 이미지 업로드 버튼 클릭
  const handle이미지업로드클릭 = useCallback(() => {
    파일입력Ref.current?.click();
  }, []);

  // 파일 선택 처리
  const handle파일선택 = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      set저장중(true);

      // 실제 구현에서는 Supabase Storage에 업로드
      // 현재는 임시 URL 생성
      const imageUrl = URL.createObjectURL(file);
      const markdownImage = `![${file.name}](${imageUrl})`;

      // 커서 위치에 이미지 마크다운 삽입
      set내용(prev => prev + '\n\n' + markdownImage + '\n\n');

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      set저장중(false);
      // 파일 입력 초기화
      if (파일입력Ref.current) {
        파일입력Ref.current.value = '';
      }
    }
  }, []);

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    set드래그오버(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    set드래그오버(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    set드래그오버(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      set저장중(true);

      for (const file of imageFiles) {
        // 실제 구현에서는 Supabase Storage에 업로드
        const imageUrl = URL.createObjectURL(file);
        const markdownImage = `![${file.name}](${imageUrl})`;

        set내용(prev => prev + '\n\n' + markdownImage + '\n\n');
      }

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      set저장중(false);
    }
  }, []);

  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* 헤더 - 제목 및 메타데이터 입력 */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="space-y-4">
          {/* 제목 입력 */}
          <input
            type="text"
            value={제목}
            onChange={(e) => set제목(e.target.value)}
            placeholder="글 제목을 입력하세요"
            className="w-full text-2xl font-bold border-none outline-none resize-none placeholder-gray-400"
          />

          {/* 요약 입력 */}
          <textarea
            value={요약}
            onChange={(e) => set요약(e.target.value)}
            placeholder="글 요약을 입력하세요 (SEO 메타 설명용)"
            className="w-full h-20 border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />

          {/* 태그 및 액션 버튼 */}
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              value={태그문자열}
              onChange={(e) => set태그문자열(e.target.value)}
              placeholder="태그를 입력하세요 (쉼표로 구분)"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />

            <div className="flex gap-2">
              {/* 이미지 업로드 버튼 */}
              <button
                onClick={handle이미지업로드클릭}
                disabled={저장중}
                data-testid="image-upload-button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {저장중 ? '업로드중...' : '이미지'}
              </button>

              {/* 저장 버튼 */}
              <button
                onClick={handle저장}
                disabled={저장중}
                data-testid="save-button"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                임시저장
              </button>

              {/* 발행 버튼 */}
              <button
                onClick={handle발행}
                disabled={저장중}
                data-testid="publish-button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                발행
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 에디터 영역 */}
      <div className="flex-1 flex">
        {/* 왼쪽: 마크다운 에디터 */}
        <div className="w-1/2 border-r border-gray-200">
          <div
            className={`h-full relative ${드래그오버 ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="drop-zone"
          >
            <textarea
              value={내용}
              onChange={handle내용변경}
              placeholder="마크다운으로 글을 작성하세요...

# 제목 1
## 제목 2

**굵은 글씨** *기울임 글씨*

```typescript
const hello = 'world';
console.log(hello);
```

- 목록 항목 1
- 목록 항목 2

[링크](https://example.com)

이미지를 드래그하거나 이미지 버튼을 클릭하세요."
              data-testid="markdown-editor"
              className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm leading-6"
            />

            {드래그오버 && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-blue-600 font-medium">이미지를 여기에 드롭하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="w-1/2 bg-gray-50">
          <div className="h-full overflow-auto p-4">
            <div
              data-testid="markdown-preview"
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900
                prose-p:text-gray-700
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100
                prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-li:text-gray-700"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // 코드 블록 커스터마이징
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  // 이미지 최적화
                  img: ({ src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="max-w-full h-auto rounded-lg shadow-sm"
                      loading="lazy"
                      {...props}
                    />
                  ),
                }}
              >
                {내용 || '# 미리보기\n\n왼쪽 에디터에서 마크다운을 작성하면 여기에 실시간으로 미리보기가 표시됩니다.'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={파일입력Ref}
        type="file"
        accept="image/*"
        multiple
        onChange={handle파일선택}
        className="hidden"
      />
    </div>
  );
}