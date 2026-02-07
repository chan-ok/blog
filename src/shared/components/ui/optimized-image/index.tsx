// OptimizedImage 컴포넌트
// 로컬 이미지는 Vite Plugin이 자동 최적화 (WebP, AVIF 생성)
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

  // 로컬 이미지는 Vite Plugin이 자동 최적화
  const basePath = src.replace(/\.(jpg|jpeg|png)$/, '');

  return (
    <picture>
      {/* Vite Plugin이 빌드 시 자동 생성 */}
      <source srcSet={`${basePath}.avif`} type="image/avif" />
      <source srcSet={`${basePath}.webp`} type="image/webp" />

      {/* Fallback: 원본 이미지 */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
