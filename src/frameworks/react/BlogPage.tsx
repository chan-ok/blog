import { useEffect, useRef, useState } from 'react';
import type { PageModel } from '../../lib/presentation/page-model';
import { pageHref } from '../../lib/presentation/routes';
import { mountMermaid } from '../../lib/browser/mermaid';

export default function BlogPage({ model }: { model: PageModel }) {
  const { messages: t, context, page } = model;
  const root = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [notice, setNotice] = useState('');
  const [active, setActive] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  useEffect(() => {
    if (image.current?.complete) setImageLoaded(true);
    let disposed = false;
    let cleanup = () => {};
    if (root.current)
      void mountMermaid(root.current).then((stop) => {
        if (disposed) stop();
        else cleanup = stop;
      });
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries.find((entry) => entry.isIntersecting);
        if (first) setActive(first.target.id);
      },
      { rootMargin: '0px 0px -65% 0px' }
    );
    root.current
      ?.querySelectorAll('.mdx-content h1[id], .mdx-content h2[id], .mdx-content h3[id]')
      .forEach((heading) => observer.observe(heading));
    return () => {
      disposed = true;
      cleanup();
      observer.disconnect();
    };
  }, [model]);
  async function copy(event: React.MouseEvent) {
    const button = (event.target as HTMLElement).closest('[data-copy]');
    if (!button) return;
    try {
      await navigator.clipboard.writeText(
        button.parentElement?.querySelector('code')?.textContent || ''
      );
      setNotice(t.ui.copied);
    } catch {
      setNotice(t.ui.copyError);
    }
  }
  function rows() {
    return model.posts.length ? (
      <ol className="divide-y divide-rule">
        {model.posts.map((post, index) => (
          <li key={post.href} className="py-5">
            <div className="flex items-start justify-between gap-5">
              <span className="mt-1.5 min-w-9 shrink-0 text-[11px] text-ink3 tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <a
                className="group block min-w-0 flex-1 text-[16px] leading-[1.45] font-semibold text-ink"
                href={post.href}
              >
                {post.title}
              </a>
              <time className="text-[11px] text-ink3 shrink-0 tabular-nums">{post.dateLabel}</time>
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <p className="py-8 text-sm text-ink3">{t.post.noPosts}</p>
    );
  }
  const headings = model.article?.headings.filter((heading) => heading.level <= 3) || [];
  return (
    <div ref={root} data-framework="react" onClick={copy}>
      <header className="sticky top-0 z-50 border-b border-rule bg-bg">
        <nav className="app-shell" aria-label={t.nav.primaryLabel}>
          <div className="flex min-h-16 items-center gap-2 flex-wrap py-2">
            <a
              href={pageHref(context, { kind: 'home' })}
              className="mr-2 inline-flex h-10 items-center px-2 text-sm font-semibold"
            >
              chanho.kim
            </a>
            <div className="hidden md:flex">
              {model.navigation.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  className={`inline-flex h-11 items-center px-4 text-sm ${link.active ? 'bg-ink text-bg' : 'text-ink2 hover:bg-bg2'}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs">
              <nav aria-label={t.ui.framework} className="framework-links">
                {model.frameworkLinks.map((link) => (
                  <a
                    key={link.framework}
                    href={link.href}
                    aria-current={link.active ? 'true' : undefined}
                  >
                    {link.framework}
                  </a>
                ))}
              </nav>
              <nav aria-label={t.nav.changeLanguage} className="locale-links">
                {model.localeLinks.map((link) => (
                  <a
                    key={link.locale}
                    href={link.href}
                    lang={link.locale}
                    aria-current={link.active ? 'true' : undefined}
                  >
                    {link.locale.toUpperCase()}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </nav>
      </header>
      <main className="app-shell min-h-[60vh]">
        {page.kind === 'home' ? (
          <>
            <section className="pb-10 pt-12 md:pb-14 lg:pb-18">
              <p className="text-[11px] tracking-[0.2em] uppercase text-ink3">{t.about.label}</p>
              <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-8">
                <div className="order-2 min-w-0 space-y-6 lg:order-1">
                  <h1 className="text-[clamp(2.2rem,4vw,3.1rem)] font-semibold leading-[1.15]">
                    {t.about.greeting}
                  </h1>
                  <p className="max-w-[62ch] text-[17px] leading-[1.9] text-ink2 whitespace-pre-line">
                    {t.about.introduction}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      className="inline-flex h-10 items-center px-4 text-sm bg-ink text-bg"
                      href={pageHref(context, { kind: 'posts' })}
                    >
                      {t.about.viewWork}
                    </a>
                    <a
                      className="inline-flex h-10 items-center px-4 text-sm border border-rule"
                      href={pageHref(context, { kind: 'about' })}
                    >
                      {t.about.readMore}
                    </a>
                  </div>
                </div>
                <div className="relative order-1 aspect-square w-[clamp(6rem,28vw,12rem)] overflow-hidden rounded-xl border border-rule bg-bg2 p-1 lg:order-2 lg:w-full">
                  {!imageLoaded && (
                    <div
                      className="absolute inset-1 rounded-lg bg-bg2 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                  <img
                    ref={image}
                    src="/image/git-profile.png"
                    alt={t.about.profileAlt}
                    width="591"
                    height="591"
                    className="relative h-full w-full rounded-lg object-cover"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                </div>
              </div>
            </section>
            <section className="border-t border-rule py-8">
              <h2 className="mb-4 text-[11px] tracking-[0.2em] text-ink3">{t.post.recentPosts}</h2>
              {rows()}
            </section>
          </>
        ) : page.kind === 'posts' ? (
          <section className="py-12">
            <h1 className="mb-8 border-b border-rule pb-6 text-3xl font-semibold">
              {t.post.recentPosts}
            </h1>
            {rows()}
          </section>
        ) : (
          <article className="mx-auto max-w-155 py-12 pb-16">
            {model.article?.title && (
              <header className="mb-8 border-b-2 border-ink pb-6">
                <h1 className="mb-4 text-[32px] font-bold leading-tight">{model.article.title}</h1>
                <time className="text-[11px] text-ink3">{model.article.dateLabel}</time>
              </header>
            )}
            {headings.length > 0 && (
              <nav className="toc" aria-label={t.post.tableOfContents}>
                <button type="button" onClick={() => setTocOpen(!tocOpen)} aria-expanded={tocOpen}>
                  {t.post.tableOfContents}
                </button>
                <ol className={tocOpen ? 'open' : ''}>
                  {headings.map((heading) => (
                    <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}>
                      <a
                        href={`#${heading.id}`}
                        aria-current={active === heading.id ? 'location' : undefined}
                        onClick={() => setTocOpen(false)}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div
              className="mdx-content"
              dangerouslySetInnerHTML={{ __html: model.article?.html || '' }}
            />
            <p role="status" aria-live="polite" className="copy-status">
              {notice}
            </p>
          </article>
        )}
      </main>
      <footer className="mt-14 border-t border-rule py-10 text-center text-ink3">
        <div className="app-shell flex flex-col gap-4 sm:flex-row sm:justify-between">
          <p>© {model.year} chanho.kim</p>
          <a href="mailto:kiss.yagni.dry@gmail.com" className="underline">
            kiss.yagni.dry@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
