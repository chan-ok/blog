import React from 'react';

interface TableWrapperProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

/**
 * MDX 콘텐츠용 테이블 래퍼 컴포넌트
 * - 반응형 가로 스크롤 지원
 * - 줄무늬(striped) 스타일링
 * - 다크모드 지원 (CSS 토큰 기반)
 * - 키보드 접근성 (tabIndex={0})
 */
export default function TableWrapper({ children, className = '', ...rest }: TableWrapperProps) {
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
            // thead 스타일링
            if (child.type === 'thead') {
              return React.cloneElement(child, {
                className: [child.props.className, 'bg-bg2'].filter(Boolean).join(' '),
              } as React.HTMLAttributes<HTMLTableSectionElement>);
            }
            // tbody 스타일링
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
