import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ErrorPage } from '.';

/**
 * ============================================================================
 * ErrorPage 컴포넌트 테스트
 * ============================================================================
 *
 * 이 파일은 ErrorPage 컴포넌트의 정확성을 검증하는 테스트를 포함합니다.
 *
 * ## 검증 항목
 *
 * 1. **렌더링**
 *    - 404, 403, 500 상태 코드별 기본 메시지 표시
 *    - 커스텀 title과 description 표시
 *    - 다크 모드 지원
 *
 * 2. **버튼 동작**
 *    - onGoHome 콜백이 있으면 "Go Home" 버튼 렌더링 및 클릭 시 호출
 *    - onRetry 콜백이 있으면 "Try Again" 버튼 렌더링 및 클릭 시 호출
 *    - onRetry가 없으면 "Try Again" 버튼 미렌더링
 *
 * 3. **접근성**
 *    - role="alert" 설정
 *    - 버튼에 접근 가능한 텍스트
 *
 * ## 사용된 라이브러리
 *
 * - **vitest**: 테스트 러너 (describe, it, expect 제공)
 * - **@testing-library/react**: React 컴포넌트 렌더링 및 DOM 쿼리
 * - **@testing-library/user-event**: 사용자 인터랙션 시뮬레이션
 * - **react-i18next**: i18n 모킹
 */

// ============================================================================
// i18next 모킹
// ============================================================================

/**
 * useTranslation 훅을 모킹하여 영어 번역 반환
 * 실제 i18n 라이브러리 없이 테스트 가능하도록 설정
 */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'error.notFound': 'Page Not Found',
        'error.notFoundDesc':
          "The page you're looking for doesn't exist or has been moved.",
        'error.forbidden': 'Access Denied',
        'error.forbiddenDesc': "You don't have permission to access this page.",
        'error.serverError': 'Something Went Wrong',
        'error.serverErrorDesc':
          'An unexpected error occurred. Please try again later.',
        'error.goHome': 'Go Home',
        'error.retry': 'Try Again',
      };
      return translations[key] ?? key;
    },
  }),
}));

// ============================================================================
// Unit 테스트: 렌더링
// ============================================================================

