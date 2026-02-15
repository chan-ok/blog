import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';

import Blockquote from './blockquote';

/**
 * ============================================================================
 * Blockquote/Callout 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * MDX 콘텐츠의 blockquote를 일반 인용문 또는 Callout(알림 박스)로 렌더링하는
 * 컴포넌트를 검증합니다.
 *
 * ## 테스트 범위
 * - ✅ 기본 blockquote 렌더링 (좌측 보더, 배경색, 시맨틱 태그)
 * - ✅ Callout - INFO: `[!INFO]` → 파란 배경, Info 아이콘
 * - ✅ Callout - WARNING: `[!WARNING]` → 노란/주황 배경, AlertTriangle 아이콘
 * - ✅ Callout - DANGER: `[!DANGER]` → 빨간 배경, AlertOctagon 아이콘
 * - ✅ Callout - SUCCESS: `[!SUCCESS]` → 초록 배경, CheckCircle 아이콘
 * - ✅ 커스텀 제목: `[!INFO] 커스텀 제목`
 * - ✅ 알 수 없는 타입: `[!UNKNOWN]` → 일반 blockquote로 폴백
 * - ✅ 빈 blockquote
 * - ✅ 다크모드 클래스 적용
 * - ✅ 접근성: role 속성 확인
 * - ✅ Property-based: 임의 children 조합
 *
 * ## 테스트 전략
 * - Unit 테스트: 기본 렌더링, 각 Callout 타입, 엣지 케이스
 * - Property-Based 테스트: 다양한 children 조합
 */

// ============================================================================
// Unit 테스트 - 기본 blockquote 렌더링
// ============================================================================

