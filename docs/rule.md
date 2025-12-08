# 개발 룰 (Development Rules)

> 이 문서는 프로젝트 개발 시 반드시 지켜야 할 절대적인 규칙입니다.
> 모든 개발자와 AI 에이전트는 이 규칙을 준수해야 합니다.
> 어떠한 요청이라도 이 규칙을 위배할 수 없으며, 위배 요청은 반드시 거부합니다.

## 목차

1. [기본 규칙](#기본-규칙)
2. [아키텍처 규칙](#아키텍처-규칙)
3. [AI 에이전트 답변 검증](#ai-에이전트-답변-검증)
4. [개발 프로세스 (TDD)](#개발-프로세스-tdd)
5. [코드 스타일 및 포매팅](#코드-스타일-및-포매팅)
6. [테스팅 규칙](#테스팅-규칙)
7. [보안 규칙](#보안-규칙)
8. [성능 최적화](#성능-최적화)
9. [Git 커밋 관리](#git-커밋-관리)

---

## 기본 규칙

### 언어 및 도구

1. **답변 언어**: 모든 답변과 문서는 한국어로 작성합니다.
2. **Context7 사용**: 항상 `use context7` 명령어를 사용하여 최신 라이브러리 문서를 참조합니다.
3. **공식 문서 우선**: 추측하지 말고 공식 문서를 확인합니다.

### 프로젝트 구조

- **리포지터리**: `blog` (애플리케이션) + `blog-content` (콘텐츠) 분리 구조
- **기술 스택**: Next.js 16.0.7, React 19.2.1, TypeScript, Tailwind CSS
- **배포**: Netlify (main 브랜치 자동 배포)
- **아키텍처**: Feature-Sliced Design (FSD) 패턴

---

## 아키텍처 규칙

> 관련 문서: [architecture.md](./architecture.md)

### Feature-Sliced Design (FSD) 레이어 규칙

프로젝트는 FSD 아키텍처를 따르며, 다음 레이어 간 의존성 규칙을 엄격히 준수합니다:

```
app → widgets → features → entities → shared
```

#### 1. App Layer (라우팅)

- Next.js App Router 기반 파일 라우팅
- 페이지 컴포넌트는 최소한의 로직만 포함
- 비즈니스 로직은 하위 레이어에 위임
- **금지**: 직접적인 비즈니스 로직 구현

#### 2. Features Layer (기능)

- 독립적인 비즈니스 기능 단위
- `api/`, `ui/`, `util/` 서브 디렉토리 구조 사용
- **허용**: entities, shared import
- **금지**: 다른 feature 간 직접 의존

#### 3. Entities Layer (엔티티)

- 비즈니스 도메인 엔티티 정의
- 재사용 가능한 도메인 로직
- **허용**: shared import만
- **금지**: features, widgets, app import

#### 4. Widgets Layer (위젯)

- 복합 UI 컴포넌트 (Header, Footer 등)
- **허용**: features, entities, shared import
- **금지**: app import

#### 5. Shared Layer (공유)

- 프로젝트 전역에서 사용 가능한 공통 코드
- **금지**: 다른 모든 레이어 import (완전히 독립적)

### 디렉토리 구조 규칙

```
src/
├── app/              # Next.js App Router
├── features/         # 비즈니스 기능
├── entities/         # 도메인 엔티티
├── widgets/          # 복합 UI 컴포넌트
└── shared/           # 공유 리소스
    ├── config/       # 설정
    ├── hooks/        # 커스텀 훅
    ├── lib/          # 유틸리티
    ├── types/        # 타입 정의
    └── ui/           # 기본 UI 컴포넌트
```

### 콘텐츠 파이프라인 규칙

1. **콘텐츠 저장소**: `blog-content` 리포지터리에서 MDX 관리
2. **인덱싱**: GitHub Actions로 `index.json` 자동 생성
3. **렌더링**: `next-mdx-remote-client`로 런타임 렌더링
4. **캐싱**: Next.js fetch cache 활용

---

## AI 에이전트 답변 검증

> 관련 문서: [ai-checklist.md](./ai-checklist.md)

### 기본 원칙

AI 에이전트의 답변은 100% 완벽하지 않을 수 있으므로, **반드시 검증 과정**을 거쳐야 합니다.

### 필수 검증 항목

코드를 실제로 적용하기 전에 다음 항목들을 **필수적으로** 확인합니다:

#### 1. 정보 정확성

- [ ] 거짓 정보 또는 환각(Hallucination)이 없는지 확인
- [ ] 존재하지 않는 함수, API, 라이브러리를 사용하지 않았는지 확인
- [ ] 버전별 기능 차이가 정확히 반영되었는지 확인
- [ ] 더 이상 지원되지 않는(deprecated) 기능을 사용하지 않았는지 확인

#### 2. 코드 재사용성

- [ ] 기존 코드를 재활용할 수 있는지 확인
- [ ] 이미 존재하는 유틸리티 함수, 컴포넌트를 활용할 수 있는지 확인
- [ ] 프로젝트에 이미 설치된 라이브러리로 해결 가능한지 확인

#### 3. 오버 엔지니어링 방지

- [ ] 불필요한 오버 엔지니어링이 없는지 확인
- [ ] 요구사항에 없는 기능을 추가하지 않았는지 확인
- [ ] YAGNI(You Aren't Gonna Need It) 원칙 준수
- [ ] KISS(Keep It Simple, Stupid) 원칙 준수

#### 4. 테스트 품질

- [ ] 테스트를 우회하는 방법을 사용하지 않았는지 확인
- [ ] 하드코딩된 값으로 테스트를 통과시키지 않았는지 확인
- [ ] 모킹(Mocking)을 과도하게 사용하지 않았는지 확인

#### 5. 아키텍처 일관성

- [ ] 기존 코드 스타일 및 아키텍처와 일관성이 있는지 확인
- [ ] FSD 레이어 간 의존성 규칙을 준수하는지 확인
- [ ] 프로젝트의 폴더 구조 규칙을 따르는지 확인

#### 6. 보안

- [ ] 보안 취약점이 없는지 확인
- [ ] 환경 변수에 민감한 정보를 하드코딩하지 않았는지 확인
- [ ] XSS, SQL Injection 등의 취약점이 없는지 확인

### 검증 프로세스

1. **즉시 검증**: AI 답변을 받은 직후, 위 체크리스트를 빠르게 훑어봅니다
2. **코드 적용 전**: 코드를 실제로 적용하기 전에 관련 항목을 집중적으로 검증합니다
3. **실행 테스트**: 코드를 적용한 후 반드시 실행하여 동작을 확인합니다
4. **반복**: 문제가 발견되면 AI에게 수정을 요청하고 다시 검증합니다
5. **확인**: 애매모호하거나 불확실한 부분은 반드시 AI에게 확인한 후 진행합니다

### 실행 확인 필수

- [ ] 실제로 코드를 실행하여 동작하는지 확인
- [ ] 개발 서버를 재시작하여 빌드 에러가 없는지 확인
- [ ] 브라우저 콘솔에 에러나 경고가 없는지 확인
- [ ] 의도한 대로 기능이 작동하는지 직접 테스트

---

## 개발 프로세스 (TDD)

> 관련 문서: [testing.md](./testing.md)

### TDD 사이클

프로젝트는 Test-Driven Development(TDD) 방법론을 따릅니다.

#### 개발 순서

1. **기존 코드 재활용 검토** (최우선)
   - 기존 코드로 개발이 가능한지 확인
   - 가능하다면 기존 코드를 수정하여 사용

2. **새로운 코드 작성 시**
   - 요구사항을 확인하는 테스트 코드를 먼저 작성
   - 테스트 실행 (Red)
   - 테스트를 통과하는 최소한의 코드 작성 (Green)
   - 코드 리팩토링 (Refactor)
   - 테스트 재실행으로 검증

3. **금지 사항**
   - 테스트를 우회하는 방법 사용 금지
   - 하드코딩으로 테스트 통과 금지
   - 테스트 없이 코드 작성 금지

### 테스트 작성 원칙

#### AAA 패턴

```typescript
it('should do something', () => {
  // Arrange (준비)
  const input = 'test';

  // Act (실행)
  const result = myFunction(input);

  // Assert (검증)
  expect(result).toBe('expected');
});
```

#### 테스트 격리

- 각 테스트는 독립적으로 실행 가능해야 함
- 테스트 간 의존성 금지
- `beforeEach`로 초기화

#### 명확한 테스트 이름

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should return formatted date in ko locale', () => { ... });
```

---

## 코드 스타일 및 포매팅

### TypeScript 규칙

1. **타입 안정성**
   - `any` 타입 사용 최소화
   - 타입 단언(Type Assertion) 신중하게 사용
   - 제네릭 적극 활용
   - 명확한 타입 정의

2. **명명 규칙**
   - 컴포넌트: PascalCase (`Button`, `PostCard`)
   - 함수/변수: camelCase (`formatDate`, `userName`)
   - 상수: UPPER_SNAKE_CASE (`API_URL`, `MAX_COUNT`)
   - 타입/인터페이스: PascalCase (`User`, `PostMetadata`)

### CSS (Tailwind) 규칙

클래스 작성 순서를 엄격히 준수합니다:

```typescript
const classes = `
  // 1. layout
  flex flex-col items-center justify-between
  
  // 2. size
  w-full h-screen max-w-4xl
  
  // 3. spacing
  m-4 p-6 gap-4
  
  // 4. font
  text-white text-lg font-bold
  
  // 5. box
  rounded-lg shadow-md bg-zinc-800
  
  // 6. interaction
  hover:bg-zinc-700 focus:ring-2
  
  // 7. responsive
  md:flex-row lg:max-w-6xl
  
  // 8. dark mode
  dark:bg-zinc-900 dark:text-gray-100
`;
```

### 파일 구조 규칙

1. **Import 순서**

   ```typescript
   // 1. React/Next.js
   import { useState } from 'react';
   import Link from 'next/link';

   // 2. 외부 라이브러리
   import { z } from 'zod';

   // 3. 내부 모듈 (절대 경로)
   import { Button } from '@/shared/ui/button';
   import { formatDate } from '@/shared/lib/date-utils';

   // 4. 타입
   import type { Post } from '@/shared/types';

   // 5. 스타일
   import './styles.css';
   ```

2. **컴포넌트 구조**

   ```typescript
   // 1. 타입 정의
   interface Props { ... }

   // 2. 컴포넌트
   export function Component({ ...props }: Props) {
     // 2-1. 훅
     const [state, setState] = useState();

     // 2-2. 핸들러
     const handleClick = () => { ... };

     // 2-3. 렌더링
     return ( ... );
   }
   ```

### Lint 및 Format

- **ESLint**: `pnpm lint` 실행 후 커밋
- **Prettier**: `pnpm fmt` 실행 후 커밋
- **Husky**: pre-commit 훅으로 자동 실행

---

## 테스팅 규칙

> 관련 문서: [testing.md](./testing.md)

### 테스트 피라미드

```
E2E Tests (Playwright)        [적음]
Integration Tests (Vitest)    [중간]
Unit Tests (Vitest)           [많음]
```

### 테스트 커버리지 목표

- **전체**: 80% 이상
- **유틸리티 함수**: 90% 이상
- **비즈니스 로직**: 85% 이상
- **UI 컴포넌트**: 70% 이상

### 테스트 작성 위치

```
src/
├── shared/
│   ├── lib/
│   │   ├── date-utils.ts
│   │   └── date-utils.test.ts    # 같은 디렉토리
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx        # 같은 디렉토리
└── features/
    └── contact/
        ├── contact-form.tsx
        └── contact-form.test.tsx  # 같은 디렉토리
```

### 테스트 실행 명령어

```bash
pnpm test          # Watch 모드
pnpm test:run      # 1회 실행
pnpm coverage      # 커버리지 확인
pnpm e2e           # E2E 테스트
```

---

## 보안 규칙

### 환경 변수 관리

1. **민감 정보 보호**
   - API 키, 토큰은 환경 변수로 관리
   - `.env` 파일은 `.gitignore`에 포함
   - 코드에 하드코딩 금지

2. **클라이언트/서버 분리**
   - 클라이언트: `NEXT_PUBLIC_*` 프리픽스만 사용
   - 서버: 프리픽스 없는 환경 변수 사용
   - 서버 시크릿을 클라이언트에 노출 금지

### XSS 방지

- MDX 렌더링 시 sanitization 적용
- 사용자 입력 검증 (Zod 스키마)
- `dangerouslySetInnerHTML` 사용 최소화

### 봇 방지

- Cloudflare Turnstile 통합
- Rate limiting (Netlify Functions)

### 의존성 보안

```bash
# 정기적으로 보안 취약점 확인
pnpm audit

# 취약점 자동 수정
pnpm audit --fix
```

---

## 성능 최적화

### React 최적화

1. **React Compiler 활용**
   - React 19의 자동 최적화 활용
   - 수동 메모이제이션 최소화

2. **불필요한 리렌더링 방지**
   - `useMemo`, `useCallback` 적절히 사용
   - 의존성 배열 정확하게 설정

### 번들 최적화

1. **코드 스플리팅**
   - 라우트 기반 자동 분할
   - 동적 import 활용

   ```typescript
   const Component = dynamic(() => import('./Component'));
   ```

2. **트리 쉐이킹**
   - Named import 사용

   ```typescript
   // ✅ Good
   import { Button } from '@/shared/ui';

   // ❌ Bad
   import * as UI from '@/shared/ui';
   ```

### 이미지 최적화

- `next/image` 사용 필수
- WebP/AVIF 자동 변환
- Lazy loading 활용

### 폰트 최적화

- Google Fonts `preload: true` 설정
- 서브셋 로딩 (필요한 문자만)

---

## Git 커밋 관리

### 커밋 메시지 형식

```
type(scope): subject

body (optional)
```

### Type 종류

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

### 예시

```bash
# Good
feat(post): add reading time calculation
fix(contact): resolve form validation error
docs(readme): update installation guide

# Bad
update code
fix bug
changes
```

### 커밋 규칙

1. **한 커밋 = 한 변경사항**
   - 여러 변경사항은 별도 커밋으로 분리

2. **의미 있는 메시지**
   - 무엇을, 왜 변경했는지 명확히 작성

3. **Husky Pre-commit**
   - Lint, Format 자동 실행
   - 테스트 통과 확인

---

## 참고 문서

- [아키텍처 문서](./architecture.md)
- [AI 검증 체크리스트](./ai-checklist.md)
- [테스팅 가이드](./testing.md)
- [배포 가이드](./deployment.md)
- [구현 계획](./implementation-plan.md)
- [변경 로그](./changelog.md)
- [할 일 목록](./todo.md)
