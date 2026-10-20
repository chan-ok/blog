import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { createSatteriOptions, createSharedMarkdownOptions } from './processor';
import { prepareImageUrls } from './images';
import { sanitizeMarkdownHtml, type SanitizedHtml } from './sanitize';
import type { RouteContext } from '../presentation/types';
import { getMessages } from '../i18n/messages';
export interface Heading {
  id: string;
  text: string;
  level: number;
}
export interface CompiledMarkdown {
  html: SanitizedHtml;
  headings: Heading[];
  image?: string;
}
export interface MarkdownOptions {
  context: RouteContext;
  resolveImage(path: string): Promise<string | undefined>;
}
export async function renderMarkdown(
  body: string,
  options: MarkdownOptions
): Promise<CompiledMarkdown> {
  const images = await prepareImageUrls(body, options.resolveImage);
  const processor = await createSatteriMarkdownProcessor({
    ...createSharedMarkdownOptions(),
    ...createSatteriOptions(images, getMessages(options.context.locale).ui.copy),
  });
  const result = await processor.render(body);
  let html = result.code;
  html = html.replace(
    /href="\/(ko|ja)(\/[^"#?]*)?"/gu,
    (original, locale: string, path: string | undefined) => {
      return options.context.explicitFramework
        ? `href="/${options.context.framework}/${locale}${path || '/'}"`
        : original;
    }
  );
  return {
    image: images.values().next().value,
    html: sanitizeMarkdownHtml(html),
    headings: result.metadata.headings.map((heading) => ({
      id: heading.slug,
      text: heading.text,
      level: heading.depth,
    })),
  };
}
