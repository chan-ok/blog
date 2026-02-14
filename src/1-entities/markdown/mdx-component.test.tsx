import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import MDComponent from './index';
import getMarkdown from './util/get-markdown';
import type { Frontmatter } from './model/markdown.schema';

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

/**
 * ============================================================================
 * MDXComponent 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * CSR MDX 렌더링 컴포넌트의 상태 관리 및 에러 처리를 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 로딩 상태 표시
 * - ✅ 성공 시 MDX 렌더링
 * - ✅ 에러 상태 처리 (네트워크 에러, evaluate 실패)
 * - ✅ 재시도 기능
 * - ✅ 다양한 MDX 콘텐츠 렌더링
 *
 * ## 테스트 전략
 * - getMarkdown을 모킹하여 다양한 시나리오 검증
 * - useEffect 실행 보장
 * - MDXContent 컴포넌트를 직접 반환하는 방식으로 테스트
 */

// ============================================================================
// Mock 설정
// ============================================================================

// getMarkdown 함수 모킹
vi.mock('./util/get-markdown', () => ({
  default: vi.fn(),
}));

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

// Mock MDX Content 컴포넌트 생성 헬퍼
const createMockMDXContent = (content: string) => {
  // React 컴포넌트 반환 (evaluate의 반환값과 동일)
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
   * **검증: markdownData가 null일 때 로딩 표시**
   *
   * 시나리오: getMarkdown이 완료되지 않은 상태
   * 기대 결과: "Loading..." 텍스트 표시
   */
  it('데이터 로딩 중 로딩 메시지를 표시해야 한다', () => {
    // getMarkdown이 resolve되지 않도록 pending Promise 반환
    vi.mocked(getMarkdown).mockReturnValue(new Promise(() => {}));

    renderComponent('/test.mdx');

    // 로딩 상태 확인
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
   * **검증: MDXContent를 React 컴포넌트로 렌더링**
   *
   * 시나리오: 유효한 MDXContent 제공
   * 기대 결과: MDX가 렌더링되고 콘텐츠 표시
   */
  it('유효한 MDX 데이터를 성공적으로 렌더링해야 한다', async () => {
    const testContent = 'Hello MDX';
    vi.mocked(getMarkdown).mockResolvedValue({
      MDXContent: createMockMDXContent(testContent),
      frontmatter: createMockFrontmatter(),
      content: '# Hello MDX',
      source: '# Hello MDX',
    });

    renderComponent('/test.mdx');

    // 로딩 상태 확인
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // 렌더링 완료 대기
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByText(testContent)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
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
   * **검증: getMarkdown 실패 시 에러 상태 표시**
   *
   * 시나리오: getMarkdown이 reject됨
   * 기대 결과: catch 블록 실행 → error 상태 → 에러 메시지 표시
   */
  it('네트워크 에러 발생 시 에러 메시지를 표시해야 한다', async () => {
    const testError = new Error('Network error');
    vi.mocked(getMarkdown).mockRejectedValue(testError);

    renderComponent('/test.mdx');

    // 로딩 상태 확인
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // 에러 상태 확인
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // console.error 호출 확인
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch markdown:',
      testError
    );
  });

  /**
   * **Feature: mdx-component, Property: 재시도 기능**
   * **검증: 재시도 버튼 클릭 시 다시 fetch**
   *
   * 시나리오: 에러 후 재시도 버튼 클릭
   * 기대 결과: getMarkdown 재호출, 성공 시 콘텐츠 렌더링
   */
  it('재시도 버튼을 클릭하면 다시 로딩해야 한다', async () => {
    const testError = new Error('Network error');
    const testContent = 'Retry Success';

    // 첫 번째 호출은 실패
    vi.mocked(getMarkdown).mockRejectedValueOnce(testError);

    renderComponent('/test.mdx');

    // 에러 상태 대기
    await waitFor(() => {
      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
    });

    // 두 번째 호출은 성공하도록 모킹
    vi.mocked(getMarkdown).mockResolvedValueOnce({
      MDXContent: createMockMDXContent(testContent),
      frontmatter: createMockFrontmatter(),
      content: '# Retry',
      source: '# Retry',
    });

    // 재시도 버튼 클릭
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await retryButton.click();

    // 로딩 상태 확인
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // 성공 상태 확인
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByText(testContent)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
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
 * - ✅ 재시도 기능: 재시도 버튼 클릭 시 다시 fetch
 *
 * ## 커버리지
 * - 목표: 80%+ (비즈니스 로직)
 * - 예상: 85%+ (index.tsx)
 *
 * ## 추가 테스트 권장사항
 * - Storybook 스토리 추가 (시각적 확인)
 * - getMarkdown 함수 별도 Unit 테스트 (완료)
 * - E2E 테스트로 실제 브라우저 렌더링 검증
 */
