import React from 'react';

import { AlertOctagon, AlertTriangle, CheckCircle, Info, type LucideIcon } from 'lucide-react';
import CodeBlock from '../ui/code-block';
import ImageBlock from '../ui/image-block';
import MermaidDiagram from '../ui/mermaid-diagram';

import type { MDXComponents } from 'mdx/types';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  id?: string;
}

function Heading1({ children, id, ...rest }: HeadingProps) {
  return (
    <h1
      id={id}
      className="group border-b-2 border-ink pb-3 pt-16 mb-6 text-[28px] font-bold leading-tight"
      {...rest}
    >
      {children}
    </h1>
  );
}

function Heading2({ children, id, ...rest }: HeadingProps) {
  return (
    <h2
      id={id}
      className="group border-b border-rule pb-2 pt-12 mb-5 text-[21px] font-bold leading-snug"
      {...rest}
    >
      {children}
    </h2>
  );
}

function Heading3({ children, id, ...rest }: HeadingProps) {
  return (
    <h3 id={id} className="group pt-10 mb-4 text-[17px] font-bold leading-snug" {...rest}>
      {children}
    </h3>
  );
}

function Heading4({ children, id, ...rest }: HeadingProps) {
  return (
    <h4 id={id} className="group pt-7 mb-3 text-[15px] font-semibold leading-snug" {...rest}>
      {children}
    </h4>
  );
}

function Heading5({ children, id, ...rest }: HeadingProps) {
  return (
    <h5
      id={id}
      className="group pt-5 mb-3 text-[14px] font-semibold text-ink2 leading-snug"
      {...rest}
    >
      {children}
    </h5>
  );
}

function Heading6({ children, id, ...rest }: HeadingProps) {
  return (
    <h6
      id={id}
      className="group pt-4 mb-2 text-[13px] font-semibold text-ink3 tracking-wide leading-snug"
      {...rest}
    >
      {children}
    </h6>
  );
}

interface TableWrapperProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

function TableWrapper({ children, className = '', ...rest }: TableWrapperProps) {
  return (
    <div
      role="region"
      aria-label="표 영역"
      tabIndex={0}
      className="my-6 overflow-x-auto rounded-md border border-rule bg-bg"
    >
      <table className={`min-w-full divide-y divide-rule ${className}`} {...rest}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement<React.HTMLAttributes<HTMLTableSectionElement>>(child)) {
            if (child.type === 'thead') {
              return React.cloneElement(child, {
                className: [child.props.className, 'bg-bg2'].filter(Boolean).join(' '),
              } as React.HTMLAttributes<HTMLTableSectionElement>);
            }
            if (child.type === 'tbody') {
              return React.cloneElement(child, {
                className: [child.props.className, 'divide-y divide-rule bg-bg']
                  .filter(Boolean)
                  .join(' '),
              } as React.HTMLAttributes<HTMLTableSectionElement>);
            }
          }
          return child;
        })}
      </table>
      <style>{`
        table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ink);
        }
        table td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--ink2);
        }
      `}</style>
    </div>
  );
}

interface BlockquoteProps {
  children?: React.ReactNode;
}

type CalloutType = 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';

interface CalloutConfig {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const CALLOUT_CONFIGS: Record<CalloutType, CalloutConfig> = {
  INFO: {
    icon: Info,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink3',
    borderColor: 'border-rule',
  },
  WARNING: {
    icon: AlertTriangle,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink2',
    borderColor: 'border-rule',
  },
  DANGER: {
    icon: AlertOctagon,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink',
    borderColor: 'border-ink',
  },
  SUCCESS: {
    icon: CheckCircle,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink3',
    borderColor: 'border-rule',
  },
};

function parseCallout(children: React.ReactNode): {
  type: CalloutType;
  title: string;
  content: React.ReactNode;
} | null {
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return null;

  const firstChildIndex = childArray.findIndex((child) => {
    if (typeof child === 'string') return child.trim() !== '';
    return true;
  });

  if (firstChildIndex === -1) return null;
  const firstChild = childArray[firstChildIndex];

  let textContent = '';
  if (React.isValidElement(firstChild)) {
    const props = firstChild.props as { children?: React.ReactNode };
    const pChildren = props.children;

    if (typeof pChildren === 'string') {
      textContent = pChildren;
    } else if (Array.isArray(pChildren)) {
      const firstText = pChildren.find((c) => typeof c === 'string');
      textContent = typeof firstText === 'string' ? firstText : '';
    }
  } else if (typeof firstChild === 'string') {
    textContent = firstChild;
  }

  const calloutMatch = /^\s*\[!(INFO|WARNING|DANGER|SUCCESS)\]\s*(.*)$/m.exec(textContent);
  if (!calloutMatch) return null;

  const type = calloutMatch[1] as CalloutType;
  const titleText = calloutMatch[2].trim() || type;
  const matchEndIndex = (calloutMatch.index || 0) + calloutMatch[0].length;
  const remainingText = textContent.slice(matchEndIndex).trim();
  const contentChildren: React.ReactNode[] = [];

  if (remainingText) {
    if (React.isValidElement(firstChild)) {
      contentChildren.push(React.cloneElement(firstChild, {}, remainingText));
    } else {
      contentChildren.push(remainingText);
    }
  }

  contentChildren.push(...childArray.slice(firstChildIndex + 1));

  return {
    type,
    title: titleText,
    content: contentChildren.length > 0 ? <>{contentChildren}</> : null,
  };
}

function Blockquote({ children }: BlockquoteProps) {
  const callout = parseCallout(children);

  if (callout) {
    const config = CALLOUT_CONFIGS[callout.type];
    const Icon = config.icon;

    return (
      <div
        role="note"
        className={`my-6 rounded-md border p-4 ${config.bgColor} ${config.borderColor}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <Icon size={20} className={config.iconColor} aria-hidden="true" />
          <p className="font-semibold text-ink">{callout.title}</p>
        </div>
        <div className="text-ink2">{callout.content}</div>
      </div>
    );
  }

  return (
    <blockquote className="my-8 border-l-[3px] border-ink bg-bg2 pl-7 pr-6 py-5 italic text-ink2 text-[15px] leading-[1.9]">
      {children}
    </blockquote>
  );
}

export function setMdxComponents(components?: MDXComponents, baseUrl?: string): MDXComponents {
  return {
    h1: Heading1,
    h2: Heading2,
    h3: Heading3,
    h4: Heading4,
    h5: Heading5,
    h6: Heading6,
    p: ({ children }) => <p className="mb-6 text-[16px] leading-loose text-ink2">{children}</p>,
    ul: ({ children }) => <ul className="mdx-ul mb-6 pl-2 space-y-2 text-ink2">{children}</ul>,
    ol: ({ children }) => <ol className="mdx-ol mb-6 pl-2 space-y-2 text-ink2">{children}</ol>,
    li: ({ children }) => <li className="text-[16px] leading-[1.9]">{children}</li>,
    a: ({ href, children, className, ...rest }) => {
      // 앵커 링크 (rehype-autolink-headings가 생성)
      if (typeof className === 'string' && className.includes('anchor')) {
        return (
          <a
            href={href}
            className="mr-2 no-underline text-ink3 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100!"
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
          className="text-accent-strong underline underline-offset-2 decoration-accent transition-colors hover:text-ink hover:decoration-ink"
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
        <code className="rounded-md bg-bg2 px-1.5 py-0.5 font-mono text-sm text-ink border border-rule">
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
