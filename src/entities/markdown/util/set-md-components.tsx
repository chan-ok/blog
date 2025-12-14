import type { MDXComponents } from 'mdx/types';
import Code from '../ui/Code';
import Typography from '../ui/Typography';

export default function setMdxComponents(
  components?: MDXComponents
): MDXComponents {
  return {
    h1: Typography.h1,
    h2: Typography.h2,
    h3: Typography.h3,
    h4: Typography.h4,
    h5: Typography.h5,
    p: ({ children }) => <p className="mb-4">{children}</p>,
    ul: ({ children }) => (
      <ul className="mb-4 list-inside list-disc">{children}</ul>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        {children}
      </a>
    ),
    pre: ({ children }) => (
      <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4">
        {children}
      </pre>
    ),
    code: Code,
    ...components,
  };
}
