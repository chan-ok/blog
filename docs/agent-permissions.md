# 에이전트별 권한 분리 가이드

## 개요

보안 강화를 위해 각 에이전트의 역할에 맞게 권한을 분리하였습니다. 이를 통해:

- 최소 권한 원칙 (Principle of Least Privilege) 적용
- 에이전트별 명확한 책임 범위 정의
- 민감 정보 노출 및 데이터 손실 위험 최소화

## 권한 분리 원칙

### 1. master-orchestrator

**역할**: 조율자 (Orchestrator)
**책임**: 작업 분석 및 subagent 호출

**허용 권한**:

- ✅ Task tool (subagent 호출)
- ✅ 파일 읽기 (소스 코드, 문서, 설정 파일)
- ✅ Dashboard 문서 작성/수정
- ✅ 테스트/린트 실행
- ✅ 파일 검색 (find, grep)

**제한 권한**:

- ❌ 소스 코드 작성/수정 (feature-developer/test-specialist에 위임)
- ❌ Git 작업 (git-guardian에 위임)
- ❌ GitHub 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 2. feature-developer

**역할**: 기능 개발자
**책임**: 새로운 기능 구현

**허용 권한**:

- ✅ 소스 코드 파일 읽기 (src/**/\*.ts, src/**/\*.tsx)
- ✅ 소스 코드 파일 작성/수정
- ✅ 설정 파일 읽기/수정 (\*.config.ts, package.json)
- ✅ 테스트/린트/타입체크 실행
- ✅ Git 읽기 명령 (status, diff, log)
- ✅ Git add/commit (사용자 확인 필요)

**제한 권한**:

- ❌ 테스트 파일 작성 (test-specialist에 위임)
- ❌ 문서 수정 (doc-validator에 위임)
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ GitHub PR 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 3. test-specialist

**역할**: 테스트 엔지니어
**책임**: 테스트 코드 작성 및 검증

**허용 권한**:

- ✅ 소스 코드 파일 읽기
- ✅ 테스트 파일 읽기/작성/수정 (_.test.ts, _.test.tsx)
- ✅ Storybook 파일 읽기/작성/수정 (\*.stories.tsx)
- ✅ 테스트/커버리지/린트 실행
- ✅ Storybook 실행
- ✅ Git 읽기 명령
- ✅ Git add/commit (테스트 파일만, 사용자 확인 필요)

**제한 권한**:

- ❌ 소스 코드 수정 (feature-developer에 위임)
- ❌ 문서 수정 (doc-validator에 위임)
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ GitHub PR 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 4. security-scanner

**역할**: 보안 감사관
**책임**: 보안 취약점 탐지 및 민감 정보 노출 방지

**허용 권한**:

- ✅ 모든 파일 읽기 (.env 제외)
- ✅ pnpm audit 실행
- ✅ Git 읽기 명령 (변경사항 확인)
- ✅ .gitignore 파일 읽기
- ✅ 민감 정보 패턴 검색

**제한 권한**:

- ❌ 모든 파일 쓰기/수정 (읽기 전용)
- ❌ Git add/commit
- ❌ .env 파일 읽기 (보안상 접근 불가)

**중요**: security-scanner는 **읽기 전용** 모드로 동작하며, 문제 발견 시 보고만 합니다.

### 5. doc-validator

**역할**: 문서 검증자
**책임**: 문서 정확성 검증 및 갱신

**허용 권한**:

- ✅ 문서 파일 읽기/작성/수정 (docs/\*.md)
- ✅ 소스 코드 파일 읽기 (검증 목적)
- ✅ 설정 파일 읽기
- ✅ Git 읽기 명령
- ✅ Git add/commit (문서 파일만, 사용자 확인 필요)

**제한 권한**:

- ❌ 소스 코드 수정
- ❌ Git branch/merge 작업 (git-guardian에 위임)
- ❌ GitHub PR 작업 (github-helper에 위임)
- ❌ .env 파일 접근

