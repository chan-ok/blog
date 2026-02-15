import React from 'react';

interface TableWrapperProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

/**
 * MDX 콘텐츠용 테이블 래퍼 컴포넌트
 * - 반응형 가로 스크롤 지원
 * - 줄무늬(striped) 스타일링
 * - 다크모드 지원
 * - 키보드 접근성 (tabIndex={0})
 */
export default function TableWrapper({
  children,
  className = '',
  ...rest
}: TableWrapperProps) {
  return (
    <div
      role="region"
      aria-label="표 영역"
      tabIndex={0}
      className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <table
        className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}
        {...rest}
      >
        {React.Children.map(children, (child) => {
          if (
            React.isValidElement<React.HTMLAttributes<HTMLTableSectionElement>>(
              child
            )
          ) {
            // thead 스타일링
            if (child.type === 'thead') {
              return React.cloneElement(child, {
                className: [
                  child.props.className,
                  'bg-gray-50 dark:bg-gray-800',
                ]
                  .filter(Boolean)
                  .join(' '),
              } as React.HTMLAttributes<HTMLTableSectionElement>);
            }
            // tbody 스타일링
            if (child.type === 'tbody') {
              return React.cloneElement(child, {
                className: [
                  child.props.className,
                  'divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900',
                ]
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
          color: rgb(55 65 81);
        }
        .dark table th {
          color: rgb(209 213 219);
        }
        table td {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: rgb(55 65 81);
        }
        .dark table td {
          color: rgb(209 213 219);
        }
        table tbody tr:nth-child(even) {
          background-color: rgb(249 250 251);
        }
        .dark table tbody tr:nth-child(even) {
          background-color: rgb(31 41 55);
        }
      `}</style>
    </div>
  );
}
