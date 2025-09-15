import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { 글작성요청 } from '@/entities/post/model/types';

// highlight.js 테마 import
import 'highlight.js/styles/github-dark.css';

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
  const [썸네일URL, set썸네일URL] = useState<string | null>(null);

  const 파일입력Ref = useRef<HTMLInputElement>(null);
  const 에디터Ref = useRef<HTMLTextAreaElement>(null);

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

  // 커서 위치에 텍스트 삽입하는 헬퍼 함수
  const insertAtCursor = (text: string) => {
    const textarea = 에디터Ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    set내용(newValue);

    // 커서 위치를 삽입된 텍스트 뒤로 이동
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // 이미지 처리 함수
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const imageUrl = URL.createObjectURL(file);

      // 첫 번째 이미지를 썸네일로 설정
      if (!썸네일URL) {
        set썸네일URL(imageUrl);
      }

      resolve(imageUrl);
    });
  };

  // 파일 선택 처리
  const handle파일선택 = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      set저장중(true);

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          console.warn(`${file.name}은(는) 이미지 파일이 아닙니다.`);
          continue;
        }

        // 실제 구현에서는 Supabase Storage에 업로드
        const imageUrl = await processImage(file);
        const markdownImage = `![${file.name}](${imageUrl})`;

        // 커서 위치에 이미지 삽입
        insertAtCursor(`\n\n${markdownImage}\n\n`);
      }

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
  }, [썸네일URL]);

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
        const imageUrl = await processImage(file);
        const markdownImage = `![${file.name}](${imageUrl})`;

        // 커서 위치에 이미지 삽입
        insertAtCursor(`\n\n${markdownImage}\n\n`);
      }

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      set저장중(false);
    }
  }, [썸네일URL]);

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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {저장중 ? '업로드중...' : '이미지'}
              </button>

              {/* 저장 버튼 */}
              <button
                onClick={handle저장}
                disabled={저장중}
                data-testid="save-button"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                임시저장
              </button>

              {/* 발행 버튼 */}
              <button
                onClick={handle발행}
                disabled={저장중}
                data-testid="publish-button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              ref={에디터Ref}
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
            {/* 썸네일 미리보기 */}
            {썸네일URL && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">썸네일 이미지</h3>
                <img src={썸네일URL} alt="썸네일" className="w-full h-48 object-cover rounded" />
              </div>
            )}

            <div
              data-testid="markdown-preview"
              className="max-w-none text-gray-900"
              style={{
                '--tw-prose-body': '#374151',
                '--tw-prose-headings': '#111827',
                '--tw-prose-lead': '#4b5563',
                '--tw-prose-links': '#2563eb',
                '--tw-prose-bold': '#111827',
                '--tw-prose-counters': '#6b7280',
                '--tw-prose-bullets': '#d1d5db',
                '--tw-prose-hr': '#e5e7eb',
                '--tw-prose-quotes': '#111827',
                '--tw-prose-quote-borders': '#e5e7eb',
                '--tw-prose-captions': '#6b7280',
                '--tw-prose-code': '#111827',
                '--tw-prose-pre-code': '#e5e7eb',
                '--tw-prose-pre-bg': '#1f2937',
                '--tw-prose-th-borders': '#d1d5db',
                '--tw-prose-td-borders': '#e5e7eb',
              } as React.CSSProperties}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // 제목 스타일링
                  h1: ({ children, ...props }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 leading-tight" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3 leading-tight" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2 leading-tight" {...props}>
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 className="text-lg font-semibold text-gray-900 mt-3 mb-2" {...props}>
                      {children}
                    </h4>
                  ),
                  h5: ({ children, ...props }) => (
                    <h5 className="text-base font-semibold text-gray-900 mt-2 mb-1" {...props}>
                      {children}
                    </h5>
                  ),
                  h6: ({ children, ...props }) => (
                    <h6 className="text-sm font-semibold text-gray-900 mt-2 mb-1" {...props}>
                      {children}
                    </h6>
                  ),
                  // 단락 스타일링
                  p: ({ children, ...props }) => (
                    <p className="text-gray-700 leading-7 mb-4" {...props}>
                      {children}
                    </p>
                  ),
                  // 목록 스타일링
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc list-outside ml-6 mb-4 space-y-1" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal list-outside ml-6 mb-4 space-y-1" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="text-gray-700 leading-6" {...props}>
                      {children}
                    </li>
                  ),
                  // 인용구 스타일링
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-800"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  // 코드 스타일링
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !match ? (
                      <code
                        className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // 이미지 최적화
                  img: ({ src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="max-w-full h-auto rounded-lg shadow-sm my-4"
                      loading="lazy"
                      {...props}
                    />
                  ),
                  // 링크를 새 탭에서 열도록 설정
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  // 굵은 글씨 스타일링
                  strong: ({ children, ...props }) => (
                    <strong className="font-bold text-gray-900" {...props}>
                      {children}
                    </strong>
                  ),
                  // 기울임 글씨 스타일링
                  em: ({ children, ...props }) => (
                    <em className="italic" {...props}>
                      {children}
                    </em>
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