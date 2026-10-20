import DOMPurify from 'dompurify';

import type { MermaidConfig } from 'mermaid';

export const MERMAID_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  suppressErrorRendering: true,
  maxEdges: 500,
  maxTextSize: 50_000,
  secure: [
    'secure',
    'securityLevel',
    'startOnLoad',
    'suppressErrorRendering',
    'maxEdges',
    'maxTextSize',
    'theme',
    'themeCSS',
    'themeVariables',
    'fontFamily',
    'altFontFamily',
    'dompurifyConfig',
  ],
};

const UNSAFE_CSS_TOKEN =
  /(?:@|\\|expression\s*\(|behavior\s*:|-moz-binding|(?:image|image-set|src)\s*\()/iu;
const CSS_URL = /url\s*\(([^)]*)\)/giu;

export function isSafeMermaidCss(css: string): boolean {
  if (UNSAFE_CSS_TOKEN.test(css)) {
    return false;
  }

  for (const match of css.matchAll(CSS_URL)) {
    const value = (match[1] ?? '').trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/u, '$1$2');
    if (!/^#[A-Za-z_][\w:.-]*$/u.test(value)) {
      return false;
    }
  }

  return true;
}

export function hardenMermaidSvg(svg: string): string {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');

  if (document.querySelector('parsererror')) {
    return '';
  }

  document.querySelectorAll('style').forEach((style) => {
    if (!isSafeMermaidCss(style.textContent ?? '')) {
      style.remove();
    }
  });

  document.querySelectorAll('*').forEach((element) => {
    const style = element.getAttribute('style');
    if (style && !isSafeMermaidCss(style)) {
      element.removeAttribute('style');
    }

    for (const attributeName of ['href', 'xlink:href', 'src']) {
      const value = element.getAttribute(attributeName);
      if (value && !/^#[A-Za-z_][\w:.-]*$/u.test(value)) {
        element.removeAttribute(attributeName);
      }
    }

    for (const attribute of Array.from(element.attributes)) {
      if (/url\s*\(/iu.test(attribute.value) && !isSafeMermaidCss(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return document.documentElement.outerHTML;
}

export function sanitizeMermaidSvg(renderedSvg: string): string {
  const sanitizedSvg = DOMPurify.sanitize(renderedSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['foreignObject', 'script'],
    ALLOWED_URI_REGEXP: /^#[A-Za-z_][\w:.-]*$/u,
  });

  return hardenMermaidSvg(String(sanitizedSvg));
}

let sequence = 0;
export async function mountMermaid(root: HTMLElement, signal?: AbortSignal): Promise<() => void> {
  let cancelled = false;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-mermaid]'));
  if (!nodes.length)
    return () => {
      cancelled = true;
    };
  const mermaid = (await import('mermaid')).default;
  if (signal?.aborted) return () => {};
  mermaid.initialize(MERMAID_CONFIG);
  for (const node of nodes) {
    if (cancelled || signal?.aborted || !node.isConnected) break;
    try {
      const { svg } = await mermaid.render(`blog-mermaid-${++sequence}`, node.textContent || '');
      if (!cancelled && !signal?.aborted && node.isConnected)
        node.innerHTML = sanitizeMermaidSvg(svg);
    } catch {
      if (!cancelled && !signal?.aborted && node.isConnected) node.dataset.mermaidError = 'true';
    }
  }
  return () => {
    cancelled = true;
  };
}
