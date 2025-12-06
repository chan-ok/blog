import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

export async function parsePost(raw: string) {
  'use server';
  const vfile = await compile(raw, {
    outputFormat: 'function-body',
    development: process.env.NODE_ENV === 'development',
  });
  const code = String(vfile);
  const { default: MDXContent } = await run(code, runtime);
  return MDXContent;
}
