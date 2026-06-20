import { useTranslation } from 'react-i18next';

export default function AboutBlock() {
  const { t } = useTranslation();

  return (
    <div className="mb-10">
      {/* 소개 레이블 */}
      <p className="text-[9px] tracking-[4px] uppercase text-ink3 mb-6">소개</p>

      {/* 큰 소개 문구 */}
      <h1 className="text-[34px] font-bold leading-[1.3] text-ink mb-5 tracking-normal">
        {t('about.greeting')}
      </h1>

      {/* 한 단락 본문 */}
      <p className="text-[15px] leading-[2.0] text-ink2 max-w-lg whitespace-pre-line">
        {t('about.introduction')}
      </p>
    </div>
  );
}
