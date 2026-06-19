import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageBlockProps {
  src: string;
  alt?: string;
  baseUrl?: string;
}

/**
 * MDX 콘텐츠용 이미지 블록 컴포넌트
 * - 레이지 로딩 지원
 * - 이미지 로드 실패 시 placeholder 표시
 * - alt 텍스트 제공 시 figcaption 렌더링
 * - 다크모드 및 접근성 지원
 * - 상대 경로 이미지를 baseUrl 기준으로 절대 경로로 변환
 */
export default function ImageBlock({ src, alt, baseUrl }: ImageBlockProps) {
  const [hasError, setHasError] = useState(false);

  // 상대 경로 → 절대 경로 변환
  const resolvedSrc = React.useMemo(() => {
    // 이미 절대 경로(http/https)면 그대로 사용
    if (src.startsWith('http')) {
      return src;
    }

    // 상대 경로면 baseUrl + src로 조합
    if (baseUrl) {
      return `${baseUrl}/${src}`;
    }

    // baseUrl이 없으면 src 그대로 (fallback)
    return src;
  }, [src, baseUrl]);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <figure
        role="img"
        aria-label={alt || '이미지를 불러올 수 없습니다'}
        className="my-6 flex flex-col items-center justify-center rounded-md border border-rule bg-bg2 p-8"
      >
        <ImageOff className="h-12 w-12 text-ink3" aria-hidden="true" />
        <p className="mt-2 text-sm text-ink3">이미지를 불러올 수 없습니다</p>
        {alt && <figcaption className="mt-2 text-xs text-ink3">{alt}</figcaption>}
      </figure>
    );
  }

  return (
    <figure role="img" aria-label={alt} className="my-6">
      <img
        src={resolvedSrc}
        alt={alt || ''}
        loading="lazy"
        onError={handleError}
        className="max-w-full h-auto rounded-md border border-rule"
      />
      {alt && <figcaption className="mt-2 text-center text-sm text-ink3">{alt}</figcaption>}
    </figure>
  );
}
