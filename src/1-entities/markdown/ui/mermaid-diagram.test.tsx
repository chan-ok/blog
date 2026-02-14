import { render, screen, waitFor } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from 'vitest';
import * as fc from 'fast-check';
import MermaidDiagram from './mermaid-diagram';

/**
 * MermaidDiagram 컴포넌트 테스트
 *
 * 검증 항목:
 * 1. mermaid 로딩 중 로딩 표시 확인
 * 2. mermaid 렌더링 성공 시 SVG 표시 확인
 * 3. mermaid 렌더링 실패 시 에러 메시지 + 원본 코드 fallback 확인
 * 4. 다크모드 배경 클래스 확인 (bg-gray-900)
 * 5. 코드 변경 시 재렌더링 확인
 * 6. Property-based: 임의 문자열로 크래시하지 않음
 */

// mermaid 패키지 모킹 (dynamic import 지원)
const mockRender = vi.fn();
const mockInitialize = vi.fn();

// @ts-expect-error - Mocking module
globalThis.mermaid = {
  initialize: mockInitialize,
  render: mockRender,
};

vi.mock('mermaid', async () => {
  return {
    default: {
      initialize: mockInitialize,
      render: mockRender,
    },
  };
});

describe('MermaidDiagram', () => {
  beforeAll(() => {
    // jsdom에서 SVGElement.getBBox가 없어서 발생하는 에러 방지
    if (typeof SVGElement !== 'undefined') {
      // @ts-expect-error - Mocking missing method in jsdom
      SVGElement.prototype.getBBox = vi.fn().mockReturnValue({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mermaid 로딩 중 로딩 표시를 렌더링해야 함', () => {
    // mermaid.render가 pending 상태로 유지
    mockRender.mockReturnValue(new Promise(() => {}));

    render(<MermaidDiagram code="graph TD; A-->B;" />);

    expect(screen.getByText(/로딩|Loading/i)).toBeInTheDocument();
  });

  it('mermaid 렌더링 성공 시 SVG를 표시해야 함', async () => {
    const mockSvgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>';
    mockRender.mockResolvedValue({ svg: mockSvgContent });

    render(<MermaidDiagram code="graph TD; A-->B;" />);

    await waitFor(() => {
      const svgContainer = screen.getByTestId('mermaid-svg');
      expect(svgContainer.innerHTML).toContain('svg');
      expect(svgContainer.innerHTML).toContain('circle');
    });
  });

  it('mermaid 렌더링 실패 시 에러 메시지와 원본 코드를 표시해야 함', async () => {
    mockRender.mockRejectedValue(new Error('Syntax error'));

    const originalCode = 'invalid mermaid code';
    render(<MermaidDiagram code={originalCode} />);

    await waitFor(() => {
      // 에러 메시지: "Failed to render Mermaid diagram:"로 시작하는 텍스트
      expect(
        screen.getByText(/Failed to render Mermaid diagram:/i)
      ).toBeInTheDocument();
      // 원본 코드는 <pre> 태그 내부에 표시
      expect(screen.getByText(originalCode)).toBeInTheDocument();
    });
  });

  it('다크모드 배경 클래스(bg-gray-900)를 적용해야 함', () => {
    mockRender.mockResolvedValue({ svg: '<svg></svg>' });

    const { container } = render(<MermaidDiagram code="graph TD; A-->B;" />);

    const darkBgElement = container.querySelector('.bg-gray-900');
    expect(darkBgElement).toBeInTheDocument();
  });

  it('코드 변경 시 재렌더링되어야 함', async () => {
    const mockSvg1 = '<svg id="svg1"></svg>';
    const mockSvg2 = '<svg id="svg2"></svg>';

    mockRender
      .mockResolvedValueOnce({ svg: mockSvg1 })
      .mockResolvedValueOnce({ svg: mockSvg2 });

    const { rerender } = render(<MermaidDiagram code="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-svg').innerHTML).toContain('svg1');
    });

    rerender(<MermaidDiagram code="graph TD; C-->D;" />);

    await waitFor(() => {
      expect(screen.getByTestId('mermaid-svg').innerHTML).toContain('svg2');
    });
  });

  it('빈 문자열 코드로도 크래시하지 않아야 함', () => {
    mockRender.mockResolvedValue({ svg: '<svg></svg>' });

    expect(() => {
      render(<MermaidDiagram code="" />);
    }).not.toThrow();
  });

  it('Property-based: 임의 문자열을 code prop으로 전달해도 크래시하지 않아야 함', () => {
    mockRender.mockImplementation((id: string, code: string) => {
      // 임의 문자열에 대해 성공 또는 실패 응답
      if (code.length % 2 === 0) {
        return Promise.resolve({ svg: '<svg></svg>' });
      }
      return Promise.reject(new Error('Random error'));
    });

    fc.assert(
      fc.property(fc.string(), (code) => {
        const { unmount } = render(<MermaidDiagram code={code} />);

        // 컴포넌트가 렌더링되어야 함 (크래시하지 않음)
        expect(document.body).toBeTruthy();

        unmount();
      }),
      { numRuns: 30 }
    );
  });

  it('여러 다이어그램 인스턴스가 동시에 렌더링되어도 충돌하지 않아야 함', async () => {
    mockRender.mockResolvedValue({ svg: '<svg></svg>' });

    const { container } = render(
      <div>
        <MermaidDiagram code="graph TD; A-->B;" />
        <MermaidDiagram code="graph LR; X-->Y;" />
      </div>
    );

    await waitFor(() => {
      const diagrams = container.querySelectorAll(
        '[data-testid="mermaid-svg"]'
      );
      expect(diagrams.length).toBe(2);
    });
  });
});
