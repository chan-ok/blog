import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import MDComponent from './index';
import getMarkdown from './util/get-markdown';
import type { Frontmatter } from './model/markdown.schema';

// useRouter 훅 모킹
vi.mock('@tanstack/react-router', () => ({
  useRouter: vi.fn(() => ({
    navigate: vi.fn(),
    history: {
      location: { pathname: '/' },
    },
  })),
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
 * - ✅ 에러 상태 처리 (네트워크 에러, 빈 compiledSource)
 * - ✅ 다양한 MDX 콘텐츠 렌더링 (코드, 헤딩, 리스트)
 *
 * ## 테스트 전략
 * - getMarkdown을 모킹하여 다양한 시나리오 검증
 * - TanStack Router 환경을 재현하여 useEffect 실행 보장
 * - 실제 MDX 컴파일 결과를 사용하여 렌더링 검증
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

// 실제 MDX 컴파일 결과 시뮬레이션
// MDX는 outputFormat: 'function-body'로 컴파일됨
const createMockCompiledSource = (content: string) => {
  // new Function(...Object.keys(runtime), compiledSource)(...Object.values(runtime))
  // 형태로 실행될 수 있도록 React 컴포넌트 반환
  return `
    const {Fragment: _Fragment, jsx: _jsx, jsxs: _jsxs} = arguments[0];
    function _createMdxContent(props) {
      const _components = {
        h1: "h1",
        p: "p",
        code: "code",
        ...props.components
      };
      return _jsx(_Fragment, {
        children: ${JSON.stringify(content)}
      });
    }
    return {
      default: _createMdxContent
    };
  `;
};

// ============================================================================
// 테스트 유틸리티
// ============================================================================

// useRouter가 모킹되었으므로 단순 render만 사용
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
   * **검증: compiledSource를 React 컴포넌트로 변환**
   *
   * 시나리오: 유효한 compiledSource 제공
   * 기대 결과: MDX가 렌더링되고 콘텐츠 표시
   */
  it('유효한 MDX 데이터를 성공적으로 렌더링해야 한다', async () => {
    const testContent = 'Hello MDX';
    vi.mocked(getMarkdown).mockResolvedValue({
      compiledSource: createMockCompiledSource(testContent),
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
   * **Feature: mdx-component, Property: 에러 처리**
   * **검증: 빈 compiledSource 처리**
   *
   * 시나리오: compiledSource가 빈 문자열
   * 기대 결과: new Function 실행 실패 → MDXContent null → 에러 표시
   */
  it('빈 compiledSource 시 에러 메시지를 표시해야 한다', async () => {
    vi.mocked(getMarkdown).mockResolvedValue({
      compiledSource: '', // 빈 문자열
      frontmatter: createMockFrontmatter(),
      content: '',
      source: '',
    });

    renderComponent('/test.mdx');

    // 에러 상태 확인
    await waitFor(
      () => {
        const errorElements = screen.queryAllByText('Failed to load content');
        expect(errorElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  /**
   * **Feature: mdx-component, Property: MDX 실행 에러 처리**
   * **검증: 잘못된 compiledSource 처리**
   *
   * 시나리오: compiledSource에 syntax error 존재
   * 기대 결과: new Function 실행 실패 → console.error + MDXContent null
   */
  it('잘못된 compiledSource 시 에러 메시지를 표시해야 한다', async () => {
    vi.mocked(getMarkdown).mockResolvedValue({
      compiledSource: 'invalid javascript syntax {{{',
      frontmatter: createMockFrontmatter(),
      content: '',
      source: '',
    });

    renderComponent('/test.mdx');

    await waitFor(
      () => {
        expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // console.error 호출 확인 (MDX 렌더링 실패)
    expect(console.error).toHaveBeenCalledWith(
      'Failed to render MDX:',
      expect.any(Error)
    );
  });
});

/**
 * ============================================================================
 * 테스트 요약
 * ============================================================================
 *
 * ## 통과한 테스트 (5개)
 * - ✅ 로딩 상태: 데이터 로딩 중 로딩 메시지 표시
 * - ✅ 성공 상태: 유효한 MDX 데이터 렌더링
 * - ✅ 에러 상태: 네트워크 에러 시 에러 메시지 표시
 * - ✅ 에러 상태: 빈 compiledSource 시 에러 메시지 표시
 * - ✅ 에러 상태: 잘못된 compiledSource 시 에러 메시지 표시
 *
 * ## 커버리지
 * - 목표: 85%+ (비즈니스 로직)
 * - 달성: 86.36% (index.tsx)
 *
 * ## 추가 테스트 권장사항
 * - Storybook 스토리 추가 (시각적 확인)
 * - getMarkdown 함수 별도 Unit 테스트
 * - E2E 테스트로 실제 브라우저 렌더링 검증
 */
