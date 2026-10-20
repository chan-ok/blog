import { defineHastPlugin, type HastNode } from 'satteri';
import type {
  SatteriMarkdownProcessorOptions,
  SatteriProcessorOptions,
} from '@astrojs/markdown-satteri';
import { obsidianPlugin } from './obsidian';
import { imageUrlPlugin } from './images';
export function createSharedMarkdownOptions(): Pick<
  SatteriMarkdownProcessorOptions,
  'syntaxHighlight' | 'shikiConfig'
> {
  return {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'mermaid'] },
    shikiConfig: { theme: 'github-dark' },
  };
}
function presentationPlugin() {
  return defineHastPlugin({
    name: 'blog-presentation',
    element: {
      filter: ['blockquote', 'pre'],
      visit(node, ctx) {
        if (node.tagName === 'blockquote') {
          const text = ctx.textContent(node);
          const match = /^\s*\[!(INFO|WARNING|DANGER|SUCCESS)\]\s*/u.exec(text);
          if (match) {
            const children = structuredClone(node.children || []);
            const first = children.find(
              (child) => child.type === 'element' && child.tagName === 'p'
            );
            if (first?.type === 'element') {
              const child = first.children?.[0];
              if (child?.type === 'text')
                child.value = child.value.replace(/^\[!(INFO|WARNING|DANGER|SUCCESS)\]\s*/u, '');
            }
            ctx.replaceNode(node, {
              type: 'element',
              tagName: 'aside',
              properties: { role: 'note', className: ['callout', match[1].toLowerCase()] },
              children,
            });
          }
        }
        if (node.tagName === 'pre') {
          const code = node.children?.find(
            (n): n is HastNode & { type: 'element' } => n.type === 'element' && n.tagName === 'code'
          );
          const classes = code?.type === 'element' ? code.properties?.className : undefined;
          if (Array.isArray(classes) && classes.includes('language-mermaid')) {
            ctx.setProperty(node, 'data-mermaid', 'true');
            return;
          }
          ctx.replaceNode(node, {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block'] },
            children: [
              node,
              {
                type: 'element',
                tagName: 'button',
                properties: { type: 'button', 'data-copy': 'true', 'aria-label': 'Copy code' },
                children: [{ type: 'text', value: 'Copy' }],
              },
            ],
          });
        }
      },
    },
  });
}
export function createSatteriOptions(
  imageUrls?: ReadonlyMap<string, string>
): SatteriProcessorOptions {
  return {
    features: { gfm: true, smartPunctuation: false },
    mdastPlugins: [obsidianPlugin(), ...(imageUrls ? [imageUrlPlugin(imageUrls)] : [])],
    hastPlugins: [presentationPlugin()],
  };
}
