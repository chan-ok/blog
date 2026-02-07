# 기능 개발 에이전트

## 개요

이 디렉토리에는 프로젝트의 커스텀 에이전트가 포함되어 있습니다. 에이전트는 특정 작업을 자율적으로 수행하는 전문화된 AI 도우미입니다.

## 사용 가능한 에이전트

### feature-developer

10년차 프론트엔드 개발자로서, TDD 방식으로 새로운 기능을 개발하는 전문 에이전트입니다.

**주요 역할**:

- ✅ TDD(Red-Green-Refactor) 방식의 기능 개발
- ✅ 엣지 케이스 및 예상 버그 사전 식별
- ✅ 프로젝트 코딩 규칙 및 FSD 아키텍처 준수
- ✅ 포괄적인 테스트 커버리지 보장
- ✅ 보안 및 접근성 고려

**사용 시기**:

- 새로운 UI 컴포넌트 개발
- 복잡한 비즈니스 로직 구현
- Form 검증 및 보안 기능
- 엣지 케이스가 많은 기능

**사용 예시**:

```
"다크 모드를 지원하는 태그 필터 컴포넌트를 만들어줘"
"블로그 포스트를 카테고리별로 그룹핑하고 정렬하는 기능을 추가해줘"
"Contact 폼에 이메일 검증과 XSS 방지 기능을 추가해줘"
```

**개발 프로세스**:

1. 요구사항 분석 및 엣지 케이스 식별
2. TDD Red: 실패하는 테스트 작성
3. TDD Green: 최소 구현
4. TDD Refactor: 코드 품질 개선
5. 통합 및 검증 (테스트, 린트, 타입 체크)
6. 문서화

---

### security-scanner

보안 취약점을 탐지하고 민감 정보 노출을 방지하는 전문 에이전트입니다. **Git commit 전에 자동으로 실행**되어 코드 보안을 검증합니다.

**주요 역할**:

- 🔒 민감 정보 탐지 (API 키, 토큰, 비밀번호, 개인정보)
- 🔍 의존성 라이브러리 취약점 검사
- 🛡️ 보안 코딩 패턴 검증 (XSS, Injection 방지)
- 🚫 Critical 이슈 발견 시 Git commit/push 차단
- 💡 구체적인 수정 방법 제안

**중요: Pre-Commit vs Pre-Push**

| 단계           | 검사 항목      | 이유                                                |
| -------------- | -------------- | --------------------------------------------------- |
| **Pre-Commit** | 민감 정보 탐지 | 한 번이라도 커밋되면 Git 히스토리에 **영구 기록**됨 |
| **Pre-Push**   | 의존성 취약점  | 로컬 커밋은 되었지만 원격에 **공개되기 전** 차단    |

**사용 시기**:

- Git commit 전 자동 실행 (pre-commit hook) - **민감 정보 탐지**
- Git push 전 자동 실행 (pre-push hook) - **의존성 취약점**
- 코드 변경사항 보안 검증 (수동)
- 전체 프로젝트 보안 감사 (수동)

**사용 예시**:

```
"git commit 전에 보안 취약점 검사해줘"
"git push 전에 의존성 취약점 검사해줘"
"프로젝트 전체에 보안 취약점이 있는지 확인해줘"
"변경사항에 보안 문제가 없는지 검사해"
```

**검증 항목**:

1. **민감 정보 탐지 (Pre-Commit)**
   - API 키, 토큰, 비밀번호 하드코딩
   - AWS 키, Private 키 노출
   - 데이터베이스 연결 문자열 노출
   - 개인정보 (SSN, 신용카드 등)
   - 환경 변수 파일 (`.env`, `.env.local`) 커밋 시도

2. **환경 변수 검증**
   - `.env.local` 파일이 `.gitignore`에 포함되었는지
   - 서버/클라이언트 환경 변수 적절한 사용
   - `.env.example`에 실제 값 없는지

3. **의존성 취약점 (Pre-Push)**
   - `pnpm audit`로 알려진 취약점 확인
   - Critical/High 취약점 우선 처리
   - 대안 라이브러리 제안

4. **코드 보안 패턴**
   - XSS 방지 (dangerouslySetInnerHTML 검증)
   - Injection 방지 (사용자 입력 sanitization)
   - Zod 스키마 검증 적용 여부

**Commit/Push 차단 규칙**:

**Pre-Commit**:

- 🔴 **Critical 이슈 (민감 정보)**: 무조건 차단
- 🔴 **.env 파일 커밋 시도**: 무조건 차단

**Pre-Push**:

- 🔴 **Critical 취약점**: 무조건 차단
- 🟠 **High 취약점 (3개 이상)**: 차단 권장
- 🟡 **Moderate/Low 취약점**: 경고 표시 후 허용

**Husky Hook 통합**:

이 에이전트는 Husky를 통해 자동으로 실행됩니다:

- `.husky/pre-commit` - 민감 정보 탐지, 환경 변수 파일 차단
- `.husky/pre-push` - 의존성 취약점 검사

---

### doc-validator

프로젝트 문서(특히 `docs/agents.md`)의 정확성과 최신성을 검증하는 전문 에이전트입니다.

**주요 역할**:

- 📋 문서-코드 일관성 검증
- 🔍 오류 및 오래된 내용 탐지
- 🔄 Git 변경사항 추적하여 문서 업데이트 제안
- ✏️ 자동 문서 갱신 실행

**사용 시기**:

- 문서 정확성 확인 필요 시
- 코드 변경 후 문서 업데이트 필요 시
- 의존성 업데이트 후 버전 정보 확인
- 정기적인 문서 유지보수

**사용 예시**:

```
"docs/agents.md 문서가 현재 프로젝트와 일치하는지 검증해줘"
"최근 코드 변경사항을 확인해서 문서를 업데이트해야 할 부분이 있는지 알려줘"
"docs/agents.md에 오래된 내용이나 오류가 있는지 검증해"
```

**검증 항목**:

- ✅ package.json 명령어와 문서의 명령어 일치
- ✅ 파일 경로와 디렉토리 구조 일치
- ✅ 기술 스택 버전 정보 일치
- ✅ FSD 아키텍처 설명 일치
- ✅ 코드 예제 문법 및 정확성
- ✅ 내부 문서 링크 유효성

## 에이전트 트리거 방법

Claude Code가 자동으로 에이전트를 트리거합니다. 명시적으로 사용하고 싶다면:

```
"feature-developer 에이전트를 사용하여 [기능]을 구현해줘"
```

## 에이전트 검증

에이전트 파일이 올바르게 작성되었는지 검증하려면:

```bash
bash ../.agents/skills/agent-identifier/scripts/validate-agent.sh feature-developer.md
```

## 에이전트 개발 가이드

새로운 에이전트를 추가하려면 Agent Development 스킬을 참고하세요:

```
/Agent Development
```

또는 `.agents/skills/agent-identifier/SKILL.md` 파일을 확인하세요.

## 프로젝트 컨텍스트

에이전트는 다음 프로젝트 규칙을 준수합니다:

### 기술 스택

- Next.js 16, React 19, TypeScript 5
- Tailwind CSS v4
- Vitest, Playwright, Storybook, fast-check

### 아키텍처

- Feature-Sliced Design (FSD) 패턴
- `app → widgets → features → entities → shared`

### 코딩 규칙

- 한국어 주석 및 커밋 메시지
- TDD 필수
- Property-based 테스트 활용
- 타입 안정성 (any 금지)
- 보안 및 접근성 고려

자세한 내용은 `/docs/agents.md` 참고.
