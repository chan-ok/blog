# 📚 프로젝트 문서

이 폴더는 프로젝트의 모든 문서를 체계적으로 관리합니다.

## 📁 문서 구조

### 🏗️ [architecture/](./architecture/)
시스템 아키텍처 관련 문서

- **[design/](./architecture/design/)**
  - `architecture.md` - 전체 시스템 아키텍처
  - `data-flow.md` - 데이터 흐름도
- **[dependency-rules.md](./architecture/dependency-rules.md)** - 의존성 규칙
- **[folder-structure.md](./architecture/folder-structure.md)** - 폴더 구조
- **[overview.md](./architecture/overview.md)** - 아키텍처 개요
- **[performance.md](./architecture/performance.md)** - 성능 최적화
- **[responsive-design.md](./architecture/responsive-design.md)** - 반응형 디자인
- **[ui-ux-guidelines.md](./architecture/ui-ux-guidelines.md)** - UI/UX 가이드라인

### 🛠️ [development/](./development/)
개발 프로세스와 이력 관리

- **[process/](./development/process/)**
  - `develop-process.md` - TDD 기반 개발 프로세스 및 의사결정 기록 절차
- **[guides/](./development/guides/)**
  - `code-format.md` - 코드 포맷팅 규칙
  - `commit-guide.md` - Git 커밋 가이드
  - `branch-workflow.md` - Git 브랜치 워크플로우 ⭐
  - `testing-strategy.md` - 테스트 전략
- **[history/](./development/history/)**
  - `README.md` - 개발 이력 관리 가이드
  - `2025-09-16.md` - 일별 개발 이력
  - `...` - 날짜별 이력 파일들

### ⚡ [features/](./features/)
기능별 상세 문서

- `authentication.md` - 인증 시스템
- `email-system.md` - 이메일 시스템

### 📖 [guides/](./guides/)
개발자 가이드

- `error-handling-guide.md` - 에러 처리 가이드
- `troubleshooting-guide.md` - 문제 해결 가이드
- `sequence-diagrams.md` - 시퀀스 다이어그램

### 📋 [project/](./project/)
프로젝트 관리 문서

- `todo.md` - 할 일 목록
- `implementation-summary.md` - 구현 요약
- `component-documentation.md` - 컴포넌트 문서
- `feature-documentation.md` - 기능 문서

## 🔍 문서 찾기

### 주제별 빠른 찾기

#### 새로운 개발자라면?
1. **[architecture/overview.md](./architecture/overview.md)** - 시스템 전체 이해
2. **[development/process/develop-process.md](./development/process/develop-process.md)** - 개발 프로세스
3. **[development/guides/code-format.md](./development/guides/code-format.md)** - 코딩 규칙
4. **[development/history/README.md](./development/history/README.md)** - 개발 이력 이해

#### 아키텍처를 알고 싶다면?
1. **[architecture/design/architecture.md](./architecture/design/architecture.md)** - 전체 구조
2. **[architecture/folder-structure.md](./architecture/folder-structure.md)** - 폴더 구조
3. **[architecture/dependency-rules.md](./architecture/dependency-rules.md)** - 의존성 규칙

#### 개발 프로세스를 알고 싶다면?
1. **[development/process/develop-process.md](./development/process/develop-process.md)** - TDD 프로세스
2. **[development/guides/branch-workflow.md](./development/guides/branch-workflow.md)** - Git 브랜치 워크플로우 ⭐
3. **[development/guides/testing-strategy.md](./development/guides/testing-strategy.md)** - 테스트 전략
4. **[development/guides/commit-guide.md](./development/guides/commit-guide.md)** - 커밋 가이드

#### 특정 기능을 구현한다면?
1. **[features/](./features/)** - 기능별 문서 확인
2. **[development/history/](./development/history/)** - 관련 개발 이력 검색
3. **[guides/](./guides/)** - 구현 가이드 참고

### 검색 명령어

```bash
# 전체 문서에서 키워드 검색
grep -r "키워드" docs/

# 특정 폴더에서만 검색
grep -r "키워드" docs/architecture/

# 개발 이력에서 검색
grep -r "키워드" docs/development/history/

# 파일명으로 찾기
find docs -name "*키워드*"
```

## 📝 문서 작성 가이드

### 새 문서 추가 시
1. 적절한 폴더 선택
2. 마크다운 형식 사용
3. 목차와 섹션 구조화
4. 코드 예시 포함 (필요시)

