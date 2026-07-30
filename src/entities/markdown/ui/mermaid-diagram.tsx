import { useEffect, useId, useState } from 'react';
import DOMPurify from 'dompurify';

import type { MermaidConfig } from 'mermaid';

interface MermaidDiagramProps {
  code: string;
}

type MermaidModule = typeof import('mermaid');

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

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  // 상태: 렌더링된 SVG, 로딩, 에러
  const [svg, setSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 파생 값: 고유 ID
  const id = useId();
  const diagramId = `mermaid-${id.replace(/:/g, '-')}`;

  // useEffect: mermaid 렌더링
  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError('');

        // lazy import: mermaid 패키지 동적 로드
        const mermaidModule: MermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        // mermaid 초기화 (neutral 테마, strict 보안 레벨)
        mermaid.initialize(MERMAID_CONFIG);

        if (cancelled) return;

        // 다이어그램 렌더링
        const { svg: renderedSvg } = await mermaid.render(diagramId, code);

        if (cancelled) return;

        // SVG 출력을 DOMPurify와 URL/CSS 경계로 sanitize (XSS 방지)
        setSvg(sanitizeMermaidSvg(renderedSvg));
      } catch (err) {
        if (cancelled) return;

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to render Mermaid diagram: ${errorMessage}`);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, diagramId]);

  // 렌더링: 로딩 상태
  if (isLoading) {
    return (
      <div className="mb-6 flex min-h-50 items-center justify-center rounded-md border border-rule bg-bg2 p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-accent" />
          <span className="font-mono text-sm text-ink3">Loading diagram...</span>
        </div>
      </div>
    );
  }

  // 렌더링: 에러 상태
  if (error) {
    return (
      <div className="mb-6 overflow-hidden rounded-md border border-accent bg-accent-soft">
        <div className="border-b border-accent px-4 py-2">
          <span className="font-mono text-sm font-medium text-accent-strong">Mermaid Error</span>
        </div>
        <div className="p-4">
          <p className="mb-4 font-mono text-sm text-ink2">{error}</p>
          <details className="group">
            <summary className="mb-2 cursor-pointer font-mono text-sm text-ink3 transition-colors hover:text-ink">
              Show source code
            </summary>
            <pre className="overflow-x-auto rounded-md border border-rule bg-bg p-4 font-mono text-sm text-ink2">
              {code}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // 렌더링: 성공 - SVG 표시
  return (
    <div
      data-testid="mermaid-svg"
      className="mb-6 overflow-x-auto rounded-md border border-rule bg-bg2 p-8"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
