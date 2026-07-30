import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '@/shared/components/ui/link';
import OptimizedImage from '@/shared/components/ui/optimized-image';

export default function AboutBlock() {
  const { t } = useTranslation();
  const [isProfileImageLoading, setIsProfileImageLoading] = useState(true);

  return (
    <section className="pb-10 pt-12 md:pb-14 lg:pb-18">
      <p className="text-[11px] tracking-[0.2em] uppercase text-ink3">{t('about.label')}</p>

      <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-8">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
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
        <div className="relative order-1 aspect-square w-[clamp(6rem,28vw,12rem)] overflow-hidden rounded-xl border border-rule bg-bg2 p-1 lg:order-2 lg:w-full">
          {isProfileImageLoading ? (
            <div className="absolute inset-1 rounded-lg bg-bg2 animate-pulse" aria-hidden="true" />
          ) : null}
          <OptimizedImage
            src="/image/git-profile.png"
            alt={t('about.profileAlt')}
            width={591}
            height={591}
            className={`relative h-full w-full rounded-lg object-cover transition-opacity duration-300 ${
              isProfileImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsProfileImageLoading(false)}
            onError={() => setIsProfileImageLoading(false)}
            priority
          />
        </div>
      </div>
    </section>
  );
}
