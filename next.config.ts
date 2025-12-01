import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [['rehype-highlight']],
    remarkPlugins: [
      ['remark-frontmatter'],
      ['remark-mdx-frontmatter'],
      ['remark-gfm'],
    ],
  },
});

export default withMDX(nextConfig);
