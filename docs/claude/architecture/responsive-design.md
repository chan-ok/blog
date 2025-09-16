# Responsive Design Guide

## 📱 Responsive Design Philosophy

### Core Principles
1. **Mobile First** Design
2. **Progressive Enhancement**
3. **Content-Centered** Approach
4. **Performance Optimization** Consideration

### Design System Foundation
- **Base**: Tailwind CSS v4 + shadcn/ui
- **Icons**: Lucide React
- **Typography**: Korean-friendly font stack
- **Colors**: CSS variable-based dark mode support

## 📐 Breakpoint Definition

### Tailwind CSS v4 Standard Breakpoints

```css
/* Mobile-first design */
/* Default (Mobile)     : 0px ~ 639px   */
sm: 640px;    /* Small Tablet      : 640px ~ 767px  */
md: 768px;    /* Tablet           : 768px ~ 1023px */
lg: 1024px;   /* Desktop          : 1024px ~ 1279px */
xl: 1280px;   /* Large Desktop    : 1280px ~ 1535px */
2xl: 1536px;  /* Extra Large Display : 1536px ~      */
```

### Usage Recommendations

```typescript
// Responsive component example
export function ResponsiveHeader() {
  return (
    <header className="
      px-4 py-3           /* Mobile: small padding */
      md:px-6 md:py-4     /* Tablet: medium padding */
      lg:px-8 lg:py-5     /* Desktop: large padding */
      flex flex-col       /* Mobile: vertical alignment */
      md:flex-row         /* Tablet+: horizontal alignment */
      items-center
      justify-between
    ">
      <Logo />
      <NavigationMenu />
    </header>
  );
}
```

## 🎨 Responsive Component Patterns

### 1. Grid System Usage

