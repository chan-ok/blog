// OptimizedImage 컴포넌트
// 로컬 이미지는 Vite Plugin이 자동 압축 (PNG 압축률 70%)
// 외부 이미지는 직접 로드 + lazy loading

interface OptimizedImageProps {
  src: string; // 로컬 또는 외부 URL
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // true: eager, false: lazy
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  // 외부 URL 감지 (GitHub Raw, CDN 등)
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  // 외부 이미지는 직접 로드 (최적화 불가)
  if (isExternal) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    );
  }

  // 로컬 이미지는 Vite Plugin이 자동 압축 (PNG → 최적화된 PNG)
  // 현재는 WebP/AVIF 변환 없이 압축된 PNG만 사용 (70% 절감 성공)
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}
