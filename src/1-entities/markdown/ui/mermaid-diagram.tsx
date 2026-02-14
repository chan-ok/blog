import { useEffect, useId, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface MermaidDiagramProps {
  code: string;
}

type MermaidModule = typeof import('mermaid');

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

        // mermaid 초기화 (다크 테마 고정, strict 보안 레벨)
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
        });

        if (cancelled) return;

        // 다이어그램 렌더링
        const { svg: renderedSvg } = await mermaid.render(diagramId, code);

        if (cancelled) return;

        // SVG 출력을 DOMPurify로 sanitize (XSS 방지)
        const sanitizedSvg = DOMPurify.sanitize(renderedSvg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });

        setSvg(sanitizedSvg);
      } catch (err) {
        if (cancelled) return;

        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
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
      <div className="mb-6 flex min-h-[200px] items-center justify-center rounded-lg bg-gray-900 p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-gray-300" />
          <span className="font-mono text-sm text-gray-400">
            Loading diagram...
          </span>
        </div>
      </div>
    );
  }

  // 렌더링: 에러 상태
  if (error) {
    return (
      <div className="mb-6 overflow-hidden rounded-lg bg-gray-900">
        <div className="border-b border-red-700 bg-red-900/20 px-4 py-2">
          <span className="font-mono text-sm font-medium text-red-400">
            Mermaid Error
          </span>
        </div>
        <div className="p-4">
          <p className="mb-4 font-mono text-sm text-red-400">{error}</p>
          <details className="group">
            <summary className="mb-2 cursor-pointer font-mono text-sm text-gray-400 transition-colors hover:text-gray-300">
              Show source code
            </summary>
            <pre className="overflow-x-auto rounded bg-gray-800 p-4 font-mono text-sm text-gray-300">
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
      className="mb-6 overflow-x-auto rounded-lg bg-gray-900 p-8"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
