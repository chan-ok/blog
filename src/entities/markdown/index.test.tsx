import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';

import { MarkdownContent } from './index';

describe('MarkdownContent security boundaries', () => {
  beforeEach(() => {
    Reflect.deleteProperty(globalThis, '__markdownExecuted');
  });

  it('renders remote content without executing MDX expressions or raw HTML', () => {
    const html = renderToStaticMarkup(
      <MarkdownContent
        content={`{globalThis.__markdownExecuted = true}

<script>globalThis.__markdownExecuted = true</script>

[unsafe](javascript:globalThis.__markdownExecuted=true)
`}
      />
    );

    expect(Reflect.has(globalThis, '__markdownExecuted')).toBe(false);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('globalThis.__markdownExecuted');
  });
});
