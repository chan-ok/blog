import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';

import Button, { type ButtonVariant, type ButtonShape } from '.';

/**
 * ============================================================================
 * Button 컴포넌트 테스트
 * ============================================================================
 *
 * 이 파일은 Button 컴포넌트의 정확성을 검증하는 테스트를 포함합니다.
 *
 * ## 테스트 종류
 *
 * 1. **Property-Based 테스트 (속성 기반 테스트)**
 *    - fast-check 라이브러리를 사용하여 무작위 입력값으로 100회 반복 테스트
 *    - 특정 예시가 아닌 "모든 경우에 대해 참이어야 하는 규칙"을 검증
 *    - 예: "모든 variant와 shape 조합에서 다크 모드 클래스가 포함되어야 한다"
 *
 * 2. **Unit 테스트 (단위 테스트)**
 *    - 특정 시나리오에 대한 구체적인 동작 검증
 *    - 예: "children이 올바르게 렌더링되는가?"
 *
 * ## 사용된 라이브러리
 *
 * - **vitest**: 테스트 러너 (describe, it, expect 제공)
 * - **@testing-library/react**: React 컴포넌트 렌더링 및 DOM 쿼리
 * - **fast-check**: Property-Based 테스트를 위한 무작위 데이터 생성
 */

// ============================================================================
// 테스트 설정
// ============================================================================

/**
 * Testing Library는 Vitest와 함께 사용할 때 자동으로 cleanup 수행
 * (@testing-library/jest-dom/vitest import 시 활성화)
 */

// ============================================================================
// Property-Based 테스트를 위한 데이터 생성기 (Arbitraries)
// ============================================================================

/**
 * 모든 variant 값을 무작위로 생성하는 생성기
 * 테스트 실행 시 'primary', 'default', 'danger', 'link' 중 하나가 무작위로 선택됩니다.
 */
const variantArb = fc.constantFrom<ButtonVariant>(
  'primary',
  'default',
  'danger',
  'link'
);

/**
 * 모든 shape 값을 무작위로 생성하는 생성기
 * 테스트 실행 시 'fill', 'outline' 중 하나가 무작위로 선택됩니다.
 */
const shapeArb = fc.constantFrom<ButtonShape>('fill', 'outline');

/**
 * link를 제외한 variant 값을 무작위로 생성하는 생성기
 * link variant는 특별한 스타일 규칙을 가지므로 별도로 테스트합니다.
 */
const nonLinkVariantArb = fc.constantFrom<ButtonVariant>(
  'primary',
  'default',
  'danger'
);

// ============================================================================
// Property 4: Props 전달 테스트
// ============================================================================

/**
 * **Feature: button-component, Property 4: Props 전달**
 * **Validates: Requirements 5.2, 6.2, 6.3**
 *
 * ## 테스트 목적
 * Button 컴포넌트에 전달된 모든 props가 실제 DOM의 button 요소에
 * 올바르게 전달되는지 검증합니다.
 *
 * ## 왜 중요한가?
 * - 접근성(a11y)을 위해 aria-* 속성이 반드시 전달되어야 합니다
 * - 커스텀 스타일링을 위해 className이 병합되어야 합니다
 * - 폼 제출 등을 위해 type, name 등 HTML 속성이 전달되어야 합니다
 *
 * ## 테스트 방법
 * fast-check가 무작위 문자열을 생성하고, 해당 값이 렌더링된
 * button 요소의 속성에 존재하는지 확인합니다.
 */
