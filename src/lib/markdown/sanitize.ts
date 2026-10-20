import sanitize from 'sanitize-html';
export type SanitizedHtml = string & { readonly __sanitizedHtml: unique symbol };
export function sanitizeMarkdownHtml(html: string): SanitizedHtml {
  return sanitize(html, {
    allowedTags: [...sanitize.defaults.allowedTags, 'img', 'button', 'input', 'aside'],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
      button: ['type', 'data-copy', 'aria-label'],
      pre: ['style', 'data-mermaid', 'tabindex'],
      span: ['style'],
      aside: ['role'],
      input: ['type', 'checked', 'disabled'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    allowedStyles: {
      '*': {
        color: [/^#[\da-f]{3,8}$/iu],
        'background-color': [/^#[\da-f]{3,8}$/iu],
        'white-space': [/^pre(?:-wrap)?$/u],
      },
    },
    transformTags: {
      '*': (tagName, attribs) => {
        if (Object.keys(attribs).some((name) => name.toLowerCase() === '__astro_image_'))
          throw new Error('Unresolved image marker');
        if (tagName === 'input') attribs.disabled = '';
        return { tagName, attribs };
      },
    },
  }) as SanitizedHtml;
}
