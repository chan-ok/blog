# 성능 최적화 가이드

## 🚀 성능 최적화 전략 개요

### 핵심 목표
1. **빠른 초기 로딩**: 3초 이내 완전 로딩
2. **부드러운 인터랙션**: 60fps 유지
3. **효율적인 메모리 사용**: 메모리 누수 방지
4. **최적화된 네트워크**: 불필요한 요청 최소화

### 측정 기준 (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 📦 코드 분할 (Code Splitting)

### 1. 라우트 기반 분할

```typescript
// TanStack Router의 자동 코드 분할 활용
// routes/posts/$slug.tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

// 지연 로딩으로 컴포넌트 분할
const 글상세페이지 = lazy(() => import('../components/글상세페이지'));
const 댓글섹션 = lazy(() => import('../components/댓글섹션'));

export const Route = createFileRoute('/posts/$slug')({
  component: () => (
    <Suspense fallback={<글로딩스피너 />}>
      <글상세페이지 />
      <Suspense fallback={<댓글로딩 />}>
        <댓글섹션 />
      </Suspense>
    </Suspense>
  ),
});
```

### 2. 컴포넌트별 분할

```typescript
// 무거운 컴포넌트 지연 로딩
const 마크다운에디터 = lazy(() =>
  import('@/features/post-editor/components/MarkdownEditor').then(module => ({
    default: module.MarkdownEditor
  }))
);

const 차트컴포넌트 = lazy(() =>
  import('recharts').then(module => ({
    default: module.ResponsiveContainer
  }))
);

// 조건부 로딩
function 관리자대시보드() {
  const { data: 사용자 } = use현재사용자();
  const [에디터표시, set에디터표시] = useState(false);

  return (
    <div>
      <h1>관리자 대시보드</h1>

      {/* 필요할 때만 로딩 */}
      {에디터표시 && (
        <Suspense fallback={<에디터로딩 />}>
          <마크다운에디터 />
        </Suspense>
      )}

      <button onClick={() => set에디터표시(true)}>
        글 작성하기
      </button>
    </div>
  );
}
```

### 3. 써드파티 라이브러리 분할

```typescript
// 동적 import로 필요시에만 로딩
async function 이미지처리하기(파일: File) {
  // 이미지 압축 라이브러리를 필요할 때만 로딩
  const { default: imageCompression } = await import('browser-image-compression');

  const 압축옵션 = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  return await imageCompression(파일, 압축옵션);
}

// PDF 생성 기능
async function PDF생성하기(콘텐츠: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);

  // PDF 생성 로직...
}
```

## ⚡ 렌더링 최적화

### 1. React.memo 활용

```typescript
// 불필요한 리렌더링 방지
export const 블로그글카드 = memo(function 블로그글카드({
  글,
  onClick
}: {
  글: 블로그글;
  onClick: (아이디: string) => void;
}) {
  return (
    <article className="border rounded-lg p-4">
      <h3>{글.제목}</h3>
      <p>{글.요약}</p>
      <button onClick={() => onClick(글.아이디)}>
        자세히 보기
      </button>
    </article>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return (
    prevProps.글.아이디 === nextProps.글.아이디 &&
    prevProps.글.수정일자 === nextProps.글.수정일자
  );
});
```

### 2. useMemo와 useCallback 최적화

```typescript
// 계산 비용이 큰 작업 캐싱
function 글통계대시보드() {
  const { data: 글목록 } = use블로그글목록();

  // 복잡한 계산 결과 캐싱
  const 통계데이터 = useMemo(() => {
    if (!글목록) return null;

    return {
      전체글수: 글목록.length,
      발행된글수: 글목록.filter(글 => 글.상태 === '발행됨').length,
      월별통계: 글목록.reduce((acc, 글) => {
        const 월 = 글.생성일자.toISOString().substring(0, 7);
        acc[월] = (acc[월] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      인기태그: 글목록
        .flatMap(글 => 글.태그목록)
        .reduce((acc, 태그) => {
          acc[태그] = (acc[태그] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };
  }, [글목록]);

  // 함수 참조 안정화
  const 글삭제핸들러 = useCallback((아이디: string) => {
    // 삭제 로직
  }, []);

  const 글수정핸들러 = useCallback((아이디: string, 데이터: any) => {
    // 수정 로직
  }, []);

  return (
    <div>
      {통계데이터 && <통계차트 데이터={통계데이터} />}
      {글목록?.map(글 => (
        <글관리카드
          key={글.아이디}
          글={글}
          onDelete={글삭제핸들러}
          onEdit={글수정핸들러}
        />
      ))}
    </div>
  );
}
```

### 3. 가상화 (Virtualization)

