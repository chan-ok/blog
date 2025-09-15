import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Contact } from '../contact';

// Supabase 모킹
const mockSupabaseFunctions = {
  invoke: vi.fn(),
};

vi.mock('../../shared/config/supabase', () => ({
  supabase: {
    functions: mockSupabaseFunctions,
  },
}));

describe('Contact 페이지', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    // supabase 모킹 함수 설정
    mockSupabaseFunctions.invoke.mockResolvedValue({ error: null });
  });

  it('연락처 페이지가 올바르게 렌더링되어야 한다', () => {
    render(<Contact />, { wrapper: createWrapper });

    expect(screen.getByText('연락처')).toBeInTheDocument();
    expect(screen.getByText('메시지 보내기')).toBeInTheDocument();
    expect(screen.getByText('연락 방법')).toBeInTheDocument();

    // GitHub 링크 확인
    expect(screen.getByText('github.com/chan-ok')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'github.com/chan-ok' }))
      .toHaveAttribute('href', 'https://github.com/chan-ok');
  });

  it('폼 필드들이 올바르게 렌더링되어야 한다', () => {
    render(<Contact />, { wrapper: createWrapper });

    expect(screen.getByLabelText('이름 *')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일 *')).toBeInTheDocument();
    expect(screen.getByLabelText('제목 *')).toBeInTheDocument();
    expect(screen.getByLabelText('내용 *')).toBeInTheDocument();
    expect(screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '메시지 보내기' })).toBeInTheDocument();
  });

  it('폼 입력값이 올바르게 업데이트되어야 한다', async () => {
    render(<Contact />, { wrapper: createWrapper });

    const 이름입력 = screen.getByLabelText('이름 *') as HTMLInputElement;
    const 이메일입력 = screen.getByLabelText('이메일 *') as HTMLInputElement;
    const 제목입력 = screen.getByLabelText('제목 *') as HTMLInputElement;
    const 내용입력 = screen.getByLabelText('내용 *') as HTMLTextAreaElement;
    const 동의체크박스 = screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/) as HTMLInputElement;

    fireEvent.change(이름입력, { target: { value: '홍길동' } });
    fireEvent.change(이메일입력, { target: { value: 'test@example.com' } });
    fireEvent.change(제목입력, { target: { value: '테스트 문의' } });
    fireEvent.change(내용입력, { target: { value: '안녕하세요. 테스트 문의입니다.' } });
    fireEvent.click(동의체크박스);

    expect(이름입력.value).toBe('홍길동');
    expect(이메일입력.value).toBe('test@example.com');
    expect(제목입력.value).toBe('테스트 문의');
    expect(내용입력.value).toBe('안녕하세요. 테스트 문의입니다.');
    expect(동의체크박스.checked).toBe(true);
  });

  it('개인정보 동의 없이 제출 시 오류 메시지를 표시해야 한다', async () => {
    render(<Contact />, { wrapper: createWrapper });

    const 이름입력 = screen.getByLabelText('이름 *');
    const 이메일입력 = screen.getByLabelText('이메일 *');
    const 제목입력 = screen.getByLabelText('제목 *');
    const 내용입력 = screen.getByLabelText('내용 *');
    const 제출버튼 = screen.getByRole('button', { name: '메시지 보내기' });

    fireEvent.change(이름입력, { target: { value: '홍길동' } });
    fireEvent.change(이메일입력, { target: { value: 'test@example.com' } });
    fireEvent.change(제목입력, { target: { value: '테스트 문의' } });
    fireEvent.change(내용입력, { target: { value: '안녕하세요.' } });

    fireEvent.click(제출버튼);

    await waitFor(() => {
      expect(screen.getByText('개인정보 수집 및 이용에 동의해주세요.')).toBeInTheDocument();
    });

    expect(mockSupabaseFunctions.invoke).not.toHaveBeenCalled();
  });

  it('폼 제출 시 Supabase function이 올바른 데이터로 호출되어야 한다', async () => {
    render(<Contact />, { wrapper: createWrapper });

    const 이름입력 = screen.getByLabelText('이름 *');
    const 이메일입력 = screen.getByLabelText('이메일 *');
    const 제목입력 = screen.getByLabelText('제목 *');
    const 내용입력 = screen.getByLabelText('내용 *');
    const 동의체크박스 = screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/);
    const 제출버튼 = screen.getByRole('button', { name: '메시지 보내기' });

    fireEvent.change(이름입력, { target: { value: '홍길동' } });
    fireEvent.change(이메일입력, { target: { value: 'test@example.com' } });
    fireEvent.change(제목입력, { target: { value: '테스트 문의' } });
    fireEvent.change(내용입력, { target: { value: '안녕하세요. 테스트 문의입니다.' } });
    fireEvent.click(동의체크박스);

    fireEvent.click(제출버튼);

    await waitFor(() => {
      expect(mockSupabaseFunctions.invoke).toHaveBeenCalledWith('contact-email', {
        body: {
          name: '홍길동',
          email: 'test@example.com',
          subject: '테스트 문의',
          message: '안녕하세요. 테스트 문의입니다.',
        },
      });
    });
  });

  it('이메일 전송 성공 시 성공 메시지를 표시하고 폼을 초기화해야 한다', async () => {
    mockSupabaseFunctions.invoke.mockResolvedValue({ error: null });

    render(<Contact />, { wrapper: createWrapper });

    const 이름입력 = screen.getByLabelText('이름 *') as HTMLInputElement;
    const 이메일입력 = screen.getByLabelText('이메일 *') as HTMLInputElement;
    const 제목입력 = screen.getByLabelText('제목 *') as HTMLInputElement;
    const 내용입력 = screen.getByLabelText('내용 *') as HTMLTextAreaElement;
    const 동의체크박스 = screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/) as HTMLInputElement;
    const 제출버튼 = screen.getByRole('button', { name: '메시지 보내기' });

    fireEvent.change(이름입력, { target: { value: '홍길동' } });
    fireEvent.change(이메일입력, { target: { value: 'test@example.com' } });
    fireEvent.change(제목입력, { target: { value: '테스트 문의' } });
    fireEvent.change(내용입력, { target: { value: '안녕하세요.' } });
    fireEvent.click(동의체크박스);

    fireEvent.click(제출버튼);

    await waitFor(() => {
      expect(screen.getByText('메시지가 성공적으로 전송되었습니다! 24-48시간 내에 답변드리겠습니다.')).toBeInTheDocument();
    });

    // 폼이 초기화되었는지 확인
    expect(이름입력.value).toBe('');
    expect(이메일입력.value).toBe('');
    expect(제목입력.value).toBe('');
    expect(내용입력.value).toBe('');
    expect(동의체크박스.checked).toBe(false);
  });

  it('이메일 전송 실패 시 오류 메시지를 표시해야 한다', async () => {
    const 오류 = new Error('전송 실패');
    mockSupabaseFunctions.invoke.mockRejectedValue(오류);

    render(<Contact />, { wrapper: createWrapper });

    const 이름입력 = screen.getByLabelText('이름 *');
    const 이메일입력 = screen.getByLabelText('이메일 *');
    const 제목입력 = screen.getByLabelText('제목 *');
    const 내용입력 = screen.getByLabelText('내용 *');
    const 동의체크박스 = screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/);
    const 제출버튼 = screen.getByRole('button', { name: '메시지 보내기' });

    fireEvent.change(이름입력, { target: { value: '홍길동' } });
    fireEvent.change(이메일입력, { target: { value: 'test@example.com' } });
    fireEvent.change(제목입력, { target: { value: '테스트 문의' } });
    fireEvent.change(내용입력, { target: { value: '안녕하세요.' } });
    fireEvent.click(동의체크박스);

    fireEvent.click(제출버튼);

    await waitFor(() => {
      expect(screen.getByText('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    });
  });

  it('전송 중일 때 버튼이 비활성화되고 로딩 텍스트를 표시해야 한다', async () => {
    // 무한 대기 promise로 로딩 상태 시뮬레이션
    mockSupabaseFunctions.invoke.mockImplementation(() => new Promise(() => {}));

    render(<Contact />, { wrapper: createWrapper });

    const 이름입력 = screen.getByLabelText('이름 *');
    const 이메일입력 = screen.getByLabelText('이메일 *');
    const 제목입력 = screen.getByLabelText('제목 *');
    const 내용입력 = screen.getByLabelText('내용 *');
    const 동의체크박스 = screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/);

    fireEvent.change(이름입력, { target: { value: '홍길동' } });
    fireEvent.change(이메일입력, { target: { value: 'test@example.com' } });
    fireEvent.change(제목입력, { target: { value: '테스트 문의' } });
    fireEvent.change(내용입력, { target: { value: '안녕하세요.' } });
    fireEvent.click(동의체크박스);

    const 제출버튼 = screen.getByRole('button', { name: '메시지 보내기' });
    fireEvent.click(제출버튼);

    await waitFor(() => {
      const 로딩버튼 = screen.getByRole('button', { name: '전송 중...' });
      expect(로딩버튼).toBeDisabled();
    });

    // 폼 필드들도 비활성화되었는지 확인
    expect(이름입력).toBeDisabled();
    expect(이메일입력).toBeDisabled();
    expect(제목입력).toBeDisabled();
    expect(내용입력).toBeDisabled();
    expect(동의체크박스).toBeDisabled();
  });

  it('연락처 정보가 올바르게 표시되어야 한다', () => {
    render(<Contact />, { wrapper: createWrapper });

    expect(screen.getByText('chanho.kim@example.com')).toBeInTheDocument();
    expect(screen.getByText('업무 관련 문의나 협업 제안')).toBeInTheDocument();
    expect(screen.getByText('오픈소스 프로젝트와 코드 저장소')).toBeInTheDocument();
    expect(screen.getByText('일반적으로 24-48시간 내에 답변드립니다.')).toBeInTheDocument();
  });
});