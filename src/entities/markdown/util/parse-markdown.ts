import { parse as parseYaml } from 'yaml';

const MAX_MARKDOWN_SOURCE_LENGTH = 2 * 1024 * 1024;
const MAX_FRONTMATTER_LENGTH = 64 * 1024;
const YAML_BOUNDARY = /^---[\t ]*$/u;
const FRONTMATTER_END = /^(?:---|\.\.\.)[\t ]*$/u;

export interface ParsedMarkdownSource {
  content: string;
  data: Record<string, unknown>;
}

function normalizeSource(source: string): string {
  const withoutBom = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;

  if (withoutBom.length > MAX_MARKDOWN_SOURCE_LENGTH) {
    throw new Error('Markdown source exceeds the size limit');
  }

  return withoutBom;
}

export function parseMarkdownSource(source: string): ParsedMarkdownSource {
  const normalizedSource = normalizeSource(source);
  const lines = normalizedSource.split(/\r?\n/u);
  const firstLine = lines[0] ?? '';

  if (!YAML_BOUNDARY.test(firstLine)) {
    if (/^---\S/u.test(firstLine) || /^\+\+\+[\t ]*$/u.test(firstLine)) {
      throw new Error('Unsupported frontmatter format; only YAML is allowed');
    }

    return { content: normalizedSource, data: {} };
  }

  const closingIndex = lines.slice(1).findIndex((line) => FRONTMATTER_END.test(line));
  if (closingIndex === -1) {
    throw new Error('Invalid frontmatter: closing delimiter is missing');
  }

  const absoluteClosingIndex = closingIndex + 1;
  const frontmatterSource = lines.slice(1, absoluteClosingIndex).join('\n');
  if (frontmatterSource.length > MAX_FRONTMATTER_LENGTH) {
    throw new Error('Frontmatter exceeds the size limit');
  }

  const parsed = parseYaml(frontmatterSource, {
    maxAliasCount: 20,
    prettyErrors: false,
    uniqueKeys: true,
  });

  if (parsed == null) {
    return {
      content: lines.slice(absoluteClosingIndex + 1).join('\n'),
      data: {},
    };
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid frontmatter: expected a YAML mapping');
  }

  return {
    content: lines.slice(absoluteClosingIndex + 1).join('\n'),
    data: parsed as Record<string, unknown>,
  };
}
