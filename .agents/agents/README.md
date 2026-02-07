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
