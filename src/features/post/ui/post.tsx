'use server';

import { LocaleType } from '@/shared/types/common.schema';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { notFound } from 'next/navigation';
import { addStyle } from '../util/add-style';
import { getPost } from '../util/get-post';

interface PostProps {
  locale: LocaleType;
  slug: string[];
  extension?: 'md' | 'mdx';
}

export default async function Post({
  locale,
  slug,
  extension = 'md',
}: PostProps) {
  try {
    const content = await getPost(locale, slug.join('/'), extension);
    if (!content) throw notFound();

    const components = addStyle({});
    return <MDXRemote components={components} source={content} />;
  } catch (e: unknown) {
    console.error('Failed to fetch post', e);
    throw notFound();
  }
}
