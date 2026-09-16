import { use } from 'react';
import Markdown, { type Components } from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { setMdxComponents } from './util/set-md-components';
import { rehypeUnwrapImages } from './util/rehype-unwrap-images';
import { remarkObsidianImage } from './util/remark-obsidian-image';

import type { MarkdownElement } from './util/get-markdown';

interface MDComponentProps {
  dataPromise: Promise<MarkdownElement>;
  baseUrl?: string;
  components?: Components;
}

interface MarkdownContentProps {
  content: string;
  baseUrl?: string;
  components?: Components;
}

export function MarkdownContent({
  content,
  baseUrl,
  components: customComponents,
}: MarkdownContentProps) {
  const components = setMdxComponents(customComponents, baseUrl);

  return (
    <Markdown
      skipHtml
      remarkPlugins={[remarkObsidianImage, remarkGfm]}
      rehypePlugins={[
        rehypeHighlight,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'prepend',
            properties: {
              className: ['anchor'],
              ariaHidden: 'true',
              tabIndex: -1,
            },
            content: {
              type: 'element',
              tagName: 'span',
              properties: { className: ['anchor-icon'] },
              children: [{ type: 'text', value: '#' }],
            },
          },
        ],
        rehypeUnwrapImages,
      ]}
      components={components}
    >
      {content}
    </Markdown>
  );
}

export default function MDComponent({
  dataPromise,
  baseUrl,
  components: customComponents,
}: MDComponentProps) {
  const data = use(dataPromise);

  return <MarkdownContent content={data.content} baseUrl={baseUrl} components={customComponents} />;
}

export type { MarkdownElement, MarkdownFrontmatter } from './util/get-markdown';
