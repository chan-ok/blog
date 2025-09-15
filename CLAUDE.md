# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 필요한 가이드를 제공합니다.

## 🚨 중요: 코딩 규칙

**⚠️ 코드 식별자는 반드시 영어로 작성해야 합니다!**

- ✅ **영어로 작성**: 함수명, 변수명, 클래스명, 인터페이스명, 타입명, 프로퍼티명
- ✅ **한국어로 작성**: 주석, 문서, 커밋 메시지, UI 텍스트, 에러 메시지
- ❌ **금지**: `사용자`, `로그인하기`, `이메일` 등 한글 식별자 사용

**예시:**
```typescript
// ❌ 잘못된 예
interface 사용자 {
  이메일: string;
  비밀번호: string;
}
const 로그인하기 = (사용자정보: 사용자) => { ... }

// ✅ 올바른 예
interface User {
  email: string;
  password: string;
}
const login = (userInfo: User) => { ... }
```

## 📋 빠른 시작

### 개발 명령어

```bash
pnpm dev          # 개발 서버 시작 (포트 3000)
pnpm build        # 프로덕션 빌드
pnpm test         # 테스트 실행
```

### 기술 스택

- **프레임워크**: React 19 + Vite + TypeScript
- **라우팅**: TanStack Router (파일 기반, `src/pages/`)
- **상태 관리**: TanStack Query
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **백엔드**: Supabase
- **테스트**: Vitest (TDD 기반 개발)

## 📚 상세 가이드

모든 세부 사항은 다음 문서들을 참조하세요:

### 핵심 문서
- **[아키텍처 가이드](./docs/architecture.md)** - Feature Slice Design, 폴더 구조
- **[개발 할 일](./docs/todo.md)** - 구현 예정 기능들
- **[인증 시스템](./docs/authentication.md)** - 로그인 및 권한 관리 ⭐

### 개발 가이드
- **[코드 포맷 규칙](./docs/code-format.md)** - 네이밍 컨벤션
- **[데이터 플로우](./docs/data-flow.md)** - Supabase 연동 패턴
- **[개발 프로세스](./docs/develop-process.md)** - TDD 기반 개발 가이드

## 🏗️ 프로젝트 구조

```
src/
├── app/           # 애플리케이션 설정
├── pages/         # 라우팅 (파일 기반)
├── shared/        # 공유 리소스
├── entities/      # 데이터 엔티티 (앞으로 구현)
└── features/      # 기능 단위 (앞으로 구현)
```

## ⚡ 개발 시 유의사항

1. **TDD 기반 개발**: 실패 테스트 → 기능 개발 → 리팩토링
2. **코딩 언어 규칙**:
   - 함수명, 변수명, 클래스명, 인터페이스명, 타입명, 프로퍼티명: **반드시 영어** (camelCase, PascalCase)
   - 주석, 문서, 커밋 메시지, UI 텍스트: 한국어
   - **절대 금지**: 한글 식별자 사용 (예: `사용자`, `로그인하기`, `이메일` 등)
3. **타입 안전성**: TypeScript strict 모드 사용
4. **컴포넌트**: shadcn/ui 기반 일관된 UI

더 자세한 내용은 각 폴더의 CLAUDE.md 파일을 확인하세요.
