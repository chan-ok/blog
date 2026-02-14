import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageBlockProps {
  src: string;
  alt?: string;
}

/**
 * MDX 콘텐츠용 이미지 블록 컴포넌트
 * - 레이지 로딩 지원
 * - 이미지 로드 실패 시 placeholder 표시
 * - alt 텍스트 제공 시 figcaption 렌더링
 * - 다크모드 및 접근성 지원
 */
export default function ImageBlock({ src, alt }: ImageBlockProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <figure
        role="img"
        aria-label={alt || '이미지를 불러올 수 없습니다'}
        className="my-6 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800"
      >
        <ImageOff
          className="h-12 w-12 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          이미지를 불러올 수 없습니다
        </p>
        {alt && (
          <figcaption className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure role="img" aria-label={alt} className="my-6">
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        onError={handleError}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}
