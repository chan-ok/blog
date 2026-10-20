import { defineMdastPlugin, markdownToMdast, type MdastNode } from 'satteri';
import { obsidianParts } from './obsidian';
export async function prepareImageUrls(
  body: string,
  resolveImage: (path: string) => Promise<string | undefined>
): Promise<ReadonlyMap<string, string>> {
  const tree = markdownToMdast(body);
  const references = new Set<string>();
  const definitions = new Map<string, string>();
  function visit(node: MdastNode) {
    if (node.type === 'image') references.add(node.url);
    if (node.type === 'text')
      for (const part of obsidianParts(node.value) || [])
        if (part.type === 'image') references.add(part.url);
    if (node.type === 'definition') definitions.set(node.identifier.toLowerCase(), node.url);
    if ('children' in node) node.children?.forEach(visit);
  }
  visit(tree);
  function refs(node: MdastNode) {
    if (node.type === 'imageReference') {
      const url = definitions.get(node.identifier.toLowerCase());
      if (url) references.add(url);
    }
    if ('children' in node) node.children?.forEach(refs);
  }
  refs(tree);
  const entries = await Promise.all(
    [...references].map(async (path) => {
      const url = await resolveImage(path);
      if (!url) throw new Error(`Invalid image: ${path}`);
      return [path, url] as const;
    })
  );
  return new Map(entries);
}
export function imageUrlPlugin(urls: ReadonlyMap<string, string>) {
  return defineMdastPlugin({
    name: 'public-image-urls',
    image(node, ctx) {
      const url = urls.get(node.url);
      if (!url) throw new Error(`Unresolved image: ${node.url}`);
      ctx.setProperty(node, 'url', url);
    },
    definition(node, ctx) {
      const url = urls.get(node.url);
      if (url) ctx.setProperty(node, 'url', url);
    },
  });
}
