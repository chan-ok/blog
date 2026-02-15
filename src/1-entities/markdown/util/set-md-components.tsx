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
  baseUrl?: string,
  contentPath?: string
): MDXComponents {
  return {
    h1: Typography.h1,
    h2: Typography.h2,
    h3: Typography.h3,
    h4: Typography.h4,
    h5: Typography.h5,
    h6: Typography.h6,
    p: ({ children }) => {
      // 자식이 img 태그만 있는 경우 <p> 태그 없이 렌더링
      const childArray = React.Children.toArray(children);

      // 자식이 1개이고 img 태그인 경우 (MDX는 img를 전달, 이후 ImageBlock으로 변환됨)
      if (
        childArray.length === 1 &&
        React.isValidElement(childArray[0]) &&
        childArray[0].type === 'img'
      ) {
        return <>{children}</>;
      }

      // 일반 텍스트/혼합 컨텐츠는 <p> 태그로 감싸기
      return <p className="mb-6">{children}</p>;
    },
    ul: ({ children }) => (
      <ul className="mb-6 list-inside list-disc">{children}</ul>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ href, children, className, ...rest }) => {
      // 앵커 링크 (rehype-autolink-headings가 생성)
      if (typeof className === 'string' && className.includes('anchor')) {
        return (
          <a
            href={href}
            className="mr-2 no-underline text-gray-400 opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
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
          className="text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
        const mermaidCode =
          typeof codeChildren === 'string' ? codeChildren : '';
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
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {children}
        </code>
      );
    },
    img: ({ src, alt }) => (
      <ImageBlock
        src={src || ''}
        alt={alt}
        baseUrl={baseUrl}
        contentPath={contentPath}
      />
    ),
    table: ({ children, ...rest }) => (
      <TableWrapper {...rest}>{children}</TableWrapper>
    ),
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
    ...components,
  };
}
