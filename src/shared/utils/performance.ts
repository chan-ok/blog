// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// 스로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecutionTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecutionTime >= delay) {
      fn(...args);
      lastExecutionTime = currentTime;
    }
  };
}

// 메모이제이션
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

// 지연 실행
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 재시도 함수
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        await delay(delayMs * Math.pow(2, attempt)); // 지수 백오프
      }
    }
  }

  throw lastError;
}

// 배치 처리
export async function batchProcess<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));

    results.push(...batchResults);

    // 다음 배치 전 지연
    if (i + batchSize < items.length) {
      await delay(delayMs);
    }
  }

  return results;
}

// 실행 시간 측정
export async function measureTime<T>(
  fn: () => Promise<T> | T,
  logOutput: boolean = true
): Promise<{ result: T; executionTime: number }> {
  const startTime = performance.now();

  const result = await fn();

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  if (logOutput) {
    console.log(`실행 시간: ${executionTime.toFixed(2)}ms`);
  }

  return { result, executionTime };
}

// 이미지 지연 로딩
export function lazyLoadImage(imageElement: HTMLImageElement, actualSrc: string): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imageElement.src = actualSrc;
        observer.unobserve(imageElement);
      }
    });
  });

  observer.observe(imageElement);
}

// 무한 스크롤 도우미
export function watchInfiniteScroll(
  callback: () => void,
  threshold: number = 100
): () => void {
  const handler = throttle(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      callback();
    }
  }, 200);

  window.addEventListener('scroll', handler);

  return () => window.removeEventListener('scroll', handler);
}

// 리소스 프리로딩
export function preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    let element: HTMLElement;

    switch (type) {
      case 'image':
        element = new Image();
        (element as HTMLImageElement).src = url;
        break;
      case 'script':
        element = document.createElement('script');
        (element as HTMLScriptElement).src = url;
        break;
      case 'style':
        element = document.createElement('link');
        (element as HTMLLinkElement).rel = 'stylesheet';
        (element as HTMLLinkElement).href = url;
        break;
    }

    element.onload = () => resolve();
    element.onerror = () => reject(new Error(`Failed to load ${url}`));

    if (type !== 'image') {
      document.head.appendChild(element);
    }
  });
}