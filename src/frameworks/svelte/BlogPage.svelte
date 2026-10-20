<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageModel } from '../../lib/presentation/page-model';
  import { pageHref } from '../../lib/presentation/routes';
  import { mountMermaid } from '../../lib/browser/mermaid';

  let { model }: { model: PageModel } = $props();
  const t = $derived(model.messages);
  const headings = $derived(model.article?.headings.filter((heading) => heading.level <= 3) || []);
  let root: HTMLDivElement;
  let image = $state<HTMLImageElement>();
  let imageLoaded = $state(false);
  let notice = $state('');
  let active = $state('');
  let tocOpen = $state(false);
  onMount(() => {
    if (image?.complete) imageLoaded = true;
    let disposed = false;
    let cleanup = () => {};
    void mountMermaid(root).then((stop) => { if (disposed) stop(); else cleanup = stop; });
    const observer = new IntersectionObserver((entries) => { const first = entries.find((entry) => entry.isIntersecting); if (first) active = first.target.id; }, { rootMargin: '0px 0px -65% 0px' });
    root.querySelectorAll('.mdx-content h1[id], .mdx-content h2[id], .mdx-content h3[id]').forEach((heading) => observer.observe(heading));
    return () => { disposed = true; cleanup(); observer.disconnect(); };
  });
  async function copy(event: MouseEvent) {
    if (!(event.target instanceof Element) || !root?.contains(event.target)) return;
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    try { await navigator.clipboard.writeText(button.parentElement?.querySelector('code')?.textContent || ''); notice = t.ui.copied; }
    catch { notice = t.ui.copyError; }
  }
</script>

<svelte:window onclick={copy} />
<div bind:this={root} data-framework="svelte">
  <header class="sticky top-0 z-50 border-b border-rule bg-bg"><nav class="app-shell" aria-label={t.nav.primaryLabel}><div class="flex min-h-16 items-center gap-2 flex-wrap py-2">
    <a href={pageHref(model.context, { kind: 'home' })} class="mr-2 inline-flex h-10 items-center px-2 text-sm font-semibold">chanho.kim</a>
    <div class="hidden md:flex">{#each model.navigation as link (link.href)}<a href={link.href} aria-current={link.active ? 'page' : undefined} class={`inline-flex h-11 items-center px-4 text-sm ${link.active ? 'bg-ink text-bg' : 'text-ink2 hover:bg-bg2'}`}>{link.label}</a>{/each}</div>
    <div class="ml-auto flex items-center gap-3 text-xs"><nav aria-label={t.ui.framework} class="framework-links">{#each model.frameworkLinks as link (link.framework)}<a href={link.href} aria-current={link.active ? 'true' : undefined}>{link.framework}</a>{/each}</nav><nav aria-label={t.nav.changeLanguage} class="locale-links">{#each model.localeLinks as link (link.locale)}<a href={link.href} lang={link.locale} aria-current={link.active ? 'true' : undefined}>{link.locale.toUpperCase()}</a>{/each}</nav></div>
  </div></nav></header>
  <main class="app-shell min-h-[60vh]">
    {#if model.page.kind === 'home'}
      <section class="pb-10 pt-12 md:pb-14 lg:pb-18"><p class="text-[11px] tracking-[0.2em] uppercase text-ink3">{t.about.label}</p>
        <div class="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-8">
          <div class="order-2 min-w-0 space-y-6 lg:order-1"><h1 class="text-[clamp(2.2rem,4vw,3.1rem)] font-semibold leading-[1.15]">{t.about.greeting}</h1><p class="max-w-[62ch] text-[17px] leading-[1.9] text-ink2 whitespace-pre-line">{t.about.introduction}</p><div class="flex flex-wrap gap-3"><a class="inline-flex h-10 items-center px-4 text-sm bg-ink text-bg" href={pageHref(model.context, { kind: 'posts' })}>{t.about.viewWork}</a><a class="inline-flex h-10 items-center px-4 text-sm border border-rule" href={pageHref(model.context, { kind: 'about' })}>{t.about.readMore}</a></div></div>
          <div class="relative order-1 aspect-square w-[clamp(6rem,28vw,12rem)] overflow-hidden rounded-xl border border-rule bg-bg2 p-1 lg:order-2 lg:w-full">{#if !imageLoaded}<div class="absolute inset-1 rounded-lg bg-bg2 animate-pulse" aria-hidden="true"></div>{/if}<img bind:this={image} src="/image/git-profile.png" alt={t.about.profileAlt} width="591" height="591" class="relative h-full w-full rounded-lg object-cover" onload={() => imageLoaded = true} onerror={() => imageLoaded = true} /></div>
        </div>
      </section>
    {/if}
    {#if model.page.kind === 'home' || model.page.kind === 'posts'}
      <section class={model.page.kind === 'home' ? 'border-t border-rule py-8' : 'py-12'}>
        {#if model.page.kind === 'home'}<h2 class="mb-4 text-[11px] tracking-[0.2em] text-ink3">{t.post.recentPosts}</h2>{:else}<h1 class="mb-8 border-b border-rule pb-6 text-3xl font-semibold">{t.post.recentPosts}</h1>{/if}
        {#if model.posts.length}<ol class="divide-y divide-rule">{#each model.posts as post, index (post.href)}<li class="py-5"><div class="flex items-start justify-between gap-5"><span class="mt-1.5 min-w-9 shrink-0 text-[11px] text-ink3 tabular-nums">{String(index + 1).padStart(2, '0')}</span><a class="group block min-w-0 flex-1 text-[16px] leading-[1.45] font-semibold text-ink" href={post.href}>{post.title}</a><time class="text-[11px] text-ink3 shrink-0 tabular-nums">{post.dateLabel}</time></div></li>{/each}</ol>{:else}<p class="py-8 text-sm text-ink3">{t.post.noPosts}</p>{/if}
      </section>
    {:else}
      <article class="mx-auto max-w-155 py-12 pb-16">
        {#if model.article?.title}<header class="mb-8 border-b-2 border-ink pb-6"><h1 class="mb-4 text-[32px] font-bold leading-tight">{model.article.title}</h1><time class="text-[11px] text-ink3">{model.article.dateLabel}</time></header>{/if}
        {#if headings.length}<nav class="toc" aria-label={t.post.tableOfContents}><button type="button" onclick={() => tocOpen = !tocOpen} aria-expanded={tocOpen}>{t.post.tableOfContents}</button><ol class:open={tocOpen}>{#each headings as heading (heading.id)}<li style:padding-left={`${(heading.level - 1) * 8}px`}><a href={`#${heading.id}`} aria-current={active === heading.id ? 'location' : undefined} onclick={() => tocOpen = false}>{heading.text}</a></li>{/each}</ol></nav>{/if}
        <div class="mdx-content">{@html model.article?.html || ''}</div>
        <p role="status" aria-live="polite" class="copy-status">{notice}</p>
      </article>
    {/if}
  </main>
  <footer class="mt-14 border-t border-rule py-10 text-center text-ink3"><div class="app-shell flex flex-col gap-4 sm:flex-row sm:justify-between"><p>© {model.year} chanho.kim</p><a href="mailto:kiss.yagni.dry@gmail.com" class="underline">kiss.yagni.dry@gmail.com</a></div></footer>
</div>