### 6. git-guardian

**역할**: Git 워크플로우 관리자
**책임**: 안전한 Git 작업 수행

**허용 권한**:

- ✅ 모든 Git 읽기 명령
- ✅ Git branch 생성/전환
- ✅ Git add/commit (사용자 확인 필요)
- ✅ Git stash 관리
- ✅ Git worktree 관리
- ✅ Git merge (사용자 확인 필요)
- ✅ Git push (사용자 확인 필요)
- ✅ Git config 읽기 (--get만)

**제한 권한**:

- ❌ 파일 쓰기/수정 (읽기 전용)
- ❌ git reset --hard (global deny)
- ❌ git rebase (global deny)
- ❌ git config 쓰기 (커밋 위조 방지)

**중요**: git-guardian은 **Git 작업 전용**이며, 파일 수정은 하지 않습니다.

### 7. github-helper

**역할**: GitHub 통합 관리자
**책임**: PR, Issue, CI/CD 관리

**허용 권한**:

- ✅ Git 읽기 명령 (상태 확인 목적)
- ✅ gh pr create/view/list/merge (PR 관리)
- ✅ gh issue create/view/list (Issue 관리)
- ✅ gh run list/view (CI/CD 모니터링)
- ✅ gh api (GitHub API 호출)

**제한 권한**:

- ❌ 파일 쓰기/수정 (읽기 전용)
- ❌ Git add/commit/push (git-guardian에 위임)
- ❌ .env 파일 접근

**중요**: github-helper는 **GitHub 작업 전용**이며, 로컬 Git 작업은 git-guardian에 위임합니다.

## 권한 매트릭스

| 권한             | master         | feature-dev | test-spec | security | doc-val  | git-guard | github   |
| ---------------- | -------------- | ----------- | --------- | -------- | -------- | --------- | -------- |
| **파일 작업**    |
| 소스 코드 읽기   | ✅             | ✅          | ✅        | ✅       | ✅       | ❌        | ❌       |
| 소스 코드 쓰기   | ❌             | ✅          | ❌        | ❌       | ❌       | ❌        | ❌       |
| 테스트 파일 쓰기 | ❌             | ❌          | ✅        | ❌       | ❌       | ❌        | ❌       |
| 문서 쓰기        | ✅ (dashboard) | ❌          | ❌        | ❌       | ✅       | ❌        | ❌       |
| .env 읽기        | ❌             | ❌          | ❌        | ❌       | ❌       | ❌        | ❌       |
| **테스트/빌드**  |
| pnpm test        | ✅             | ✅          | ✅        | ❌       | ❌       | ❌        | ❌       |
| pnpm audit       | ✅             | ❌          | ❌        | ✅       | ❌       | ❌        | ❌       |
| **Git 읽기**     |
| git status       | ❌             | ✅          | ✅        | ✅       | ✅       | ✅        | ✅       |
| git diff         | ❌             | ✅          | ✅        | ✅       | ✅       | ✅        | ✅       |
| git log          | ❌             | ✅          | ✅        | ✅       | ✅       | ✅        | ✅       |
| **Git 쓰기**     |
| git add          | ❌             | ✅ (ask)    | ✅ (ask)  | ❌       | ✅ (ask) | ✅ (ask)  | ❌       |
| git commit       | ❌             | ✅ (ask)    | ✅ (ask)  | ❌       | ✅ (ask) | ✅ (ask)  | ❌       |
| git checkout     | ❌             | ❌          | ❌        | ❌       | ❌       | ✅        | ❌       |
| git merge        | ❌             | ❌          | ❌        | ❌       | ❌       | ✅ (ask)  | ❌       |
| git push         | ❌             | ❌          | ❌        | ❌       | ❌       | ✅ (ask)  | ❌       |
| git worktree     | ❌             | ❌          | ❌        | ❌       | ❌       | ✅        | ❌       |
| **GitHub**       |
| gh pr create     | ❌             | ❌          | ❌        | ❌       | ❌       | ❌        | ✅ (ask) |
| gh pr view       | ❌             | ✅          | ✅        | ✅       | ✅       | ❌        | ✅       |
| gh pr merge      | ❌             | ❌          | ❌        | ❌       | ❌       | ❌        | ✅ (ask) |
| **Task Tool**    |
| task \*          | ✅             | ❌          | ❌        | ❌       | ❌       | ❌        | ❌       |

