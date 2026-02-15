/**
 * Obsidian 이미지 문법을 표준 마크다운으로 변환하는 remark 플러그인
 *
 * 변환 규칙:
 * - `![[images/some-image.png]]` → `![some-image.png](images/some-image.png)`
 * - `![[images/some-image.png|alt text]]` → `![alt text](images/some-image.png)`
 *
 * @example
 * ```ts
 * import remarkObsidianImage from './remark-obsidian-image';
 * evaluate(content, {
 *   remarkPlugins: [remarkObsidianImage, remarkGfm],
 * });
 * ```
 */
const remarkObsidianImage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    const { visit } = require('unist-util-visit');

    visit(
      tree,
      'paragraph',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node: any) => {
        // paragraph 내 text 노드 찾기
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textNode = node.children?.find((child: any) => child.type === 'text');

        if (!textNode) return;

        // Obsidian 이미지 패턴 감지: ![[path]] or ![[path|alt]]
        const obsidianImageRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
        const matches = Array.from(
          textNode.value.matchAll(obsidianImageRegex)
        );

        if (matches.length === 0) return;

        // 매치된 각 Obsidian 이미지를 Image 노드로 변환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newChildren: any[] = [];
        let lastIndex = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        matches.forEach((match: any) => {
          const fullMatch = match[0] as string;
          const imagePath = (match[1] as string).trim();
          const altText =
            (match[2] as string | undefined)?.trim() ||
            imagePath.split('/').pop() ||
            '';

          const matchIndex = (match.index as number | undefined) ?? 0;

        // 매치 이전 텍스트가 있으면 Text 노드로 추가
        if (matchIndex > lastIndex) {
          const beforeText = textNode.value.slice(lastIndex, matchIndex);
          if (beforeText) {
            newChildren.push({
              type: 'text',
              value: beforeText,
            });
          }
        }

        // Image 노드 추가
        newChildren.push({
          type: 'image',
          url: imagePath,
          alt: altText,
        });

        lastIndex = matchIndex + fullMatch.length;
      });

      // 마지막 매치 이후 남은 텍스트 추가
      if (lastIndex < textNode.value.length) {
        const afterText = textNode.value.slice(lastIndex);
        if (afterText) {
          newChildren.push({
            type: 'text',
            value: afterText,
          });
        }
      }

      // 변환된 노드들로 paragraph의 children 교체
      if (newChildren.length > 0) {
        // Image 노드만 있으면 paragraph를 유지하고 children만 교체
        node.children = newChildren;
      }
    });
  };
};

export default remarkObsidianImage;
