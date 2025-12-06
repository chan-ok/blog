'use server';

import {
  MDXRemote,
  type MDXComponents,
  type MDXRemoteOptions,
} from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';
import getMarkdown from './util/get-markdown';
import setMdxComponents from './util/set-mdx-components';

interface MDXComponentProps {
  locale: LocaleType;
  slug: string[];
  extension?: 'md' | 'mdx';
}

export default async function MDXComponent({
  locale,
  slug,
  extension = 'md',
}: MDXComponentProps) {
  try {
    const path = slug.join('/');
    const { source, frontmatter } = await getMarkdown(locale, path, extension);
    if (!source) throw notFound();

    const options: MDXRemoteOptions = {
      mdxOptions: {},
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