describe('Property 4: Props 전달', () => {
  /**
   * aria-label 속성 전달 테스트
   *
   * 시나리오: 무작위 문자열을 aria-label로 전달
   * 기대 결과: button 요소에 동일한 aria-label 속성이 존재
   *
   * 예시:
   * - 입력: <Button aria-label="메뉴 열기">...</Button>
   * - 검증: button[aria-label="메뉴 열기"] 존재 확인
   */
  it('should pass aria attributes to the button element', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (label) => {
        // 무작위 label 값으로 Button 렌더링
        const { unmount } = render(
          <Button aria-label={label}>Click me</Button>
        );
        const button = screen.getByRole('button');

        // aria-label 속성이 전달된 값과 동일한지 확인
        expect(button).toHaveAttribute('aria-label', label);
        unmount();
      }),
      { numRuns: 30 }
    );
  });

  /**
   * className 속성 전달 테스트
   *
   * 시나리오: 무작위 CSS 클래스명을 className으로 전달
   * 기대 결과: button 요소의 className에 전달한 클래스가 포함됨
   *
   * 예시:
   * - 입력: <Button className="my-custom-class">...</Button>
   * - 검증: button.className에 "my-custom-class" 포함 확인
   *
   * 참고: 컴포넌트 내부 스타일과 사용자 className이 병합(merge)됩니다.
   */
  it('should pass className to the button element', () => {
    fc.assert(
      fc.property(
        // 유효한 CSS 클래스명 패턴으로 무작위 문자열 생성
        fc.stringMatching(/^[a-z][a-z0-9-]*$/),
        variantArb,
        shapeArb,
        (customClass, variant, shape) => {
          const { unmount } = render(
            <Button variant={variant} shape={shape} className={customClass}>
              Click me
            </Button>
          );
          const button = screen.getByRole('button');

          // 전달한 className이 button의 className에 포함되어 있는지 확인
          expect(button.className).toContain(customClass);
          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * HTML button 표준 속성 전달 테스트
   *
   * 시나리오: type과 name 속성을 무작위로 전달
   * 기대 결과: button 요소에 해당 속성들이 존재
   *
   * 예시:
   * - 입력: <Button type="submit" name="login-btn">...</Button>
   * - 검증: button[type="submit"][name="login-btn"] 존재 확인
   *
   * 이 테스트는 폼 제출 시 버튼이 올바르게 동작하는지 보장합니다.
   */
  it('should pass HTML button attributes to the button element', () => {
    fc.assert(
      fc.property(
        // button의 type 속성으로 가능한 값들
        fc.constantFrom('button', 'submit', 'reset') as fc.Arbitrary<
          'button' | 'submit' | 'reset'
        >,
        // 무작위 name 값
        fc.string({ minLength: 1, maxLength: 20 }),
        (type, name) => {
          const { unmount } = render(
            <Button type={type} name={name}>
              Click me
            </Button>
          );
          const button = screen.getByRole('button');

          // type과 name 속성이 올바르게 전달되었는지 확인
          expect(button).toHaveAttribute('type', type);
          expect(button).toHaveAttribute('name', name);
          unmount();
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Property 2: 일관된 기본 스타일 적용 테스트
// ============================================================================

/**
 * **Feature: button-component, Property 2: 일관된 기본 스타일 적용**
 * **Validates: Requirements 3.1, 3.2, 3.4**
 *
 * ## 테스트 목적
 * link를 제외한 모든 variant와 shape 조합에서 일관된 기본 스타일이
 * 적용되는지 검증합니다.
 *
 * ## 검증하는 스타일
 * - rounded-lg: 8px 둥근 모서리 (Requirements 3.1)
 * - px-4 py-2: 일관된 패딩 (Requirements 3.2)
 * - font-medium: 일관된 폰트 굵기 (Requirements 3.4)
 *
 * ## 왜 중요한가?
 * UI 일관성을 위해 모든 버튼이 동일한 기본 스타일을 가져야 합니다.
 * 이를 통해 사용자 경험이 향상되고 디자인 시스템이 유지됩니다.
 */
describe('Property 2: 일관된 기본 스타일 적용', () => {
  /**
   * 기본 스타일 클래스 적용 테스트
   *
   * 시나리오: primary/default/danger variant와 fill/outline shape의
   *          모든 조합(총 6가지)을 무작위로 테스트
   * 기대 결과: 모든 조합에서 rounded-lg, px-4, py-2, font-medium 클래스 존재
   *
   * 예시:
   * - <Button variant="primary" shape="fill"> → rounded-lg, px-4, py-2, font-medium ✓
   * - <Button variant="danger" shape="outline"> → rounded-lg, px-4, py-2, font-medium ✓
   */
  it('should apply consistent base styles for non-link variants', () => {
    fc.assert(
      fc.property(nonLinkVariantArb, shapeArb, (variant, shape) => {
        const { unmount } = render(
          <Button variant={variant} shape={shape}>
            Test Button
          </Button>
        );
        const button = screen.getByRole('button');
        const className = button.className;

        // Requirements 3.1: 둥근 모서리 (8px)
        expect(className).toContain('rounded-lg');

        // Requirements 3.2: 일관된 패딩
        expect(className).toContain('px-4');
        expect(className).toContain('py-2');

        // Requirements 3.4: 일관된 폰트 굵기
        expect(className).toContain('font-medium');
        unmount();
      }),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Property 1: Link variant는 shape을 무시함 테스트
// ============================================================================

/**
 * **Feature: button-component, Property 1: Link variant는 shape을 무시함**
 * **Validates: Requirements 2.4**
 *
 * ## 테스트 목적
 * link variant의 Button은 shape prop 값에 관계없이 항상 동일한
 * 스타일(배경/테두리 없음)이 적용되는지 검증합니다.
 *
 * ## 왜 이런 규칙이 있는가?
 * link variant는 텍스트 링크처럼 보여야 하므로:
 * - 배경색이 없어야 함 (bg-transparent)
 * - 테두리가 없어야 함
 * - 패딩이 없어야 함 (px-0 py-0)
 * - 둥근 모서리가 없어야 함
 *
 * shape="outline"을 전달해도 이 규칙은 변하지 않아야 합니다.
 */
describe('Property 1: Link variant는 shape을 무시함', () => {
  /**
   * link variant의 shape 무시 테스트
   *
   * 시나리오: link variant에 fill 또는 outline shape을 전달
   * 기대 결과: 어떤 shape을 전달해도 동일한 스타일이 적용됨
   *
   * 예시:
   * - <Button variant="link" shape="fill"> 의 className
   * - <Button variant="link" shape="outline"> 의 className
   * - 위 두 버튼의 className이 완전히 동일해야 함
   */
  it(
    'should apply identical styles for link variant regardless of shape',
    { timeout: 10000 },
    () => {
      fc.assert(
        fc.property(shapeArb, (shape) => {
          // 테스트할 shape으로 link variant 버튼 렌더링
          const { unmount: unmountLinkVariantButton } = render(
            <Button variant="link" shape={shape}>
              Link Button 1
            </Button>
          );
          const button1 = screen.getByRole('button', { name: 'Link Button 1' });
          const className1 = button1.className;

          // 비교 대상: fill shape의 link variant 버튼
          const { unmount: unmountLinkFillButton } = render(
            <Button variant="link" shape="fill">
              Link Button 2
            </Button>
          );
          const button2 = screen.getByRole('button', { name: 'Link Button 2' });
          const className2 = button2.className;

          // 핵심 검증: 두 버튼의 className이 완전히 동일해야 함
          // (shape이 무시되므로 fill이든 outline이든 같은 스타일)
          expect(className1).toBe(className2);

          // link variant는 둥근 모서리가 없어야 함
          expect(className1).not.toContain('rounded-lg');

          // link variant는 패딩이 없어야 함 (텍스트 링크처럼 보이기 위해)
          expect(className1).toContain('px-0');
          expect(className1).toContain('py-0');

          // link variant는 투명 배경이어야 함
          expect(className1).toContain('bg-transparent');
          unmountLinkVariantButton();
          unmountLinkFillButton();
        }),
        { numRuns: 30 }
      );
    }
  );
});

// ============================================================================
// Property 3: 다크 모드 클래스 포함 테스트
// ============================================================================

/**
 * **Feature: button-component, Property 3: 다크 모드 클래스 포함**
 * **Validates: Requirements 4.1**
 *
 * ## 테스트 목적
 * 모든 variant와 shape 조합에서 다크 모드 스타일 클래스(dark: 접두사)가
 * 포함되어 있는지 검증합니다.
 *
 * ## Tailwind CSS 다크 모드 작동 방식
 * - dark: 접두사가 붙은 클래스는 다크 모드에서만 적용됩니다
 * - 예: "dark:bg-white"는 다크 모드에서 배경을 흰색으로 변경
 * - 이 클래스들이 없으면 다크 모드에서 버튼이 제대로 보이지 않습니다
 *
 * ## 왜 중요한가?
 * 사용자가 다크 모드를 사용할 때도 버튼이 올바르게 표시되어야 합니다.
 * 다크 모드 클래스가 누락되면 가독성 문제가 발생할 수 있습니다.
 */
describe('Property 3: 다크 모드 클래스 포함', () => {
  /**
   * 다크 모드 클래스 존재 테스트
   *
   * 시나리오: 모든 variant(4개)와 shape(2개)의 조합(총 8가지)을 무작위로 테스트
   * 기대 결과: 모든 조합에서 dark: 접두사가 붙은 클래스가 최소 1개 이상 존재
   *
   * 예시:
   * - <Button variant="primary" shape="fill">
   *   → className에 "dark:bg-white dark:text-gray-900" 등 포함
   */
  it('should include dark mode classes for all variant/shape combinations', () => {
    fc.assert(
      fc.property(variantArb, shapeArb, (variant, shape) => {
        const { unmount } = render(
          <Button variant={variant} shape={shape}>
            Test Button
          </Button>
        );
        const button = screen.getByRole('button');
        const className = button.className;

        // dark: 접두사가 붙은 클래스가 최소 1개 이상 존재하는지 확인
        // 정규식 /dark:/는 "dark:"라는 문자열이 포함되어 있는지 검사
        expect(className).toMatch(/dark:/);
        unmount();
      }),
      { numRuns: 30 }
    );
  });
});

// ============================================================================
// Unit 테스트: 기본 기능 검증
// ============================================================================

/**
 * Button 컴포넌트 기본 기능 Unit 테스트
 *
 * Property-Based 테스트와 달리, 특정 시나리오에 대한 구체적인 동작을 검증합니다.
 * 이 테스트들은 컴포넌트의 핵심 기능이 올바르게 작동하는지 확인합니다.
 */
describe('Button Component - Unit Tests', () => {
  /**
   * children 렌더링 테스트
   *
   * 시나리오: Button에 텍스트 children 전달
   * 기대 결과: 버튼 내부에 해당 텍스트가 표시됨
   *
   * 이 테스트는 가장 기본적인 기능인 "버튼에 내용이 표시되는가"를 검증합니다.
   */
  it('renders children correctly', () => {
    const { unmount } = render(<Button>Click me</Button>);

    // screen.getByRole('button')은 접근성 역할로 요소를 찾습니다
    // 이 방식은 실제 사용자가 스크린 리더로 페이지를 탐색하는 것과 유사합니다
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
    unmount();
  });

  /**
   * 기본값 적용 테스트
   *
   * 시나리오: variant와 shape을 지정하지 않고 Button 렌더링
   * 기대 결과: 기본값인 variant="default", shape="fill" 스타일이 적용됨
   *
   * 이 테스트는 props를 생략했을 때 합리적인 기본값이 적용되는지 확인합니다.
   * (Requirements 1.5, 2.3)
   */
  it('applies default variant and shape when not specified', () => {
    const { unmount } = render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');

    // default variant + fill shape의 스타일 확인
    // bg-gray-100: 연한 회색 배경 (default fill의 특징)
    // text-gray-900: 어두운 텍스트 색상
    expect(button.className).toContain('bg-gray-100');
    expect(button.className).toContain('text-gray-900');
    unmount();
  });

  /**
   * disabled 상태 스타일 테스트
   *
   * 시나리오: disabled prop을 true로 설정
   * 기대 결과: 비활성화 상태를 나타내는 스타일 클래스가 적용됨
   *
   * 이 테스트는 버튼이 비활성화되었을 때 시각적으로 구분되는지 확인합니다.
   * (Requirements 5.3)
   */
  it('applies disabled styles when disabled', () => {
    const { unmount } = render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');

    // disabled 상태 스타일 확인
    // disabled:opacity-50: 50% 투명도로 흐리게 표시
    // disabled:cursor-not-allowed: 마우스 커서가 금지 아이콘으로 변경
    expect(button.className).toContain('disabled:opacity-50');
    expect(button.className).toContain('disabled:cursor-not-allowed');
    unmount();
  });

  /**
   * disabled 상태에서 onClick 미호출 테스트
   *
   * 시나리오: disabled 버튼을 클릭
   * 기대 결과: onClick 핸들러가 호출되지 않음
   */
  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    const { unmount } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
    unmount();
  });
});
