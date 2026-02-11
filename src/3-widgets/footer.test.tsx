import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import Footer from './footer';

/**
 * ============================================================================
 * Footer 위젯 테스트
 * ============================================================================
 *
 * ## 테스트 종류
 * 1. Unit 테스트: Footer 컴포넌트의 렌더링 및 스타일 검증
 *
 * ## 검증 항목
 * - 정상 케이스: footer 요소 렌더링, 저작권 텍스트 포함
 * - UI/UX: 텍스트 정렬, 여백, 다크 모드 스타일 클래스
 */

describe('Footer 위젯', () => {
  describe('정상 케이스', () => {
    it('footer 요소가 렌더링되어야 한다', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('저작권 텍스트가 포함되어야 한다', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      const currentYear = new Date().getFullYear();
      expect(footer).toHaveTextContent(
        `© ${currentYear} Chanho Kim's dev Blog. All rights reserved.`
      );
    });
  });

  describe('UI/UX (스타일 검증)', () => {
    it('text-center 클래스가 적용되어야 한다', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('text-center');
    });

    it('text-gray-600 클래스가 포함되어야 한다 (라이트 모드)', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('text-gray-600');
    });

    it('dark:text-gray-400 클래스가 포함되어야 한다 (다크 모드 지원)', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer.className).toMatch(/dark:text-gray-400/);
    });

    it('mt-10 클래스가 적용되어야 한다 (상단 여백)', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('mt-10');
    });

    it('py-6 클래스가 적용되어야 한다 (수직 패딩)', () => {
      render(<Footer />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('py-6');
    });
  });
});
