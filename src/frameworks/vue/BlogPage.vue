<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import type { PageModel } from '../../lib/presentation/page-model';
import { pageHref } from '../../lib/presentation/routes';
import { mountMermaid } from '../../lib/browser/mermaid';

const { model } = defineProps<{ model: PageModel }>();
const t = model.messages;
const root = ref<HTMLDivElement>();
const image = ref<HTMLImageElement>();
const imageLoaded = ref(false);
const imageFailed = ref(false);
const notice = ref('');
const active = ref('');
const tocOpen = ref(false);
const headings = computed(() => model.article?.headings.filter((heading) => heading.level <= 3) || []);
let disposed = false;
const diagramAbort = new AbortController();
let cleanup = () => {};
let observer: IntersectionObserver | undefined;

  function failedImage(event: Event | { target: EventTarget | null }) {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.closest('.mdx-content') || target.hidden) return;
    target.hidden = true;
    const fallback = document.createElement('span');
    fallback.className = 'image-error'; fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', target.alt || t.ui.imageError);
    fallback.textContent = t.ui.imageError; target.after(fallback);
  }

onMounted(() => {
  root.value?.addEventListener('error', failedImage, true);
  root.value?.querySelectorAll<HTMLImageElement>('.mdx-content img').forEach((img) => { if (img.complete && !img.naturalWidth) failedImage({ target: img }); });
  if (image.value?.complete) { imageLoaded.value = true; imageFailed.value = !image.value.naturalWidth; }
  if (root.value) void mountMermaid(root.value, diagramAbort.signal).then((stop) => { if (disposed) stop(); else cleanup = stop; });
  observer = new IntersectionObserver((entries) => { const first = entries.find((entry) => entry.isIntersecting); if (first) active.value = first.target.id; }, { rootMargin: '0px 0px -65% 0px' });
  root.value?.querySelectorAll('.mdx-content h1[id], .mdx-content h2[id], .mdx-content h3[id]').forEach((heading) => observer?.observe(heading));
});
onBeforeUnmount(() => { root.value?.removeEventListener('error', failedImage, true); disposed = true; diagramAbort.abort(); cleanup(); observer?.disconnect(); });
async function copy(event: MouseEvent) {
  const button = event.target instanceof Element ? event.target.closest('[data-copy]') : null;
  if (!button) return;
  try { await navigator.clipboard.writeText(button.parentElement?.querySelector('code')?.textContent || ''); notice.value = t.ui.copied; }
  catch { notice.value = t.ui.copyError; }
}
</script>

