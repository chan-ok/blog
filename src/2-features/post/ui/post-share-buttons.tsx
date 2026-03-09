import { useState } from 'react';
import { Twitter, Linkedin, Link, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PostShareButtonsProps = {
  /** 포스트 제목 (Twitter 공유 텍스트에 사용) */
  title: string;
  /** 현재 페이지 전체 URL */
  url: string;
};

/**
 * PostShareButtons 컴포넌트
 *
 * 포스트 상세 페이지 하단에 표시되는 공유 버튼 모음입니다.
 * Twitter/X, LinkedIn 공유 및 URL 클립보드 복사를 지원합니다.
 */
export default function PostShareButtons({ title, url }: PostShareButtonsProps) {
  const { t } = useTranslation();
  // URL 복사 완료 여부 상태 (2초 후 원상복구)
  const [copied, setCopied] = useState(false);

  // 이벤트 핸들러: URL을 클립보드에 복사하고 2초 후 상태 초기화
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 복사 실패 시 조용히 무시
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {t('post.share')}
      </span>

      {/* Twitter/X 공유 버튼 */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter/X로 공유"
        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        <Twitter size={18} aria-hidden="true" />
      </a>

      {/* LinkedIn 공유 버튼 */}
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn으로 공유"
        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        <Linkedin size={18} aria-hidden="true" />
      </a>

      {/* URL 복사 버튼 */}
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copied ? t('post.copied') : t('post.copyLink')}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        {copied ? (
          <Check size={16} aria-hidden="true" className="text-green-500" />
        ) : (
          <Link size={16} aria-hidden="true" />
        )}
        <span>{copied ? t('post.copied') : t('post.copyLink')}</span>
      </button>
    </div>
  );
}
