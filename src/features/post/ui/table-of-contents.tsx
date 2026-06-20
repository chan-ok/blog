import { useEffect, useRef, useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleObserve = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;

      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((top, entry) => {
          return entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top;
        });
        setActiveId(topEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserve, {
      rootMargin: '0px 0px -70% 0px',
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      isScrollingRef.current = true;
      setActiveId(id);
      setIsOpen(false);

      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  const hasHeadings = headings.length > 0;

  if (!hasHeadings) return null;

  const mobileLabel = 'Contents';

  const tocList = (
    <nav role="navigation" aria-label="Table of contents">
      <ul className="space-y-1">
        {headings.map(({ id, text, level }, index) => {
          const isActive = activeId === id;
          const indentClass =
            level === 1
              ? 'pl-2 text-[12px] font-medium'
              : level === 2
                ? 'pl-3 text-[12px]'
                : 'pl-6 text-[11px]';

          return (
            <li key={`${id}-${index}`}>
              <button
                onClick={() => handleHeadingClick(id)}
                className={[
                  'block w-full text-left transition-colors py-1.5',
                  'border-l-2 leading-normal',
                  indentClass,
                  isActive
                    ? 'font-semibold text-ink border-ink'
                    : 'text-ink3 border-transparent hover:text-ink2 hover:border-rule',
                ].join(' ')}
                type="button"
              >
                {text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* 모바일/중간: 접이식 (xl=1280px 미만에서 표시) */}
      <div className="mb-8 xl:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between border border-rule bg-bg2 px-4 py-3 text-left transition-colors hover:bg-bg"
          aria-expanded={isOpen}
          type="button"
        >
          <span className="text-[11px] tracking-[2px] uppercase font-medium text-ink">
            {mobileLabel}
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-ink3" aria-hidden="true" />
          ) : (
            <ChevronDown size={16} className="text-ink3" aria-hidden="true" />
          )}
        </button>

        {isOpen && <div className="border border-t-0 border-rule bg-bg p-4">{tocList}</div>}
      </div>

      {/* 데스크탑: fixed 사이드바 */}
      <aside className="fixed top-44 hidden max-h-[calc(100vh-12rem)] overflow-y-auto xl:block xl:w-44 xl:left-[calc(50%+21rem)] 2xl:w-60 2xl:left-[calc(50%+22rem)]">
        <div className="p-4 border-l border-rule">{tocList}</div>
      </aside>
    </>
  );
}
