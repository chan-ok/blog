import type { MDXComponents } from 'mdx/types';
import Code from '../ui/code';
import Typography from '../ui/typography';

export default function setMdxComponents(
  components?: MDXComponents
): MDXComponents {
  return {
    h1: Typography.h1,
    h2: Typography.h2,
    h3: Typography.h3,
    h4: Typography.h4,
    h5: Typography.h5,
    p: ({ children }) => <p className="mb-6">{children}</p>,
    ul: ({ children }) => (
      <ul className="mb-6 list-inside list-disc">{children}</ul>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </a>
    ),
    pre: ({ children }) => (
      <pre className="mb-6 overflow-x-auto rounded-lg bg-gray-900 p-4">
        {children}
      </pre>
    ),
    code: Code,
    ...components,
  };
}