### 개발 이력 기록 시
1. **[development/history/](./development/history/)** 폴더 사용
2. 날짜별 파일 생성 (YYYY-MM-DD.md)
3. 템플릿 형식 준수
4. 의사결정 과정 포함

### 문서 업데이트 시
1. 관련 문서들 동시 업데이트
2. 링크 깨짐 확인
3. 목차 업데이트

## 🎯 기능별 상세 문서 위치

각 기능의 **상세 구현 가이드**는 해당 위치의 `CLAUDE.md` 파일에서 확인하세요:

### Features Layer (비즈니스 로직)
- [`src/features/auth/CLAUDE.md`](../src/features/auth/CLAUDE.md) - **인증 시스템**
  - 로그인/로그아웃, 회원가입, 인증 가드
  - 보안 고려사항, 에러 처리, 데이터 플로우
- [`src/features/post-editor/CLAUDE.md`](../src/features/post-editor/CLAUDE.md) - **글 작성/편집**
  - 마크다운 에디터, 미리보기, 자동 저장
  - 성능 최적화, 이미지 업로드 처리

### Entities Layer (도메인 모델)
- [`src/entities/user/CLAUDE.md`](../src/entities/user/CLAUDE.md) - **사용자 도메인**
  - 사용자 데이터 모델, API 호출, 훅
- [`src/entities/post/CLAUDE.md`](../src/entities/post/CLAUDE.md) - **블로그글 도메인**
  - 글 데이터 모델, CRUD 작업, 유효성 검증

### Shared Layer (공통 리소스)
- [`src/shared/components/`](../src/shared/components/) - **공통 UI 컴포넌트**
- [`src/shared/utils/`](../src/shared/utils/) - **유틸리티 함수들**
- [`src/shared/types/`](../src/shared/types/) - **공통 타입 정의**

## 🚀 빠른 참조

### 🎯 신입 개발자 온보딩

#### 1️⃣ 프로젝트 전체 파악 (30분)
- [ ] [**README.md**](../README.md) `10분` - 프로젝트 개요 및 시작 방법
- [ ] [**CLAUDE.md**](../CLAUDE.md) `10분` - 코딩 규칙과 빠른 시작 가이드
- [ ] [**docs/README.md**](./README.md) `10분` - 전체 문서 구조 파악

#### 2️⃣ 아키텍처 이해 (1시간)
- [ ] [아키텍처 개요](./architecture/overview.md) `20분` - FSD 아키텍처 철학
- [ ] [폴더 구조](./architecture/folder-structure.md) `15분` - 폴더 구조 이해
- [ ] [의존성 규칙](./architecture/dependency-rules.md) `10분` - 의존성 규칙
- [ ] [전체 시스템 아키텍처](./architecture/design/architecture.md) `15분` - 시스템 구조

#### 3️⃣ 개발 프로세스 익히기 (45분)
- [ ] [개발 프로세스](./development/process/develop-process.md) `20분` - TDD 및 의사결정 기록
- [ ] [코드 포맷 규칙](./development/guides/code-format.md) `15분` - 영어 식별자 규칙
- [ ] [테스트 전략](./development/guides/testing-strategy.md) `10분` - 테스트 전략

#### 4️⃣ 시스템 이해 (30분)
- [ ] [데이터 플로우](./architecture/design/data-flow.md) `20분` - Supabase 연동 패턴
- [ ] [인증 시스템](./features/authentication.md) `10분` - 인증 시스템 개요

### 🔨 새 기능 개발
1. [개발 프로세스](./development/process/develop-process.md) - 의사결정 기록 절차
2. [아키텍처 개요](./architecture/overview.md) - 계층별 역할
3. [의존성 규칙](./architecture/dependency-rules.md) - 허용/금지 패턴
4. 해당 기능의 `CLAUDE.md` - 구체적 구현 방법

### 문제 해결
1. [문제해결 가이드](./guides/troubleshooting-guide.md) - 일반적 문제들
2. [에러 처리 가이드](./guides/error-handling-guide.md) - 에러 처리 패턴
3. [개발 이력](./development/history/) - 과거 해결 사례

---

> 💡 **문서 구조 원칙**:
> - `docs/` = 전체적인 가이드와 시스템 문서
> - `src/*/CLAUDE.md` = 각 기능별 상세 구현 가이드
> - `docs/development/history/` = 모든 개발 의사결정 기록
> - 중복 없이, 참조로 연결하여 유지보수성 확보

*문서에 대한 피드백이나 개선 제안이 있으면 개발팀에 알려주세요.*