# 보안 개선 요약 (2025-02-08)

## 🎯 개선 목표

1. 에이전트별 권한 분리로 최소 권한 원칙 적용
2. Git 작업 안전성 강화
3. 민감 정보 노출 방지
4. 사용자에게 명령 실행 주체 명확히 표시

## ✅ 완료된 작업

### 1. 에이전트별 권한 분리

**master-orchestrator** (조율자):

- ❌ 소스 코드 작성/수정 권한 제거
- ❌ Git 명령 실행 권한 제거
- ✅ Task tool로 subagent 호출만 허용
- ✅ Dashboard 문서 작성만 허용

**feature-developer** (기능 개발):

- ✅ 소스 코드 파일 작성/수정 허용
- ✅ 테스트/린트 실행 허용
- ✅ Git 읽기 명령 허용
- ✅ Git add/commit 허용 (사용자 확인 필요)

**test-specialist** (테스트 작성):

- ✅ 테스트 파일 작성/수정 허용
- ✅ Storybook 파일 작성/수정 허용
- ✅ 테스트 실행 허용
- ✅ Git add/commit 허용 (테스트 파일만)

**security-scanner** (보안 감사):

- ✅ 모든 파일 읽기 허용 (.env 제외)
- ❌ 모든 파일 쓰기 금지 (읽기 전용)
- ✅ pnpm audit 실행 허용
- ✅ Git 읽기 명령 허용

**doc-validator** (문서 검증):

- ✅ 문서 파일 작성/수정 허용
- ✅ 소스 코드 읽기 허용
- ✅ Git add/commit 허용 (문서만)

**git-guardian** (Git 관리) - **신규 추가**:

- ✅ Git 브랜치/워크트리 관리
- ✅ Git add/commit/merge 허용 (사용자 확인 필요)
- ✅ Git push 허용 (사용자 확인 필요)
- ❌ 파일 쓰기 금지 (Git 작업만)

**github-helper** (GitHub 통합) - **신규 추가**:

- ✅ gh pr/issue 관리
- ✅ CI/CD 모니터링
- ❌ 파일 쓰기 금지
- ❌ Git 로컬 작업 금지 (git-guardian에 위임)

### 2. 보안 명령 차단

**전역 차단 (모든 에이전트)**:

```json
{
  "rm *": "deny",
  "git commit *": "deny",
  "git push *": "deny",
  "git reset --hard *": "deny",
  "git rebase *": "deny",
  "git commit --no-verify *": "deny"
}
```

**파일 접근 제한**:

```json
{
  "read": {
    "*.env": "deny",
    "*.env.*": "deny",
    "*.env.example": "allow"
  }
}
```

### 3. 위험 명령 패턴 제한

**이전 (위험)**:

- `cat *` → 모든 파일 읽기 가능 (.env 포함)
- `git add *` → .env 스테이징 가능
- `git branch *` → `git branch -D` 강제 삭제 가능
- `git config *` → 커밋 위조 가능
- `find *` → 시스템 전체 탐색 가능

**이후 (안전)**:

- `cat dashboard.md`, `cat docs/*.md` → 특정 파일만
- `git add .` → 사용자 확인 필요 (ask)
- `git branch --list` → 읽기만 허용
- `git config --get *` → 읽기만 허용
- `find . -name '*.ts'` → 특정 패턴만

### 4. 명령 실행 요청 규칙 추가

모든 에이전트는 명령 실행 요청 시 에이전트 이름을 명시해야 합니다:

**이전**:

```
다음 명령을 실행해도 될까요?
→ git add src/shared/ui/Button.tsx
```

**이후**:

```
[feature-developer] 다음 명령을 실행해도 될까요?
→ git add src/shared/ui/Button.tsx

이유: Button 컴포넌트 구현 완료, 커밋 준비
```

## 📊 보안 개선 효과

### 데이터 손실 방지

- ✅ `git reset --hard` 차단 → 변경사항 영구 삭제 방지
- ✅ `git branch -D` 차단 → 브랜치 강제 삭제 방지
- ✅ `git rebase` 차단 → 히스토리 변경 방지
- ✅ `git stash drop/clear` 차단 → stash 영구 삭제 방지

### 데이터 변질 방지

- ✅ `git config user.*` 차단 → 커밋 위조 방지
- ✅ `git commit --no-verify` 차단 → pre-commit 훅 우회 방지
- ✅ Git add는 사용자 확인 필요 → 의도하지 않은 스테이징 방지

### 민감 정보 노출 방지

- ✅ `.env` 파일 읽기 차단 → API 키 노출 방지
- ✅ `cat *` 차단 → 민감 파일 무단 접근 방지
- ✅ security-scanner 읽기 전용 → 보안 감사 중 변경 방지

### 책임 명확화

- ✅ 에이전트별 권한 분리 → 각자의 역할에 집중
- ✅ 명령 실행 주체 표시 → 사용자가 어느 에이전트인지 확인
- ✅ master-orchestrator는 조율만 → 코드 수정은 subagent

## 📁 변경된 파일

1. **opencode.json** (+337/-21 lines)
   - 에이전트별 permission 섹션 추가
   - git-guardian, github-helper 에이전트 추가
   - 전역 보안 규칙 강화
   - git commit --no-verify 차단

2. **docs/agent-permissions.md** (신규 생성, 302 lines)
   - 에이전트별 권한 가이드
   - 권한 매트릭스 테이블
   - 워크플로우 예시
   - 보안 개선 사항 문서화

3. **.agents/agents/master-orchestrator.md** (+13 lines)
   - 소스 코드/Git 작업 금지 명시
   - 명령 실행 요청 규칙 추가

## 🔄 다음 작업 (재시작 후)

1. ⏳ 모든 에이전트 프롬프트에 명령 실행 요청 규칙 추가
   - feature-developer.md
   - test-specialist.md
   - security-scanner.md
   - doc-validator.md
   - git-guardian.md
   - github-helper.md

2. ⏳ 변경된 opencode.json 검증
   - 기본 명령 실행 테스트
   - 에이전트별 권한 동작 확인

3. ⏳ Phase 10 진행
   - ThemeToggle, LocaleToggle 마이그레이션
   - 남은 3개 Storybook 테스트 수정
   - 207/207 테스트 통과 목표

## 📋 참고 문서

- [에이전트별 권한 가이드](./agent-permissions.md)
- [에이전트 README](../.agents/agents/README.md)
- [코딩 가이드](./agents.md)
