# 반응형 디자인 가이드

## 📱 반응형 디자인 철학

### 핵심 원칙
1. **모바일 우선** (Mobile First) 설계
2. **점진적 향상** (Progressive Enhancement)
3. **콘텐츠 중심** 접근
4. **성능 최적화** 고려

### 디자인 시스템 기반
- **Base**: Tailwind CSS v4 + shadcn/ui
- **아이콘**: Lucide React
- **타이포그래피**: 한국어 친화적 폰트 스택
- **색상**: CSS 변수 기반 다크모드 지원

## 📐 Breakpoint 정의

### Tailwind CSS v4 기준 Breakpoint

```css
/* 모바일 우선 설계 */
/* 기본 (모바일)  : 0px ~ 639px   */
sm: 640px;    /* 작은 태블릿      : 640px ~ 767px  */
md: 768px;    /* 태블릿          : 768px ~ 1023px */
lg: 1024px;   /* 데스크톱        : 1024px ~ 1279px */
xl: 1280px;   /* 대형 데스크톱    : 1280px ~ 1535px */
2xl: 1536px;  /* 초대형 디스플레이 : 1536px ~      */
```

### 사용 권장사항

```typescript
// 반응형 컴포넌트 예시
export function 반응형헤더() {
  return (
    <header className="
      px-4 py-3           /* 모바일: 작은 패딩 */
      md:px-6 md:py-4     /* 태블릿: 중간 패딩 */
      lg:px-8 lg:py-5     /* 데스크톱: 큰 패딩 */
      flex flex-col       /* 모바일: 세로 정렬 */
      md:flex-row         /* 태블릿 이상: 가로 정렬 */
      items-center
      justify-between
    ">
      <로고 />
      <네비게이션메뉴 />
    </header>
  );
}
```

## 🎨 반응형 컴포넌트 패턴

### 1. 그리드 시스템 활용

```tsx
// 반응형 글 목록 그리드
export function 블로그글목록() {
  return (
    <div className="
      grid
      grid-cols-1        /* 모바일: 1열 */
      md:grid-cols-2     /* 태블릿: 2열 */
      lg:grid-cols-3     /* 데스크톱: 3열 */
      gap-4 md:gap-6 lg:gap-8
    ">
      {글목록.map(글 => <글카드 key={글.아이디} 글={글} />)}
    </div>
  );
}
```

### 2. 유연한 타이포그래피

```tsx
// 반응형 제목 컴포넌트
export function 페이지제목({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="
      text-2xl md:text-3xl lg:text-4xl xl:text-5xl
      font-bold
      leading-tight md:leading-tight lg:leading-none
      mb-4 md:mb-6 lg:mb-8
    ">
      {children}
    </h1>
  );
}
```

### 3. 적응형 네비게이션

```tsx
// 햄버거 메뉴를 활용한 반응형 네비게이션
export function 네비게이션() {
  const [메뉴열림, set메뉴열림] = useState(false);

  return (
    <nav className="relative">
      {/* 데스크톱 메뉴 */}
      <ul className="hidden md:flex md:space-x-6 lg:space-x-8">
        <li><Link to="/about">소개</Link></li>
        <li><Link to="/posts">블로그</Link></li>
        <li><Link to="/contact">연락처</Link></li>
      </ul>

      {/* 모바일 햄버거 버튼 */}
      <button
        className="md:hidden"
        onClick={() => set메뉴열림(!메뉴열림)}
      >
        {메뉴열림 ? <X /> : <Menu />}
      </button>

      {/* 모바일 메뉴 */}
      {메뉴열림 && (
        <ul className="
          absolute top-full left-0 right-0
          bg-white shadow-lg
          md:hidden
          py-4
        ">
          <li><Link to="/about">소개</Link></li>
          <li><Link to="/posts">블로그</Link></li>
          <li><Link to="/contact">연락처</Link></li>
        </ul>
      )}
    </nav>
  );
}
```

## 📱 모바일 최적화 전략

### 1. 터치 친화적 인터페이스

