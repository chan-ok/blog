# 아키텍처 가이드

## 📚 아키텍처 문서 목차

이 문서는 프로젝트의 전체 아키텍처에 대한 개요를 제공하며, 각 주제별 상세 가이드는 별도 문서로 구성되어 있습니다.

### 핵심 아키텍처 문서들

1. **[아키텍처 개요](./architecture/overview.md)**
   - Feature Slice Design (FSD) 기반 아키텍처 철학
   - 계층 구조 및 의존성 규칙 개요
   - 빠른 시작 가이드

2. **[폴더 구조 가이드](./architecture/folder-structure.md)**
   - 상세한 폴더 구조 및 파일 배치 규칙
   - 각 계층별 책임과 역할
   - 파일 네이밍 컨벤션

3. **[의존성 규칙](./architecture/dependency-rules.md)**
   - Layer 간 의존성 방향 및 규칙
   - 허용/금지된 의존성 패턴
   - 의존성 관리 도구 및 검증 방법

### 구현 가이드 문서들

4. **[반응형 디자인](./architecture/responsive-design.md)**
   - 모바일 우선 설계 원칙
   - Breakpoint 정의 및 활용
   - 터치 친화적 인터페이스 구현

5. **[성능 최적화](./architecture/performance.md)**
   - 코드 분할 및 지연 로딩 전략
   - 렌더링 최적화 기법
   - 이미지 및 네트워크 최적화

6. **[UI/UX 가이드라인](./architecture/ui-ux-guidelines.md)**
   - 디자인 시스템 및 컴포넌트 라이브러리
   - 접근성 고려사항
   - 모바일 UX 패턴

## 🚀 빠른 시작 - 개발자를 위한 체크리스트

### 1. 프로젝트 구조 이해하기
- [ ] [아키텍처 개요](./architecture/overview.md) 읽기
- [ ] [폴더 구조 가이드](./architecture/folder-structure.md) 숙지
- [ ] [의존성 규칙](./architecture/dependency-rules.md) 확인

### 2. 개발 환경 설정
- [ ] 프로젝트 클론 및 의존성 설치: `pnpm install`
- [ ] 개발 서버 실행: `pnpm dev`
- [ ] 테스트 실행: `pnpm test`

### 3. 새 기능 개발 시
- [ ] Features Layer에서 시작하여 하위 계층 순으로 개발
- [ ] [성능 최적화](./architecture/performance.md) 가이드 참고
- [ ] [UI/UX 가이드라인](./architecture/ui-ux-guidelines.md) 준수

### 4. 반응형 및 접근성
- [ ] [반응형 디자인](./architecture/responsive-design.md) 패턴 적용
- [ ] 모바일, 태블릿, 데스크톱에서 테스트
- [ ] 키보드 내비게이션 및 스크린 리더 호환성 확인

## 🎯 Layer별 책임과 역할

### 1. App Layer (`src/app/`)
- 애플리케이션 초기화
- 전역 프로바이더 설정 (QueryClient, Router)
- 전역 스타일 정의

### 2. Pages Layer (`src/pages/`)
- **파일 기반 라우팅** (TanStack Router)
- 페이지별 컴포넌트 정의
- 라우트별 데이터 로딩

#### 주요 라우트 구조
```
/ (index)           → 홈페이지
/about              → 소개 페이지
  /about/resume     → 이력서 (중첩 라우팅)
/posts              → 블로그 글 목록
  /posts/:id        → 개별 글 상세
/tags               → 태그별 글 목록
  /tags/:tagName    → 특정 태그의 글들
/contact            → 연락처
```

### 3. Shared Layer (`src/shared/`)
- 프로젝트 전반에서 사용되는 공통 리소스
- UI 컴포넌트, 유틸리티, 설정 등
- **의존성 규칙**: 다른 layer에 의존하지 않음

### 4. Entities Layer (`src/entities/`)
- **도메인 모델 정의**
- 비즈니스 로직과 데이터 구조
- Supabase 스키마와 연동되는 타입 정의

