# 💅 코드 스타일 가이드

> 이 문서는 프로젝트의 코드 작성 규칙을 정의합니다.
> 일관된 코드 스타일은 가독성과 유지보수성을 높입니다.

## TypeScript 규칙

### 타입 안정성

```typescript
// ❌ Bad - any 타입 사용
function processData(data: any) {
  return data.value;
}

// ✅ Good - 명확한 타입 정의
interface Data {
  value: string;
  count: number;
}

function processData(data: Data) {
  return data.value;
}
```

### 타입 단언 최소화

```typescript
// ❌ Bad - 불필요한 타입 단언
const element = document.getElementById('app') as HTMLDivElement;

// ✅ Good - 타입 가드 사용
const element = document.getElementById('app');
if (element instanceof HTMLDivElement) {
  // element는 HTMLDivElement로 추론됨
}
```

### 제네릭 활용

```typescript
// ❌ Bad - 중복된 함수
function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}

// ✅ Good - 제네릭 사용
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

## 명명 규칙

| 대상            | 규칙             | 예시                                      |
| --------------- | ---------------- | ----------------------------------------- |
| 컴포넌트        | PascalCase       | `Button`, `PostCard`, `ContactForm`       |
| 함수/변수       | camelCase        | `formatDate`, `userName`, `isLoading`     |
| 상수            | UPPER_SNAKE_CASE | `API_URL`, `MAX_COUNT`, `DEFAULT_LOCALE`  |
| 타입/인터페이스 | PascalCase       | `User`, `PostMetadata`, `ContactFormData` |
| 파일명          | kebab-case       | `post-card.tsx`, `use-theme.ts`           |

### 실제 프로젝트 예시

```typescript
// src/features/post/ui/post-card.tsx

// 타입: PascalCase
interface PostCardProps {
  title: string;
  createdAt: Date;
  tags: string[];
}

// 상수: UPPER_SNAKE_CASE
const MAX_TAGS_DISPLAY = 3;

// 컴포넌트: PascalCase
export function PostCard({ title, createdAt, tags }: PostCardProps) {
  // 변수: camelCase
  const formattedDate = formatDate(createdAt);
  const displayTags = tags.slice(0, MAX_TAGS_DISPLAY);

  return (
    <article>
      <h2>{title}</h2>
      <time>{formattedDate}</time>
      {displayTags.map(tag => <span key={tag}>{tag}</span>)}
    </article>
  );
}
```

## Import 순서

Import는 다음 순서로 그룹화합니다:

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. 외부 라이브러리
import { z } from 'zod';
import { create } from 'zustand';

// 3. 내부 모듈 (절대 경로)
import Button from '@/shared/components/ui/button';
import { formatDate } from '@/shared/lib/date-utils';
import { useTheme } from '@/shared/hooks/use-theme';

// 4. 타입 (type import)
import type { Post } from '@/shared/types';
import type { Locale } from '@/shared/config/i18n';

// 5. 스타일 (있는 경우)
import './styles.css';
```

## 컴포넌트 구조

### 기본 구조

```typescript
// 1. 타입 정의
interface ComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

// 2. 컴포넌트
export function Component({ title, description, onAction }: ComponentProps) {
  // 2-1. 훅 (상태, 커스텀 훅)
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  // 2-2. 파생 값 (useMemo 등)
  const displayTitle = title.toUpperCase();

  // 2-3. 이벤트 핸들러
  const handleClick = () => {
    setIsOpen(true);
    onAction?.();
  };

  // 2-4. 이펙트
  useEffect(() => {
    // 사이드 이펙트
  }, []);

  // 2-5. 조건부 렌더링
  if (!title) {
    return null;
  }

  // 2-6. 렌더링
  return (
    <div>
      <h1>{displayTitle}</h1>
      {description && <p>{description}</p>}
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

### 실제 프로젝트 예시

```typescript
// src/widgets/header.tsx
interface HeaderProps {
  locale: Locale;
}

