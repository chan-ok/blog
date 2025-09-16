# Performance Optimization Guide

## 🚀 Performance Optimization Strategy Overview

### Core Objectives
1. **Fast Initial Loading**: Complete loading within 3 seconds
2. **Smooth Interactions**: Maintain 60fps
3. **Efficient Memory Usage**: Prevent memory leaks
4. **Optimized Network**: Minimize unnecessary requests

### Measurement Criteria (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 📦 Code Splitting

### 1. Route-Based Splitting

```typescript
// Leverage TanStack Router's automatic code splitting
// routes/posts/$slug.tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

// Split components with lazy loading
const PostDetailPage = lazy(() => import('../components/PostDetailPage'));
const CommentSection = lazy(() => import('../components/CommentSection'));

export const Route = createFileRoute('/posts/$slug')({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <PostDetailPage />
      <Suspense fallback={<CommentLoading />}>
        <CommentSection />
      </Suspense>
    </Suspense>
  ),
});
```

### 2. Component-Based Splitting

```typescript
// Lazy loading for heavy components
const MarkdownEditor = lazy(() =>
  import('@/features/post-editor/components/MarkdownEditor').then(module => ({
    default: module.MarkdownEditor
  }))
);

const ChartComponent = lazy(() =>
  import('recharts').then(module => ({
    default: module.ResponsiveContainer
  }))
);

// Conditional loading
function AdminDashboard() {
  const { data: user } = useCurrentUser();
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Load only when needed */}
      {showEditor && (
        <Suspense fallback={<EditorLoading />}>
          <MarkdownEditor />
        </Suspense>
      )}

      <button onClick={() => setShowEditor(true)}>
        Write Post
      </button>
    </div>
  );
}
```

### 3. Third-Party Library Splitting

```typescript
// Dynamic import for loading only when needed
async function processImage(file: File) {
  // Load image compression library only when needed
  const { default: imageCompression } = await import('browser-image-compression');

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  return await imageCompression(file, options);
}

// PDF generation feature
async function generatePDF(content: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);

  // PDF generation logic...
}
```

## ⚡ Rendering Optimization

### 1. React.memo Usage

```typescript
// Prevent unnecessary re-renders
export const PostCard = memo(function PostCard({
  post,
  onClick
}: {
  post: BlogPost;
  onClick: (id: string) => void;
}) {
  return (
    <article className="border rounded-lg p-4">
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <button onClick={() => onClick(post.id)}>
        Read More
      </button>
    </article>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.updatedAt === nextProps.post.updatedAt
  );
});
```

### 2. useMemo and useCallback Optimization

```typescript
// Cache expensive computation results
function PostStatsDashboard() {
  const { data: posts } = usePosts();

  // Cache complex calculation results
  const statsData = useMemo(() => {
    if (!posts) return null;

    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(post => post.status === 'published').length,
      monthlyStats: posts.reduce((acc, post) => {
        const month = post.createdAt.toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      popularTags: posts
        .flatMap(post => post.tags)
        .reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };
  }, [posts]);

  // Stabilize function references
  const handleDeletePost = useCallback((id: string) => {
    // Delete logic
  }, []);

  const handleEditPost = useCallback((id: string, data: any) => {
    // Edit logic
  }, []);

  return (
    <div>
      {statsData && <StatsChart data={statsData} />}
      {posts?.map(post => (
        <PostManagementCard
          key={post.id}
          post={post}
          onDelete={handleDeletePost}
          onEdit={handleEditPost}
        />
      ))}
    </div>
  );
}
```

### 3. Virtualization

```typescript
// Long list virtualization using react-window
import { FixedSizeList as List } from 'react-window';

function LargePostList() {
  const { data: posts } = usePosts({ size: 1000 });

  const renderPostItem = useCallback(({ index, style }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const post = posts[index];

    return (
      <div style={style}>
        <PostCard post={post} />
      </div>
    );
  }, [posts]);

  return (
    <List
      height={600}        // Visible area height
      itemCount={posts?.length || 0}
      itemSize={200}      // Each item height
      overscanCount={5}   // Number of items to pre-render
    >
      {renderPostItem}
    </List>
  );
}
```

## 🖼️ Image Optimization

### 1. Multiple Formats and Sizes

```typescript
// Responsive image component
export function OptimizedImage({
  src,
  alt,
  sizes = "100vw",
  className
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  // Generate various sizes and formats
  const generateSrcSet = (originalUrl: string, format: string) => {
    const sizeList = [400, 600, 800, 1200, 1600];
    return sizeList
      .map(size => `${originalUrl}?w=${size}&f=${format} ${size}w`)
      .join(', ');
  };

  return (
    <picture>
      {/* WebP format (modern browsers) */}
      <source
        srcSet={generateSrcSet(src, 'webp')}
        sizes={sizes}
        type="image/webp"
      />

      {/* AVIF format (newer) */}
      <source
        srcSet={generateSrcSet(src, 'avif')}
        sizes={sizes}
        type="image/avif"
      />

      {/* Default format (compatibility) */}
      <img
        src={`${src}?w=800&f=jpg`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={className}
        sizes={sizes}
      />
    </picture>
  );
}
```

### 2. Lazy Loading and Intersection Observer

