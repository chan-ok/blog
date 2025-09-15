# 아키텍처 가이드

## 📚 아키텍처 문서 목차

이 프로젝트는 **Feature Slice Design (FSD)** 기반 아키텍처를 사용합니다. 각 주제별 상세 가이드를 확인하세요.

### 📖 핵심 아키텍처 문서

| 문서 | 설명 |
|------|------|
| **[아키텍처 개요](./architecture/overview.md)** | FSD 기반 아키텍처 철학, 계층 구조, 의존성 규칙 |
| **[폴더 구조](./architecture/folder-structure.md)** | 상세한 폴더 구조, 각 계층별 책임, 네이밍 컨벤션 |
| **[의존성 규칙](./architecture/dependency-rules.md)** | Layer 간 의존성 방향, 허용/금지 패턴, 관리 도구 |

### 🎨 구현 가이드 문서

| 문서 | 설명 |
|------|------|
| **[반응형 디자인](./architecture/responsive-design.md)** | 모바일 우선 설계, Breakpoint 정의, 터치 인터페이스 |
| **[성능 최적화](./architecture/performance.md)** | 코드 분할, 렌더링 최적화, 이미지/네트워크 최적화 |
| **[UI/UX 가이드라인](./architecture/ui-ux-guidelines.md)** | 디자인 시스템, 접근성 고려사항, 모바일 UX 패턴 |

## 🚀 빠른 시작 가이드

### 1️⃣ 새 개발자 온보딩
```bash
# 1. 의존성 설치
pnpm install

# 2. 개발 서버 실행
pnpm dev

# 3. 테스트 실행
pnpm test
```

### 2️⃣ 개발 전 필독
- [ ] [아키텍처 개요](./architecture/overview.md) - FSD 이해
- [ ] [폴더 구조](./architecture/folder-structure.md) - 파일 배치 규칙
- [ ] [의존성 규칙](./architecture/dependency-rules.md) - Layer 간 규칙

### 3️⃣ 새 기능 개발 워크플로우
1. **Features Layer**에서 기능 설계 시작
2. 필요한 **Entities Layer** 도메인 모델 정의
3. **Shared Layer** 공통 컴포넌트/유틸리티 구현
4. **Pages Layer**에서 라우팅 연결

## 🎯 Layer 구조 한눈에 보기

```
App Layer      ← 애플리케이션 초기화, 전역 설정
  ↓
Pages Layer    ← 파일 기반 라우팅, 페이지 컴포넌트
  ↓
Features Layer ← 비즈니스 로직, 사용자 기능
  ↓
Entities Layer ← 도메인 모델, 데이터 관리
  ↓
Shared Layer   ← 공통 리소스, 유틸리티
```

**핵심 의존성 규칙:** 상위 → 하위 방향으로만 의존 가능

## 📁 주요 기능별 문서 위치

각 기능의 상세한 구현 가이드는 해당 기능의 `CLAUDE.md` 파일을 참조하세요:

### Features Layer
- [`src/features/auth/CLAUDE.md`](../src/features/auth/CLAUDE.md) - 인증 시스템
- [`src/features/post-editor/CLAUDE.md`](../src/features/post-editor/CLAUDE.md) - 글 작성/편집
- [`src/features/post-list/CLAUDE.md`](../src/features/post-list/CLAUDE.md) - 글 목록
- [`src/features/markdown-viewer/CLAUDE.md`](../src/features/markdown-viewer/CLAUDE.md) - 마크다운 뷰어

### Entities Layer
- [`src/entities/user/CLAUDE.md`](../src/entities/user/CLAUDE.md) - 사용자 도메인
- [`src/entities/post/CLAUDE.md`](../src/entities/post/CLAUDE.md) - 블로그글 도메인
- [`src/entities/tag/CLAUDE.md`](../src/entities/tag/CLAUDE.md) - 태그 도메인

## 🔗 관련 문서

| 문서 | 용도 |
|------|------|
| [`docs/develop-process.md`](./develop-process.md) | TDD 기반 개발 프로세스 |
| [`docs/testing-strategy.md`](./testing-strategy.md) | 테스트 전략 및 도구 |
| [`docs/data-flow.md`](./data-flow.md) | Supabase 연동 패턴 |

---

> 💡 **참고**: 이 문서는 인덱스 역할을 합니다. 구체적인 구현 방법은 각 세부 문서를 참조하세요.