import { useScrollProgress } from '@/5-shared/hooks/use-scroll-progress';

// 페이지 최상단에 fixed로 표시되는 스크롤 진행 바
export default function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
      {/* width는 동적 퍼센트 값이므로 인라인 style 예외 허용 */}
      <div
        className="h-full bg-blue-500 transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