```typescript
// Custom lazy loading hook
function useLazyImage() {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const currentImage = imageRef.current;
    if (!currentImage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',  // Pre-load 50px ahead
        threshold: 0.1
      }
    );

    observer.observe(currentImage);

    return () => observer.disconnect();
  }, []);

  return { imageRef, loaded };
}

// Usage example
function LazyLoadImage({ src, alt }: { src: string; alt: string }) {
  const { imageRef, loaded } = useLazyImage();

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={loaded ? src : ''}
        alt={alt}
        className={`transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

### 3. Image Compression and Optimization

```typescript
// Client-side image compression
async function optimizeImageUpload(file: File): Promise<File> {
  // Return as-is if not an image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip compression for small images
  if (file.size <= 1024 * 1024) { // Don't compress under 1MB
    return file;
  }

  const { default: imageCompression } = await import('browser-image-compression');

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type.includes('png') ? 'image/png' : 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log('Compression complete:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
    });

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
}
```

## 📡 Network Optimization

### 1. TanStack Query Caching Strategy

```typescript
// Efficient caching configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // Fresh for 5 minutes
      cacheTime: 10 * 60 * 1000,    // Keep cache for 10 minutes
      refetchOnWindowFocus: false,   // Disable auto-refetch on focus
      refetchOnReconnect: 'always',  // Refetch on reconnection
      retry: (failureCount, error: any) => {
        // Don't retry client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Prefetch important data
export async function prefetchCriticalData() {
  const prefetchTasks = [
    queryClient.prefetchQuery({
      queryKey: ['posts', 1],
      queryFn: () => fetchPosts({ page: 1, pageSize: 10 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['popularTags'],
      queryFn: () => fetchPopularTags(),
    }),
  ];

  await Promise.allSettled(prefetchTasks);
}
```

### 2. API Request Optimization

```typescript
// Request batching and deduplication
class APIRequestOptimizer {
  private pendingRequests = new Map<string, Promise<any>>();
  private batchTimer: number | null = null;
  private batchRequests: Array<{ key: string; request: () => Promise<any>; resolve: Function; reject: Function }> = [];

  // Prevent duplicate requests
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const requestPromise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  // Batch requests
  async batchRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchRequests.push({ key, request: requestFn, resolve, reject });

      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }

      this.batchTimer = window.setTimeout(() => {
        this.executeBatch();
      }, 10); // Execute batch after 10ms
    });
  }

  private async executeBatch() {
    const currentBatch = [...this.batchRequests];
    this.batchRequests = [];
    this.batchTimer = null;

    // Limit concurrent executions
    const concurrency = 5;
    for (let i = 0; i < currentBatch.length; i += concurrency) {
      const chunk = currentBatch.slice(i, i + concurrency);

      await Promise.allSettled(
        chunk.map(async ({ request, resolve, reject }) => {
          try {
            const result = await request();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      );
    }
  }
}

export const apiOptimizer = new APIRequestOptimizer();
```

### 3. Service Worker Caching

```typescript
// service-worker.ts
const CACHE_NAME = 'my-blog-v1';
const staticAssets = [
  '/',
  '/app.js',
  '/app.css',
  '/manifest.json'
];

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(staticAssets))
      .then(() => self.skipWaiting())
  );
});

// Intercept network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API requests: network first, cache on failure
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => cachedResponse || fetch(request))
  );
});
```

## 🔍 Performance Monitoring

### 1. Core Web Vitals Measurement

```typescript
// Performance metrics collection
export function collectPerformanceMetrics() {
  // LCP (Largest Contentful Paint) measurement
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);

    // Send to analytics service
    sendPerformanceData('LCP', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // FID (First Input Delay) measurement
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('FID:', entry.processingStart - entry.startTime);
      sendPerformanceData('FID', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });

  // CLS (Cumulative Layout Shift) measurement
  let clsScore = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
      }
    });
    console.log('CLS:', clsScore);
    sendPerformanceData('CLS', clsScore);
  }).observe({ entryTypes: ['layout-shift'] });
}

async function sendPerformanceData(metric: string, value: number) {
  // Send performance data to analytics service
  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric,
        value,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: location.href
      })
    });
  } catch (error) {
    console.error('Failed to send performance data:', error);
  }
}
```

### 2. Bundle Analysis

```bash
# Vite bundle analysis
pnpm build -- --analyze

# Bundle size visualization
pnpm add -D rollup-plugin-visualizer
```

```typescript
// Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
});
```

## 📋 Performance Optimization Checklist

### Initial Loading Optimization
- [ ] Apply route-based code splitting
- [ ] Lazy load non-critical components
- [ ] Implement image lazy loading and optimization
- [ ] Optimize fonts (font-display: swap)
- [ ] Inline only minimal CSS needed for initial render

### Runtime Performance Optimization
- [ ] Prevent unnecessary re-renders with React.memo
- [ ] Use useMemo/useCallback appropriately
- [ ] Apply virtualization to long lists
- [ ] Optimize event handlers
- [ ] Prevent memory leaks (cleanup event listeners)

### Network Optimization
- [ ] Establish TanStack Query caching strategy
- [ ] Deduplicate API requests
- [ ] Compress images and provide multiple formats
- [ ] Implement Service Worker caching strategy
- [ ] Utilize CDN

### Monitoring and Measurement
- [ ] Implement Core Web Vitals measurement
- [ ] Monitor bundle size
- [ ] Collect real user performance data
- [ ] Conduct regular performance testing

Following this guide will help you build a web application that delivers optimal performance.