```tsx
// Responsive post list grid
export function PostList() {
  return (
    <div className="
      grid
      grid-cols-1        /* Mobile: 1 column */
      md:grid-cols-2     /* Tablet: 2 columns */
      lg:grid-cols-3     /* Desktop: 3 columns */
      gap-4 md:gap-6 lg:gap-8
    ">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

### 2. Flexible Typography

```tsx
// Responsive title component
export function PageTitle({ children }: { children: React.ReactNode }) {
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

### 3. Adaptive Navigation

```tsx
// Responsive navigation with hamburger menu
export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative">
      {/* Desktop menu */}
      <ul className="hidden md:flex md:space-x-6 lg:space-x-8">
        <li><Link to="/about">About</Link></li>
        <li><Link to="/posts">Blog</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="
          absolute top-full left-0 right-0
          bg-white shadow-lg
          md:hidden
          py-4
        ">
          <li><Link to="/about">About</Link></li>
          <li><Link to="/posts">Blog</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      )}
    </nav>
  );
}
```

## 📱 Mobile Optimization Strategy

### 1. Touch-Friendly Interface

```tsx
// Touch-optimized button
export function TouchButton({ children, ...props }: ButtonProps) {
  return (
    <button
      className="
        min-h-[44px]       /* Minimum touch area 44px */
        px-4 py-3          /* Sufficient padding */
        touch-manipulation /* Remove touch delay */
        active:scale-95    /* Touch feedback */
        transition-transform
      "
      {...props}
    >
      {children}
    </button>
  );
}
```

### 2. Swipe Gesture Support

```tsx
// Swipeable image gallery
export function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    trackMouse: true, // Support mouse drag on desktop
  });

  return (
    <div
      {...swipeHandlers}
      className="
        relative overflow-hidden
        touch-pan-x           /* Allow only horizontal swipe */
        select-none
      "
    >
      <img
        src={images[currentIndex]}
        className="w-full h-auto"
        alt={`Image ${currentIndex + 1}`}
      />

      {/* Hidden on mobile, show navigation buttons on tablet+ */}
      <button
        className="
          absolute left-4 top-1/2 -translate-y-1/2
          hidden md:block
          bg-black/50 text-white
          p-2 rounded-full
        "
        onClick={prevImage}
      >
        <ChevronLeft />
      </button>
    </div>
  );
}
```

### 3. Mobile Performance Optimization

```tsx
// Lazy loading and responsive images
export function ResponsiveImage({
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
      loading="lazy"        /* Lazy loading */
      decoding="async"      /* Async decoding */
      className={`
        w-full h-auto       /* Responsive size */
        object-cover        /* Maintain aspect ratio */
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

## 🖥️ Desktop Optimization

### 1. Keyboard Navigation

```tsx
// Component considering keyboard accessibility
export function KeyboardFriendlyMenu() {
  const [focusIndex, setFocusIndex] = useState(0);

  const keyboardHandler = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(prev => (prev + 1) % menuItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(prev => (prev - 1 + menuItems.length) % menuItems.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        menuItems[focusIndex].onClick();
        break;
    }
  }, [focusIndex]);

  return (
    <ul
      className="focus-within:ring-2 focus-within:ring-blue-500"
      onKeyDown={keyboardHandler}
    >
      {menuItems.map((item, index) => (
        <li key={item.id}>
          <button
            className={`
              w-full text-left p-3
              ${index === focusIndex ? 'bg-blue-100' : ''}
              hover:bg-gray-100
              focus:bg-blue-100 focus:outline-none
            `}
            onClick={item.onClick}
          >
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### 2. Multi-Column Layout

```tsx
// Multi-column layout for large screens
export function PostDetailPage() {
  return (
    <div className="
      container mx-auto px-4
      lg:grid lg:grid-cols-12 lg:gap-8
    ">
      {/* Main content */}
      <article className="
        lg:col-span-8
        prose prose-lg max-w-none
        lg:prose-xl
      ">
        <PostContent />
      </article>

      {/* Sidebar */}
      <aside className="
        mt-8 lg:mt-0
        lg:col-span-4
        space-y-6
      ">
        <TableOfContents />
        <RelatedPosts />
        <TagList />
      </aside>
    </div>
  );
}
```

## 🎯 Container Query Usage

### More Precise Responsive Design with CSS Container Queries

```css
/* Container queries usage example */
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
// Using container queries in React components
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="blog-card-container">
      <article className="
        blog-card
        p-4 border rounded-lg
        transition-all
      ">
        <img
          className="blog-card__image object-cover rounded"
          src={post.featuredImageUrl}
          alt={post.title}
        />
        <div className="pt-4">
          <h3 className="font-bold text-lg">{post.title}</h3>
          <p className="text-gray-600 mt-2">{post.excerpt}</p>
        </div>
      </article>
    </div>
  );
}
```

## 🌙 Dark Mode Responsive Considerations

```tsx
// Responsive component considering dark mode
export function ThemeAdaptiveCard() {
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
        Card Title
      </h3>
      <p className="
        text-sm md:text-base
        text-gray-600 dark:text-gray-300
        leading-relaxed
      ">
        Card content...
      </p>
    </div>
  );
}
```

## 📊 Responsive Performance Measurement

### 1. Core Web Vitals Optimization

```typescript
// Performance measurement utility
export function measurePerformance() {
  useEffect(() => {
    // Largest Contentful Paint measurement
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log('LCP:', entry.startTime);
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift measurement
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

### 2. Responsive Image Optimization

```tsx
// Automatic WebP support and multiple resolutions
export function OptimizedImage({ src, alt }: { src: string; alt: string }) {
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

## 📋 Responsive Checklist

### Development Phase
- [ ] Designed mobile-first?
- [ ] Tested on all breakpoints?
- [ ] Are touch areas sufficient? (minimum 44px)
- [ ] Is text readability ensured?
- [ ] Are images optimized for various resolutions?

### Accessibility Check
- [ ] Is keyboard navigation possible?
- [ ] Is it screen reader compatible?
- [ ] Is color contrast sufficient?
- [ ] Does layout not break when font size is adjusted?

### Performance Check
- [ ] Is LCP within 2.5 seconds?
- [ ] Is CLS below 0.1?
- [ ] Is FID within 100ms?
- [ ] Is mobile Lighthouse score above 90?

Following this guide will help you build a responsive website that provides optimal user experience on all devices.