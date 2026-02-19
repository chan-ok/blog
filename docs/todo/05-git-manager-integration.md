# git-manager 에이전트 통합

## 배경
- 기존 git-guardian(Git 워크플로우)와 github-helper(GitHub CLI)를 단일 에이전트로 통합
- 새로운 Git 워크플로우 전략 반영:
  - feature 브랜치에서 자유로운 커밋 (제약 없음)
  - feature → develop 머지 시 로컬 코드 리뷰 (tech-architect 위임) 후 squash merge
  - develop → main PR 생성 전 최종 보안 검토 (tech-architect 위임)
- Task tool 권한 추가 (tech-architect 호출용)
- git merge --squash, 브랜치 삭제 권한 추가
- gh CLI 명령어 통합 (PR/Issue/CI 전체 관리)

## 작업 항목

### A. 파일 생성 및 삭제

**우선순위 높음**:
- [x] todolist 작성 완료
- [ ] `.agents/agents/git-manager.md` 파일 생성 (새 통합 에이전트 프롬프트)
- [ ] `.agents/agents/git-guardian.md` 파일 삭제
- [ ] `.agents/agents/github-helper.md` 파일 삭제

### B. 문서 업데이트

**우선순위 높음** (에이전트 참조 변경):
- [ ] `docs/agent-system.md` — git-guardian/github-helper 섹션 → git-manager 섹션 (line 121-146)
- [ ] `docs/agents.md` — 에이전트 역할 요약 표 수정 (9개→8개, line 119-120)
- [ ] `docs/agent-permissions.md` — 권한 섹션 통합 (섹션6/7 → git-manager, line 127-189)
- [ ] `README.md` — 에이전트 목록 수정 (line 186-187)
- [ ] `docs/architecture.md` — 에이전트 목록 언급 수정 (line 720)
- [ ] `.agents/agents/master-orchestrator.md` — git-guardian 참조 → git-manager (line 97, 124, 127, 169)

### C. 설정 파일 업데이트

**우선순위 높음**:
- [ ] `opencode.json` — git-manager 추가, git-guardian/github-helper 제거 (line 426-574)

## 실행 가능 여부

### ✅ 서브에이전트 실행 가능 (feature-developer)
- Tasks A, B 전체 — `.md` 파일 생성/수정/삭제

### ⚠️ 권한 확인 필요
- Task C — `opencode.json` 수정 (설정 파일, feature-developer 권한 확인 필요)

## 참조하지 않는 파일
- `docs/retrospective/` — 과거 회고 기록 (보존)

## 공통 참고사항
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
- 에이전트: master-orchestrator는 조율만, 직접 코드/문서 작성 안함 (`docs/agent-system.md`)