<template>
  <div ref="root" data-framework="vue" @click="copy">
    <header class="sticky top-0 z-50 border-b border-rule bg-bg"><nav class="app-shell" :aria-label="t.nav.primaryLabel"><div class="flex min-h-16 items-center gap-2 flex-wrap py-2">
      <a :href="pageHref(model.context, { kind: 'home' })" class="mr-2 inline-flex h-10 items-center px-2 text-sm font-semibold">chanho.kim</a>
      <div class="hidden md:flex"><a v-for="link in model.navigation" :key="link.href" :href="link.href" :aria-current="link.active ? 'page' : undefined" :class="['inline-flex h-11 items-center px-4 text-sm', link.active ? 'bg-ink text-bg' : 'text-ink2 hover:bg-bg2']">{{ link.label }}</a></div>
      <div class="ml-auto flex items-center gap-3 text-xs"><nav :aria-label="t.ui.framework" class="framework-links"><a v-for="link in model.frameworkLinks" :key="link.framework" :href="link.href" :aria-current="link.active ? 'true' : undefined">{{ link.framework }}</a></nav><nav :aria-label="t.nav.changeLanguage" class="locale-links"><a v-for="link in model.localeLinks" :key="link.locale" :href="link.href" :lang="link.locale" :aria-current="link.active ? 'true' : undefined">{{ link.locale.toUpperCase() }}</a></nav></div>
    </div></nav></header>
    <main class="app-shell min-h-[60vh]">
      <template v-if="model.page.kind === 'home'">
        <section class="pb-10 pt-12 md:pb-14 lg:pb-18"><p class="text-[11px] tracking-[0.2em] uppercase text-ink3">{{ t.about.label }}</p>
          <div class="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-8">
            <div class="order-2 min-w-0 space-y-6 lg:order-1"><h1 class="text-[clamp(2.2rem,4vw,3.1rem)] font-semibold leading-[1.15]">{{ t.about.greeting }}</h1><p class="max-w-[62ch] text-[17px] leading-[1.9] text-ink2 whitespace-pre-line">{{ t.about.introduction }}</p><div class="flex flex-wrap gap-3"><a class="inline-flex h-10 items-center px-4 text-sm bg-ink text-bg" :href="pageHref(model.context, { kind: 'posts' })">{{ t.about.viewWork }}</a><a class="inline-flex h-10 items-center px-4 text-sm border border-rule" :href="pageHref(model.context, { kind: 'about' })">{{ t.about.readMore }}</a></div></div>
            <div class="relative order-1 aspect-square w-[clamp(6rem,28vw,12rem)] overflow-hidden rounded-xl border border-rule bg-bg2 p-1 lg:order-2 lg:w-full"><div v-if="!imageLoaded" class="absolute inset-1 rounded-lg bg-bg2 animate-pulse" aria-hidden="true"></div><span v-if="imageFailed" class="image-error" role="img" :aria-label="t.about.profileAlt">{{ t.ui.imageError }}</span><img :hidden="imageFailed" ref="image" src="/image/git-profile.png" :alt="t.about.profileAlt" width="591" height="591" class="relative h-full w-full rounded-lg object-cover" @load="imageLoaded = true" @error="imageLoaded = true; imageFailed = true" /></div>
          </div>
        </section>
      </template>
      <section v-if="model.page.kind === 'home' || model.page.kind === 'posts'" :class="model.page.kind === 'home' ? 'border-t border-rule py-8' : 'py-12'">
        <h2 v-if="model.page.kind === 'home'" class="mb-4 text-[11px] tracking-[0.2em] text-ink3">{{ t.post.recentPosts }}</h2><h1 v-else class="mb-8 border-b border-rule pb-6 text-3xl font-semibold">{{ t.post.recentPosts }}</h1>
        <ol v-if="model.posts.length" class="divide-y divide-rule"><li v-for="(post, index) in model.posts" :key="post.href" class="py-5"><div class="flex items-start justify-between gap-5"><span class="mt-1.5 min-w-9 shrink-0 text-[11px] text-ink3 tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span><a class="group block min-w-0 flex-1 text-[16px] leading-[1.45] font-semibold text-ink" :href="post.href">{{ post.title }}</a><time class="text-[11px] text-ink3 shrink-0 tabular-nums">{{ post.dateLabel }}</time></div></li></ol><p v-else class="py-8 text-sm text-ink3">{{ t.post.noPosts }}</p>
      </section>
      <article v-else class="mx-auto max-w-155 py-12 pb-16">
        <header v-if="model.article?.title" class="mb-8 border-b-2 border-ink pb-6"><h1 class="mb-4 text-[32px] font-bold leading-tight">{{ model.article.title }}</h1><time class="text-[11px] text-ink3">{{ model.article.dateLabel }}</time></header>
        <nav v-if="headings.length" class="toc" :aria-label="t.post.tableOfContents"><button type="button" @click="tocOpen = !tocOpen" :aria-expanded="tocOpen">{{ t.post.tableOfContents }}</button><ol :class="{ open: tocOpen }"><li v-for="heading in headings" :key="heading.id" :style="{ paddingLeft: `${(heading.level - 1) * 8}px` }"><a :href="`#${heading.id}`" :aria-current="active === heading.id ? 'location' : undefined" @click="tocOpen = false">{{ heading.text }}</a></li></ol></nav>
        <div class="mdx-content" v-html="model.article?.html || ''"></div>
        <p role="status" aria-live="polite" class="copy-status">{{ notice }}</p>
      </article>
    </main>
    <footer class="mt-14 border-t border-rule py-10 text-center text-ink3"><div class="app-shell flex flex-col gap-4 sm:flex-row sm:justify-between"><p>© {{ model.year }} chanho.kim</p><a href="mailto:kiss.yagni.dry@gmail.com" class="underline">kiss.yagni.dry@gmail.com</a></div></footer>
  </div>
</template>
