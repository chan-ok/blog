import { expect, it } from 'vitest';
import { parseMarkdownSource } from './frontmatter';

it('JavaScript frontmatter를 평가하지 않는다', () => {
  Reflect.deleteProperty(globalThis, '__frontmatterExecuted');
  expect(() =>
    parseMarkdownSource('---javascript\n(globalThis.__frontmatterExecuted = true)\n---\n# body')
  ).toThrow(/frontmatter/i);
  expect(Reflect.has(globalThis, '__frontmatterExecuted')).toBe(false);
});
it('BOM·YAML 날짜·본문을 실행 가능한 컴포넌트 없이 읽는다', () => {
  const result = parseMarkdownSource('\uFEFF---\ntitle: Post\ncreatedAt: 2026-01-01\n---\n# body');
  expect(result.content).toBe('# body');
  expect(result.data.title).toBe('Post');
  expect(result).not.toHaveProperty('MDXContent');
});
it('중복 키·과도한 alias·누락된 경계를 거부한다', () => {
  expect(() => parseMarkdownSource('---\ntitle: one\ntitle: two\n---')).toThrow(/unique/i);
  expect(() => parseMarkdownSource('---\ntitle: one')).toThrow(/delimiter/i);
  expect(() =>
    parseMarkdownSource('---\na: &a [1,2,3,4,5]\nb: &b [*a,*a,*a,*a,*a]\nc: [*b,*b,*b,*b,*b]\n---')
  ).toThrow(/alias/i);
});
