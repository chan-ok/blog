# 📚 프로젝트 문서

이 폴더는 프로젝트 전체의 **문서 인덱스 및 안내 역할**을 합니다. 각 기능별 상세 구현 가이드는 해당 기능의 `CLAUDE.md` 파일을 참조하세요.

## 🏗️ 아키텍처 문서

| 문서 | 설명 | 상태 |
|------|------|------|
| [**아키텍처 가이드**](./architecture.md) | FSD 아키텍처 개요 및 인덱스 | ✅ 완료 |
| [아키텍처 개요](./architecture/overview.md) | FSD 기반 아키텍처 철학, 계층 구조 | ✅ 완료 |
| [폴더 구조](./architecture/folder-structure.md) | 상세 폴더 구조, 네이밍 컨벤션 | ✅ 완료 |
| [의존성 규칙](./architecture/dependency-rules.md) | Layer 간 의존성 방향 및 관리 | ✅ 완료 |
| [반응형 디자인](./architecture/responsive-design.md) | 모바일 우선 설계 가이드 | ✅ 완료 |
| [성능 최적화](./architecture/performance.md) | 렌더링 및 번들 최적화 | ✅ 완료 |
| [UI/UX 가이드라인](./architecture/ui-ux-guidelines.md) | 디자인 시스템 및 접근성 | ✅ 완료 |

## 🔧 개발 프로세스 문서

| 문서 | 설명 | 상태 |
|------|------|------|
| [**개발 프로세스**](./develop-process.md) | TDD 기반 개발 워크플로우 | ✅ 완료 |
| [테스트 전략](./testing-strategy.md) | 테스트 도구 및 전략 | ✅ 완료 |
| [코드 포맷 규칙](./code-format.md) | 한국어 네이밍 컨벤션 | ✅ 완료 |
| [**Git 커밋 가이드**](./commit-guide.md) | Commitlint 규칙 및 메시지 작성법 | ✅ 완료 |
| [에러 처리 가이드](./error-handling-guide.md) | 에러 처리 패턴 및 전략 | ✅ 완료 |
| [문제해결 가이드](./troubleshooting-guide.md) | 일반적인 문제 해결 방법 | ✅ 완료 |

## 🌐 시스템 연동 문서

| 문서 | 설명 | 상태 |
|------|------|------|
| [**데이터 플로우**](./data-flow.md) | Supabase 연동 패턴 | ✅ 완료 |
| [인증 시스템](./authentication.md) | 로그인 및 권한 관리 | ✅ 완료 |
| [이메일 시스템](./email-system.md) | 연락처 폼 및 알림 | ✅ 완료 |
| [시퀀스 다이어그램](./sequence-diagrams.md) | 주요 플로우 다이어그램 | ✅ 완료 |

## 📝 구현 현황 문서

| 문서 | 설명 | 상태 |
|------|------|------|
| [**할 일 목록**](./todo.md) | 구현 예정 기능들 | 🔄 진행중 |
| [구현 요약](./implementation-summary.md) | 현재까지 구현된 기능 요약 | ✅ 완료 |
| [기능 문서](./feature-documentation.md) | 각 기능별 문서 목록 | ✅ 완료 |
| [컴포넌트 문서](./component-documentation.md) | UI 컴포넌트 가이드 | ✅ 완료 |

## 🎯 기능별 상세 문서 위치

각 기능의 **상세 구현 가이드**는 해당 위치의 `CLAUDE.md` 파일에서 확인하세요:

### Features Layer (비즈니스 로직)
- [`src/features/auth/CLAUDE.md`](../src/features/auth/CLAUDE.md) - **인증 시스템**
  - 로그인/로그아웃, 회원가입, 인증 가드
  - 보안 고려사항, 에러 처리, 데이터 플로우
- [`src/features/post-editor/CLAUDE.md`](../src/features/post-editor/CLAUDE.md) - **글 작성/편집**
  - 마크다운 에디터, 미리보기, 자동 저장
  - 성능 최적화, 이미지 업로드 처리
- [`src/features/post-list/CLAUDE.md`](../src/features/post-list/CLAUDE.md) - **글 목록**
  - 목록 조회, 페이지네이션, 검색 필터