export function Header({ locale }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isScrolled = useDetectScrolled();

  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header className={isScrolled ? 'shadow-md' : ''}>
      <nav>
        <Link href={`/${locale}`}>Home</Link>
        <Link href={`/${locale}/posts`}>Posts</Link>
      </nav>
      <div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <LocaleToggle locale={locale} />
      </div>
    </header>
  );
}
```

## Tailwind CSS 규칙

### 클래스 작성 순서

클래스는 다음 순서로 작성합니다:

```typescript
const className = `
  // 1. Layout (레이아웃)
  flex flex-col items-center justify-between
  
  // 2. Size (크기)
  w-full h-screen max-w-4xl min-h-[200px]
  
  // 3. Spacing (여백)
  m-4 p-6 gap-4
  
  // 4. Typography (타이포그래피)
  text-white text-lg font-bold leading-relaxed
  
  // 5. Visual (시각적 요소)
  rounded-lg shadow-md bg-zinc-800 border border-gray-200
  
  // 6. Interaction (상호작용)
  hover:bg-zinc-700 focus:ring-2 active:scale-95 cursor-pointer
  
  // 7. Responsive (반응형)
  md:flex-row lg:max-w-6xl sm:text-base
  
  // 8. Dark Mode (다크 모드)
  dark:bg-zinc-900 dark:text-gray-100 dark:border-gray-700
`;
```

### 실제 예시

```typescript
// src/features/post/ui/post-card.tsx
export function PostCard({ title, excerpt, tags }: PostCardProps) {
  return (
    <article
      className="
        flex flex-col
        w-full max-w-md
        p-6 gap-4
        text-gray-900
        rounded-xl shadow-sm bg-white border border-gray-100
        hover:shadow-md hover:border-gray-200
        transition-all duration-200
        dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700
      "
    >
      <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
      <p className="text-gray-600 line-clamp-3 dark:text-gray-400">{excerpt}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 text-sm rounded-full bg-gray-100 dark:bg-zinc-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
```

## 파일 구조

### Feature 디렉토리 구조

```
src/features/contact/
├── api/
│   └── send-email.ts       # API 호출 로직
├── ui/
│   ├── contact-form.tsx    # 메인 컴포넌트
│   └── form-field.tsx      # 하위 컴포넌트
├── util/
│   └── validate-form.ts    # 유틸리티 함수
├── contact.test.tsx        # 테스트
└── index.ts                # Public API (re-export)
```

### index.ts (Barrel Export)

```typescript
// src/features/contact/index.ts
export { ContactForm } from './ui/contact-form';
export { sendEmail } from './api/send-email';
export type { ContactFormData } from './ui/contact-form';
```

## Lint 및 Format

### 자동 검사

```bash
# ESLint 실행
pnpm lint

# Prettier 포맷팅
pnpm fmt

# TypeScript 타입 체크
pnpm tsc --noEmit
```

### Husky Pre-commit

커밋 시 자동으로 lint-staged가 실행됩니다:

```javascript
// lint-staged.config.ts
export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
```

## 주의사항

### 피해야 할 패턴

```typescript
// ❌ Bad - 인라인 스타일
<div style={{ color: 'red', padding: '10px' }}>

// ✅ Good - Tailwind 클래스
<div className="text-red-500 p-2.5">

// ❌ Bad - 매직 넘버
if (items.length > 10) { ... }

// ✅ Good - 상수 사용
const MAX_ITEMS = 10;
if (items.length > MAX_ITEMS) { ... }

// ❌ Bad - 중첩된 삼항 연산자
const result = a ? b ? c : d : e;

// ✅ Good - 명확한 조건문
let result;
if (a && b) {
  result = c;
} else if (a) {
  result = d;
} else {
  result = e;
}
```

## 관련 문서

- [개발 규칙](./rule.md) - 핵심 개발 원칙
- [테스팅 가이드](./testing.md) - 테스트 작성 규칙
- [아키텍처](./architecture.md) - FSD 구조

---

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
