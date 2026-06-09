import { visit } from 'unist-util-visit';

interface HastNode {
  type: string;
  tagName?: string;
  children?: HastNode[];
}

interface HastElement extends HastNode {
  type: 'element';
  tagName: string;
  children: HastNode[];
}

interface HastParent extends HastNode {
  children: HastNode[];
}

/**
 * 이미지만 포함된 단락(<p>)을 제거하는 rehype 플러그인
 *
 * 변환: <p><img /></p> → <img />
 *
 * @example
 * ```ts
 * compile(content, {
 *   rehypePlugins: [rehypeUnwrapImages],
 * });
 * ```
 */
export default function rehypeUnwrapImages() {
  return (tree: HastNode) => {
    visit(tree, 'element', (node: HastNode, index, parent) => {
      const element = node as HastElement;
      const parentNode = parent as HastParent | undefined;

      // p 태그이고, 자식이 1개이며, 그 자식이 img 태그인 경우
      if (
        element.tagName === 'p' &&
        element.children.length === 1 &&
        element.children[0].type === 'element' &&
        (element.children[0] as HastElement).tagName === 'img' &&
        parentNode &&
        typeof index === 'number'
      ) {
        // p 태그를 제거하고 img만 남김
        parentNode.children[index] = element.children[0];
      }
    });
  };
}
