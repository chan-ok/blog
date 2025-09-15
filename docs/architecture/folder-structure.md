# 폴더 구조 가이드

## 📁 상세 폴더 구조

### src/ 디렉터리 전체 구조

```
src/
├── app/                    # 애플리케이션 초기화 및 프로바이더
│   ├── main.tsx           # 앱 진입점
│   └── styles.css         # 전역 스타일
├── pages/                  # 라우팅 (TanStack Router 파일 기반)
│   ├── __root.tsx         # 루트 레이아웃
│   ├── index.tsx          # 홈페이지
│   ├── about/
│   │   ├── index.tsx      # 소개 페이지
│   │   └── resume.tsx     # 이력서 (중첩 라우팅)
│   ├── posts/
│   │   ├── index.tsx      # 블로그 글 목록
│   │   └── $slug.tsx      # 개별 글 상세
│   ├── tags/
│   │   ├── index.tsx      # 태그 목록
│   │   └── $tagName.tsx   # 특정 태그의 글들
│   ├── contact.tsx        # 연락처
│   └── admin/             # 관리자 페이지들
│       ├── index.tsx      # 관리자 대시보드
│       ├── write.tsx      # 글 작성
│       ├── manage.tsx     # 글 관리
│       └── settings.tsx   # 설정
├── shared/                 # 공유 리소스
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── ui/           # shadcn/ui 기본 컴포넌트
│   │   │   └── button.tsx
│   │   ├── Header.tsx    # 공용 헤더
│   │   ├── Footer.tsx    # 공용 푸터
│   │   ├── PostCard.tsx  # 글 카드 컴포넌트
│   │   └── index.ts      # export 모음
│   ├── config/           # 설정 파일들
│   │   ├── supabase.ts   # Supabase 설정
│   │   └── i18n.ts       # 국제화 설정
│   ├── utils/            # 유틸리티 함수
│   │   ├── date.ts       # 날짜 관련
│   │   ├── string.ts     # 문자열 관련
│   │   └── index.ts      # export 모음
│   ├── types/            # 공통 타입 정의
│   │   └── index.ts
│   └── data/             # 샘플 데이터
│       └── sampleData.ts
├── entities/              # 데이터 엔티티 (도메인 모델)
│   ├── user/             # 사용자 엔티티
│   │   ├── CLAUDE.md     # 엔티티별 가이드
│   │   ├── model/        # 타입 정의 및 비즈니스 로직
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   ├── api/          # API 호출 로직
│   │   │   ├── userAPI.ts
│   │   │   └── __tests__/
│   │   └── hooks/        # 리액트 훅
│   │       ├── useAuth.ts
│   │       └── __tests__/
│   ├── post/             # 블로그글 엔티티
│   │   ├── CLAUDE.md
│   │   ├── model/
│   │   ├── api/
│   │   └── hooks/
│   └── tag/              # 태그 엔티티
│       ├── CLAUDE.md
│       ├── model/
│       ├── api/
│       └── hooks/
└── features/              # 기능 단위 모듈
    ├── auth/              # 인증 기능
    │   ├── CLAUDE.md      # 기능별 가이드
    │   ├── components/    # 기능 전용 컴포넌트
    │   │   ├── LoginForm.tsx
    │   │   ├── LogoutButton.tsx
    │   │   └── __tests__/
    │   ├── hooks/         # 기능별 커스텀 훅
    │   └── utils/         # 기능별 유틸리티
    ├── post-editor/       # 글 작성/편집
    │   ├── CLAUDE.md
    │   ├── components/
    │   │   ├── MarkdownEditor.tsx
    │   │   └── __tests__/
    │   ├── hooks/
    │   └── utils/
    ├── post-list/         # 글 목록 조회
    │   ├── CLAUDE.md
    │   ├── components/
    │   ├── hooks/
    │   └── utils/
    └── markdown-viewer/   # 마크다운 렌더링
        ├── CLAUDE.md
        ├── components/
        ├── hooks/
        └── utils/
```

## 🎯 Layer별 책임과 역할

### 1. App Layer (`src/app/`)
**책임**: 애플리케이션 초기화 및 전역 설정

```typescript
// app/main.tsx 예시
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/shared/config/routeTree.gen';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

### 2. Pages Layer (`src/pages/`)
**책임**: 라우팅 및 페이지 레벨 컴포넌트

- **파일 기반 라우팅** (TanStack Router)
- 각 페이지는 독립적인 파일
- 중첩 라우팅 지원 (`about/resume.tsx`)
- 동적 라우팅 지원 (`$slug.tsx`, `$tagName.tsx`)

### 3. Features Layer (`src/features/`)
**책임**: 비즈니스 로직 및 사용자 기능

각 기능별로 다음 구조를 가짐:
- `components/`: 기능 전용 UI 컴포넌트
- `hooks/`: 기능별 상태 관리 훅
- `utils/`: 기능별 유틸리티 함수
- `__tests__/`: 기능별 테스트

### 4. Entities Layer (`src/entities/`)
**책임**: 도메인 모델 및 데이터 관리

각 엔티티별로 다음 구조를 가짐:
- `model/`: 타입 정의 및 비즈니스 로직
- `api/`: 데이터 조회/변경 API
- `hooks/`: 데이터 연동 리액트 훅
- `__tests__/`: 엔티티별 테스트

### 5. Shared Layer (`src/shared/`)
**책임**: 프로젝트 전반 공용 리소스

- `components/`: 재사용 가능한 UI 컴포넌트
- `config/`: 설정 파일들
- `utils/`: 공통 유틸리티 함수
- `types/`: 공통 타입 정의
- `data/`: 샘플/테스트 데이터

## 📝 파일 네이밍 규칙

### 파일명
- **React 컴포넌트**: PascalCase (예: `LoginForm.tsx`)
- **일반 TypeScript**: camelCase (예: `userAPI.ts`)
- **설정 파일**: kebab-case (예: `vite.config.ts`)
- **가이드 문서**: UPPERCASE (예: `CLAUDE.md`)

### 폴더명
- **모든 폴더**: kebab-case (예: `post-editor/`)
- **Pages 하위**: 라우팅 구조를 따름

### export/import 패턴
```typescript
// 각 폴더의 index.ts에서 export 모음
export { LoginForm } from './LoginForm';
export { LogoutButton } from './LogoutButton';

// 사용할 때
import { LoginForm, LogoutButton } from '@/features/auth/components';
```

## 🧪 테스트 파일 구조

각 기능/컴포넌트별로 `__tests__/` 폴더에 테스트 파일 배치:

```
components/
├── LoginForm.tsx
├── LogoutButton.tsx
└── __tests__/
    ├── LoginForm.test.tsx
    └── LogoutButton.test.tsx
```

## 📋 새 기능 추가 체크리스트

1. **Features Layer**에서 기능 폴더 생성
2. **CLAUDE.md** 가이드 문서 작성
3. **entities**에서 필요한 도메인 모델 확인/추가
4. **components** 디렉터리에 UI 컴포넌트 구현
5. **hooks** 디렉터리에 상태 관리 로직 구현
6. **__tests__** 디렉터리에 테스트 코드 작성
7. **pages**에서 라우팅 연결

이 구조를 따라 일관성 있고 확장 가능한 코드베이스를 유지할 수 있습니다.