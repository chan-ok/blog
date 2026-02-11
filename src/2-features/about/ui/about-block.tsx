import { Github, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OptimizedImage from '@/5-shared/components/ui/optimized-image';

export default function AboutBlock() {
  const { t } = useTranslation();

  return (
    <div className="w-full flex items-center justify-start gap-8">
      <div>
        <OptimizedImage
          src="/image/git-profile.png"
          alt="Profile"
          width={120}
          height={120}
          className="rounded-full"
          priority
        />
      </div>
      <div className="text-left">
        <h2 className="mb-2 text-2xl font-bold">{t('about.greeting')}</h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {t('about.introduction')}
        </p>
        <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <a
            href="mailto:kiss.yagni.dry@gmail.com"
            className="flex items-center hover:text-gray-700 dark:hover:text-gray-200"
            aria-label={t('about.emailLabel')}
          >
            <Mail size={16} />
          </a>
          <a
            href="https://github.com/chan-ok"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-200"
            aria-label={t('about.githubLabel')}
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
