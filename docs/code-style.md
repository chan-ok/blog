> 이 문서의 상위 문서: [agents.md](./agents.md)

# 코드 스타일

## Import 순서 (4단계)

```typescript
// 1. React/TanStack Router
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';

// 2. 외부 라이브러리
import { z } from 'zod';
import { create } from 'zustand';

// 3. 내부 모듈 (@/*)
import { Button } from '@/5-shared/components/ui/button';
import { formatDate } from '@/5-shared/util/date-utils';
import { useTheme } from '@/5-shared/hooks/use-theme';

// 4. 타입 import
import type { Post } from '@/5-shared/types';
import type { Locale } from '@/5-shared/config/i18n';
```

## TypeScript

### 지시사항

- **strict 모드** 사용
- **any 타입 금지** - 명확한 타입 정의 필수
- **타입 가드 선호** - 타입 단언(as) 최소화
- **제네릭 활용** - 중복 함수 대신 제네릭 사용

### 예제

```typescript
// ❌ Bad - any 타입
function processData(data: any) {
  return data.value;
}

// ✅ Good - 명확한 타입
interface Data {
  value: string;
  count: number;
}

function processData(data: Data) {
  return data.value;
}

// ❌ Bad - 타입 단언
const element = document.getElementById('app') as HTMLDivElement;

// ✅ Good - 타입 가드
const element = document.getElementById('app');
if (element instanceof HTMLDivElement) {
  // element는 HTMLDivElement로 추론됨
}

// ✅ Good - 제네릭 활용
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

## 컴포넌트 구조 (6단계)

### 지시사항

컴포넌트는 다음 순서로 작성:

1. 타입 정의
2. 커스텀 훅
3. 파생 값 계산
4. 이벤트 핸들러
5. 이펙트
6. 렌더링

### 예제

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

## Tailwind CSS 순서 (8단계)

### 지시사항

Tailwind 클래스는 다음 순서로 작성:

1. Layout (레이아웃)
2. Size (크기)
3. Spacing (여백)
4. Typography (타이포그래피)
5. Visual (시각적 요소)
6. Interaction (상호작용)
7. Responsive (반응형)
8. Dark Mode (다크 모드)

### 예제

```typescript
// 실제 프로젝트 예시
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
    </article>
  );
}
```

### 주의사항

- ⚠️ 인라인 스타일 사용 금지 (`style={{ ... }}`)
- ⚠️ 매직 넘버 대신 상수 사용
- ⚠️ 중첩된 삼항 연산자 지양

## 파일 명명

| 파일 종류    | 규칙                  | 예시                            |
| ------------ | --------------------- | ------------------------------- |
| 컴포넌트     | `kebab-case.tsx`      | `button.tsx`, `post-card.tsx`    |
| 유틸리티     | `kebab-case.ts`       | `date-utils.ts`, `sanitize.ts`  |
| 테스트       | `kebab-case.test.tsx`          | `button.test.tsx`               |
| Storybook    | `kebab-case.stories.tsx`       | `button.stories.tsx`            |
| 타입         | `kebab-case.types.ts`          | `post.types.ts`                 |
| 스키마 (Zod) | `kebab-case.schema.ts`         | `contact-form.schema.ts`        |
| 훅           | `use-*.ts (kebab-case)`            | `use-theme.ts`, `use-resize.ts` |
| 인덱스       | `index.ts` (re-export만)                            |