- [`src/features/markdown-viewer/CLAUDE.md`](../src/features/markdown-viewer/CLAUDE.md) - **마크다운 뷰어**
  - 마크다운 렌더링, 문법 강조, 목차 생성

### Entities Layer (도메인 모델)
- [`src/entities/user/CLAUDE.md`](../src/entities/user/CLAUDE.md) - **사용자 도메인**
  - 사용자 데이터 모델, API 호출, 훅
- [`src/entities/post/CLAUDE.md`](../src/entities/post/CLAUDE.md) - **블로그글 도메인**
  - 글 데이터 모델, CRUD 작업, 유효성 검증
- [`src/entities/tag/CLAUDE.md`](../src/entities/tag/CLAUDE.md) - **태그 도메인**
  - 태그 관리, 분류 시스템

### Shared Layer (공통 리소스)
- [`src/shared/components/`](../src/shared/components/) - **공통 UI 컴포넌트**
- [`src/shared/utils/`](../src/shared/utils/) - **유틸리티 함수들**
- [`src/shared/types/`](../src/shared/types/) - **공통 타입 정의**

## 🚀 빠른 참조

### 🎯 신입 개발자 온보딩 (총 3시간)

#### 1️⃣ 프로젝트 전체 파악 (30분)
- [ ] [**README.md**](../README.md) `10분` - 프로젝트 개요 및 시작 방법
- [ ] [**CLAUDE.md**](../CLAUDE.md) `10분` - 코딩 규칙과 빠른 시작 가이드
- [ ] [**docs/README.md**](./README.md) `10분` - 전체 문서 구조 파악

#### 2️⃣ 아키텍처 이해 (1시간)
- [ ] [아키텍처 가이드](./architecture.md) `15분` - 아키텍처 인덱스
- [ ] [아키텍처 개요](./architecture/overview.md) `20분` - FSD 아키텍처 철학
- [ ] [폴더 구조](./architecture/folder-structure.md) `15분` - 폴더 구조 이해
- [ ] [의존성 규칙](./architecture/dependency-rules.md) `10분` - 의존성 규칙

#### 3️⃣ 개발 프로세스 익히기 (45분)
- [ ] [개발 프로세스](./develop-process.md) `20분` - TDD 기반 개발 프로세스
- [ ] [코드 포맷 규칙](./code-format.md) `15분` - 한국어 네이밍 컨벤션
- [ ] [테스트 전략](./testing-strategy.md) `10분` - 테스트 전략

#### 4️⃣ 시스템 이해 (30분)
- [ ] [데이터 플로우](./data-flow.md) `20분` - Supabase 연동 패턴
- [ ] [인증 시스템](./authentication.md) `10분` - 인증 시스템 개요

#### 5️⃣ 기능별 구현 이해 (필요시)
- [ ] [인증 기능](../src/features/auth/CLAUDE.md) - 인증 시스템 상세
- [ ] [글작성 기능](../src/features/post-editor/CLAUDE.md) - 글 작성/편집 기능
- [ ] [기타 features/CLAUDE.md] - 필요한 기능별로

> 💡 **온보딩 팁**:
> - 1-4단계는 순서대로 필수 읽기
> - 5단계는 담당할 기능에 따라 선택적으로 읽기
> - 실습: `pnpm dev` 실행하여 개발 환경 확인

### 🔨 새 기능 개발
1. [아키텍처 개요](./architecture/overview.md) - 계층별 역할
2. [의존성 규칙](./architecture/dependency-rules.md) - 허용/금지 패턴
3. 해당 기능의 `CLAUDE.md` - 구체적 구현 방법

### 문제 해결
1. [문제해결 가이드](./troubleshooting-guide.md) - 일반적 문제들
2. [에러 처리 가이드](./error-handling-guide.md) - 에러 처리 패턴
3. 해당 기능 `CLAUDE.md`의 "⚠️ 잠재적 실패 지점" 섹션

---

> 💡 **문서 구조 원칙**:
> - `docs/` = 인덱스 및 전체적인 가이드
> - `src/*/CLAUDE.md` = 각 기능별 상세 구현 가이드
> - 중복 없이, 참조로 연결하여 유지보수성 확보