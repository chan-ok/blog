import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// useQuery 모킹 — getMarkdown 대신 TanStack Query 훅 레벨에서 모킹
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// react-i18next 모킹
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'markdown.loading': 'Loading...',
        'markdown.loadError': 'Failed to load content',
        'markdown.retry': 'Retry',
      };
      return translations[key] ?? key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

import { useQuery } from '@tanstack/react-query';
import MDComponent from './index';
import type { Frontmatter } from './model/markdown.schema';

/**
 * ============================================================================
 * MDXComponent 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * CSR MDX 렌더링 컴포넌트의 상태 관리 및 에러 처리를 검증합니다.
 *
 * ## 테스트 전략
 * - useQuery를 모킹하여 TanStack Query 레벨에서 상태 제어
 * - getMarkdown 직접 모킹 대신 훅 반환값으로 시나리오 제어
 */

// ============================================================================
// 테스트 데이터
// ============================================================================

const createMockFrontmatter = (): Frontmatter => ({
  title: 'Test Post',
  path: ['test', 'Test Post'],
  tags: ['test'],
  createdAt: new Date('2024-01-01'),
  published: true,
});

const createMockMDXContent = (content: string) => {
  return function MockMDXContent() {
    return <div>{content}</div>;
  };
};

// ============================================================================
// 테스트 유틸리티
// ============================================================================

function renderComponent(path: string, baseUrl?: string) {
  return render(<MDComponent path={path} baseUrl={baseUrl} />);
}

// ============================================================================
// Unit 테스트: 로딩 상태
// ============================================================================

describe('MDXComponent - 로딩 상태', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: mdx-component, Property: 로딩 상태**
   * **검증: isLoading=true일 때 로딩 표시**
   *
   * 시나리오: useQuery가 로딩 중 상태 반환
   * 기대 결과: "Loading..." 텍스트 표시
   */
  it('데이터 로딩 중 로딩 메시지를 표시해야 한다', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderComponent('/test.mdx');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

// ============================================================================
// Unit 테스트: 성공 상태
// ============================================================================

describe('MDXComponent - 성공 상태', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: mdx-component, Property: MDX 렌더링**
   * **검증: data가 있을 때 MDXContent를 렌더링**
   *
   * 시나리오: useQuery가 성공 데이터 반환
   * 기대 결과: MDX 콘텐츠 표시
   */
  it('유효한 MDX 데이터를 성공적으로 렌더링해야 한다', async () => {
    const testContent = 'Hello MDX';
    vi.mocked(useQuery).mockReturnValue({
      data: {
        MDXContent: createMockMDXContent(testContent),
        frontmatter: createMockFrontmatter(),
        content: '# Hello MDX',
        source: '# Hello MDX',
      },
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderComponent('/test.mdx');

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText(testContent)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Unit 테스트: 에러 상태
// ============================================================================

describe('MDXComponent - 에러 상태', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * **Feature: mdx-component, Property: 네트워크 에러 처리**
   * **검증: error가 있을 때 에러 UI 표시**
   *
   * 시나리오: useQuery가 error 반환
   * 기대 결과: 에러 메시지 표시 + console.error 호출
   */
  it('네트워크 에러 발생 시 에러 메시지를 표시해야 한다', async () => {
    const testError = new Error('Network error');
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      error: testError,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useQuery>);

    renderComponent('/test.mdx');

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
    });

    // useEffect에서 console.error 호출 확인
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch markdown:',
      testError
    );
  });

  /**
   * **Feature: mdx-component, Property: 재시도 기능**
   * **검증: 재시도 버튼 클릭 시 refetch 호출**
   *
   * 시나리오: 에러 상태에서 재시도 버튼 클릭
   * 기대 결과: refetch() 함수 호출
   */
  it('재시도 버튼을 클릭하면 refetch를 호출해야 한다', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      error: new Error('Network error'),
      isLoading: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useQuery>);

    renderComponent('/test.mdx');

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await userEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});

/**
 * ============================================================================
 * 테스트 요약
 * ============================================================================
 *
 * ## 통과한 테스트 (4개)
 * - ✅ 로딩 상태: 데이터 로딩 중 로딩 메시지 표시
 * - ✅ 성공 상태: 유효한 MDX 데이터 렌더링
 * - ✅ 에러 상태: 네트워크 에러 시 에러 메시지 표시
 * - ✅ 재시도 기능: 재시도 버튼 클릭 시 refetch 호출
 */
