import { defineMdastPlugin, type MdastContent } from 'satteri';
export function obsidianParts(value: string): MdastContent[] | undefined {
  const children: MdastContent[] = [];
  let start = 0;
  for (const match of value.matchAll(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/gu)) {
    const index = match.index!;
    if (index > start) children.push({ type: 'text', value: value.slice(start, index) });
    const url = match[1].trim();
    children.push({ type: 'image', url, alt: match[2]?.trim() || url.split('/').at(-1) || '' });
    start = index + match[0].length;
  }
  if (children.length) {
    if (start < value.length) children.push({ type: 'text', value: value.slice(start) });
    return children;
  }
}
export function obsidianPlugin() {
  return defineMdastPlugin({
    name: 'obsidian-images',
    text(node, ctx) {
      const parts = obsidianParts(node.value);
      if (parts) ctx.replaceNode(node, parts);
    },
  });
}
