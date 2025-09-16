# UI/UX Guidelines

## 🎨 Design System Overview

### Basic Philosophy
1. **Consistency**: Unified design language across the entire application
2. **Accessibility**: Interface accessible to all users
3. **Usability**: Intuitive and efficient user experience
4. **Scalability**: System that allows easy addition of new features and components

### Design Token-Based System
- **Colors**: CSS variable-based dark mode support
- **Typography**: Korean-friendly font stack
- **Spacing**: Consistent spacing system based on 8px
- **Shadows**: Hierarchical shadows expressing depth

## 🎨 Color System

### Basic Color Palette

```css
:root {
  /* Primary Colors - Brand colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;

  /* Neutral Colors - Text and background */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-500: #737373;
  --color-neutral-900: #171717;

  /* Semantic Colors - Meaningful colors */
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

### Color Usage Guidelines

```tsx
// Correct color usage example
export function BlogCard() {
  return (
    <article className="
      bg-white dark:bg-neutral-800
      border border-neutral-200 dark:border-neutral-700
      text-neutral-900 dark:text-neutral-100
      hover:shadow-md
      transition-colors
    ">
      <h3 className="text-primary-600 dark:text-primary-400">
        Card Title
      </h3>
      <p className="text-neutral-600 dark:text-neutral-300">
        Card Description
      </p>
      <button className="
        bg-primary-500 hover:bg-primary-600
        text-white
        px-4 py-2 rounded-md
        transition-colors
      ">
        Read More
      </button>
    </article>
  );
}
```

## 📝 Typography

### Font Stack

```css
:root {
  /* Korean-friendly font stack */
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

  /* Code font */
  --font-mono:
    "JetBrains Mono",
    "Fira Code",
    "Monaco",
    "Consolas",
    "Ubuntu Mono",
    monospace;
}
```

### Text Scale

```tsx
// Typography component system
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

// Usage example
function PostDetail() {
  return (
    <article>
      <Typography.H1>Blog Post Title</Typography.H1>
      <Typography.Caption>January 15, 2024 · 5 min read</Typography.Caption>
      <Typography.Body>
        This is the post content. It can include <Typography.Code>code examples</Typography.Code>.
      </Typography.Body>
    </article>
  );
}
```

## 📏 Spacing System

### 8px-Based Grid

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

### Spacing Guidelines

```tsx
// Consistent spacing usage example
export function LayoutComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section spacing: 64px (spacing-16) */}
      <section className="mb-16">
        <h2 className="mb-6">Section Title</h2>

        {/* Card spacing: 24px (spacing-6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card internal padding: 24px (spacing-6) */}
          <div className="p-6 bg-white rounded-lg shadow">
            {/* Element spacing: 16px (spacing-4) */}
            <h3 className="mb-4">Card Title</h3>
            <p className="mb-4">Card Content</p>
            <button className="px-4 py-2">Button</button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 🎯 Component Guidelines

### 1. Button System

```tsx
// Button variations
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

### 2. Input Fields

```tsx
// Consistent input field styles
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

### 3. Card Component

```tsx
// Reusable card system
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

// Usage example
function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card.Container className="hover:shadow-md transition-shadow">
      <Card.Content>
        <Typography.H3>{post.title}</Typography.H3>
        <Typography.Body className="mt-2">{post.excerpt}</Typography.Body>
      </Card.Content>
      <Card.Footer>
        <div className="flex justify-between items-center">
          <Typography.Caption>{post.createdAt.toLocaleDateString()}</Typography.Caption>
          <Button.Ghost>Read More</Button.Ghost>
        </div>
      </Card.Footer>
    </Card.Container>
  );
}
```

## ♿ Accessibility Guidelines

### 1. Keyboard Navigation

```tsx
// Keyboard accessible dropdown menu
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
        Menu
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

### 2. ARIA Labels and Screen Reader Support

```tsx
// Loading state considering accessibility
export function AccessibleLoadingSpinner({
  label = "Loading"
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

### 3. Color Contrast and Focus Indicators

```css
/* Focus styles considering accessibility */
.focus-visible {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .text-neutral-600 {
    @apply text-neutral-800;
  }

  .border-neutral-200 {
    @apply border-neutral-400;
  }
}

/* Support for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📱 Mobile UX Patterns

### 1. Touch-Friendly Interface

```tsx
// Mobile-optimized navigation
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button - sufficient touch area */}
      <button
        className="
          p-3                    /* Minimum 48x48px touch area */
          md:hidden
          focus:outline-none
          touch-manipulation     /* Remove touch delay */
        "
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Full screen overlay menu */}
      {isOpen && (
        <div className="
          fixed inset-0 z-50
          bg-white dark:bg-neutral-900
          md:hidden
        ">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                className="p-3"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
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

### 2. Swipe Gestures

```tsx
// Swipeable image gallery
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
            alt={`Image ${index + 1}`}
          />
        ))}
      </div>

      {/* Indicators */}
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
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 📋 UI/UX Checklist

### Design Consistency
- [ ] Are colors used consistently throughout the system?
- [ ] Is the typography scale followed?
- [ ] Is the spacing system applied?
- [ ] Are component variations consistent?

### Accessibility
- [ ] Is keyboard navigation possible?
- [ ] Are ARIA labels properly set?
- [ ] Is color contrast sufficient? (4.5:1 or higher)
- [ ] Are focus indicators clear?
- [ ] Is it screen reader compatible?

### Mobile Experience
- [ ] Are touch areas sufficient? (minimum 44px)
- [ ] Are swipe gestures intuitive?
- [ ] Is the mobile menu easy to use?
- [ ] Is text size readable?

### Performance and Usability
- [ ] Are loading states clearly displayed?
- [ ] Are error states user-friendly?
- [ ] Is interaction feedback immediate?
- [ ] Do animations not impact performance?

Following these guidelines will help you build a consistent, accessible, and user-friendly interface.