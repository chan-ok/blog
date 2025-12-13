# 프로젝트 구조

## 아키텍처 패턴

이 프로젝트는 계층화된 아키텍처와 함께 **Feature-Sliced Design (FSD)** 원칙을 따릅니다.

## 디렉터리 구조

```
blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # 다국어 라우트 (ko, en, ja)
│   │   ├── globals.css        # 전역 스타일
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── entities/              # 비즈니스 엔티티
│   │   └── mdx/              # MDX 관련 엔티티
│   ├── features/              # 기능 모듈
│   │   ├── about/            # About 페이지 기능
│   │   │   ├── model/        # 데이터 모델
│   │   │   ├── ui/           # UI 컴포넌트
│   │   │   └── util/         # 유틸리티
│   │   ├── contact/          # Contact 폼 기능
│   │   │   ├── model/        # 데이터 모델
│   │   │   ├── ui/           # UI 컴포넌트
│   │   │   └── util/         # 유틸리티
│   │   └── post/             # 포스트 표시 기능
│   │       ├── ui/           # UI 컴포넌트
│   │       └── util/         # 유틸리티
│   ├── shared/                # 공유 유틸리티
│   │   ├── config/           # 설정 파일 (폰트, API)
│   │   ├── hooks/            # 커스텀 React hooks
│   │   ├── providers/        # Context providers
│   │   ├── stores/           # Zustand stores
│   │   ├── types/            # TypeScript 타입 정의
│   │   └── ui/               # 기본 UI 컴포넌트
│   │       ├── toggle/       # 토글 컴포넌트
│   │       └── turnstile/    # Cloudflare Turnstile
│   ├── widgets/               # 복합 UI 컴포넌트
│   │   ├── footer.tsx
│   │   └── header.tsx
│   └── proxy.ts               # Proxy 유틸리티
├── netlify/
│   └── functions/             # Netlify 서버리스 함수
├── public/                    # 정적 자산
├── e2e/                       # Playwright E2E 테스트
├── docs/                      # 프로젝트 문서
└── .kiro/                     # Kiro AI 설정
    ├── hooks/                 # Agent hooks
    └── steering/              # Steering 규칙
```

## 레이어 책임

### app/

Next.js App Router 페이지와 레이아웃. 다국어 지원을 위해 `[locale]` 동적 세그먼트 사용.

### entities/

핵심 비즈니스 엔티티와 도메인 모델. 현재 MDX 관련 로직 포함.

### features/

자체 컴포넌트, 로직, 테스트를 가진 독립적인 기능 모듈. 각 기능은 독립적으로 테스트 가능해야 함.

### shared/

기능 전반에 걸쳐 사용되는 공통 관심사와 유틸리티:

- **config/**: 앱 설정 및 상수 (폰트, API 설정)
- **hooks/**: 커스텀 React hooks (useBreakpoint, useResize 등)
- **providers/**: React context providers (theme-provider)
- **stores/**: Zustand 상태 관리 stores (theme-store)
- **types/**: 공유 TypeScript 타입
- **ui/**: 기본 UI 컴포넌트 (toggle, turnstile 등)

### widgets/

여러 기능이나 공유 컴포넌트를 결합한 복합 컴포넌트 (예: Header, Footer).

> **Note**: Storybook stories는 각 컴포넌트와 함께 배치

## 파일 명명 규칙

- **컴포넌트**: `kebab-case.tsx` (예: `user-profile.tsx`)
- **테스트**: `*.test.tsx` 또는 `*.spec.tsx`
- **Stories**: `*.stories.tsx`
- **타입**: `*.types.ts` 또는 `types/` 디렉터리 내
- **Hooks**: `use-*.ts` (예: `use-theme.ts`)

## Import 규칙

더 깔끔한 import를 위해 경로 별칭 사용:

```typescript
import { Component } from '@/shared/components/component';
import { config } from '@/shared/config';
```

## 테스팅 구조

- 소스 파일과 함께 배치된 유닛 테스트: `component.test.tsx`
- `e2e/` 디렉터리의 E2E 테스트
- 컴포넌트와 함께 배치

## 설정 파일

- `next.config.ts` - MDX 지원을 포함한 Next.js 설정
- `netlify.toml` - Netlify 배포 및 함수 설정
- `eslint.config.ts` - ESLint 규칙 (flat config 형식)
- `prettier.config.ts` - Prettier 포맷팅 규칙
- `tsconfig.json` - TypeScript 컴파일러 옵션
- `vitest.config.ts` - Vitest 테스트 설정
- `playwright.config.ts` - Playwright E2E 테스트 설정
