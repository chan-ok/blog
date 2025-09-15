# Features Layer 가이드

이 폴더는 Feature Slice Design (FSD) 아키텍처의 **Features Layer**입니다.

## 🎯 Features Layer의 역할

### 책임
- **기능별 비즈니스 로직**: 사용자 시나리오 구현
- **UI와 데이터 연결**: 컴포넌트와 엔티티 계층 연결
- **상태 관리**: 기능별 클라이언트 상태 관리
- **사용자 인터랙션**: 폼, 이벤트 처리 등

### 허용되는 의존성
- ✅ Entities layer 사용
- ✅ Shared layer 사용
- ✅ 다른 Features (신중하게)

### 금지사항
- ❌ Pages layer에 의존
- ❌ App layer에 의존

## 📁 폴더 구조

```
src/features/
├── CLAUDE.md                  # 이 파일
├── 인증/                      # 로그인/로그아웃 기능
│   ├── CLAUDE.md              # 인증 기능 가이드
│   ├── components/            # 인증 관련 컴포넌트
│   │   ├── 로그인폼.tsx       # 로그인 폼
│   │   ├── 회원가입폼.tsx     # 회원가입 폼
│   │   └── 사용자메뉴.tsx     # 사용자 드롭다운 메뉴
│   ├── hooks/                 # 인증 관련 훅
│   │   └── use인증폼.ts       # 인증 폼 로직
│   └── utils/                 # 인증 유틸리티
│       └── 인증가드.tsx       # 라우트 보호 컴포넌트
├── 글작성/                    # 블로그 글 작성/편집
│   ├── CLAUDE.md
│   ├── components/
│   │   ├── 마크다운에디터.tsx
│   │   ├── 미리보기.tsx
│   │   └── 글작성폼.tsx
│   ├── hooks/
│   │   └── use글작성.ts
│   └── utils/
│       └── 마크다운변환.ts
├── 글목록/                    # 블로그 글 목록 조회
│   ├── CLAUDE.md
│   ├── components/
│   │   ├── 글목록.tsx
│   │   ├── 글카드.tsx
│   │   ├── 페이지네이션.tsx
│   │   └── 검색필터.tsx
│   ├── hooks/
│   │   └── use글목록.ts
│   └── utils/
│       └── 목록정렬.ts
└── 마크다운뷰어/              # 마크다운 렌더링
    ├── CLAUDE.md
    ├── components/
    │   ├── 마크다운렌더러.tsx
    │   ├── 코드하이라이터.tsx
    │   └── 목차생성기.tsx
    ├── hooks/
    │   └── use마크다운.ts
    └── utils/
        └── 마크다운파서.ts
```

## 🔨 구현 패턴

### 1. 컴포넌트 구조
```typescript
// features/글작성/components/글작성폼.tsx
import { use글작성 } from '../hooks/use글작성';
import { 블로그글작성입력 } from '@/entities/블로그글/model/types';

interface 글작성폼Props {
  초기데이터?: Partial<블로그글작성입력>;
  완료후콜백?: (글아이디: string) => void;
}

export function 글작성폼({ 초기데이터, 완료후콜백 }: 글작성폼Props) {
  const {
    폼데이터,
    에러상태,
    로딩중,
    필드업데이트,
    제출하기,
  } = use글작성({
    초기데이터,
    완료후콜백,
  });

  return (
    <form onSubmit={제출하기}>
      {/* 폼 구현 */}
    </form>
  );
}
```