```typescript
// react-window를 사용한 긴 목록 가상화
import { FixedSizeList as List } from 'react-window';

function 대용량글목록() {
  const { data: 글목록 } = use블로그글목록({ 크기: 1000 });

  const 글항목렌더러 = useCallback(({ index, style }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const 글 = 글목록[index];

    return (
      <div style={style}>
        <블로그글카드 글={글} />
      </div>
    );
  }, [글목록]);

  return (
    <List
      height={600}        // 보이는 영역 높이
      itemCount={글목록?.length || 0}
      itemSize={200}      // 각 항목 높이
      overscanCount={5}   // 미리 렌더링할 항목 수
    >
      {글항목렌더러}
    </List>
  );
}
```

## 🖼️ 이미지 최적화

### 1. 다양한 형식과 크기 제공

```typescript
// 반응형 이미지 컴포넌트
export function 최적화이미지({
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
  // 다양한 크기와 형식 생성
  const generateSrcSet = (원본URL: string, 형식: string) => {
    const 크기목록 = [400, 600, 800, 1200, 1600];
    return 크기목록
      .map(크기 => `${원본URL}?w=${크기}&f=${형식} ${크기}w`)
      .join(', ');
  };

  return (
    <picture>
      {/* WebP 형식 (최신 브라우저) */}
      <source
        srcSet={generateSrcSet(src, 'webp')}
        sizes={sizes}
        type="image/webp"
      />

      {/* AVIF 형식 (더 최신) */}
      <source
        srcSet={generateSrcSet(src, 'avif')}
        sizes={sizes}
        type="image/avif"
      />

      {/* 기본 형식 (호환성) */}
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

### 2. 지연 로딩과 Intersection Observer

```typescript
// 커스텀 지연 로딩 훅
function use지연이미지() {
  const [로딩됨, set로딩됨] = useState(false);
  const 이미지참조 = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const 현재이미지 = 이미지참조.current;
    if (!현재이미지) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          set로딩됨(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',  // 50px 전에 미리 로딩
        threshold: 0.1
      }
    );

    observer.observe(현재이미지);

    return () => observer.disconnect();
  }, []);

  return { 이미지참조, 로딩됨 };
}