```tsx
// 터치에 최적화된 버튼
export function 터치버튼({ children, ...props }: ButtonProps) {
  return (
    <button
      className="
        min-h-[44px]       /* 최소 터치 영역 44px */
        px-4 py-3          /* 충분한 패딩 */
        touch-manipulation /* 터치 지연 제거 */
        active:scale-95    /* 터치 피드백 */
        transition-transform
      "
      {...props}
    >
      {children}
    </button>
  );
}
```

### 2. 스와이프 제스처 지원

```tsx
// 스와이프 가능한 이미지 갤러리
export function 이미지갤러리({ 이미지목록 }: { 이미지목록: string[] }) {
  const [현재인덱스, set현재인덱스] = useState(0);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => 다음이미지(),
    onSwipedRight: () => 이전이미지(),
    trackMouse: true, // 데스크톱에서도 마우스 드래그 지원
  });

  return (
    <div
      {...swipeHandlers}
      className="
        relative overflow-hidden
        touch-pan-x           /* 수평 스와이프만 허용 */
        select-none
      "
    >
      <img
        src={이미지목록[현재인덱스]}
        className="w-full h-auto"
        alt={`이미지 ${현재인덱스 + 1}`}
      />

      {/* 모바일에서는 숨김, 태블릿 이상에서 네비게이션 버튼 표시 */}
      <button
        className="
          absolute left-4 top-1/2 -translate-y-1/2
          hidden md:block
          bg-black/50 text-white
          p-2 rounded-full
        "
        onClick={이전이미지}
      >
        <ChevronLeft />
      </button>
    </div>
  );
}
```

### 3. 모바일 성능 최적화

```tsx
// 지연 로딩과 반응형 이미지
export function 반응형이미지({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"        /* 지연 로딩 */
      decoding="async"      /* 비동기 디코딩 */
      className={`
        w-full h-auto       /* 반응형 크기 */
        object-cover        /* 비율 유지 */
        transition-opacity
        ${className}
      `}
      sizes="
        (max-width: 640px) 100vw,
        (max-width: 1024px) 50vw,
        33vw
      "
    />
  );
}
```

## 🖥️ 데스크톱 최적화

### 1. 키보드 내비게이션

```tsx
// 키보드 접근성을 고려한 컴포넌트
export function 키보드친화메뉴() {
  const [포커스인덱스, set포커스인덱스] = useState(0);

  const 키보드핸들러 = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        set포커스인덱스(prev => (prev + 1) % 메뉴항목.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        set포커스인덱스(prev => (prev - 1 + 메뉴항목.length) % 메뉴항목.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        메뉴항목[포커스인덱스].onClick();
        break;
    }
  }, [포커스인덱스]);

  return (
    <ul
      className="focus-within:ring-2 focus-within:ring-blue-500"
      onKeyDown={키보드핸들러}
    >
      {메뉴항목.map((항목, 인덱스) => (
        <li key={항목.id}>
          <button
            className={`
              w-full text-left p-3
              ${인덱스 === 포커스인덱스 ? 'bg-blue-100' : ''}
              hover:bg-gray-100
              focus:bg-blue-100 focus:outline-none
            `}
            onClick={항목.onClick}
          >
            {항목.제목}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### 2. 멀티컬럼 레이아웃

```tsx
// 대형 화면에서 멀티컬럼 활용
export function 글상세페이지() {
  return (
    <div className="
      container mx-auto px-4
      lg:grid lg:grid-cols-12 lg:gap-8
    ">
      {/* 메인 콘텐츠 */}
      <article className="
        lg:col-span-8
        prose prose-lg max-w-none
        lg:prose-xl
      ">
        <글내용 />
      </article>

      {/* 사이드바 */}
      <aside className="
        mt-8 lg:mt-0
        lg:col-span-4
        space-y-6
      ">
        <목차 />
        <관련글목록 />
        <태그목록 />
      </aside>
    </div>
  );
}
```

## 🎯 컨테이너 쿼리 활용

### CSS Container Queries로 더 정밀한 반응형

```css
/* container queries 사용 예시 */
.blog-card-container {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .blog-card {
    display: flex;
    flex-direction: row;
  }

  .blog-card__image {
    width: 150px;
    flex-shrink: 0;
  }
}

