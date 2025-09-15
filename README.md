# 한국어 블로그 프로젝트

React 19 + TypeScript + Supabase를 활용한 현대적인 블로그 애플리케이션입니다.

## ✨ 주요 특징

- **Feature Slice Design (FSD)** 아키텍처 적용
- **한국어 중심 개발** - 모든 코드와 문서가 한국어로 작성
- **마크다운 지원** - 블로그 글 작성과 문법 강조 기능
- **실시간 데이터베이스** - Supabase를 통한 인증과 데이터 관리
- **반응형 디자인** - Tailwind CSS v4 + shadcn/ui

## 🚀 시작하기

### 환경 설정

```bash
pnpm install
pnpm start
```

### 프로덕션 빌드

```bash
pnpm build
```

## 🛠️ 기술 스택

- **프레임워크**: React 19 + TypeScript
- **빌드**: Vite
- **라우팅**: TanStack Router (파일 기반)
- **상태 관리**: TanStack Query
- **백엔드**: Supabase (인증, 데이터베이스, 스토리지)
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **테스트**: Vitest + Testing Library
- **린팅**: Biome

## 📁 프로젝트 구조

```
src/
├── app/              # 애플리케이션 레이어
├── pages/            # 페이지 레이어
├── features/         # 기능 레이어
├── entities/         # 엔티티 레이어
├── shared/           # 공유 레이어
└── routes/           # TanStack Router 파일
```

## 🧪 테스트 및 검증

```bash
pnpm test              # Vitest 테스트 실행
pnpm lint              # Biome 린팅
pnpm format            # 코드 포맷팅
pnpm check             # 타입 검사
```

## 📚 개발 가이드

이 프로젝트는 **한국어 우선 개발**을 원칙으로 합니다. 상세한 개발 가이드는 다음 문서를 참조하세요:

### 주요 문서

- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 전체 가이드
- **[아키텍처 가이드](./docs/architecture.md)** - FSD 아키텍처 상세 설명
- **[개발 프로세스](./docs/develop-process.md)** - TDD 개발 워크플로우
- **[코드 포맷](./docs/code-format.md)** - 한국어 네이밍 규칙
- **[데이터 플로우](./docs/data-flow.md)** - Supabase 연동 가이드

### 레이어별 가이드

- **[엔티티 레이어](./src/entities/CLAUDE.md)** - 도메인 모델 정의
- **[기능 레이어](./src/features/CLAUDE.md)** - UI 및 비즈니스 로직

## 🎯 개발 원칙

1. **한국어 코드**: 모든 변수명, 함수명, 주석은 한국어로 작성
2. **TDD**: 테스트 주도 개발 (Red → Green → Refactor)
3. **FSD 아키텍처**: 계층별 역할 분리와 의존성 규칙 준수
4. **타입 안전성**: TypeScript를 활용한 엄격한 타입 검사

이 프로젝트는 TanStack Router를 사용하여 파일 기반 라우팅을 구현합니다. `src/routes` 폴더에 파일을 추가하면 자동으로 라우트가 생성됩니다.

## 🌐 주요 페이지

- **홈**: 최신 블로그 글 목록
- **글 상세**: 마크다운 렌더링과 댓글 시스템
- **글 작성/편집**: 실시간 미리보기 에디터
- **관리자**: 사용자 및 컨텐츠 관리

## 🔧 환경 변수

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성: `git checkout -b feature/새기능`
3. TDD 개발 프로세스 준수
4. 테스트 작성 및 통과 확인
5. 풀 리퀘스트 생성

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
