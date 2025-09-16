# Markdown Viewer Feature Guide

마크다운을 HTML로 렌더링하고 표시하는 기능을 담당합니다.

## 🎯 주요 기능

### 구현 예정 기능
- 마크다운 → HTML 변환
- 문법 하이라이팅 (코드 블록)
- 목차 자동 생성
- 이미지 지연 로딩
- 링크 처리 (외부 링크 표시)
- 수학 공식 렌더링 (선택)
- 다이어그램 지원 (Mermaid)

## 📁 컴포넌트 구조

```
src/features/markdown-viewer/
├── components/
│   ├── MarkdownRenderer.tsx   # 메인 렌더링 컴포넌트
│   ├── CodeHighlighter.tsx    # 코드 블록 하이라이팅
│   ├── TocGenerator.tsx        # TOC 생성
│   └── ImageViewer.tsx         # 이미지 확대/축소
├── hooks/
│   └── useMarkdown.ts          # 마크다운 처리 훅
└── utils/
    ├── markdownParser.ts       # 마크다운 파싱
    ├── syntaxHighlighting.ts   # 코드 하이라이팅
    └── sanitize.ts             # XSS 방지
```

## 🔧 사용 예시

### 마크다운 렌더러
```typescript
// components/MarkdownRenderer.tsx
import { useMarkdown } from '../hooks/useMarkdown';
import { TocGenerator } from './TocGenerator';

interface MarkdownRendererProps {
  content: string;
  showToc?: boolean;
  syntaxHighlighting?: boolean;
  className?: string;
}

export function MarkdownRenderer({
  content,
  showToc = true,
  syntaxHighlighting = true,
  className,
}: MarkdownRendererProps) {
  const { htmlContent, tocList, loading } = useMarkdown({
    markdownContent: content,
    syntaxHighlighting,
  });

  if (loading) {
    return <div>마크다운을 렌더링하는 중...</div>;
  }

  return (
    <div className={`markdown-viewer ${className || ''}`}>
      {showToc && tocList.length > 0 && (
        <aside className="toc-sidebar">
          <TocGenerator tocList={tocList} />
        </aside>
      )}

      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
```

### 마크다운 처리 훅
```typescript
// hooks/useMarkdown.ts
import { useMemo } from 'react';
import { markdownToHtml, extractToc } from '../utils/markdownParser';

interface UseMarkdownOptions {
  markdownContent: string;
  syntaxHighlighting?: boolean;
  generateToc?: boolean;
  lazyLoadImages?: boolean;
}

export function useMarkdown({
  markdownContent,
  syntaxHighlighting = true,
  generateToc = true,
  lazyLoadImages = true,
}: UseMarkdownOptions) {
  const htmlContent = useMemo(() => {
    if (!markdownContent) return '';

    return markdownToHtml(markdownContent, {
      syntaxHighlighting,
      lazyLoadImages,
    });
  }, [markdownContent, syntaxHighlighting, lazyLoadImages]);

  const tocList = useMemo(() => {
    if (!generateToc || !markdownContent) return [];

    return extractToc(markdownContent);
  }, [markdownContent, generateToc]);

  return {
    htmlContent,
    tocList,
    loading: false, // 동기 처리이므로 로딩 없음
  };
}
```

### 문법 하이라이팅 유틸리티
```typescript
// utils/syntaxHighlighting.ts
import Prism from 'prismjs';

// 지원하는 언어들 동적 로딩
const languageLoaders = {
  typescript: () => import('prismjs/components/prism-typescript'),
  python: () => import('prismjs/components/prism-python'),
  bash: () => import('prismjs/components/prism-bash'),
  sql: () => import('prismjs/components/prism-sql'),
  // 필요한 언어들 추가
};

export async function highlightCode(code: string, language: string): Promise<string> {
  // 언어가 로딩되지 않았으면 동적 로딩
  if (language in languageLoaders && !Prism.languages[language]) {
    try {
      await languageLoaders[language as keyof typeof languageLoaders]();
    } catch (error) {
      console.warn(`언어 로딩 실패: ${language}`, error);
      return code; // 하이라이팅 없이 원본 반환
    }
  }

  // Prism으로 하이라이팅
  if (Prism.languages[language]) {
    return Prism.highlight(code, Prism.languages[language], language);
  }

  return code; // 지원하지 않는 언어는 원본 반환
}
```

### 보안 처리 (XSS 방지)
```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

const allowedTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'strong', 'em', 'u', 's', 'del',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'div', 'span',
];

const allowedAttributes = [
  'href', 'src', 'alt', 'title',
  'class', 'id',
  'target', 'rel',
  'width', 'height',
  'loading', 'decoding',
];

export function sanitizeHtml(htmlContent: string): string {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ADD_ATTR: ['loading'], // 이미지 지연 로딩용
    FORCE_BODY: false,
  });
}
```

## 📋 개발 우선순위

1. **핵심 기능**
   - [ ] 기본 마크다운 렌더링
   - [ ] XSS 방지 sanitization
   - [ ] 기본 스타일링
   - [ ] 코드 블록 하이라이팅

2. **고급 기능**
   - [ ] 목차 자동 생성
   - [ ] 이미지 지연 로딩
   - [ ] 외부 링크 처리
   - [ ] 수학 공식 지원

3. **부가 기능**
   - [ ] 다이어그램 렌더링
   - [ ] 이미지 확대/축소
   - [ ] 코드 복사 기능
   - [ ] 다크모드 지원

## 🎨 스타일링 고려사항

- **타이포그래피**: 읽기 편한 폰트와 행간
- **코드 블록**: 문법별 색상 구분, 복사 버튼
- **이미지**: 반응형 크기 조절, 캡션 지원
- **링크**: 내부/외부 링크 구분 표시
- **모바일**: 가로 스크롤 방지, 터치 친화적

## 🔐 보안 고려사항

- **XSS 방지**: DOMPurify로 HTML sanitization
- **CSP 정책**: Content Security Policy 준수
- **링크 보안**: 외부 링크에 `rel="noopener noreferrer"` 추가
- **이미지 보안**: 안전한 도메인에서만 로딩

이 컴포넌트는 글 상세 페이지와 에디터 미리보기에서 공통으로 사용됩니다.