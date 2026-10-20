import { getCollection } from 'astro:content';
import { getMessages, type Messages } from '../i18n/messages';
import { LOCALES, type Framework, type Locale, type PageRef, type RouteContext } from './types';
import { canonicalHref, pageHref } from './routes';
import { isVisible } from '../content/visibility';
import { resolveVaultDirectory } from '../content/vault';
import { createAssetRegistry } from '../content/assets';
import { renderMarkdown, type CompiledMarkdown } from '../markdown/render';
import { getAbout, ABOUT_ROOT } from './about';
import { resolveContentUrl } from '../../shared/util/content-url';
import { implementedFrameworks } from './frameworks';
export class PageNotFoundError extends Error {}
export interface PageModel {
  context: RouteContext;
  page: PageRef;
  messages: Messages;
  year: number;
  navigation: { label: string; href: string; active: boolean }[];
  frameworkLinks: { framework: Framework; href: string; active: boolean }[];
  localeLinks: { locale: Locale; href: string; active: boolean }[];
  meta: {
    title: string;
    description: string;
    canonical: string;
    image?: string;
    type: 'website' | 'article';
    locale: Locale;
    publishedTime?: string;
    tags: string[];
  };
  posts: { title: string; href: string; dateLabel: string; thumbnail?: string; summary?: string }[];
  article?: CompiledMarkdown & { title?: string; dateLabel?: string };
}
function dateLabel(value: string, detail = false): string {
  return value.slice(0, detail ? 10 : 7).replaceAll('-', '.');
}
export async function buildPageModel(
  context: RouteContext,
  page: PageRef,
  production: boolean
): Promise<PageModel> {
  const messages = getMessages(context.locale);
  const entries = (await getCollection('posts')).map((entry) => entry.data);
  const visible = entries
    .filter(
      (post) => post.locale === context.locale && isVisible(post.metadata, production, 'list')
    )
    .toSorted((a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt));
  const assets = createAssetRegistry(
    await resolveVaultDirectory(process.cwd(), process.env.BLOG_CONTENT_DIR)
  );
  const model: PageModel = {
    context,
    page,
    messages,
    year: new Date().getUTCFullYear(),
    navigation: (['home', 'about', 'posts'] as const).map((kind) => ({
      label: messages.nav[kind],
      href: pageHref(context, { kind }),
      active: page.kind === kind || (kind === 'posts' && page.kind === 'post'),
    })),
    frameworkLinks: implementedFrameworks.map((framework) => ({
      framework,
      href: pageHref({ ...context, framework, explicitFramework: true }, page),
      active: framework === context.framework,
    })),
    localeLinks: LOCALES.map((locale) => ({
      locale,
      href: pageHref({ ...context, locale }, page),
      active: locale === context.locale,
    })),
    meta: {
      title: 'chanho.kim',
      description: messages.about.introduction,
      canonical: canonicalHref(context.locale, page),
      type: page.kind === 'post' ? 'article' : 'website',
      locale: context.locale,
      tags: [],
    },
    posts: visible.slice(0, page.kind === 'home' ? 4 : 10).map((post) => ({
      title: post.metadata.title,
      href: pageHref(context, { kind: 'post', slug: post.slug }),
      dateLabel: dateLabel(post.metadata.createdAt),
      summary: post.metadata.summary,
    })),
  };
  if (page.kind === 'post') {
    const post = entries.find(
      (entry) => entry.locale === context.locale && entry.slug.join('/') === page.slug.join('/')
    );
    if (!post || !isVisible(post.metadata, production, 'detail'))
      throw new PageNotFoundError('Post not found');
    model.article = {
      ...(await renderMarkdown(post.body, { context, resolveImage: assets.resolve })),
      title: post.metadata.title,
      dateLabel: dateLabel(post.metadata.createdAt, true),
    };
    model.meta = {
      ...model.meta,
      title: `${post.metadata.title} | chanho.kim`,
      description:
        post.metadata.summary || post.metadata.tags.join(', ') || messages.about.introduction,
      publishedTime: post.metadata.createdAt,
      tags: post.metadata.tags,
      image: post.metadata.thumbnail
        ? await assets.resolve(post.metadata.thumbnail)
        : model.article.image,
    };
  } else if (page.kind === 'about') {
    model.article = await renderMarkdown(await getAbout(context.locale), {
      context,
      resolveImage: async (path) => assets.resolve(resolveContentUrl(path, ABOUT_ROOT) || path),
    });
    model.meta.title = 'About | chanho.kim';
  } else if (page.kind === 'posts') model.meta.title = 'Posts | chanho.kim';
  return model;
}
export async function routePaths(kind: PageRef['kind'], prefixed: boolean) {
  const posts =
    kind === 'post'
      ? (await getCollection('posts'))
          .map((entry) => entry.data)
          .filter((post) => isVisible(post.metadata, import.meta.env.PROD, 'detail'))
      : [];
  return (prefixed ? implementedFrameworks : (['react'] as const)).flatMap((framework) =>
    LOCALES.flatMap((locale) => {
      const pages: PageRef[] =
        kind === 'post'
          ? posts
              .filter((post) => post.locale === locale)
              .map((post) => ({ kind: 'post', slug: post.slug }))
          : [{ kind } as PageRef];
      return pages.map((page) => ({
        params: {
          ...(prefixed ? { framework } : {}),
          locale,
          ...(page.kind === 'post' ? { slug: page.slug.join('/') } : {}),
        },
        props: { context: { framework, locale, explicitFramework: prefixed }, page },
      }));
    })
  );
}