describe('ErrorPage', () => {
  describe('렌더링', () => {
    /**
     * 404 상태 코드와 기본 메시지 렌더링 테스트
     *
     * 시나리오: statusCode=404로 ErrorPage 렌더링
     * 기대 결과: "Page Not Found" 제목과 기본 설명 표시
     */
    it('404 상태 코드와 기본 메시지를 올바르게 렌더링해야 한다', () => {
      const { unmount } = render(
        <ErrorPage statusCode={404} onGoHome={vi.fn()} />
      );

      // 제목과 설명이 표시되는지 확인
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(
          "The page you're looking for doesn't exist or has been moved."
        )
      ).toBeInTheDocument();

      unmount();
    });

    /**
     * 403 상태 코드와 기본 메시지 렌더링 테스트
     *
     * 시나리오: statusCode=403으로 ErrorPage 렌더링
     * 기대 결과: "Access Denied" 제목과 기본 설명 표시
     */
    it('403 상태 코드와 기본 메시지를 올바르게 렌더링해야 한다', () => {
      const { unmount } = render(
        <ErrorPage statusCode={403} onGoHome={vi.fn()} />
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText("You don't have permission to access this page.")
      ).toBeInTheDocument();

      unmount();
    });

    /**
     * 500 상태 코드와 기본 메시지 렌더링 테스트
     *
     * 시나리오: statusCode=500으로 ErrorPage 렌더링
     * 기대 결과: "Something Went Wrong" 제목과 기본 설명 표시
     */
    it('500 상태 코드와 기본 메시지를 올바르게 렌더링해야 한다', () => {
      const { unmount } = render(
        <ErrorPage statusCode={500} onGoHome={vi.fn()} />
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(
        screen.getByText(
          'An unexpected error occurred. Please try again later.'
        )
      ).toBeInTheDocument();

      unmount();
    });

    /**
     * 커스텀 title과 description 표시 테스트
     *
     * 시나리오: title과 description props 전달
     * 기대 결과: 기본값 대신 커스텀 값 표시
     */
    it('커스텀 title과 description을 표시해야 한다', () => {
      const customTitle = 'Custom Error';
      const customDescription = 'This is a custom error message.';

      const { unmount } = render(
        <ErrorPage
          statusCode={404}
          title={customTitle}
          description={customDescription}
          onGoHome={vi.fn()}
        />
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();

      // 기본 메시지가 표시되지 않는지 확인
      expect(screen.queryByText('Page Not Found')).not.toBeInTheDocument();

      unmount();
    });
  });

  // ============================================================================
  // Unit 테스트: 버튼 동작
  // ============================================================================

  describe('버튼 동작', () => {
    /**
     * onGoHome 콜백 버튼 렌더링 및 클릭 테스트
     *
     * 시나리오: onGoHome 콜백 전달
     * 기대 결과: "Go Home" 버튼이 렌더링되고 클릭 시 콜백 호출
     */
    it('onGoHome 콜백이 있으면 "Go Home" 버튼을 렌더링하고 클릭 시 호출해야 한다', async () => {
      const handleGoHome = vi.fn();
      const user = userEvent.setup();

      const { unmount } = render(
        <ErrorPage statusCode={404} onGoHome={handleGoHome} />
      );

      // "Go Home" 버튼이 존재하는지 확인
      const goHomeButton = screen.getByRole('button', { name: /Go Home/i });
      expect(goHomeButton).toBeInTheDocument();

      // 버튼 클릭
      await user.click(goHomeButton);

      // 콜백이 호출되었는지 확인
      expect(handleGoHome).toHaveBeenCalledTimes(1);

      unmount();
    });

    /**
     * onRetry 콜백 버튼 렌더링 및 클릭 테스트
     *
     * 시나리오: onRetry 콜백 전달
     * 기대 결과: "Try Again" 버튼이 렌더링되고 클릭 시 콜백 호출
     */
    it('onRetry 콜백이 있으면 "Try Again" 버튼을 렌더링하고 클릭 시 호출해야 한다', async () => {
      const handleRetry = vi.fn();
      const user = userEvent.setup();

      const { unmount } = render(
        <ErrorPage statusCode={500} onRetry={handleRetry} onGoHome={vi.fn()} />
      );

      // "Try Again" 버튼이 존재하는지 확인
      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      expect(retryButton).toBeInTheDocument();

      // 버튼 클릭
      await user.click(retryButton);

      // 콜백이 호출되었는지 확인
      expect(handleRetry).toHaveBeenCalledTimes(1);

      unmount();
    });

    /**
     * onRetry 없을 때 "Try Again" 버튼 미렌더링 테스트
     *
     * 시나리오: onRetry 콜백 없이 ErrorPage 렌더링
     * 기대 결과: "Try Again" 버튼이 렌더링되지 않음
     */
    it('onRetry가 없으면 "Try Again" 버튼이 렌더링되지 않아야 한다', () => {
      const { unmount } = render(
        <ErrorPage statusCode={500} onGoHome={vi.fn()} />
      );

      // "Try Again" 버튼이 존재하지 않는지 확인
      expect(
        screen.queryByRole('button', { name: /Try Again/i })
      ).not.toBeInTheDocument();

      unmount();
    });
  });

  // ============================================================================
  // Unit 테스트: 접근성
  // ============================================================================

  describe('접근성', () => {
    /**
     * role="alert" 설정 테스트
     *
     * 시나리오: ErrorPage 렌더링
     * 기대 결과: role="alert"가 설정된 요소 존재
     *
     * 이 테스트는 스크린 리더 사용자에게 에러 메시지가
     * 즉시 알림으로 전달되는지 확인합니다.
     */
    it('role="alert"가 설정되어 있어야 한다', () => {
      const { unmount } = render(
        <ErrorPage statusCode={404} onGoHome={vi.fn()} />
      );

      // role="alert" 요소가 존재하는지 확인
      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();

      unmount();
    });

    /**
     * 버튼 접근성 테스트
     *
     * 시나리오: onGoHome과 onRetry 콜백 전달
     * 기대 결과: 모든 버튼에 접근 가능한 텍스트 존재
     */
    it('버튼에 접근 가능한 텍스트가 있어야 한다', () => {
      const handleGoHome = vi.fn();
      const handleRetry = vi.fn();

      const { unmount } = render(
        <ErrorPage
          statusCode={500}
          onGoHome={handleGoHome}
          onRetry={handleRetry}
        />
      );

      // 모든 버튼이 접근 가능한 텍스트를 가지고 있는지 확인
      expect(
        screen.getByRole('button', { name: /Go Home/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Try Again/i })
      ).toBeInTheDocument();

      unmount();
    });
  });
});