### 2. 커스텀 훅 패턴
```typescript
// features/글작성/hooks/use글작성.ts
import { useState } from 'react';
import { use블로그글작성 } from '@/entities/블로그글/hooks/use블로그글';
import { 블로그글데이터검증 } from '@/entities/블로그글/model/validation';

interface use글작성옵션 {
  초기데이터?: Partial<블로그글작성입력>;
  완료후콜백?: (글아이디: string) => void;
}

export function use글작성(옵션: use글작성옵션 = {}) {
  const [폼데이터, set폼데이터] = useState({
    제목: '',
    내용: '',
    태그목록: [],
    발행상태: '임시저장' as const,
    ...옵션.초기데이터,
  });

  const [에러상태, set에러상태] = useState<Record<string, string>>({});

  const 작성뮤테이션 = use블로그글작성();

  const 필드업데이트 = (필드: string, 값: any) => {
    set폼데이터(prev => ({ ...prev, [필드]: 값 }));

    // 에러 상태 초기화
    if (에러상태[필드]) {
      set에러상태(prev => ({ ...prev, [필드]: '' }));
    }
  };

  const 제출하기 = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    const 에러들 = 블로그글데이터검증(폼데이터);
    if (Object.keys(에러들).length > 0) {
      set에러상태(에러들);
      return;
    }

    try {
      const 새글 = await 작성뮤테이션.mutateAsync(폼데이터);
      옵션.완료후콜백?.(새글.아이디);
    } catch (error) {
      console.error('글 작성 실패:', error);
    }
  };

  return {
    폼데이터,
    에러상태,
    로딩중: 작성뮤테이션.isLoading,
    필드업데이트,
    제출하기,
  };
}
```

### 3. 유틸리티 함수
```typescript
// features/마크다운뷰어/utils/마크다운파서.ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface 마크다운옵션 {
  문법하이라이팅?: boolean;
  목차생성?: boolean;
  이미지지연로딩?: boolean;
}

export function 마크다운을HTML로변환(
  마크다운내용: string,
  옵션: 마크다운옵션 = {}
): string {
  // Marked 설정
  marked.setOptions({
    highlight: 옵션.문법하이라이팅 ? 코드하이라이팅 : undefined,
    breaks: true,
    gfm: true,
  });

  // 마크다운을 HTML로 변환
  const HTML내용 = marked(마크다운내용);

  // XSS 방지를 위한 sanitize
  const 안전한HTML = DOMPurify.sanitize(HTML내용, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id'],
  });

  return 옵션.이미지지연로딩 ? 이미지지연로딩적용(안전한HTML) : 안전한HTML;
}

function 코드하이라이팅(코드: string, 언어: string): string {
  // 문법 하이라이팅 라이브러리 (예: Prism.js) 적용
  return 코드;
}

function 이미지지연로딩적용(HTML: string): string {
  return HTML.replace(/<img/g, '<img loading="lazy"');
}
```

## 🔄 Features 간 상호작용

### 허용되는 패턴
```typescript
// ✅ 다른 feature의 컴포넌트 사용 (신중하게)
import { 사용자메뉴 } from '@/features/인증/components/사용자메뉴';

export function 글작성페이지() {
  return (
    <div>
      <header>
        <사용자메뉴 />
      </header>
      <main>
        <글작성폼 />
      </main>
    </div>
  );
}
```

### 추천하는 패턴 (Shared를 통한 연결)
```typescript
// shared/components/레이아웃/관리자레이아웃.tsx
import { 사용자메뉴 } from '@/features/인증/components/사용자메뉴';

export function 관리자레이아웃({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <사용자메뉴 />
      </header>
      <main>{children}</main>
    </div>
  );
}

// features/글작성/components/글작성페이지.tsx
import { 관리자레이아웃 } from '@/shared/components/레이아웃/관리자레이아웃';

export function 글작성페이지() {
  return (
    <관리자레이아웃>
      <글작성폼 />
    </관리자레이아웃>
  );
}
```

## 📊 상태 관리 패턴

### 1. 로컬 상태 (useState)
```typescript
// 단순한 폼 상태, UI 상태
const [열림상태, set열림상태] = useState(false);
const [선택된탭, set선택된탭] = useState('미리보기');
```

### 2. 서버 상태 (TanStack Query)
```typescript
// 서버에서 가져오는 데이터
const { data: 글목록 } = use블로그글목록(검색조건);
const 글생성 = use블로그글작성();
```

