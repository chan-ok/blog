import { expect, it } from 'vitest';
import { satteri, createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { createSatteriOptions, createSharedMarkdownOptions } from './processor';
import { renderMarkdown } from './render';
it('설정 위치가 다른 두 API에 비기본 설정을 적용한다', async () => {
  const shared = { ...createSharedMarkdownOptions(), syntaxHighlight: false as const };
  const a = await satteri(createSatteriOptions()).createRenderer(shared);
  const b = await createSatteriMarkdownProcessor({ ...shared, ...createSatteriOptions() });
  const source = '# title\n\n"hello" -- ...\n\n```ts\nconst x = 1\n```';
  const left = await a.render(source);
  const right = await b.render(source);
  expect(left.code).toBe(right.code);
  expect(left.code).not.toContain('astro-code');
  expect(createSatteriOptions().features?.smartPunctuation).toBe(false);
});
it('글마다 이미지 맵을 분리하고 reference 이미지를 처리한다', async () => {
  const context = { framework: 'react' as const, locale: 'ko' as const, explicitFramework: false };
  const source = '![alt][x]\n\n[x]: images/hello.png';
  const a = await renderMarkdown(source, {
    context,
    resolveImage: async () => '/content-assets/a.png',
  });
  const b = await renderMarkdown(source, {
    context,
    resolveImage: async () => '/content-assets/b.png',
  });
  expect(a.html).toContain('/content-assets/a.png');
  expect(b.html).toContain('/content-assets/b.png');
  await expect(
    renderMarkdown(source, { context, resolveImage: async () => undefined })
  ).rejects.toThrow(/Invalid image/);
});