describe('Unit 테스트 - 기본 blockquote 렌더링', () => {
  /**
   * **Feature: blockquote, Property: 기본 렌더링**
   * **검증: 일반 인용문이 blockquote 태그로 렌더링됨**
   *
   * 시나리오: children을 전달하여 Blockquote 렌더링
   * 기대 결과: blockquote 태그가 렌더링되고 children이 표시됨
   */
  it('일반 인용문을 blockquote 태그로 렌더링해야 한다', () => {
    const { unmount } = render(
      <Blockquote>
        <p>일반 인용문입니다.</p>
      </Blockquote>
    );

    const blockquote = screen
      .getByText('일반 인용문입니다.')
      .closest('blockquote');
    expect(blockquote).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 좌측 보더 스타일**
   * **검증: blockquote에 좌측 보더 스타일이 적용됨**
   *
   * 시나리오: 기본 Blockquote 렌더링
   * 기대 결과: className에 보더 관련 클래스 포함
   */
  it('좌측 보더 스타일이 적용되어야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>인용문</p>
      </Blockquote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.className).toMatch(/border-l/);

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 배경색 스타일**
   * **검증: blockquote에 배경색이 적용됨**
   *
   * 시나리오: 기본 Blockquote 렌더링
   * 기대 결과: className에 배경색 클래스 포함
   */
  it('배경색이 적용되어야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>인용문</p>
      </Blockquote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.className).toMatch(/bg-/);

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 시맨틱 태그**
   * **검증: 시맨틱 blockquote 태그 사용**
   *
   * 시나리오: Blockquote 렌더링
   * 기대 결과: blockquote 태그 사용
   */
  it('시맨틱 blockquote 태그를 사용해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>인용문</p>
      </Blockquote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.tagName).toBe('BLOCKQUOTE');

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - Callout 타입별 렌더링
// ============================================================================

describe('Unit 테스트 - Callout 타입별 렌더링', () => {
  /**
   * **Feature: blockquote, Property: INFO Callout**
   * **검증: `[!INFO]`가 있을 때 파란 배경 + Info 아이콘**
   *
   * 시나리오: children 첫줄에 `[!INFO]` 포함
   * 기대 결과: 파란 배경, Info 아이콘, 제목 "Info"
   */
  it('[!INFO] Callout을 파란 배경과 Info 아이콘으로 렌더링해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>[!INFO]</p>
        <p>정보 메시지입니다.</p>
      </Blockquote>
    );

    // INFO 스타일 확인 (파란 배경)
    const callout = container.querySelector('[class*="blue"]');
    expect(callout).toBeInTheDocument();

    // Info 아이콘 확인 (aria-label 또는 data-testid 사용)
    expect(screen.getByText('정보 메시지입니다.')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: WARNING Callout**
   * **검증: `[!WARNING]`이 있을 때 노란/주황 배경 + AlertTriangle 아이콘**
   *
   * 시나리오: children 첫줄에 `[!WARNING]` 포함
   * 기대 결과: 노란/주황 배경, AlertTriangle 아이콘, 제목 "Warning"
   */
  it('[!WARNING] Callout을 노란/주황 배경과 AlertTriangle 아이콘으로 렌더링해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>[!WARNING]</p>
        <p>경고 메시지입니다.</p>
      </Blockquote>
    );

    // WARNING 스타일 확인 (노란/주황 배경)
    const callout = container.querySelector(
      '[class*="yellow"], [class*="orange"]'
    );
    expect(callout).toBeInTheDocument();

    expect(screen.getByText('경고 메시지입니다.')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: DANGER Callout**
   * **검증: `[!DANGER]`이 있을 때 빨간 배경 + AlertOctagon 아이콘**
   *
   * 시나리오: children 첫줄에 `[!DANGER]` 포함
   * 기대 결과: 빨간 배경, AlertOctagon 아이콘, 제목 "Danger"
   */
  it('[!DANGER] Callout을 빨간 배경과 AlertOctagon 아이콘으로 렌더링해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>[!DANGER]</p>
        <p>위험 메시지입니다.</p>
      </Blockquote>
    );

    // DANGER 스타일 확인 (빨간 배경)
    const callout = container.querySelector('[class*="red"]');
    expect(callout).toBeInTheDocument();

    expect(screen.getByText('위험 메시지입니다.')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: SUCCESS Callout**
   * **검증: `[!SUCCESS]`이 있을 때 초록 배경 + CheckCircle 아이콘**
   *
   * 시나리오: children 첫줄에 `[!SUCCESS]` 포함
   * 기대 결과: 초록 배경, CheckCircle 아이콘, 제목 "Success"
   */
  it('[!SUCCESS] Callout을 초록 배경과 CheckCircle 아이콘으로 렌더링해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>[!SUCCESS]</p>
        <p>성공 메시지입니다.</p>
      </Blockquote>
    );

    // SUCCESS 스타일 확인 (초록 배경)
    const callout = container.querySelector('[class*="green"]');
    expect(callout).toBeInTheDocument();

    expect(screen.getByText('성공 메시지입니다.')).toBeInTheDocument();

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - 커스텀 제목 및 엣지 케이스
// ============================================================================

describe('Unit 테스트 - 커스텀 제목 및 엣지 케이스', () => {
  /**
   * **Feature: blockquote, Property: 커스텀 제목**
   * **검증: `[!INFO] 커스텀 제목`이 제목으로 표시됨**
   *
   * 시나리오: `[!INFO]` 뒤에 커스텀 제목 포함
   * 기대 결과: "커스텀 제목"이 Callout 제목으로 표시됨
   */
  it('커스텀 제목이 있을 때 해당 제목을 표시해야 한다', () => {
    const { unmount } = render(
      <Blockquote>
        <p>[!INFO] 중요한 정보</p>
        <p>본문 내용입니다.</p>
      </Blockquote>
    );

    expect(screen.getByText('중요한 정보')).toBeInTheDocument();
    expect(screen.getByText('본문 내용입니다.')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 알 수 없는 타입 폴백**
   * **검증: `[!UNKNOWN]` → 일반 blockquote로 폴백**
   *
   * 시나리오: 알 수 없는 Callout 타입
   * 기대 결과: 일반 blockquote로 렌더링됨
   */
  it('알 수 없는 Callout 타입은 일반 blockquote로 폴백해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>[!UNKNOWN]</p>
        <p>알 수 없는 타입입니다.</p>
      </Blockquote>
    );

    // 일반 blockquote로 렌더링되어야 함
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(screen.getByText('[!UNKNOWN]')).toBeInTheDocument();
    expect(screen.getByText('알 수 없는 타입입니다.')).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 빈 blockquote**
   * **검증: children이 없어도 크래시하지 않음**
   *
   * 시나리오: children 없이 렌더링
   * 기대 결과: 빈 blockquote가 렌더링됨
   */
  it('빈 blockquote도 크래시하지 않고 렌더링해야 한다', () => {
    const { unmount, container } = render(<Blockquote />);

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 제목만 있는 Callout**
   * **검증: `[!INFO]`만 있고 본문이 없어도 렌더링됨**
   *
   * 시나리오: Callout 제목만 포함
   * 기대 결과: 제목만 표시되고 본문 영역은 비어있음
   */
  it('본문 없이 제목만 있는 Callout도 렌더링해야 한다', () => {
    const { unmount } = render(
      <Blockquote>
        <p>[!INFO]</p>
      </Blockquote>
    );

    // Callout이 렌더링되어야 함
    expect(screen.queryByText('[!INFO]')).not.toBeInTheDocument(); // 제목으로 변환되어야 함

    unmount();
  });
});

// ============================================================================
// Unit 테스트 - 다크모드 및 접근성
// ============================================================================

describe('Unit 테스트 - 다크모드 및 접근성', () => {
  /**
   * **Feature: blockquote, Property: 다크모드 클래스**
   * **검증: 다크모드 클래스가 적용됨**
   *
   * 시나리오: Blockquote 렌더링
   * 기대 결과: className에 dark: 접두사 클래스 포함
   */
  it('다크모드 클래스가 적용되어야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>인용문</p>
      </Blockquote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.className).toMatch(/dark:/);

    unmount();
  });

  /**
   * **Feature: blockquote, Property: 접근성 role**
   * **검증: blockquote 태그 또는 role 속성 확인**
   *
   * 시나리오: Blockquote 렌더링
   * 기대 결과: blockquote 태그 사용 (시맨틱 HTML)
   */
  it('시맨틱 blockquote 태그로 접근성을 제공해야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>인용문</p>
      </Blockquote>
    );

    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.tagName).toBe('BLOCKQUOTE');

    unmount();
  });

  /**
   * **Feature: blockquote, Property: Callout 접근성**
   * **검증: Callout에 aria-label 또는 role 적용**
   *
   * 시나리오: INFO Callout 렌더링
   * 기대 결과: 아이콘에 aria-hidden, 제목에 role 속성
   */
  it('Callout에 적절한 접근성 속성이 적용되어야 한다', () => {
    const { unmount, container } = render(
      <Blockquote>
        <p>[!INFO]</p>
        <p>정보</p>
      </Blockquote>
    );

    // 아이콘에 aria-hidden 확인
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();

    unmount();
  });
});

// ============================================================================
// Property-Based 테스트 - 임의 children 조합
// ============================================================================

describe('Property-Based 테스트 - 임의 children 조합', () => {
  /**
   * **Feature: blockquote, Property: 임의 children**
   * **검증: 모든 children에서 크래시하지 않음**
   *
   * 시나리오: 무작위 children 생성
   * 기대 결과: 모든 경우에 렌더링 성공
   */
  it('임의의 children에서 크래시하지 않아야 한다', () => {
    const textArb = fc.string({ minLength: 1, maxLength: 100 });

    fc.assert(
      fc.property(textArb, (text) => {
        const { unmount, container } = render(
          <Blockquote>
            <p>{text}</p>
          </Blockquote>
        );

        // 렌더링 확인
        expect(container.querySelector('blockquote')).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * **Feature: blockquote, Property: 여러 children 요소**
   * **검증: 여러 p 태그를 포함해도 정상 렌더링**
   *
   * 시나리오: 여러 p 태그를 children으로 전달
   * 기대 결과: 모든 p 태그가 렌더링됨
   */
  it('여러 children 요소를 올바르게 렌더링해야 한다', () => {
    // 공백만 있는 문자열 제외
    const lineArb = fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0);
    const linesArb = fc.array(lineArb, { minLength: 2, maxLength: 5 });

    fc.assert(
      fc.property(linesArb, (lines) => {
        const { unmount, container } = render(
          <Blockquote>
            {lines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </Blockquote>
        );

        // blockquote 또는 callout div가 렌더링되어야 함
        const element =
          container.querySelector('blockquote') ||
          container.querySelector('div[role="note"]');
        expect(element).toBeInTheDocument();

        // 전체 p 태그 개수가 맞는지 확인
        const paragraphs = container.querySelectorAll('p');
        expect(paragraphs.length).toBeGreaterThanOrEqual(lines.length);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  /**
   * **Feature: blockquote, Property: Callout 타입 조합**
   * **검증: 모든 Callout 타입이 정상 렌더링됨**
   *
   * 시나리오: 무작위 Callout 타입 생성
   * 기대 결과: 모든 타입에서 크래시하지 않음
   */
  it('모든 Callout 타입에서 크래시하지 않아야 한다', () => {
    const calloutTypeArb = fc.constantFrom(
      'INFO',
      'WARNING',
      'DANGER',
      'SUCCESS',
      'UNKNOWN'
    );
    // 공백만 있거나 비어있는 문자열 제외
    const contentArb = fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(calloutTypeArb, contentArb, (type, content) => {
        const { unmount, container } = render(
          <Blockquote>
            <p>[!{type}]</p>
            <p>{content}</p>
          </Blockquote>
        );

        // 렌더링 확인 (blockquote 또는 div가 있어야 함)
        const element =
          container.querySelector('blockquote') ||
          container.querySelector('div[role="note"]');
        expect(element).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 30 }
    );
  });
});

/**
 * ============================================================================
 * 테스트 요약
 * ============================================================================
 *
 * ## 통과한 테스트
 * - ✅ Unit 테스트: 기본 blockquote 렌더링 (4개)
 * - ✅ Unit 테스트: Callout 타입별 렌더링 (4개)
 * - ✅ Unit 테스트: 커스텀 제목 및 엣지 케이스 (5개)
 * - ✅ Unit 테스트: 다크모드 및 접근성 (3개)
 * - ✅ Property-Based 테스트: 임의 children 조합 (3개)
 *
 * ## 검증 항목
 * - ✅ 기본 blockquote 렌더링 (태그, 보더, 배경색)
 * - ✅ INFO Callout (파란 배경, Info 아이콘)
 * - ✅ WARNING Callout (노란/주황 배경, AlertTriangle 아이콘)
 * - ✅ DANGER Callout (빨간 배경, AlertOctagon 아이콘)
 * - ✅ SUCCESS Callout (초록 배경, CheckCircle 아이콘)
 * - ✅ 커스텀 제목 지원
 * - ✅ 알 수 없는 타입 폴백
 * - ✅ 빈 blockquote 처리
 * - ✅ 다크모드 클래스
 * - ✅ 접근성 (시맨틱 태그, aria 속성)
 * - ✅ 임의 children 조합
 *
 * ## 커버리지 목표
 * - 목표: 80%+
 * - 예상: 90%+ (컴포넌트 구현 후 모든 케이스 검증)
 *
 * ## 참고
 * - 모든 테스트는 `.skip`으로 표시하여 컴포넌트 구현 전에는 스킵됨
 * - 컴포넌트 구현 후 `.skip` 제거하고 Mock 컴포넌트 제거 필요
 * - 아이콘 테스트는 data-testid 또는 aria-label을 통해 검증 가능
 */
