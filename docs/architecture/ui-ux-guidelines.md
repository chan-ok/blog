# UI/UX 가이드라인

## 🎨 디자인 시스템 개요

### 기본 철학
1. **일관성**: 전체 애플리케이션에서 통일된 디자인 언어
2. **접근성**: 모든 사용자가 접근 가능한 인터페이스
3. **사용성**: 직관적이고 효율적인 사용자 경험
4. **확장성**: 새로운 기능과 컴포넌트 추가가 용이한 시스템

### 디자인 토큰 기반 시스템
- **컬러**: CSS 변수 기반 다크모드 지원
- **타이포그래피**: 한국어 친화적 폰트 스택
- **스페이싱**: 8px 기반 일관된 간격 시스템
- **그림자**: 깊이감을 표현하는 계층적 shadow

## 🎨 컬러 시스템

### 기본 컬러 팔레트

```css
:root {
  /* Primary Colors - 브랜드 색상 */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;

  /* Neutral Colors - 텍스트 및 배경 */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-500: #737373;
  --color-neutral-900: #171717;

  /* Semantic Colors - 의미가 있는 색상 */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-50: #171717;
    --color-neutral-100: #262626;
    --color-neutral-500: #a3a3a3;
    --color-neutral-900: #fafafa;
  }
}
```

### 컬러 사용 가이드라인

```tsx
// 올바른 컬러 사용 예시
export function 블로그카드() {
  return (
    <article className="
      bg-white dark:bg-neutral-800
      border border-neutral-200 dark:border-neutral-700
      text-neutral-900 dark:text-neutral-100
      hover:shadow-md
      transition-colors
    ">
      <h3 className="text-primary-600 dark:text-primary-400">
        카드 제목
      </h3>
      <p className="text-neutral-600 dark:text-neutral-300">
        카드 설명
      </p>
      <button className="
        bg-primary-500 hover:bg-primary-600
        text-white
        px-4 py-2 rounded-md
        transition-colors
      ">
        자세히 보기
      </button>
    </article>
  );
}
```

## 📝 타이포그래피

### 폰트 스택

```css
:root {
  /* 한국어 친화적 폰트 스택 */
  --font-sans:
    "Pretendard Variable",
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    sans-serif;

  /* 코드 폰트 */
  --font-mono:
    "JetBrains Mono",
    "Fira Code",
    "Monaco",
    "Consolas",
    "Ubuntu Mono",
    monospace;
}
```

### 텍스트 스케일

```tsx
// 타이포그래피 컴포넌트 시스템
export const Typography = {
  H1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
      {children}
    </h1>
  ),

  H2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
      {children}
    </h2>
  ),

  H3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-2xl md:text-3xl font-semibold leading-snug">
      {children}
    </h3>
  ),

  Body: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-base leading-relaxed ${className}`}>
      {children}
    </p>
  ),

  Caption: ({ children }: { children: React.ReactNode }) => (
    <span className="text-sm text-neutral-600 dark:text-neutral-400">
      {children}
    </span>
  ),

  Code: ({ children }: { children: React.ReactNode }) => (
    <code className="
      font-mono text-sm
      bg-neutral-100 dark:bg-neutral-800
      px-1.5 py-0.5 rounded
    ">
      {children}
    </code>
  )
};

// 사용 예시
function 글상세() {
  return (
    <article>
      <Typography.H1>블로그 글 제목</Typography.H1>
      <Typography.Caption>2024년 1월 15일 · 5분 읽기</Typography.Caption>
      <Typography.Body>
        글의 본문 내용입니다. <Typography.Code>코드 예시</Typography.Code>를 포함할 수 있습니다.
      </Typography.Body>
    </article>
  );
}
```

## 📏 스페이싱 시스템

### 8px 기반 그리드

```css
:root {
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
  --spacing-20: 5rem;    /* 80px */
}
```

### 스페이싱 가이드라인

```tsx
// 일관된 스페이싱 사용 예시
export function 레이아웃컴포넌트() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 섹션 간 간격: 64px (spacing-16) */}
      <section className="mb-16">
        <h2 className="mb-6">섹션 제목</h2>

        {/* 카드 간 간격: 24px (spacing-6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 카드 내부 패딩: 24px (spacing-6) */}
          <div className="p-6 bg-white rounded-lg shadow">
            {/* 요소 간 간격: 16px (spacing-4) */}
            <h3 className="mb-4">카드 제목</h3>
            <p className="mb-4">카드 내용</p>
            <button className="px-4 py-2">버튼</button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 🎯 컴포넌트 가이드라인

### 1. 버튼 시스템

```tsx
// 버튼 변형들
export const Button = {
  Primary: ({ children, ...props }: ButtonProps) => (
    <button
      className="
        bg-primary-500 hover:bg-primary-600
        text-white
        px-4 py-2 rounded-md
        font-medium
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      "
      {...props}
    >
      {children}
    </button>
  ),

  Secondary: ({ children, ...props }: ButtonProps) => (
    <button
      className="
        bg-white hover:bg-neutral-50
        border border-neutral-300
        text-neutral-700
        px-4 py-2 rounded-md
        font-medium
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      "
      {...props}
    >
      {children}
    </button>
  ),

  Ghost: ({ children, ...props }: ButtonProps) => (
    <button
      className="
        text-primary-600 hover:text-primary-700
        hover:bg-primary-50
        px-4 py-2 rounded-md
        font-medium
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      "
      {...props}
    >
      {children}
    </button>
  )
};
```

### 2. 입력 필드

```tsx
// 일관된 입력 필드 스타일
export function InputField({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <input
        className={`
          w-full px-3 py-2
          border rounded-md
          bg-white dark:bg-neutral-800
          text-neutral-900 dark:text-neutral-100
          placeholder-neutral-500
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error
            ? 'border-error'
            : 'border-neutral-300 dark:border-neutral-600'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}
