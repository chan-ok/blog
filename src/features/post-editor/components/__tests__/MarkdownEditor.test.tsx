import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MarkdownEditor } from '../MarkdownEditor';
import type { ReactNode } from 'react';

// 마크다운 관련 라이브러리 모킹
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="mocked-markdown">{children}</div>,
}));

// 파일 업로드 API 모킹
vi.mock('@/entities/post/api/postAPI', () => ({
  이미지업로드하기: vi.fn(),
}));

describe('MarkdownEditor 컴포넌트', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  it('마크다운 에디터와 미리보기가 렌더링되어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('왼쪽 에디터에 마크다운을 입력할 수 있어야 한다', async () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    const editor = screen.getByTestId('markdown-editor') as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '# 테스트 제목\n\n테스트 내용입니다.' } });

    expect(editor.value).toBe('# 테스트 제목\n\n테스트 내용입니다.');
  });

  it('오른쪽에 실시간 미리보기가 표시되어야 한다', async () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    const editor = screen.getByTestId('markdown-editor');

    fireEvent.change(editor, { target: { value: '# 테스트 제목' } });

    await waitFor(() => {
      const preview = screen.getByTestId('mocked-markdown');
      expect(preview).toHaveTextContent('# 테스트 제목');
    });
  });

  it('코드 블록을 입력할 수 있어야 한다', async () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    const editor = screen.getByTestId('markdown-editor');
    const codeBlock = '```typescript\nconst hello = "world";\n```';

    fireEvent.change(editor, { target: { value: codeBlock } });

    expect((editor as HTMLTextAreaElement).value).toBe(codeBlock);
  });

  it('이미지 업로드 버튼이 있어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByTestId('image-upload-button')).toBeInTheDocument();
  });

  it('저장 버튼이 있어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('발행 버튼이 있어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByTestId('publish-button')).toBeInTheDocument();
  });

  it('제목 입력 필드가 있어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByPlaceholderText('글 제목을 입력하세요')).toBeInTheDocument();
  });

  it('태그 입력 필드가 있어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByPlaceholderText('태그를 입력하세요 (쉼표로 구분)')).toBeInTheDocument();
  });

  it('초기값으로 published가 false여야 한다', () => {
    const onSave = vi.fn();

    render(<MarkdownEditor onSave={onSave} />, { wrapper: createWrapper });

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        발행됨: false,
      })
    );
  });

  it('발행 버튼 클릭 시 published가 true여야 한다', () => {
    const onSave = vi.fn();

    render(<MarkdownEditor onSave={onSave} />, { wrapper: createWrapper });

    const publishButton = screen.getByTestId('publish-button');
    fireEvent.click(publishButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        발행됨: true,
      })
    );
  });

  it('파일 드래그 앤 드롭 영역이 있어야 한다', () => {
    render(<MarkdownEditor />, { wrapper: createWrapper });

    expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
  });
});