### 3. 전역 상태 (React Context)
```typescript
// features/인증/context/인증컨텍스트.tsx
import { createContext, useContext } from 'react';
import { use현재사용자 } from '@/entities/사용자/hooks/use사용자';

interface 인증컨텍스트타입 {
  현재사용자: 사용자 | null;
  로그인중: boolean;
  관리자여부: boolean;
}

const 인증컨텍스트 = createContext<인증컨텍스트타입 | null>(null);

export function 인증프로바이더({ children }: { children: React.ReactNode }) {
  const { data: 현재사용자, isLoading: 로그인중 } = use현재사용자();

  const 관리자여부 = 현재사용자?.권한 === '관리자';

  return (
    <인증컨텍스트.Provider value={{ 현재사용자, 로그인중, 관리자여부 }}>
      {children}
    </인증컨텍스트.Provider>
  );
}

export function use인증() {
  const context = useContext(인증컨텍스트);
  if (!context) {
    throw new Error('use인증은 인증프로바이더 내부에서 사용해야 합니다');
  }
  return context;
}
```

## 🧪 테스트 전략

### 1. 컴포넌트 테스트
```typescript
// features/글작성/__tests__/글작성폼.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { 글작성폼 } from '../components/글작성폼';

// Mock entities
vi.mock('@/entities/블로그글/hooks/use블로그글');

describe('글작성폼', () => {
  it('제목과 내용을 입력하고 저장할 수 있다', async () => {
    const 완료후콜백 = vi.fn();

    render(<글작성폼 완료후콜백={완료후콜백} />);

    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '테스트 글 제목' }
    });
    fireEvent.change(screen.getByLabelText('내용'), {
      target: { value: '테스트 글 내용' }
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(완료후콜백).toHaveBeenCalledWith('new-post-id');
    });
  });
});
```

### 2. 훅 테스트
```typescript
// features/글작성/__tests__/use글작성.test.ts
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { use글작성 } from '../hooks/use글작성';

describe('use글작성', () => {
  it('필드 업데이트가 정상 작동한다', () => {
    const { result } = renderHook(() => use글작성());

    act(() => {
      result.current.필드업데이트('제목', '새 제목');
    });

    expect(result.current.폼데이터.제목).toBe('새 제목');
  });
});
```

## 🚀 성능 최적화

### 1. 컴포넌트 분할
```typescript
// 큰 컴포넌트를 작은 단위로 분할
const 마크다운에디터 = lazy(() => import('./마크다운에디터'));
const 미리보기 = lazy(() => import('./미리보기'));

export function 글작성폼() {
  return (
    <div>
      <Suspense fallback={<div>에디터 로딩 중...</div>}>
        <마크다운에디터 />
      </Suspense>
      <Suspense fallback={<div>미리보기 로딩 중...</div>}>
        <미리보기 />
      </Suspense>
    </div>
  );
}
```

### 2. 메모이제이션
```typescript
// 불필요한 리렌더링 방지
const 최적화된글카드 = memo(function 글카드({ 글정보 }: { 글정보: 블로그글 }) {
  return (
    <article>
      <h2>{글정보.제목}</h2>
      <p>{글정보.요약}</p>
    </article>
  );
});

// 비싼 계산 캐싱
function use마크다운미리보기(마크다운내용: string) {
  return useMemo(() => {
    return 마크다운을HTML로변환(마크다운내용);
  }, [마크다운내용]);
}
```

## 📋 개발 체크리스트

새로운 기능 추가 시:

- [ ] 기능의 책임이 명확한가?
- [ ] 적절한 entities를 사용하는가?
- [ ] 상태 관리 전략이 적절한가?
- [ ] 컴포넌트가 재사용 가능하게 설계되었는가?
- [ ] 에러 처리가 포함되어 있는가?
- [ ] 테스트가 작성되어 있는가?
- [ ] 성능 최적화가 고려되었는가?
- [ ] 접근성이 고려되었는가?

## 🔗 의존성 규칙 요약

```
Features Layer 의존성:
- ✅ Entities ← Features
- ✅ Shared ← Features
- ✅ Features ← Features (신중하게)
- ❌ Features → Pages
- ❌ Features → App
```

각 기능별 상세 가이드는 해당 폴더의 CLAUDE.md를 참조하세요.