```

### 3. 카드 컴포넌트

```tsx
// 재사용 가능한 카드 시스템
export const Card = {
  Container: ({ children, className = '' }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`
      bg-white dark:bg-neutral-800
      border border-neutral-200 dark:border-neutral-700
      rounded-lg shadow-sm
      ${className}
    `}>
      {children}
    </div>
  ),

  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
      {children}
    </div>
  ),

  Content: ({ children }: { children: React.ReactNode }) => (
    <div className="p-6">
      {children}
    </div>
  ),

  Footer: ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700/50">
      {children}
    </div>
  )
};

// 사용 예시
function 블로그글카드({ 글 }: { 글: 블로그글 }) {
  return (
    <Card.Container className="hover:shadow-md transition-shadow">
      <Card.Content>
        <Typography.H3>{글.제목}</Typography.H3>
        <Typography.Body className="mt-2">{글.요약}</Typography.Body>
      </Card.Content>
      <Card.Footer>
        <div className="flex justify-between items-center">
          <Typography.Caption>{글.생성일자.toLocaleDateString()}</Typography.Caption>
          <Button.Ghost>자세히 보기</Button.Ghost>
        </div>
      </Card.Footer>
    </Card.Container>
  );
}
```

## ♿ 접근성 가이드라인

### 1. 키보드 내비게이션

```tsx
// 키보드 접근 가능한 드롭다운 메뉴
export function AccessibleDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < menuItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : menuItems.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          menuItems[focusedIndex].onClick();
        }
        break;
    }
  };

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        메뉴
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded shadow-lg"
          onKeyDown={handleKeyDown}
        >
          {menuItems.map((item, index) => (
            <li key={item.id} role="none">
              <button
                role="menuitem"
                className={`
                  w-full text-left px-4 py-2
                  hover:bg-neutral-100
                  ${index === focusedIndex ? 'bg-neutral-100' : ''}
                  focus:outline-none
                `}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2. ARIA 라벨 및 스크린 리더 지원

```tsx
// 접근성을 고려한 로딩 상태
export function AccessibleLoadingSpinner({
  label = "로딩 중"
}: {
  label?: string
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex items-center justify-center"
    >
      <svg
        className="animate-spin h-8 w-8 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
```

### 3. 색상 대비 및 포커스 표시

```css
/* 접근성을 고려한 포커스 스타일 */
.focus-visible {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .text-neutral-600 {
    @apply text-neutral-800;
  }

  .border-neutral-200 {
    @apply border-neutral-400;
  }
}

/* 움직임 감소 선호 사용자 지원 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📱 모바일 UX 패턴

### 1. 터치 친화적 인터페이스

```tsx
// 모바일에 최적화된 네비게이션
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 햄버거 버튼 - 충분한 터치 영역 */}
      <button
        className="
          p-3                    /* 최소 48x48px 터치 영역 */
          md:hidden
          focus:outline-none
          touch-manipulation     /* 터치 지연 제거 */
        "
        onClick={() => setIsOpen(!isOpen)}
        aria-label="메뉴 열기"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 전체 화면 오버레이 메뉴 */}
      {isOpen && (
        <div className="
          fixed inset-0 z-50
          bg-white dark:bg-neutral-900
          md:hidden
        ">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">메뉴</h2>
              <button
                className="p-3"
                onClick={() => setIsOpen(false)}
                aria-label="메뉴 닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <ul className="p-4 space-y-2">
                {menuItems.map(item => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="
                        block py-3 px-4
                        text-lg
                        hover:bg-neutral-100 dark:hover:bg-neutral-800
                        rounded-md
                        transition-colors
                      "
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
```

### 2. 스와이프 제스처

```tsx
// 스와이프 가능한 이미지 갤러리
export function SwipeableGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    },
    onSwipedRight: () => {
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    },
    trackMouse: true,
    trackTouch: true,
  });

  return (
    <div {...swipeHandlers} className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            className="w-full flex-shrink-0 object-cover"
            alt={`이미지 ${index + 1}`}
          />
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`
                w-3 h-3 rounded-full
                ${index === currentIndex ? 'bg-white' : 'bg-white/50'}
                transition-colors
              `}
              onClick={() => setCurrentIndex(index)}
              aria-label={`이미지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 📋 UI/UX 체크리스트

### 디자인 일관성
- [ ] 컬러 시스템을 일관되게 사용했는가?
- [ ] 타이포그래피 스케일을 준수했는가?
- [ ] 스페이싱 시스템을 적용했는가?
- [ ] 컴포넌트 변형이 일관된가?

### 접근성
- [ ] 키보드 내비게이션이 가능한가?
- [ ] ARIA 라벨이 적절히 설정되었는가?
- [ ] 색상 대비가 충분한가? (4.5:1 이상)
- [ ] 포커스 표시가 명확한가?
- [ ] 스크린 리더 호환성이 있는가?

### 모바일 경험
- [ ] 터치 영역이 충분한가? (최소 44px)
- [ ] 스와이프 제스처가 직관적인가?
- [ ] 모바일 메뉴가 사용하기 쉬운가?
- [ ] 텍스트 크기가 읽기 좋은가?

### 성능 및 사용성
- [ ] 로딩 상태가 명확히 표시되는가?
- [ ] 에러 상태가 사용자 친화적인가?
- [ ] 인터랙션 피드백이 즉각적인가?
- [ ] 애니메이션이 성능에 영향을 주지 않는가?

이 가이드라인을 따라 일관되고 접근 가능하며 사용자 친화적인 인터페이스를 구축할 수 있습니다.