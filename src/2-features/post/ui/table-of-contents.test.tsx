import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import TableOfContents from './table-of-contents';

/**
 * TableOfContents 컴포넌트 테스트
 *
 * 검증 항목:
 * 1. headings props로 TOC 항목이 올바르게 렌더링되는지
 * 2. h2와 h3의 들여쓰기 차이 확인 (h3는 pl-6)
 * 3. 클릭 시 스크롤 동작 확인 (scrollIntoView 모킹)
 * 4. 빈 headings 배열 시 컴포넌트 비표시 또는 빈 상태
 * 5. IntersectionObserver 모킹하여 활성 섹션 변경 확인
 * 6. 모바일 토글 버튼 동작 확인 (열기/닫기)
 * 7. 접근성: role="navigation", aria-label 확인
 * 8. Property-based: 임의 headings 배열로 렌더링 안정성 확인
 * 9. 프로그래밍 스크롤 중 Observer 콜백이 activeId를 변경하지 않는지 확인
 * 10. 활성 항목에 왼쪽 보더 인디케이터 표시 확인
 */

// IntersectionObserver 모킹
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

let intersectionObserverCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  // IntersectionObserver 모킹 - 생성자로 동작하도록 수정
  const MockIntersectionObserver = vi.fn(function (
    this: IntersectionObserver,
    callback: IntersectionObserverCallback
  ) {
    intersectionObserverCallback = callback;
    this.observe = mockObserve;
    this.unobserve = mockUnobserve;
    this.disconnect = mockDisconnect;

    // readonly 속성은 Object.defineProperty로 설정
    Object.defineProperty(this, 'root', { value: null, writable: false });
    Object.defineProperty(this, 'rootMargin', { value: '', writable: false });
    Object.defineProperty(this, 'thresholds', { value: [], writable: false });

    this.takeRecords = vi.fn().mockReturnValue([]);
  }) as unknown as typeof IntersectionObserver;

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

  // scrollIntoView 모킹
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('TableOfContents', () => {
  const mockHeadings = [
    { id: 'heading-1', text: 'Introduction', level: 2 },
    { id: 'heading-2', text: 'Getting Started', level: 2 },
    { id: 'heading-3', text: 'Installation', level: 3 },
    { id: 'heading-4', text: 'Configuration', level: 3 },
    { id: 'heading-5', text: 'Advanced Topics', level: 2 },
  ];

  it('headings props로 TOC 항목이 올바르게 렌더링되어야 함', () => {
    render(<TableOfContents headings={mockHeadings} />);

    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Advanced Topics')).toBeInTheDocument();
  });

  it('h2와 h3의 들여쓰기 차이가 스타일에 반영되어야 함', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const h2Item = screen.getByText('Introduction').closest('button');
    const h3Item = screen.getByText('Installation').closest('button');

    expect(h2Item).toBeInTheDocument();
    expect(h3Item).toBeInTheDocument();

    // h3는 pl-6 클래스를 가져야 함 (들여쓰기)
    expect(h3Item?.className).toMatch(/pl-6/);
  });

  it('TOC 항목 클릭 시 해당 요소로 스크롤되어야 함', () => {
    // DOM에 실제 헤딩 요소 추가
    const heading1 = document.createElement('h2');
    heading1.id = 'heading-1';
    document.body.appendChild(heading1);

    render(<TableOfContents headings={mockHeadings} />);

    const tocItem = screen.getByText('Introduction');
    fireEvent.click(tocItem);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    document.body.removeChild(heading1);
  });

  it('빈 headings 배열 시 컴포넌트를 표시하지 않거나 빈 상태를 표시해야 함', () => {
    const { container } = render(<TableOfContents headings={[]} />);

    // role="navigation"이 없어야 함 (빈 배열일 때는 렌더링 안 함)
    const nav = container.querySelector('[role="navigation"]');
    expect(nav).toBeNull();
  });

  it('IntersectionObserver로 활성 섹션이 변경되어야 함', async () => {
    const heading1 = document.createElement('h2');
    heading1.id = 'heading-1';
    document.body.appendChild(heading1);

    render(<TableOfContents headings={mockHeadings} />);

    // IntersectionObserver 콜백 트리거
    if (intersectionObserverCallback) {
      const mockRect = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        right: 100,
        bottom: 100,
        left: 0,
        toJSON: () => ({}),
      };

      const entries = [
        {
          target: heading1,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: mockRect,
          intersectionRect: mockRect,
          rootBounds: mockRect,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ];

      intersectionObserverCallback(entries, {} as IntersectionObserver);
    }

    await waitFor(() => {
      const activeItem = screen.getByText('Introduction').closest('button');
      // 활성 항목은 특정 클래스를 가져야 함 (text-blue, font-semibold, border-l-2, border-blue 등)
      expect(activeItem?.className).toMatch(
        /text-blue|font-semibold|font-bold|border-l-2|border-blue/
      );
    });

    document.body.removeChild(heading1);
  });

  it('모바일 토글 버튼으로 TOC를 열고 닫을 수 있어야 함', () => {
    render(<TableOfContents headings={mockHeadings} />);

    // 토글 버튼 찾기 (버튼 텍스트는 "목차", "Table of Contents" 등)
    const toggleButton = screen.getByRole('button', {
      name: /목차|Table of Contents/i,
    });
    expect(toggleButton).toBeInTheDocument();

    // 토글 클릭 전: Introduction이 보이지 않거나 1개만 보임 (데스크탑은 hidden, 모바일은 닫힘)
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // 토글 클릭
    fireEvent.click(toggleButton);

    // TOC 표시 확인 - 모바일 TOC 영역에서 Introduction 찾기
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    const allIntroductions = screen.getAllByText('Introduction');
    expect(allIntroductions.length).toBeGreaterThanOrEqual(1);

    // 다시 토글 클릭
    fireEvent.click(toggleButton);

    // TOC가 닫힘
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('접근성: role="navigation"과 aria-label을 가져야 함', () => {
    render(<TableOfContents headings={mockHeadings} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/목차|Table of Contents/i)
    );
  });

  it('Property-based: 임의 headings 배열로 렌더링되어도 크래시하지 않아야 함', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            text: fc.string(),
            level: fc.integer({ min: 1, max: 6 }),
          })
        ),
        (headings) => {
          const { unmount } = render(<TableOfContents headings={headings} />);

          // 컴포넌트가 렌더링되어야 함 (크래시하지 않음)
          expect(document.body).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('중복된 id를 가진 headings도 안전하게 처리해야 함', () => {
    const duplicateHeadings = [
      { id: 'same-id', text: 'First', level: 2 },
      { id: 'same-id', text: 'Second', level: 2 },
      { id: 'same-id', text: 'Third', level: 3 },
    ];

    expect(() => {
      render(<TableOfContents headings={duplicateHeadings} />);
    }).not.toThrow();

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('매우 긴 제목 텍스트도 올바르게 표시되어야 함', () => {
    const longHeadings = [
      {
        id: 'long-1',
        text: 'This is a very long heading text that should be displayed correctly without breaking the layout or causing overflow issues',
        level: 2,
      },
    ];

    render(<TableOfContents headings={longHeadings} />);

    expect(
      screen.getByText(
        /This is a very long heading text that should be displayed correctly/
      )
    ).toBeInTheDocument();
  });

  it('level이 2와 3 외의 값도 안전하게 처리해야 함', () => {
    const mixedLevelHeadings = [
      { id: 'h1', text: 'H1 Heading', level: 1 },
      { id: 'h2', text: 'H2 Heading', level: 2 },
      { id: 'h4', text: 'H4 Heading', level: 4 },
      { id: 'h6', text: 'H6 Heading', level: 6 },
    ];

    expect(() => {
      render(<TableOfContents headings={mixedLevelHeadings} />);
    }).not.toThrow();
  });

  it('프로그래밍 스크롤 중에는 Observer 콜백이 activeId를 변경하지 않아야 함', async () => {
    const heading1 = document.createElement('h2');
    heading1.id = 'heading-1';
    const heading2 = document.createElement('h2');
    heading2.id = 'heading-2';
    document.body.appendChild(heading1);
    document.body.appendChild(heading2);

    render(<TableOfContents headings={mockHeadings} />);

    // 첫 번째 항목 클릭
    const tocItem1 = screen.getByText('Introduction');
    fireEvent.click(tocItem1);

    // scrollIntoView가 호출되었는지 확인
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

    // 클릭 직후 activeId가 heading-1로 설정됨
    await waitFor(() => {
      const activeItem = screen.getByText('Introduction').closest('button');
      expect(activeItem?.className).toMatch(/text-blue|font-semibold/);
    });

    // 즉시 IntersectionObserver 콜백 트리거 (프로그래밍 스크롤 중)
    // 이때 다른 섹션(heading-2)이 intersecting되더라도 activeId가 변경되지 않아야 함
    if (intersectionObserverCallback) {
      const mockRect = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        right: 100,
        bottom: 100,
        left: 0,
        toJSON: () => ({}),
      };

      const entries = [
        {
          target: heading2,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: mockRect,
          intersectionRect: mockRect,
          rootBounds: mockRect,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ];

      // 프로그래밍 스크롤 중에 콜백 호출
      intersectionObserverCallback(entries, {} as IntersectionObserver);
    }

    // activeId가 여전히 heading-1이어야 함 (heading-2로 변경되지 않음)
    // 참고: 실제 구현에서는 isScrollingRef 플래그가 이를 방지함
    // 이 테스트는 간접적으로 버그 수정을 검증함
    const activeItem = screen.getByText('Introduction').closest('button');
    expect(activeItem?.className).toMatch(/text-blue|font-semibold/);

    document.body.removeChild(heading1);
    document.body.removeChild(heading2);
  });

  it('활성 항목에 왼쪽 보더 인디케이터가 표시되어야 함', async () => {
    const heading1 = document.createElement('h2');
    heading1.id = 'heading-1';
    const heading2 = document.createElement('h2');
    heading2.id = 'heading-2';
    document.body.appendChild(heading1);
    document.body.appendChild(heading2);

    render(<TableOfContents headings={mockHeadings} />);

    // IntersectionObserver 콜백으로 heading-1을 활성화
    if (intersectionObserverCallback) {
      const mockRect = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        right: 100,
        bottom: 100,
        left: 0,
        toJSON: () => ({}),
      };

      const entries = [
        {
          target: heading1,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: mockRect,
          intersectionRect: mockRect,
          rootBounds: mockRect,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ];

      intersectionObserverCallback(entries, {} as IntersectionObserver);
    }

    await waitFor(() => {
      const activeItem = screen.getByText('Introduction').closest('button');
      // 활성 항목은 border-l-2 클래스를 가져야 함
      expect(activeItem?.className).toMatch(/border-l-2/);
      expect(activeItem?.className).toMatch(/border-blue/);
    });

    // 비활성 항목은 border-transparent 또는 border 관련 클래스가 없어야 함
    const inactiveItem = screen.getByText('Getting Started').closest('button');
    // 비활성 항목은 활성 스타일이 없어야 함
    expect(inactiveItem?.className).not.toMatch(/border-l-2.*border-blue-600/);

    document.body.removeChild(heading1);
    document.body.removeChild(heading2);
  });
});
