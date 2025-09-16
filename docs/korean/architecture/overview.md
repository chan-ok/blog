# 아키텍처 개요

## 🎯 전체 아키텍처 철학

이 프로젝트는 **Feature Slice Design (FSD)** 아키텍처를 기반으로 구성되며, 다음 원칙을 따릅니다:

### 핵심 원칙
1. **확장성**: 기능 추가가 용이한 구조
2. **유지보수성**: 변경에 유연하게 대응
3. **타입 안전성**: TypeScript 엄격 모드 활용
4. **테스트 가능성**: TDD 기반 개발 지원

### 아키텍처 계층 구조

```
App Layer      → 애플리케이션 초기화 및 전역 설정
Pages Layer    → 라우팅 및 페이지 컴포넌트
Features Layer → 비즈니스 로직 및 기능 구현
Entities Layer → 도메인 모델 및 데이터 관리
Shared Layer   → 공통 리소스 및 유틸리티
```

### 의존성 규칙

```
App → Pages → Features → Entities → Shared
   ↖    ↖        ↖         ↖
    └────┴────────┴─────────┘
```

- **상위 계층**은 하위 계층에 의존할 수 있음
- **하위 계층**은 상위 계층에 의존하면 안됨
- **동일 계층** 내에서는 신중한 의존성 관리 필요

## 📁 프로젝트 루트 구조

```
my-blog/
├── src/                    # 소스 코드
│   ├── app/               # 애플리케이션 계층
│   ├── pages/             # 페이지 계층
│   ├── features/          # 기능 계층
│   ├── entities/          # 엔티티 계층
│   └── shared/            # 공유 계층
├── docs/                  # 문서
├── public/                # 정적 파일
├── supabase/             # Supabase 설정
└── 설정 파일들...
```

## 🔄 데이터 플로우

```
사용자 입력 → Features → Entities → Supabase
     ↓           ↓         ↓         ↑
   UI 업데이트 ← TanStack Query ← API 응답
```

## 📚 세부 가이드 링크

각 계층별 상세한 내용은 다음 문서들을 참조하세요:

- **[폴더 구조 가이드](./folder-structure.md)** - 각 계층별 폴더 구조
- **[의존성 규칙](./dependency-rules.md)** - Layer 간 의존성 관리
- **[반응형 디자인](./responsive-design.md)** - 반응형 웹 구현 가이드
- **[성능 최적화](./performance.md)** - 렌더링 및 번들 최적화
- **[UI/UX 가이드라인](./ui-ux-guidelines.md)** - 디자인 시스템 및 접근성

## ⚡ 빠른 시작

1. **개발 시작**: `pnpm dev`
2. **새 기능 추가**: Features Layer에서 시작
3. **도메인 모델**: Entities Layer에서 정의
4. **공통 컴포넌트**: Shared Layer에서 구현
5. **페이지 연결**: Pages Layer에서 라우팅

자세한 구현 방법은 각 세부 가이드를 참조하세요.