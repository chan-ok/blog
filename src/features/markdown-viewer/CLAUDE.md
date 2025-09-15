# 마크다운뷰어 기능 가이드

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
src/features/마크다운뷰어/
├── components/
│   ├── 마크다운렌더러.tsx   # 메인 렌더링 컴포넌트
│   ├── 코드하이라이터.tsx   # 코드 블록 하이라이팅
│   ├── 목차생성기.tsx       # TOC 생성
│   └── 이미지뷰어.tsx       # 이미지 확대/축소
├── hooks/
│   └── use마크다운.ts       # 마크다운 처리 훅
└── utils/
    ├── 마크다운파서.ts      # 마크다운 파싱
    ├── 문법하이라이팅.ts    # 코드 하이라이팅
    └── sanitize.ts         # XSS 방지
```

## 🔧 사용 예시

### 마크다운 렌더러
```typescript
// components/마크다운렌더러.tsx
import { use마크다운 } from '../hooks/use마크다운';
import { 목차생성기 } from './목차생성기';

interface 마크다운렌더러Props {
  내용: string;
  목차표시?: boolean;
  문법하이라이팅?: boolean;
  className?: string;
}

export function 마크다운렌더러({
  내용,
  목차표시 = true,
  문법하이라이팅 = true,
  className,
}: 마크다운렌더러Props) {
  const { HTML내용, 목차목록, 로딩중 } = use마크다운({
    마크다운내용: 내용,
    문법하이라이팅,
  });

  if (로딩중) {
    return <div>마크다운을 렌더링하는 중...</div>;
  }

  return (
    <div className={`마크다운-뷰어 ${className || ''}`}>
      {목차표시 && 목차목록.length > 0 && (
        <aside className="목차-사이드바">
          <목차생성기 목차목록={목차목록} />
        </aside>
      )}

      <div
        className="마크다운-내용"
        dangerouslySetInnerHTML={{ __html: HTML내용 }}
      />
    </div>
  );
}
```

### 마크다운 처리 훅
```typescript
// hooks/use마크다운.ts
import { useMemo } from 'react';
import { 마크다운을HTML로변환, 목차추출 } from '../utils/마크다운파서';

interface use마크다운옵션 {
  마크다운내용: string;
  문법하이라이팅?: boolean;
  목차생성?: boolean;
  이미지지연로딩?: boolean;
}

export function use마크다운({
  마크다운내용,
  문법하이라이팅 = true,
  목차생성 = true,
  이미지지연로딩 = true,
}: use마크다운옵션) {
  const HTML내용 = useMemo(() => {
    if (!마크다운내용) return '';

    return 마크다운을HTML로변환(마크다운내용, {
      문법하이라이팅,
      이미지지연로딩,
    });
  }, [마크다운내용, 문법하이라이팅, 이미지지연로딩]);

  const 목차목록 = useMemo(() => {
    if (!목차생성 || !마크다운내용) return [];

    return 목차추출(마크다운내용);
  }, [마크다운내용, 목차생성]);

  return {
    HTML내용,
    목차목록,
    로딩중: false, // 동기 처리이므로 로딩 없음
  };
}
```

### 문법 하이라이팅 유틸리티
```typescript
// utils/문법하이라이팅.ts
import Prism from 'prismjs';

// 지원하는 언어들 동적 로딩
const 언어로더 = {
  typescript: () => import('prismjs/components/prism-typescript'),
  python: () => import('prismjs/components/prism-python'),
  bash: () => import('prismjs/components/prism-bash'),
  sql: () => import('prismjs/components/prism-sql'),
  // 필요한 언어들 추가
};

export async function 코드하이라이팅(코드: string, 언어: string): Promise<string> {
  // 언어가 로딩되지 않았으면 동적 로딩
  if (언어 in 언어로더 && !Prism.languages[언어]) {
    try {
      await 언어로더[언어 as keyof typeof 언어로더]();
    } catch (error) {
      console.warn(`언어 로딩 실패: ${언어}`, error);
      return 코드; // 하이라이팅 없이 원본 반환
    }
  }

  // Prism으로 하이라이팅
  if (Prism.languages[언어]) {
    return Prism.highlight(코드, Prism.languages[언어], 언어);
  }

  return 코드; // 지원하지 않는 언어는 원본 반환
}
```

### 보안 처리 (XSS 방지)
```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify';

const 허용된태그 = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'strong', 'em', 'u', 's', 'del',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'div', 'span',
];

const 허용된속성 = [
  'href', 'src', 'alt', 'title',
  'class', 'id',
  'target', 'rel',
  'width', 'height',
  'loading', 'decoding',
];

export function HTML보안처리(HTML내용: string): string {
  return DOMPurify.sanitize(HTML내용, {
    ALLOWED_TAGS: 허용된태그,
    ALLOWED_ATTR: 허용된속성,
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