// 사용 예시
function 지연로딩이미지({ src, alt }: { src: string; alt: string }) {
  const { 이미지참조, 로딩됨 } = use지연이미지();

  return (
    <div className="relative">
      <img
        ref={이미지참조}
        src={로딩됨 ? src : ''}
        alt={alt}
        className={`transition-opacity ${로딩됨 ? 'opacity-100' : 'opacity-0'}`}
      />

      {!로딩됨 && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

### 3. 이미지 압축 및 최적화

```typescript
// 클라이언트 측 이미지 압축
async function 이미지업로드최적화(파일: File): Promise<File> {
  // 이미지가 아닌 경우 그대로 반환
  if (!파일.type.startsWith('image/')) {
    return 파일;
  }

  // 큰 이미지만 압축
  if (파일.size <= 1024 * 1024) { // 1MB 이하는 압축 안함
    return 파일;
  }

  const { default: imageCompression } = await import('browser-image-compression');

  const 압축옵션 = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 파일.type.includes('png') ? 'image/png' : 'image/jpeg'
  };

  try {
    const 압축된파일 = await imageCompression(파일, 압축옵션);
    console.log('압축 완료:', {
      원본크기: 파일.size,
      압축크기: 압축된파일.size,
      압축률: ((파일.size - 압축된파일.size) / 파일.size * 100).toFixed(1) + '%'
    });

    return 압축된파일;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    return 파일;
  }
}
```

## 📡 네트워크 최적화

### 1. TanStack Query 캐싱 전략

```typescript
// 효율적인 캐싱 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5분간 fresh
      cacheTime: 10 * 60 * 1000,    // 10분간 캐시 유지
      refetchOnWindowFocus: false,   // 포커스시 자동 갱신 비활성화
      refetchOnReconnect: 'always',  // 재연결시 갱신
      retry: (failureCount, error: any) => {
        // 클라이언트 에러는 재시도 안함
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// 중요한 데이터 프리패치
export async function 중요데이터프리패치() {
  const 프리패치작업들 = [
    queryClient.prefetchQuery({
      queryKey: ['블로그글목록', 1],
      queryFn: () => 블로그글목록가져오기({ 페이지번호: 1, 페이지크기: 10 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['인기태그'],
      queryFn: () => 인기태그가져오기(),
    }),
  ];

  await Promise.allSettled(프리패치작업들);
}
```

### 2. API 요청 최적화

```typescript
// 요청 배칭 및 중복 제거
class API요청최적화 {
  private 대기중요청 = new Map<string, Promise<any>>();
  private 배치타이머: number | null = null;
  private 배치요청들: Array<{ key: string; request: () => Promise<any>; resolve: Function; reject: Function }> = [];

  // 중복 요청 방지
  async 중복방지요청<T>(키: string, 요청함수: () => Promise<T>): Promise<T> {
    if (this.대기중요청.has(키)) {
      return this.대기중요청.get(키)!;
    }

    const 요청프로미스 = 요청함수().finally(() => {
      this.대기중요청.delete(키);
    });

    this.대기중요청.set(키, 요청프로미스);
    return 요청프로미스;
  }

  // 요청 배칭
  async 배치요청<T>(키: string, 요청함수: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.배치요청들.push({ key: 키, request: 요청함수, resolve, reject });

      if (this.배치타이머) {
        clearTimeout(this.배치타이머);
      }

      this.배치타이머 = window.setTimeout(() => {
        this.배치실행();
      }, 10); // 10ms 후 배치 실행
    });
  }

  private async 배치실행() {
    const 현재배치 = [...this.배치요청들];
    this.배치요청들 = [];
    this.배치타이머 = null;

    // 동시 실행 수 제한
    const 동시실행수 = 5;
    for (let i = 0; i < 현재배치.length; i += 동시실행수) {
      const 청크 = 현재배치.slice(i, i + 동시실행수);

      await Promise.allSettled(
        청크.map(async ({ request, resolve, reject }) => {
          try {
            const 결과 = await request();
            resolve(결과);
          } catch (error) {
            reject(error);
          }
        })
      );
    }
  }
}

export const api최적화 = new API요청최적화();
```

### 3. Service Worker 캐싱

```typescript
// service-worker.ts
const CACHE_NAME = 'my-blog-v1';
const 정적자원들 = [
  '/',
  '/app.js',
  '/app.css',
  '/manifest.json'
];

// 설치 시 정적 자원 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(정적자원들))
      .then(() => self.skipWaiting())
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API 요청은 네트워크 우선, 실패시 캐시
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const 응답복사본 = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, 응답복사본));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 정적 자원은 캐시 우선
  event.respondWith(
    caches.match(request)
      .then(캐시응답 => 캐시응답 || fetch(request))
  );
});
```

## 🔍 성능 모니터링

### 1. Core Web Vitals 측정

```typescript
// 성능 메트릭 수집
export function 성능메트릭수집() {
  // LCP (Largest Contentful Paint) 측정
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);

    // 분석 서비스로 전송
    성능데이터전송('LCP', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // FID (First Input Delay) 측정
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('FID:', entry.processingStart - entry.startTime);
      성능데이터전송('FID', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });

  // CLS (Cumulative Layout Shift) 측정
  let cls스코어 = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) {
        cls스코어 += entry.value;
      }
    });
    console.log('CLS:', cls스코어);
    성능데이터전송('CLS', cls스코어);
  }).observe({ entryTypes: ['layout-shift'] });
}

async function 성능데이터전송(메트릭: string, 값: number) {
  // 성능 데이터를 분석 서비스로 전송
  try {
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: 메트릭,
        value: 값,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: location.href
      })
    });
  } catch (error) {
    console.error('성능 데이터 전송 실패:', error);
  }
}
```

### 2. 번들 분석

```bash
# Vite 번들 분석
pnpm build -- --analyze

# 번들 크기 시각화
pnpm add -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts에 추가
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... 다른 플러그인들
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
});
```

## 📋 성능 최적화 체크리스트

### 초기 로딩 최적화
- [ ] 라우트별 코드 분할 적용
- [ ] 중요하지 않은 컴포넌트 지연 로딩
- [ ] 이미지 지연 로딩 및 최적화
- [ ] 폰트 최적화 (font-display: swap)
- [ ] 초기 렌더링에 필요한 최소 CSS만 인라인

### 런타임 성능 최적화
- [ ] React.memo로 불필요한 리렌더링 방지
- [ ] useMemo/useCallback 적절히 사용
- [ ] 긴 목록에 가상화 적용
- [ ] 이벤트 핸들러 최적화
- [ ] 메모리 누수 방지 (이벤트 리스너 정리)

### 네트워크 최적화
- [ ] TanStack Query 캐싱 전략 수립
- [ ] API 요청 중복 제거
- [ ] 이미지 압축 및 다양한 형식 제공
- [ ] Service Worker 캐싱 전략
- [ ] CDN 활용

### 모니터링 및 측정
- [ ] Core Web Vitals 측정 구현
- [ ] 번들 크기 모니터링
- [ ] 실제 사용자 성능 데이터 수집
- [ ] 정기적인 성능 테스트

이 가이드를 따라 최적의 성능을 제공하는 웹 애플리케이션을 구축할 수 있습니다.