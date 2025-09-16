import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { PostCreateRequest } from '@/entities/post/model/types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  initialValue?: string;
  onSave?: (data: PostCreateRequest & { published: boolean }) => void;
  className?: string;
}

export function MarkdownEditor({
  initialValue = '',
  onSave,
  className = '',
}: MarkdownEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(initialValue);
  const [summary, setSummary] = useState('');
  const [tagString, setTagString] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Convert tag string to array
  const tagList = tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // Handle markdown content change
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  // Handle save (draft)
  const handleSave = useCallback(async () => {
    if (!onSave) return;

    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      const saveData = {
        title,
        content,
        summary,
        tags: tagList,
        published: false, // default false
      };

      await onSave(saveData);
      toast.success("글이 임시저장되었습니다!");
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [title, content, summary, tagList, onSave]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!onSave) return;

    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      const publishData = {
        title,
        content,
        summary,
        tags: tagList,
        published: true, // true when publishing
      };

      await onSave(publishData);
      toast.success("글이 발행되었습니다!");
    } catch (error) {
      console.error('발행 실패:', error);
      toast.error("발행에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [title, content, summary, tagList, onSave]);

  // Handle image upload button click
  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Helper function to insert text at cursor position
  const insertAtCursor = (text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    setContent(newValue);

    // Move cursor to end of inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Image processing function
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const imageUrl = URL.createObjectURL(file);

      // Set first image as thumbnail
      if (!thumbnailUrl) {
        setThumbnailUrl(imageUrl);
      }

      resolve(imageUrl);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsSaving(true);

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          console.warn(`${file.name}은(는) 이미지 파일이 아닙니다.`);
          continue;
        }

        // In actual implementation, upload to Supabase Storage
        const imageUrl = await processImage(file);
        const markdownImage = `![${file.name}](${imageUrl})`;

        // Insert image at cursor position
        insertAtCursor(`\n\n${markdownImage}\n\n`);
      }

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsSaving(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [thumbnailUrl]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setIsSaving(true);

      for (const file of imageFiles) {
        // In actual implementation, upload to Supabase Storage
        const imageUrl = await processImage(file);
        const markdownImage = `![${file.name}](${imageUrl})`;

        // Insert image at cursor position
        insertAtCursor(`\n\n${markdownImage}\n\n`);
      }

    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [thumbnailUrl]);

  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* Header - title and metadata input */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="space-y-4">
          {/* Title input */}
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글 제목을 입력하세요"
            className="w-full text-2xl font-bold border-none outline-none placeholder-gray-400 focus-visible:ring-0"
          />

          {/* Summary input */}
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="글 요약을 입력하세요 (SEO 메타 설명용)"
            className="w-full h-20 resize-none"
          />

          {/* Tags and action buttons */}
          <div className="flex items-center justify-between gap-4">
            <Input
              type="text"
              value={tagString}
              onChange={(e) => setTagString(e.target.value)}
              placeholder="태그를 입력하세요 (쉼표로 구분)"
              className="flex-1"
            />

            <div className="flex gap-2">
              {/* Image upload button */}
              <Button
                onClick={handleImageUploadClick}
                disabled={isSaving}
                variant="outline"
                data-testid="image-upload-button"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
              >
                {isSaving ? '업로드중...' : '이미지'}
              </Button>

              {/* Save button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="secondary"
                data-testid="save-button"
              >
                임시저장
              </Button>

              {/* Publish button */}
              <Button
                onClick={handlePublish}
                disabled={isSaving}
                data-testid="publish-button"
              >
                발행
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex">
        {/* Left: Markdown editor */}
        <div className="w-1/2 border-r border-gray-200">
          <div
            className={`h-full relative ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="drop-zone"
          >
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
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

            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-blue-600 font-medium">이미지를 여기에 드롭하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 bg-gray-50">
          <div className="h-full overflow-auto p-4">
            {/* Thumbnail preview */}
            {thumbnailUrl && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">썸네일 이미지</h3>
                <img src={thumbnailUrl} alt="썸네일" className="w-full h-48 object-cover rounded" />
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
                  // Title styling
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
                  // Paragraph styling
                  p: ({ children, ...props }) => (
                    <p className="text-gray-700 leading-7 mb-4" {...props}>
                      {children}
                    </p>
                  ),
                  // List styling
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
                  // Blockquote styling
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-800"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  // Code styling
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
                  // Image optimization
                  img: ({ src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="max-w-full h-auto rounded-lg shadow-sm my-4"
                      loading="lazy"
                      {...props}
                    />
                  ),
                  // Links open in new tab
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
                  // Bold text styling
                  strong: ({ children, ...props }) => (
                    <strong className="font-bold text-gray-900" {...props}>
                      {children}
                    </strong>
                  ),
                  // Italic text styling
                  em: ({ children, ...props }) => (
                    <em className="italic" {...props}>
                      {children}
                    </em>
                  ),
                }}
              >
                {content || '# 미리보기\n\n왼쪽 에디터에서 마크다운을 작성하면 여기에 실시간으로 미리보기가 표시됩니다.'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}