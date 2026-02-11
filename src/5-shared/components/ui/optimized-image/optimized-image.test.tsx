/**
 * ============================================================================
 * OptimizedImage 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 종류
 * 1. Unit 테스트: 외부/로컬 이미지 렌더링, priority, props 전달
 * 2. Property-Based 테스트: 다양한 src/priority/dimension 조합 검증
 *
 * ## 검증 항목
 * - 외부 이미지 (http/https) 렌더링 및 lazy loading
 * - 로컬 이미지 (/image/*) 렌더링 및 lazy loading
 * - priority=true 시 eager loading
 * - width, height, className props 전달
 * - decoding="async" 적용
 * - 모든 props 조합에서 렌더링 성공
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';

import OptimizedImage from '.';

describe('OptimizedImage 컴포넌트', () => {
  describe('정상 케이스', () => {
    it('외부 이미지 (https)를 올바르게 렌더링해야 한다', () => {
      const externalSrc = 'https://example.com/image.jpg';
      render(<OptimizedImage src={externalSrc} alt="External image" />);

      const img = screen.getByRole('img', { name: 'External image' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', externalSrc);
    });

    it('외부 이미지 (http)를 올바르게 렌더링해야 한다', () => {
      const externalSrc = 'http://example.com/image.jpg';
      render(<OptimizedImage src={externalSrc} alt="HTTP image" />);

      const img = screen.getByRole('img', { name: 'HTTP image' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', externalSrc);
    });

    it('로컬 이미지 (/image/*)를 올바르게 렌더링해야 한다', () => {
      const localSrc = '/image/git-profile.png';
      render(<OptimizedImage src={localSrc} alt="Local image" />);

      const img = screen.getByRole('img', { name: 'Local image' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', localSrc);
    });
  });

  describe('Lazy Loading 동작', () => {
    it('기본적으로 loading="lazy"가 적용되어야 한다 (외부 이미지)', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Lazy external"
        />
      );

      const img = screen.getByRole('img', { name: 'Lazy external' });
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('기본적으로 loading="lazy"가 적용되어야 한다 (로컬 이미지)', () => {
      render(<OptimizedImage src="/image/git-profile.png" alt="Lazy local" />);

      const img = screen.getByRole('img', { name: 'Lazy local' });
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('priority=true 시 loading="eager"가 적용되어야 한다 (외부 이미지)', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Eager external"
          priority
        />
      );

      const img = screen.getByRole('img', { name: 'Eager external' });
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('priority=true 시 loading="eager"가 적용되어야 한다 (로컬 이미지)', () => {
      render(
        <OptimizedImage
          src="/image/git-profile.png"
          alt="Eager local"
          priority
        />
      );

      const img = screen.getByRole('img', { name: 'Eager local' });
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('priority=false 명시 시 loading="lazy"가 적용되어야 한다', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Explicit lazy"
          priority={false}
        />
      );

      const img = screen.getByRole('img', { name: 'Explicit lazy' });
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Props 전달', () => {
    it('width와 height props가 올바르게 전달되어야 한다', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Sized image"
          width={800}
          height={600}
        />
      );

      const img = screen.getByRole('img', { name: 'Sized image' });
      expect(img).toHaveAttribute('width', '800');
      expect(img).toHaveAttribute('height', '600');
    });

    it('className이 올바르게 전달되어야 한다', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Styled image"
          className="rounded-lg shadow-md"
        />
      );

      const img = screen.getByRole('img', { name: 'Styled image' });
      expect(img).toHaveClass('rounded-lg', 'shadow-md');
    });

    it('모든 props를 조합하여 전달해도 올바르게 렌더링되어야 한다', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Full props"
          width={1200}
          height={800}
          priority
          className="w-full h-auto object-cover"
        />
      );

      const img = screen.getByRole('img', { name: 'Full props' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('width', '1200');
      expect(img).toHaveAttribute('height', '800');
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveClass('w-full', 'h-auto', 'object-cover');
    });
  });

  describe('Decoding 속성', () => {
    it('decoding="async"가 항상 적용되어야 한다 (외부 이미지)', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Async decoding external"
        />
      );

      const img = screen.getByRole('img', { name: 'Async decoding external' });
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('decoding="async"가 항상 적용되어야 한다 (로컬 이미지)', () => {
      render(
        <OptimizedImage
          src="/image/git-profile.png"
          alt="Async decoding local"
        />
      );

      const img = screen.getByRole('img', { name: 'Async decoding local' });
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  describe('경계 조건', () => {
    it('width와 height가 없어도 렌더링되어야 한다', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="No dimensions"
        />
      );

      const img = screen.getByRole('img', { name: 'No dimensions' });
      expect(img).toBeInTheDocument();
      expect(img).not.toHaveAttribute('width');
      expect(img).not.toHaveAttribute('height');
    });

    it('className이 빈 문자열이어도 렌더링되어야 한다', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Empty className"
          className=""
        />
      );

      const img = screen.getByRole('img', { name: 'Empty className' });
      expect(img).toBeInTheDocument();
    });

    it('alt가 빈 문자열이어도 렌더링되어야 한다 (장식용 이미지)', () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="" />
      );

      // alt=""인 이미지는 getByRole로 찾기 어려우므로 container에서 직접 확인
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', '');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  describe('외부/로컬 이미지 분기 로직', () => {
    it('https로 시작하는 URL은 외부 이미지로 처리되어야 한다', () => {
      render(
        <OptimizedImage src="https://cdn.example.com/image.png" alt="HTTPS" />
      );

      const img = screen.getByRole('img', { name: 'HTTPS' });
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/image.png');
    });

    it('http로 시작하는 URL은 외부 이미지로 처리되어야 한다', () => {
      render(
        <OptimizedImage src="http://cdn.example.com/image.png" alt="HTTP" />
      );

      const img = screen.getByRole('img', { name: 'HTTP' });
      expect(img).toHaveAttribute('src', 'http://cdn.example.com/image.png');
    });

    it('/로 시작하는 경로는 로컬 이미지로 처리되어야 한다', () => {
      render(<OptimizedImage src="/image/context.png" alt="Local path" />);

      const img = screen.getByRole('img', { name: 'Local path' });
      expect(img).toHaveAttribute('src', '/image/context.png');
    });

    it('상대 경로는 로컬 이미지로 처리되어야 한다', () => {
      render(<OptimizedImage src="./assets/image.png" alt="Relative path" />);

      const img = screen.getByRole('img', { name: 'Relative path' });
      expect(img).toHaveAttribute('src', './assets/image.png');
    });
  });

  describe('Property-Based 테스트', () => {
    // Arbitrary 정의
    const srcArb = fc.oneof(
      // 로컬 이미지
      fc.constantFrom(
        '/image/git-profile.png',
        '/image/context.png',
        '/assets/logo.svg',
        './local/image.jpg'
      ),
      // 외부 이미지
      fc.constantFrom(
        'https://example.com/image.jpg',
        'https://cdn.example.com/photo.png',
        'https://raw.githubusercontent.com/user/repo/main/image.webp',
        'http://example.com/old-image.gif'
      )
    );

    const priorityArb = fc.boolean();
    const dimensionArb = fc.integer({ min: 100, max: 2000 });
    const classNameArb = fc.constantFrom(
      '',
      'rounded-lg',
      'w-full h-auto',
      'object-cover shadow-md',
      'mx-auto block'
    );

    it('모든 src 조합에서 렌더링이 성공해야 한다', () => {
      fc.assert(
        fc.property(srcArb, (src) => {
          const { unmount } = render(
            <OptimizedImage src={src} alt="Test image" />
          );

          const img = screen.getByRole('img', { name: 'Test image' });
          expect(img).toBeInTheDocument();
          expect(img).toHaveAttribute('src', src);

          unmount(); // Property-based 테스트에서는 unmount 필수!
        }),
        { numRuns: 30 }
      );
    });

    it('모든 priority 조합에서 올바른 loading 속성이 적용되어야 한다', () => {
      fc.assert(
        fc.property(srcArb, priorityArb, (src, priority) => {
          const { unmount } = render(
            <OptimizedImage src={src} alt="Priority test" priority={priority} />
          );

          const img = screen.getByRole('img', { name: 'Priority test' });
          const expectedLoading = priority ? 'eager' : 'lazy';
          expect(img).toHaveAttribute('loading', expectedLoading);

          unmount();
        }),
        { numRuns: 30 }
      );
    });

    it('모든 dimension 조합에서 width/height가 올바르게 적용되어야 한다', () => {
      fc.assert(
        fc.property(
          srcArb,
          dimensionArb,
          dimensionArb,
          (src, width, height) => {
            const { unmount } = render(
              <OptimizedImage
                src={src}
                alt="Dimension test"
                width={width}
                height={height}
              />
            );

            const img = screen.getByRole('img', { name: 'Dimension test' });
            expect(img).toHaveAttribute('width', width.toString());
            expect(img).toHaveAttribute('height', height.toString());

            unmount();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('모든 props 조합에서 렌더링이 성공하고 decoding="async"가 적용되어야 한다', () => {
      fc.assert(
        fc.property(
          srcArb,
          priorityArb,
          dimensionArb,
          dimensionArb,
          classNameArb,
          (src, priority, width, height, className) => {
            const { unmount } = render(
              <OptimizedImage
                src={src}
                alt="Full props test"
                priority={priority}
                width={width}
                height={height}
                className={className}
              />
            );

            const img = screen.getByRole('img', { name: 'Full props test' });

            // 기본 검증
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', src);
            expect(img).toHaveAttribute('decoding', 'async');

            // loading 검증
            const expectedLoading = priority ? 'eager' : 'lazy';
            expect(img).toHaveAttribute('loading', expectedLoading);

            // dimension 검증
            expect(img).toHaveAttribute('width', width.toString());
            expect(img).toHaveAttribute('height', height.toString());

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('외부/로컬 이미지 분기 로직이 정확해야 한다', () => {
      fc.assert(
        fc.property(srcArb, (src) => {
          const { unmount } = render(
            <OptimizedImage src={src} alt="Branch test" />
          );

          const img = screen.getByRole('img', { name: 'Branch test' });

          // 외부/로컬 구분 없이 동일한 속성 적용 확인
          expect(img).toHaveAttribute('src', src);
          expect(img).toHaveAttribute('loading', 'lazy');
          expect(img).toHaveAttribute('decoding', 'async');

          unmount();
        }),
        { numRuns: 30 }
      );
    });
  });
});
