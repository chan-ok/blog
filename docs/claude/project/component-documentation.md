# Shared Component Documentation

## 📋 Overview

This document explains the usage, API, and design principles of shared components used in the blog application.

## 🧩 Component List

### 1. PostCard

A card-style component used in post lists.

#### Usage
```typescript
import { PostCard } from '@/shared/components';

function PostsList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

#### Props
```typescript
interface PostCardProps {
  post: Post;
  className?: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  tags: string[];
  viewCount?: number;
  readingTime?: string;
}
```

#### Features
- **Responsive Design**: Mobile to desktop support
- **Accessibility**: ARIA labels, keyboard navigation
- **Hover Effects**: Enhanced user interaction
- **Status Display**: Visual indication of post status

### 2. LoadingSpinner

Component for displaying loading state during async operations.

#### Usage
```typescript
import { LoadingSpinner } from '@/shared/components';

function DataComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        text="Loading data..."
        className="min-h-[200px]"
      />
    );
  }

  return <div>Data content</div>;
}
```

#### Props
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}
```

#### Size Options
- `sm`: 16px (w-4 h-4) - Button internals, etc.
- `md`: 32px (w-8 h-8) - Default size
- `lg`: 48px (w-12 h-12) - Page loading, etc.

### 3. EmptyState

Component displayed when there's no data or search results.

#### Usage
```typescript
import { EmptyState } from '@/shared/components';

function SearchResults({ results, query }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No search results"
        description={`No posts found for "${query}".`}
        actionText="View all posts"
        actionHref="/posts"
      />
    );
  }

  return <div>{/* Search results */}</div>;
}
```

#### Props
```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}
```

### 4. PageHeader

Component for displaying page title and description.

#### Usage
```typescript
import { PageHeader } from '@/shared/components';

function AboutPage() {
  return (
    <>
      <PageHeader
        title="About"
        description="Sharing my journey and experiences as a developer."
        className="mb-8"
      />
      <div>{/* Page content */}</div>
    </>
  );
}
```

### 5. TagBadge

Badge component for displaying tags.

#### Usage
```typescript
import { TagBadge } from '@/shared/components';

function PostTags({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <TagBadge
          key={tag}
          tag={tag}
          variant="blue"
          href={`/tags/${tag}`}
        />
      ))}
    </div>
  );
}
```

## 🎨 Design System

### Colors
- Primary: Blue family for main actions
- Gray: Neutral colors for text and backgrounds
- Semantic: Green (success), Red (error), Yellow (warning)

### Typography
- Font family: Pretendard (Korean-friendly)
- Scales: Text-sm to text-5xl
- Weights: Normal, medium, semibold, bold

### Spacing
- Base unit: 4px (0.25rem)
- Common values: 4, 8, 12, 16, 24, 32, 48, 64px

### Shadows
- sm: Subtle elevation
- md: Standard cards
- lg: Modals and overlays

## 📱 Responsive Patterns

### Breakpoints
- sm: 640px (Small tablets)
- md: 768px (Tablets)
- lg: 1024px (Desktop)
- xl: 1280px (Large desktop)

### Grid System
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 3-4 columns

## ♿ Accessibility Guidelines

### ARIA Support
- Labels for interactive elements
- Roles for complex components
- Live regions for dynamic content

### Keyboard Navigation
- Tab order logical flow
- Enter/Space for activation
- Escape for dismissal

### Color Contrast
- AA compliance (4.5:1 ratio)
- Additional visual cues beyond color
- High contrast mode support

## 🔧 Development Guidelines

### File Structure
```
src/shared/components/
├── ui/              # shadcn/ui components
├── PostCard.tsx     # Business components
├── LoadingSpinner.tsx
├── EmptyState.tsx
├── PageHeader.tsx
├── TagBadge.tsx
└── index.ts         # Barrel exports
```

### Naming Conventions
- PascalCase for components
- camelCase for props
- Descriptive, not generic names

### Props Design
- Accept className for styling flexibility
- Use TypeScript interfaces
- Default values for optional props
- Consistent prop naming across components

This documentation ensures consistent usage and maintains design system integrity across the application.