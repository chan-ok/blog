'use server';

import {
  MDXRemote,
  type MDXComponents,
  type MDXRemoteOptions,
} from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';
import getMarkdown from './util/get-markdown';
import setMdxComponents from './util/set-md-components';

import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeHighlight from 'rehype-highlight';

interface MDComponentProps {
  path: string;
  baseUrl?: string;
}

export default async function MDComponent({ path, baseUrl }: MDComponentProps) {
  try {
    const { source, frontmatter } = await getMarkdown(path, baseUrl);
    if (!source) throw notFound();

    const options: MDXRemoteOptions = {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkFrontmatter],
        rehypePlugins: [rehypeHighlight],
      },
      parseFrontmatter: true,
      scope: {
        title: frontmatter.title,
      },
    };

    const components: MDXComponents = setMdxComponents();

    return (
      <MDXRemote source={source} options={options} components={components} />
    );
  } catch (e: unknown) {
    console.error('Failed to fetch post', e);
    throw notFound();
  }
}
