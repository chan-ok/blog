import { useThemeStore } from '@/5-shared/stores/theme-store';
import Giscus from '@giscus/react';

export default function Reply({ locale }: { locale: LocaleType }) {
  const themeClass = useThemeStore((state) => state.themeClass);
  return (
    <Giscus
      id="R_kgDOQgCWsw"
      repo="chan-ok/blog-content"
      repoId="R_kgDOQgCWsw"
      category="reply"
      categoryId="DIC_kwDOQgCWs84Czw1L"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={themeClass}
      lang={locale}
      loading="lazy"
      strict="1"
    />
  );
}
