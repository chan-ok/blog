import { use } from 'react';

import { setMdxComponents } from './util/set-md-components';

import type { MDXComponents } from 'mdx/types';
import type { MarkdownElement } from './util/get-markdown';

interface MDComponentProps {
  dataPromise: Promise<MarkdownElement>;
  baseUrl?: string;
  components?: MDXComponents;
}

export default function MDComponent({
  dataPromise,
  baseUrl,
  components: customComponents,
}: MDComponentProps) {
  const data = use(dataPromise);

  const components = setMdxComponents(customComponents, baseUrl);

  return <data.MDXContent components={components} />;
}

export type { MarkdownElement, MarkdownFrontmatter } from './util/get-markdown';
