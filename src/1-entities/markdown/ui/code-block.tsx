import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
}

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

  // 파생 값: 코드 텍스트
  const codeChildren = props?.children;
  const codeTextString = typeof codeChildren === 'string' ? codeChildren : '';

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
    <div className="flex overflow-x-auto relative">
      {/* 코드 내용 */}
      <pre ref={preRef} className="flex-1 p-4">
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-6 right-6 flex items-center gap-1.5 rounded px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
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
  );
}
