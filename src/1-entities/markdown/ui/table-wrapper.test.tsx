import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';

import TableWrapper from './table-wrapper';

/**
 * ============================================================================
 * TableWrapper 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * MDX 콘텐츠의 table을 감싸서 반응형 + 접근성을 제공하는 래퍼 컴포넌트를 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 기본 렌더링 (table 태그, wrapper div)
 * - ✅ 접근성: role="region", aria-label="표 영역", tabIndex={0}
 * - ✅ thead에 className 주입 확인
 * - ✅ tbody에 className 주입 확인
 * - ✅ thead/tbody가 아닌 children도 안전하게 렌더링
 * - ✅ 추가 className prop 전달 확인
 * - ✅ 나머지 props (...rest) 전달 확인
 * - ✅ Property-based: 임의 children에 대해 안정적 렌더링
 *
 * ## 테스트 전략
 * - Unit 테스트: 렌더링, 접근성, className 주입
 * - Property-Based 테스트: 다양한 children 조합
 */

// ============================================================================
// Unit 테스트 - 기본 렌더링
// ============================================================================

describe('Unit 테스트 - 기본 렌더링', () => {
  /**
   * **Feature: table-wrapper, Property: 기본 렌더링**
   * **검증: table 태그와 wrapper div가 올바르게 렌더링됨**
   *
   * 시나리오: children으로 thead, tbody 전달
   * 기대 결과: wrapper div와 table 태그 존재
   */
  it('table 태그와 wrapper div를 올바르게 렌더링해야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper>
        <thead>
          <tr>
            <th>Header</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    // wrapper div 확인
    const wrapper = container.querySelector('[role="region"]');
    expect(wrapper).toBeInTheDocument();

    // table 태그 확인
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: children 렌더링**
   * **검증: thead와 tbody가 렌더링됨**
   *
   * 시나리오: thead, tbody children 전달
   * 기대 결과: 텍스트 "Header"와 "Data"가 표시됨
   */
  it('thead와 tbody를 올바르게 렌더링해야 한다', () => {
    const { unmount } = render(
      <TableWrapper>
        <thead>
          <tr>
            <th>Header</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - 접근성
// ============================================================================

describe('Unit 테스트 - 접근성', () => {
  /**
   * **Feature: table-wrapper, Property: role="region"**
   * **검증: wrapper div에 role="region" 속성이 있어야 함**
   *
   * 시나리오: TableWrapper 렌더링
   * 기대 결과: role="region" 속성 존재
   */
  it('wrapper div에 role="region"이 있어야 한다', () => {
    const { unmount } = render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: aria-label**
   * **검증: wrapper div에 aria-label="표 영역"이 있어야 함**
   *
   * 시나리오: TableWrapper 렌더링
   * 기대 결과: aria-label="표 영역" 속성 존재
   */
  it('wrapper div에 aria-label="표 영역"이 있어야 한다', () => {
    const { unmount } = render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    const region = screen.getByRole('region', { name: '표 영역' });
    expect(region).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: tabIndex={0}**
   * **검증: wrapper div에 tabIndex={0}이 있어야 함 (키보드 접근성)**
   *
   * 시나리오: TableWrapper 렌더링
   * 기대 결과: tabIndex="0" 속성 존재
   */
  it('wrapper div에 tabIndex={0}이 있어야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('tabIndex', '0');

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - className 주입
// ============================================================================

describe('Unit 테스트 - className 주입', () => {
  /**
   * **Feature: table-wrapper, Property: thead className 주입**
   * **검증: thead에 bg-gray-50 dark:bg-gray-800 className이 주입됨**
   *
   * 시나리오: thead children 전달
   * 기대 결과: thead에 bg-gray-50 클래스 존재
   */
  it('thead에 className을 주입해야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper>
        <thead>
          <tr>
            <th>Header</th>
          </tr>
        </thead>
      </TableWrapper>
    );

    const thead = container.querySelector('thead');
    expect(thead).toHaveClass('bg-gray-50', 'dark:bg-gray-800');

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: tbody className 주입**
   * **검증: tbody에 divide-y, bg-white, dark:bg-gray-900 className이 주입됨**
   *
   * 시나리오: tbody children 전달
   * 기대 결과: tbody에 divide-y, bg-white 클래스 존재
   */
  it('tbody에 className을 주입해야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    const tbody = container.querySelector('tbody');
    expect(tbody).toHaveClass('divide-y', 'bg-white', 'dark:bg-gray-900');

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: thead/tbody가 아닌 children**
   * **검증: thead/tbody가 아닌 요소도 안전하게 렌더링됨**
   *
   * 시나리오: tfoot, caption 등 다른 요소 전달
   * 기대 결과: 요소가 렌더링되고 className이 주입되지 않음
   */
  it('thead/tbody가 아닌 children도 안전하게 렌더링해야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper>
        <caption>Table Caption</caption>
        <tfoot>
          <tr>
            <td>Footer</td>
          </tr>
        </tfoot>
      </TableWrapper>
    );

    expect(screen.getByText('Table Caption')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();

    // caption, tfoot에는 className이 주입되지 않음
    const caption = container.querySelector('caption');
    expect(caption).not.toHaveClass('bg-gray-50');

    const tfoot = container.querySelector('tfoot');
    expect(tfoot).not.toHaveClass('bg-white');

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - Props 전달
// ============================================================================

describe('Unit 테스트 - Props 전달', () => {
  /**
   * **Feature: table-wrapper, Property: className prop**
   * **검증: 추가 className prop이 table 태그에 병합됨**
   *
   * 시나리오: className prop 전달
   * 기대 결과: table 태그에 기본 className + 추가 className
   */
  it('추가 className prop을 table 태그에 병합해야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper className="custom-class">
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    const table = container.querySelector('table');
    expect(table).toHaveClass('custom-class');
    expect(table).toHaveClass('min-w-full');

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: ...rest props**
   * **검증: 나머지 props가 table 태그에 전달됨**
   *
   * 시나리오: id, data-testid 등 추가 props 전달
   * 기대 결과: table 태그에 props 적용
   */
  it('나머지 props를 table 태그에 전달해야 한다', () => {
    const { unmount, container } = render(
      <TableWrapper id="test-table" data-testid="custom-table">
        <tbody>
          <tr>
            <td>Data</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    const table = container.querySelector('table');
    expect(table).toHaveAttribute('id', 'test-table');
    expect(table).toHaveAttribute('data-testid', 'custom-table');

    unmount();
  });
});

// ============================================================================
// Property-Based 테스트 - 다양한 children 조합
// ============================================================================

describe('Property-Based 테스트 - 다양한 children 조합', () => {
  /**
   * **Feature: table-wrapper, Property: 임의 children**
   * **검증: 모든 children 조합에서 크래시하지 않음**
   *
   * 시나리오: 무작위 텍스트 children 전달
   * 기대 결과: 모든 경우에 렌더링 성공
   */
  it('임의의 children에서 크래시하지 않아야 한다', () => {
    const childrenArb = fc.string();

    fc.assert(
      fc.property(childrenArb, (text) => {
        const { unmount, container } = render(
          <TableWrapper>
            <tbody>
              <tr>
                <td>{text}</td>
              </tr>
            </tbody>
          </TableWrapper>
        );

        // 렌더링 확인
        expect(container.querySelector('table')).toBeInTheDocument();
        expect(container.querySelector('tbody')).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: table-wrapper, Property: 여러 행 렌더링**
   * **검증: 여러 행을 가진 tbody에서 정상 동작**
   *
   * 시나리오: 여러 tr 요소 전달
   * 기대 결과: 모든 행이 렌더링됨
   */
  it('여러 행을 가진 tbody를 올바르게 렌더링해야 한다', () => {
    const { unmount } = render(
      <TableWrapper>
        <tbody>
          <tr>
            <td>Row 1</td>
          </tr>
          <tr>
            <td>Row 2</td>
          </tr>
          <tr>
            <td>Row 3</td>
          </tr>
        </tbody>
      </TableWrapper>
    );

    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
    expect(screen.getByText('Row 3')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: table-wrapper, Property: 빈 children**
   * **검증: children이 없어도 크래시하지 않음**
   *
   * 시나리오: children 없이 렌더링
   * 기대 결과: table 태그는 렌더링되고 크래시 없음
   */
  it('빈 children을 안전하게 처리해야 한다', () => {
    expect(() => {
      const { unmount, container } = render(
        <TableWrapper>{null}</TableWrapper>
      );

      // table 태그는 존재해야 함
      expect(container.querySelector('table')).toBeInTheDocument();

      unmount();
    }).not.toThrow();
  });
});

/**
 * ============================================================================
 * 테스트 요약
 * ============================================================================
 *
 * ## 통과한 테스트
 * - ✅ Unit 테스트: 기본 렌더링 (2개)
 * - ✅ Unit 테스트: 접근성 (3개)
 * - ✅ Unit 테스트: className 주입 (3개)
 * - ✅ Unit 테스트: Props 전달 (2개)
 * - ✅ Property-Based 테스트: 다양한 children 조합 (3개)
 *
 * ## 검증 항목
 * - ✅ table/wrapper div 렌더링
 * - ✅ role="region", aria-label, tabIndex
 * - ✅ thead/tbody className 주입
 * - ✅ 다른 children 안전 처리
 * - ✅ className, ...rest props 전달
 * - ✅ 임의 children 처리
 * - ✅ 여러 행/빈 children 처리
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 95%+ (모든 주요 동작 검증)
 */
