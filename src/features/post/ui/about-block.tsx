import { useTranslation } from 'react-i18next';

import Link from '@/shared/components/ui/link';
import OptimizedImage from '@/shared/components/ui/optimized-image';

export default function AboutBlock() {
  const { t } = useTranslation();

  return (
    <section className="pb-10 pt-12 md:pb-14 lg:pb-18">
      <p className="text-[11px] tracking-[0.2em] uppercase text-ink3">{t('about.label')}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <h1 className="text-[clamp(2.2rem,4vw,3.1rem)] font-semibold leading-[1.15] text-ink">
            {t('about.greeting')}
          </h1>
          <p className="max-w-[62ch] text-[17px] leading-[1.9] text-ink2 whitespace-pre-line">
            {t('about.introduction')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/posts"
              className="inline-flex h-10 items-center px-4 text-sm font-medium bg-ink text-bg transition-all duration-200 hover:bg-accent-strong active:translate-y-[1px]"
            >
              {t('about.viewWork')}
            </Link>
            <Link
              href="/about"
              className="inline-flex h-10 items-center px-4 text-sm font-medium border border-rule text-ink2 transition-all duration-200 hover:bg-bg2 hover:text-ink active:translate-y-[1px]"
            >
              {t('about.readMore')}
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-rule bg-bg2 p-1">
          <OptimizedImage
            src="/image/git-profile.png"
            alt="chanho profile portrait"
            className="h-auto w-full rounded-lg object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