## 워크플로우 예시

### 예시 1: 새로운 기능 개발

```
사용자: "다크 모드 버튼 컴포넌트를 만들어줘"
  ↓
master-orchestrator (조율)
  ├─ Task → feature-developer (컴포넌트 구현)
  ├─ Task → test-specialist (테스트 작성)
  ├─ Task → security-scanner (보안 검증)
  └─ Task → git-guardian (커밋 생성)
       └─ Task → github-helper (PR 생성)
```

### 예시 2: Git 충돌 해결

```
사용자: "git 충돌이 발생했어"
  ↓
master-orchestrator (분석)
  ↓
Task → git-guardian (충돌 해결)
  ├─ git status (충돌 파일 확인)
  ├─ 사용자에게 해결 전략 제안
  ├─ git add . (사용자 확인 후)
  └─ git commit (merge 완료)
```

### 예시 3: PR 생성

```
사용자: "PR 만들어줘"
  ↓
master-orchestrator (조율)
  ↓
Task → github-helper (PR 생성)
  ├─ git log (커밋 분석)
  ├─ git diff develop...HEAD (변경사항 분석)
  └─ gh pr create (사용자 확인 후)
```

## 보안 개선 사항

### 1. 데이터 손실 방지

- ❌ `git branch -D` 차단 (강제 삭제 방지)
- ❌ `git checkout -- file` 차단 (변경사항 버림 방지)
- ❌ `git stash drop/clear` 차단 (git-guardian에서만 사용자 확인 후)
- ❌ `git reset --hard` 전역 차단
- ❌ `git rebase` 전역 차단

### 2. 데이터 변질 방지

- ❌ `git config user.email` 차단 (커밋 위조 방지)
- ✅ `git config --get` 읽기만 허용
- ✅ Git add/commit은 사용자 확인 필요 (ask)

### 3. 민감 정보 노출 방지

- ❌ `.env`, `.env.*` 파일 접근 전역 차단
- ❌ `cat *` 차단 → 특정 파일만 허용
- ✅ security-scanner가 민감 정보 탐지
- ✅ Git add 시 .env 파일 스테이징 방지

### 4. 권한 분리

- ✅ 각 에이전트는 자신의 역할에 필요한 최소 권한만 보유
- ✅ master-orchestrator는 조율만, 실제 작업은 subagent에 위임
- ✅ git-guardian과 github-helper로 Git 작업 분리

## Global Permission (모든 에이전트 공통)

```json
{
  "permission": {
    "rm *": "deny",
    "git commit *": "deny",
    "git push *": "deny",
    "git reset --hard *": "deny",
    "git rebase *": "deny",
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow"
    }
  }
}
```

## 변경 이력

- **2025-02-08**: 초안 작성 - 에이전트별 권한 분리 완료
  - master-orchestrator: Git/코드 수정 권한 제거
  - feature-developer: 소스 코드 작성 권한 추가
  - test-specialist: 테스트 파일 작성 권한 추가
  - security-scanner: 읽기 전용 보안 검증 권한 추가
  - doc-validator: 문서 작성 권한 추가
  - git-guardian: Git 워크플로우 관리 권한 추가
  - github-helper: GitHub 통합 권한 추가

## 참고 문서

- [에이전트 README](./.agents/agents/README.md)
- [코딩 가이드](./agents.md)
- [opencode.json 설정 파일](../opencode.json)
