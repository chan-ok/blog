import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import fc from 'fast-check';

import TagChip from './tag-chip';
import { useLocaleStore } from '@/5-shared/stores/locale-store';
import type { LocaleType } from '@/5-shared/types/common.schema';
import { renderWithRouter } from '@/5-shared/test-utils/render-with-router';

/**
 * ============================================================================
 * TagChip 컴포넌트 테스트
 * ============================================================================
 *
 * ## 테스트 목적
 * 태그 칩 컴포넌트의 렌더링 및 링크 동작을 검증합니다.
 *
 * ## 검증 항목
 * 1. 태그 텍스트 렌더링
 * 2. 올바른 href 생성 (/posts?tags=xxx)
 * 3. 스타일 클래스 적용
 * 4. 접근성 (aria-label)
 * 5. 다양한 locale에서 정상 동작
 */

// ============================================================================
// Property-Based 테스트를 위한 데이터 생성기
// ============================================================================

/**
 * 태그 문자열 생성기 (1~30자)
 */
const tagArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => s.trim().length > 0);

/**
 * locale 생성기
 */
const localeArb = fc.constantFrom<LocaleType>('ko', 'en', 'ja');

// ============================================================================
// Unit 테스트
// ============================================================================

describe('TagChip - Unit 테스트', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
  });

  it('태그 텍스트가 올바르게 렌더링되어야 한다', async () => {
    await renderWithRouter(<TagChip tag="react" locale="ko" />);

    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('올바른 href를 가진 링크가 생성되어야 한다', async () => {
    await renderWithRouter(<TagChip tag="typescript" locale="ko" />);

    const link = screen.getByRole('link', { name: /typescript/i });
    expect(link).toHaveAttribute('href', '/ko/posts?tags=typescript');
  });

  it('스타일 클래스가 적용되어야 한다', async () => {
    await renderWithRouter(<TagChip tag="react" locale="ko" />);

    const link = screen.getByRole('link');
    expect(link.className).toContain('rounded-full');
    expect(link.className).toContain('px-2');
    expect(link.className).toContain('py-0.5');
    expect(link.className).toContain('text-xs');
  });

  it('접근성을 위한 aria-label이 있어야 한다', async () => {
    await renderWithRouter(<TagChip tag="react" locale="ko" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      expect.stringContaining('react')
    );
  });

  it('다양한 locale에서 올바른 href를 생성해야 한다', async () => {
    const locales: LocaleType[] = ['ko', 'en', 'ja'];

    for (const locale of locales) {
      useLocaleStore.setState({ locale });
      const { unmount } = await renderWithRouter(
        <TagChip tag="test" locale={locale} />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', `/${locale}/posts?tags=test`);

      unmount();
    }
  });
});

// ============================================================================
// Property-Based 테스트
// ============================================================================

describe('TagChip - Property-Based 테스트', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' });
  });

  it('다양한 태그 문자열에서 올바르게 렌더링되어야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(tagArb, async (tag) => {
        const { unmount, container } = await renderWithRouter(
          <TagChip tag={tag} locale="ko" />
        );

        const scope = within(container);
        // Testing Library는 accessible name의 연속 공백을 단일 공백으로 정규화하므로
        // 비교 시 동일하게 정규화하여 비교한다
        const normalizedTag = tag.trim().replace(/\s+/g, ' ');
        const link = scope.getByRole('link', {
          name: (name) =>
            name.startsWith('태그:') && name.includes(normalizedTag),
        });
        const href = link.getAttribute('href') ?? '';
        expect(href).toMatch(/^\/ko\/posts\?tags=/);

        unmount();
      }),
      { numRuns: 20 }
    );
  });

  it('모든 locale에서 올바른 href를 생성해야 한다', async () => {
    await fc.assert(
      fc.asyncProperty(localeArb, tagArb, async (locale, tag) => {
        useLocaleStore.setState({ locale });

        const { unmount, container } = await renderWithRouter(
          <TagChip tag={tag} locale={locale} />
        );

        const scope = within(container);
        // Testing Library는 accessible name의 연속 공백을 단일 공백으로 정규화하므로
        // 비교 시 동일하게 정규화하여 비교한다
        const normalizedTag = tag.trim().replace(/\s+/g, ' ');
        const link = scope.getByRole('link', {
          name: (name) =>
            name.startsWith('태그:') && name.includes(normalizedTag),
        });
        const href = link.getAttribute('href') ?? '';
        expect(href).toMatch(new RegExp(`^/${locale}/posts\\?tags=`));

        unmount();
      }),
      { numRuns: 20 }
    );
  });
});