#### 예시: 블로그글 엔티티
```typescript
// entities/블로그글/model/types.ts
export interface 블로그글 {
  아이디: string;
  제목: string;
  내용: string;
  작성일자: Date;
  수정일자: Date;
  태그목록: string[];
  작성자아이디: string;
}
```

### 5. Features Layer (`src/features/`)
- **기능별 비즈니스 로직**
- 사용자 인터랙션 처리
- UI와 비즈니스 로직의 결합

#### 예시: 글작성 기능 구조
```
features/글작성/
├── CLAUDE.md           # 기능별 가이드
├── components/         # 기능 전용 컴포넌트
│   ├── 에디터.tsx
│   └── 미리보기.tsx
├── hooks/             # 기능별 커스텀 훅
│   └── use글작성.ts
├── api/               # API 호출 로직
│   └── 글작성API.ts
└── types/             # 기능별 타입 정의
    └── 글작성타입.ts
```

## 📱 반응형 디자인 가이드라인

### Breakpoint 정의 (Tailwind CSS v4 기준)
```css
/* 모바일 우선 설계 */
sm: 640px    /* 작은 태블릿 */
md: 768px    /* 태블릿 */
lg: 1024px   /* 데스크톱 */
xl: 1280px   /* 대형 데스크톱 */
2xl: 1536px  /* 초대형 디스플레이 */
```

### 반응형 컴포넌트 작성 원칙
1. **모바일 우선** 설계
2. **컨테이너 쿼리** 활용 (가능한 경우)
3. **유연한 그리드 시스템** 사용
4. **터치 친화적 인터페이스** 고려

### 예시: 반응형 레이아웃
```tsx
// 반응형 헤더 컴포넌트
export function 헤더() {
  return (
    <header className="
      px-4 py-3           /* 모바일: 작은 패딩 */
      md:px-6 md:py-4     /* 태블릿: 중간 패딩 */
      lg:px-8 lg:py-5     /* 데스크톱: 큰 패딩 */
      flex flex-col       /* 모바일: 세로 정렬 */
      md:flex-row         /* 태블릿 이상: 가로 정렬 */
      items-center
      justify-between
    ">
      {/* 헤더 내용 */}
    </header>
  );
}
```

## 🔄 데이터 플로우

### 단방향 데이터 플로우
```
Supabase → TanStack Query → React State → UI
    ↑                                      ↓
    ←── mutations ←── user actions ←──────┘
```

### 상태 관리 계층
1. **서버 상태**: TanStack Query (캐싱, 동기화)
2. **클라이언트 상태**: React Hook (UI 상태)
3. **전역 상태**: React Context (필요시에만)

## 🔗 의존성 규칙

### Layer 간 의존성 방향
```
App → Pages → Features → Entities → Shared
   ↖    ↖        ↖         ↖
    └────┴────────┴─────────┘
```

### 금지된 의존성
- ❌ `shared` → 다른 모든 layer
- ❌ `entities` → `features`, `pages`, `app`
- ❌ `features` → `pages`, `app`

### 허용된 의존성
- ✅ 상위 layer → 하위 layer
- ✅ 동일 layer 내 모듈 간 (신중하게)

## 🎨 UI/UX 원칙

### 디자인 시스템
- **Base**: shadcn/ui + Tailwind CSS
- **아이콘**: Lucide React
- **타이포그래피**: 한국어 친화적 폰트 스택
- **색상**: CSS 변수 기반 다크모드 지원

### 접근성 고려사항
- **키보드 내비게이션** 지원
- **스크린 리더** 호환성
- **고대비 모드** 지원
- **적절한 ARIA 라벨링**

## 🚀 성능 최적화

### 코드 분할
- **라우트별 분할**: TanStack Router의 `autoCodeSplitting`
- **컴포넌트별 분할**: React.lazy() 활용
- **번들 분석**: `vite build --analyze`

### 렌더링 최적화
- **React.memo** 적절한 사용
- **useMemo/useCallback** 신중한 활용
- **가상화** (긴 목록의 경우)

이 아키텍처는 확장성과 유지보수성을 고려하여 설계되었으며, 프로젝트 성장에 따라 점진적으로 적용할 수 있습니다.