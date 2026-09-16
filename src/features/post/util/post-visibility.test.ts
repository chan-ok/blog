import { describe, expect, it } from 'vitest';

import { isPostVisible } from './post-visibility';

describe('isPostVisible', () => {
  describe.each(['list', 'detail'] as const)('in production on %s', (surface) => {
    it('shows a published post without reserved tags', () => {
      expect(
        isPostVisible({ published: true, tags: ['react'] }, { isProduction: true, surface })
      ).toBe(true);
    });

    it.each([undefined, []])('shows a published post when tags are empty or omitted', (tags) => {
      expect(isPostVisible({ published: true, tags }, { isProduction: true, surface })).toBe(true);
    });

    it('uses exact case-sensitive tag matching', () => {
      expect(
        isPostVisible({ published: true, tags: ['Test', 'DRAFT'] }, { isProduction: true, surface })
      ).toBe(true);
    });

    it.each([
      [{ published: false, tags: [] }, 'an unpublished post'],
      [{ tags: [] }, 'a post with missing published frontmatter'],
      [{ published: true, tags: ['test'] }, 'a test post'],
      [{ published: true, tags: ['draft'] }, 'a draft post'],
      [{ published: true, tags: ['react', 'test'] }, 'a post with a test tag among other tags'],
    ])('hides %s', (frontmatter) => {
      expect(isPostVisible(frontmatter, { isProduction: true, surface })).toBe(false);
    });
  });

  describe('in development', () => {
    it.each([['test'], ['draft']])('shows a published %s post in the list', (tag) => {
      expect(
        isPostVisible({ published: true, tags: [tag] }, { isProduction: false, surface: 'list' })
      ).toBe(true);
    });

    it.each([{ published: false }, {}])(
      'hides an unpublished or incomplete post from the list',
      (frontmatter) => {
        expect(
          isPostVisible(frontmatter, {
            isProduction: false,
            surface: 'list',
          })
        ).toBe(false);
      }
    );

    it.each([
      { published: false, tags: [] },
      { tags: [] },
      { published: true, tags: ['test'] },
      { published: true, tags: ['draft'] },
    ])('allows preview access on the detail surface', (frontmatter) => {
      expect(
        isPostVisible(frontmatter, {
          isProduction: false,
          surface: 'detail',
        })
      ).toBe(true);
    });
  });
});
