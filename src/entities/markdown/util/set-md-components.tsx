import React from 'react';
import type { MDXComponents } from 'mdx/types';

import CodeBlock from '../ui/code-block';
import ImageBlock from '../ui/image-block';
import MermaidDiagram from '../ui/mermaid-diagram';
import TableWrapper from '../ui/table-wrapper';
import Typography from '../ui/typography';
import Blockquote from '../ui/blockquote';

export default function setMdxComponents(
  components?: MDXComponents,
  baseUrl?: string
): MDXComponents {
  return {
    h1: Typography.h1,
    h2: Typography.h2,
    h3: Typography.h3,
    h4: Typography.h4,
    h5: Typography.h5,
    h6: Typography.h6,
    p: ({ children }) => <p className="mb-6 leading-[1.9] indent-4">{children}</p>,
    ul: ({ children }) => <ul className="mdx-ul mb-6 pl-2 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="mdx-ol mb-6 pl-2 space-y-2">{children}</ol>,
    li: ({ children }) => <li className="leading-[1.85] text-[15px]">{children}</li>,
    a: ({ href, children, className, ...rest }) => {
      // 앵커 링크 (rehype-autolink-headings가 생성)
      if (typeof className === 'string' && className.includes('anchor')) {
        return (
          <a
            href={href}
            className="mr-2 no-underline text-ink3 opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
            {...rest}
          >
            {children}
          </a>
        );
      }
      // 일반 링크
      return (
        <a
          href={href}
          className="text-ink underline underline-offset-2 decoration-ink3 transition-colors hover:decoration-ink"
        >
          {children}
        </a>
      );
    },
    pre: ({ children }) => {
      // children에서 code 엘리먼트 추출
      const codeElement = React.isValidElement(children) ? children : null;
      const props = codeElement?.props as
        | { className?: string; children?: React.ReactNode }
        | undefined;
      const className = props?.className || '';

      // mermaid 다이어그램 감지
      if (className.includes('language-mermaid')) {
        const codeChildren = props?.children;
        const mermaidCode = typeof codeChildren === 'string' ? codeChildren : '';
        return <MermaidDiagram code={mermaidCode} />;
      }

      // 일반 코드 블록
      return <CodeBlock>{children}</CodeBlock>;
    },
    code: ({ children, className }) => {
      // 코드 블록 내 code는 className이 있음 → 스타일링 없이 통과
      if (className) {
        return <code className={className}>{children}</code>;
      }
      // 인라인 코드
      return (
        <code className="rounded bg-bg2 px-1.5 py-0.5 font-mono text-sm text-ink border border-rule">
          {children}
        </code>
      );
    },
    img: ({ src, alt }) => <ImageBlock src={src || ''} alt={alt} baseUrl={baseUrl} />,
    table: ({ children, ...rest }) => <TableWrapper {...rest}>{children}</TableWrapper>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
    ...components,
  };
}
