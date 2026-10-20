import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
it('React의 정적 홈과 공개 글을 실제 HTML로 생성한다', async () => {
  const html = await readFile(new URL('../../dist/react/ko/index.html', import.meta.url), 'utf8');
  expect(html).toContain('안녕하세요.');
  expect(html).toContain('https://chan-ok.com/ko');
  expect(html).not.toContain('/workspace/blog-content');
});
