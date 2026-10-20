import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './render';
import { sanitizeMarkdownHtml } from './sanitize';
const options = {
  context: { framework: 'vue' as const, locale: 'ko' as const, explicitFramework: true },
  resolveImage: async () => '/content-assets/verified-image.png',
};
describe('Sätteri 공통 렌더링', () => {
  it('GFM과 제목 ID·문장부호를 보존한다', async () => {
    const result = await renderMarkdown(
      '# same\n\n# same\n\n"hello" -- ...\n\n| a | b |\n|---|---|\n| c | d |',
      options
    );
    expect(result.headings.map((h) => h.id)).toEqual(['same', 'same-1']);
    expect(result.html).toContain('<table');
    expect(result.html).toContain('"hello" -- ...');
  });
  it('Obsidian 이미지와 문장의 나머지 내용을 유지한다', async () => {
    const result = await renderMarkdown('앞 ![[images/codingless3r.png]] 뒤', options);
    expect(result.html).toContain('src="/content-assets/verified-image.png"');
    expect(result.html).toContain('alt="codingless3r.png"');
    expect(result.html).toContain('앞');
    expect(result.html).toContain('뒤');
    expect(result.html).not.toMatch(/<img\b[^>]*__astro_image_/iu);
    expect(result.image).toBe('/content-assets/verified-image.png');
  });
  it('현재 언어로 코드 복사 버튼을 생성한다', async () => {
    const result = await renderMarkdown('```ts\nconst x = 1;\n```', options);
    expect(result.html).toContain('aria-label="코드 복사"');
  });
  it('raw HTML 이미지를 허용된 Markdown 이미지 경로로 우회시키지 않는다', async () => {
    const result = await renderMarkdown('<img src="https://attacker.example/pixel">', options);
    expect(result.html).not.toContain('<img');
  });
  it('Mermaid와 callout을 지원하고 외부 코드를 실행하지 않는다', async () => {
    const result = await renderMarkdown(
      '> [!WARNING] 주의\n> 본문\n\n```mermaid\ngraph TD; A-->B\n```\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))',
      options
    );
    expect(result.html).toContain('data-mermaid');
    expect(result.html).toContain('graph TD; A--&gt;B');
    expect(result.html).toContain('role="note"');
    expect(result.html).toContain('주의');
    expect(result.html).not.toMatch(/<script|javascript:/iu);
  });
  it('MDX와 마커 설명은 코드로 평가하지 않는다', async () => {
    const result = await renderMarkdown(
      '`__ASTRO_IMAGE_`\n\n{globalThis.pwned = true}\n\nimport X from "evil";',
      options
    );
    expect(result.html).toContain('__ASTRO_IMAGE_');
    expect(result.html).not.toContain('<script');
  });
  it('내부 이미지 속성은 정화 전에 실패시킨다', () => {
    expect(() => sanitizeMarkdownHtml('<img __ASTRO_IMAGE_="secret">')).toThrow(/image marker/i);
  });
});