@container (min-width: 500px) {
  .blog-card {
    flex-direction: column;
  }

  .blog-card__image {
    width: 100%;
    height: 200px;
  }
}
```

```tsx
// React 컴포넌트에서 컨테이너 쿼리 활용
export function 블로그카드({ 글 }: { 글: 블로그글 }) {
  return (
    <div className="blog-card-container">
      <article className="
        blog-card
        p-4 border rounded-lg
        transition-all
      ">
        <img
          className="blog-card__image object-cover rounded"
          src={글.대표이미지URL}
          alt={글.제목}
        />
        <div className="pt-4">
          <h3 className="font-bold text-lg">{글.제목}</h3>
          <p className="text-gray-600 mt-2">{글.요약}</p>
        </div>
      </article>
    </div>
  );
}
```

## 🌙 다크모드 반응형 고려사항

```tsx
// 다크모드를 고려한 반응형 컴포넌트
export function 테마적응형카드() {
  return (
    <div className="
      p-4 md:p-6 lg:p-8
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-lg md:rounded-xl
      shadow-sm md:shadow-md lg:shadow-lg
      dark:shadow-gray-900/10

      text-gray-900 dark:text-gray-100

      hover:shadow-md md:hover:shadow-lg lg:hover:shadow-xl
      dark:hover:shadow-gray-900/20

      transition-all duration-200
    ">
      <h3 className="
        text-lg md:text-xl lg:text-2xl
        font-semibold
        mb-2 md:mb-3 lg:mb-4
      ">
        카드 제목
      </h3>
      <p className="
        text-sm md:text-base
        text-gray-600 dark:text-gray-300
        leading-relaxed
      ">
        카드 내용...
      </p>
    </div>
  );
}
```

## 📊 반응형 성능 측정

### 1. Core Web Vitals 최적화

```typescript
// 성능 측정 유틸리티
export function 성능측정() {
  useEffect(() => {
    // Largest Contentful Paint 측정
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('LCP:', entry.startTime);
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift 측정
    new PerformanceObserver((list) => {
      let cls = 0;
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      console.log('CLS:', cls);
    }).observe({ entryTypes: ['layout-shift'] });
  }, []);
}
```

### 2. 반응형 이미지 최적화

```tsx
// 자동 WebP 지원 및 다양한 해상도 제공
export function 최적화이미지({ src, alt }: { src: string; alt: string }) {
  return (
    <picture>
      <source
        media="(min-width: 1024px)"
        srcSet={`
          ${src}?w=800&f=webp 800w,
          ${src}?w=1200&f=webp 1200w,
          ${src}?w=1600&f=webp 1600w
        `}
        sizes="(min-width: 1024px) 800px"
        type="image/webp"
      />
      <source
        media="(min-width: 640px)"
        srcSet={`
          ${src}?w=600&f=webp 600w,
          ${src}?w=800&f=webp 800w
        `}
        sizes="(min-width: 640px) 600px"
        type="image/webp"
      />
      <img
        src={`${src}?w=400&f=webp`}
        alt={alt}
        loading="lazy"
        className="w-full h-auto"
        sizes="400px"
      />
    </picture>
  );
}
```

## 📋 반응형 체크리스트

### 개발 단계
- [ ] 모바일 우선으로 설계했는가?
- [ ] 모든 breakpoint에서 테스트했는가?
- [ ] 터치 영역이 충분한가? (최소 44px)
- [ ] 텍스트 가독성이 확보되는가?
- [ ] 이미지가 다양한 해상도에 최적화되어 있는가?

### 접근성 확인
- [ ] 키보드 내비게이션이 가능한가?
- [ ] 스크린 리더 호환성이 있는가?
- [ ] 색상 대비가 충분한가?
- [ ] 폰트 크기 조절 시 레이아웃이 깨지지 않는가?

### 성능 확인
- [ ] LCP가 2.5초 이내인가?
- [ ] CLS가 0.1 이하인가?
- [ ] FID가 100ms 이하인가?
- [ ] 모바일 Lighthouse 점수가 90점 이상인가?

이 가이드를 따라 모든 디바이스에서 최적의 사용자 경험을 제공하는 반응형 웹사이트를 구축할 수 있습니다.