import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-4 text-4xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-6 mb-3 text-3xl font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-4 mb-2 text-2xl font-semibold">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-3 mb-2 text-xl font-semibold">{children}</h4>
    ),
    p: ({ children }) => <p className="mb-4">{children}</p>,
    ul: ({ children }) => (
      <ul className="mb-4 list-inside list-disc">{children}</ul>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 hover:underline">
        {children}
      </a>
    ),
    pre: ({ children }) => (
      <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4">
        {children}
      </pre>
    ),
    code: ({ children, className }) => {
      const isInline = !className;
      return isInline ? (
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800">
          {children}
        </code>
      ) : (
        <code className={`font-mono text-sm ${className || ''}`}>
          {children}
        </code>
      );
    },
    ...components,
  };
}
