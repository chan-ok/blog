# AI 코딩 에이전트 가이드

AI 에이전트는 문서의 과거 설명보다 현재 소스, `package.json`, 설정 파일을 우선합니다. 작업 전 관련 파일과 worktree 상태를 확인하고 사용자 변경을 보존하세요.

## 현재 기준

- React 19, TanStack Router, Vite 8, TypeScript
- Tailwind CSS 4, i18next, Zustand
- `react-markdown` 기반 비실행 Markdown 렌더링
- Vitest 단위·통합 테스트와 Playwright 브라우저 테스트
- `app → features → entities → shared` 레이어 방향
- 한국어·일본어(`ko`, `ja`) 지원

## 작업 원칙

1. 요구사항을 실제 라우트·컴포넌트·테스트에 연결합니다.
2. dirty worktree의 기존 변경을 되돌리거나 덮어쓰지 않습니다.
3. 동작 변경은 먼저 실패하는 테스트로 고정합니다.
4. 기존 유틸과 컴포넌트를 재사용하고 필요한 범위만 수정합니다.
5. 존재하지 않는 script, 디렉터리, 플러그인, 자동화를 문서화하지 않습니다.
6. 완료 전 diff와 관련 검증 결과를 직접 확인합니다.

## 테스트 선택

| 변경                                     | 우선 검증                     |
| ---------------------------------------- | ----------------------------- |
| 순수 함수·파서·공개성 정책               | Vitest                        |
| 라우트 loader와 컴포넌트 출력            | Vitest                        |
| 실제 viewport·레이아웃·브라우저 상호작용 | Playwright                    |
| 타입·빌드 설정                           | `typecheck`, `build`          |
| 문서                                     | 로컬 링크, `git diff --check` |

테스트는 프로젝트 안에 둡니다. Vitest 테스트는 관련 소스 옆 `src/**/*.test.ts(x)`, Playwright 테스트는 `tests/browser`에 둡니다. Node의 `assert` 대신 각 러너의 `expect`를 사용합니다.

## 검증 명령

```bash
pnpm typecheck
pnpm lint:error
pnpm test:once
pnpm build
pnpm exec playwright test --config playwright.config.ts
```

작업 범위와 위험에 맞게 관련 명령을 실행하세요. package script의 실제 목록은 [commands.md](./commands.md)에 있습니다.

## 보안 기준

- `VITE_*`를 공개 값으로 취급합니다.
- 외부 Markdown 경로·URL 검증과 `skipHtml`을 우회하지 않습니다.
- 원격 MDX를 런타임 JavaScript로 평가하지 않습니다.
- Mermaid SVG 정화를 제거하지 않습니다.
- 공개성 판정을 목록과 상세 양쪽에 적용합니다.

자세한 내용은 [security.md](./security.md)를 참고하세요.

## 스킬과 외부 도구

현재 리포지터리에 프로젝트 로컬 스킬은 없습니다. 세션에 따라 전역 스킬이나 MCP가 추가로 보일 수 있지만, 설치 여부를 추정하지 말고 실제 사용 가능한 도구를 확인하세요.

과거 구현 스펙과 계획은 `docs/superpowers`에 보관되어 있습니다. 이 문서들은 현재 지시가 아니라 당시 의사결정 기록입니다.

## 관련 문서

- [개발 가이드](./development.md)
- [아키텍처](./architecture.md)
- [아키텍처 규칙](./architecture-rules.md)
- [코드 스타일](./code-style.md)
- [안티패턴](./anti-patterns.md)
- [보안](./security.md)
- [언어 규칙](./language-rules.md)
- [Git 흐름](./git-flow.md)
