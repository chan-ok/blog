import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number; // 2 or 3
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  // 상태: 활성 섹션 ID, 모바일 메뉴 열림 여부
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // ref: IntersectionObserver 관리
  const observerRef = useRef<IntersectionObserver | null>(null);
  // ref: 프로그래밍 스크롤 중 Observer 콜백 무시용 플래그
  const isScrollingRef = useRef(false);

  // useEffect: IntersectionObserver 설정
  useEffect(() => {
    // headings가 없으면 observer 불필요
    if (headings.length === 0) return;

    // 이전 observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // IntersectionObserver 콜백
    const handleObserve = (entries: IntersectionObserverEntry[]) => {
      // 프로그래밍 스크롤 중이면 무시 (무한 루프 방지)
      if (isScrollingRef.current) return;

      // 화면에 보이는 섹션들 필터링
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      // 가장 위에 있는 섹션 찾기
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((top, entry) => {
          return entry.boundingClientRect.top < top.boundingClientRect.top
            ? entry
            : top;
        });
        setActiveId(topEntry.target.id);
      }
    };

    // IntersectionObserver 생성
    observerRef.current = new IntersectionObserver(handleObserve, {
      rootMargin: '0px 0px -70% 0px', // 상단 30% 영역에서 감지
      threshold: 0,
    });

    // 모든 heading 엘리먼트 관찰
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    // 클린업
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  // 이벤트 핸들러: 헤딩 클릭 - 스무스 스크롤
  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 프로그래밍 스크롤 플래그 설정 (Observer 콜백 무시)
      isScrollingRef.current = true;
      setActiveId(id);
      setIsOpen(false); // 모바일에서 클릭 시 메뉴 닫기

      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // smooth 스크롤 완료 후 플래그 해제
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  // 이벤트 핸들러: 모바일 토글
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // headings가 없으면 렌더링 안 함
  if (headings.length === 0) {
    return null;
  }

  // 렌더링: TOC 리스트
  const tocList = (
    <nav role="navigation" aria-label="Table of contents">
      <ul className="space-y-1">
        {headings.map(({ id, text, level }, index) => {
          const isActive = activeId === id;
          const indentClass =
            level === 1
              ? 'pl-2 text-sm font-medium'
              : level === 2
                ? 'pl-4 text-sm'
                : 'pl-7 text-sm';

          return (
            <li key={`${id}-${index}`}>
              <button
                onClick={() => handleHeadingClick(id)}
                className={`
                  block w-full text-left transition-colors py-1
                  border-l-2
                  ${indentClass}
                  ${
                    isActive
                      ? 'font-semibold text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'text-gray-600 border-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }
                `}
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
          onClick={handleToggle}
          className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-expanded={isOpen}
          type="button"
        >
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Table of Contents
          </span>
          {isOpen ? (
            <ChevronUp
              size={20}
              className="text-gray-600 dark:text-gray-400"
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-gray-600 dark:text-gray-400"
              aria-hidden="true"
            />
          )}
        </button>

        {/* 접이식 콘텐츠 */}
        {isOpen && <div className="mt-2 rounded-lg p-4">{tocList}</div>}
      </div>

      {/* 데스크탑: fixed 사이드바 — 포스트 콘텐츠(max-w-4xl=56rem) 우측에 배치
          xl(1280px): 1rem 간격, 너비 160px(w-40) — 우측 여백 16px
          2xl(1536px): 2.25rem 간격, 너비 240px(w-60) — 우측 여백 44px */}
      <aside className="fixed top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto xl:block xl:w-40 xl:left-[calc(50%+28rem+1rem)] 2xl:w-60 2xl:left-[calc(50%+28rem+2.25rem)]">
        <div className="p-4">
          <h2 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
            Table of Contents
          </h2>
          {tocList}
        </div>
      </aside>
    </>
  );
}
