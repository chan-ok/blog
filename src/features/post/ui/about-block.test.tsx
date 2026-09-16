import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import AboutBlock from './about-block';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/components/ui/link', () => ({
  default: ({ children, href }: { children?: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AboutBlock', () => {
  it('reserves the profile image footprint while its skeleton is visible', () => {
    const markup = renderToStaticMarkup(<AboutBlock />);

    expect(markup).toMatch(/class="[^"]*aspect-square[^"]*"/);
    expect(markup).toContain('width="591"');
    expect(markup).toContain('height="591"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toMatch(/class="[^"]*animate-pulse[^"]*"/);
  });

  it('uses a compact image-first two-column layout below the desktop breakpoint', () => {
    const markup = renderToStaticMarkup(<AboutBlock />);

    expect(markup).toContain('grid-cols-[auto_minmax(0,1fr)]');
    expect(markup).toContain('w-[clamp(6rem,28vw,12rem)]');
    expect(markup).toMatch(/class="[^"]*order-1[^"]*lg:order-2[^"]*"/);
    expect(markup).toMatch(/class="[^"]*order-2[^"]*lg:order-1[^"]*"/);
  });
});
