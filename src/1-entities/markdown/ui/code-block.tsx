import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode; // <code className="language-xxx">...</code> 엘리먼트
}

// 언어명 매핑
const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  tsx: 'TSX',
  jsx: 'JSX',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  rust: 'Rust',
  bash: 'Bash',
  shell: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
};

export default function CodeBlock({ children }: CodeBlockProps) {
  // 상태: 복사 완료 여부
  const [copied, setCopied] = useState(false);

  // ref: pre 엘리먼트 접근
  const preRef = useRef<HTMLPreElement>(null);

  // 파생 값: 언어 추출
  const codeElement = React.isValidElement(children) ? children : null;
  const props = codeElement?.props as
    | { className?: string; children?: React.ReactNode }
    | undefined;
  const className = props?.className || '';
  const rawLanguage = className.replace(/^language-/, '');
  const displayLanguage =
    LANGUAGE_MAP[rawLanguage.toLowerCase()] || rawLanguage || 'Code';

  // 파생 값: 코드 텍스트
  const codeChildren = props?.children;
  const codeTextString = typeof codeChildren === 'string' ? codeChildren : '';

  // 파생 값: 줄번호 배열
  const [lineCount, setLineCount] = useState(0);
  useEffect(() => {
    if (preRef.current) {
      const textContent = preRef.current.textContent || '';
      const lines = textContent.split('\n');
      // 마지막 줄이 빈 줄이면 제외
      const count =
        lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
      setLineCount(count);
    }
  }, [children]);

  // 이벤트 핸들러: 복사
  const handleCopy = async () => {
    const textToCopy = preRef.current?.textContent || codeTextString;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // 렌더링
  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-gray-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
        <span className="font-mono text-sm font-medium text-gray-300">
          {displayLanguage}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          aria-label={copied ? 'Copied' : 'Copy code'}
          type="button"
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* 코드 영역 */}
      <div className="flex overflow-x-auto">
        {/* 줄번호 거터 */}
        {lineCount > 0 && (
          <div className="flex-shrink-0 select-none border-r border-gray-700 bg-gray-800 px-4 py-4 text-right font-mono text-sm leading-6 text-gray-500">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
        )}

        {/* 코드 내용 */}
        <pre ref={preRef} className="flex-1 p-4">
          {children}
        </pre>
      </div>
    </div>
  );
}
