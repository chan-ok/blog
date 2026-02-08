# opencode.json 업데이트 가이드

## 📋 변경 요약

**파일 위치**: `docs/opencode-complete.json` (완전한 버전)

### 주요 변경사항

1. ✅ **lint-formatter 에이전트 추가** (신규)
2. ✅ **doc-validator → doc-manager 승격** (에이전트명 변경 + 권한 확장)
3. ✅ **보안 개선사항 적용** (git commit/PR 권한 집중)

---

## 🆕 1. lint-formatter 에이전트 추가

### 역할

- 포매팅과 린트 에러만 수정 (코드 로직 변경 금지)
- Prettier, ESLint 자동 수정 우선 사용
- 타입 어노테이션만 추가 가능

### 권한

```json
"lint-formatter": {
  "mode": "subagent",
  "description": "Fixes formatting and linting errors without changing code behavior",
  "prompt": "{file:.agents/agents/lint-formatter.md}",
  "hidden": true,
  "permission": {
    "edit": {
      "src/**/*.ts": "ask",
      "src/**/*.tsx": "ask",
      "*.config.ts": "ask"
    },
    "bash": {
      "pnpm fmt": "allow",
      "pnpm lint": "allow",
      "pnpm lint --fix": "allow",
      "pnpm tsc --noEmit": "allow",
      "git add src/**/*.ts": "ask",
      "git add src/**/*.tsx": "ask"
    }
  }
}
```

### 트리거 예시

- "린트 에러가 발생했어"
- "코드 포매팅 좀 맞춰줘"
- "import 순서가 엉망이야"

---

## 🔄 2. doc-validator → doc-manager 승격

### 변경사항

#### Before (doc-validator)

- **역할**: 문서 검증만 (수동적)
- **권한**: `docs/*.md`만 수정 가능

#### After (doc-manager)

- **역할**: 문서 관리 전담 (능동적)
- **권한**: `docs/*.md` + `.agents/agents/*.md` 수정 가능

### 새로운 책임

1. 문서 정확성 검증 (기존)
2. 문서 갱신 및 수정 (확장)
3. **에이전트 프롬프트 관리** (신규) ⭐
4. 표준 섹션 추가 (예: "명령 실행 요청 규칙")
5. 문서 구조 개선 및 리팩토링

### 권한 변경

```json
"doc-manager": {
  "mode": "subagent",
  "description": "Manages and maintains all project documentation including agent prompts",
  "prompt": "{file:.agents/agents/doc-manager.md}",
  "permission": {
    "write": {
      "docs/*.md": "allow",
      ".agents/agents/*.md": "allow"  // ⭐ 추가
    },
    "edit": {
      "docs/*.md": "allow",
      ".agents/agents/*.md": "allow"  // ⭐ 추가
    },
    "bash": {
      "cat .agents/agents/*.md": "allow",  // ⭐ 추가
      "git add .agents/agents/*.md": "ask",  // ⭐ 추가
      "bash .agents/skills/agent-identifier/scripts/validate-agent.sh *": "allow"  // ⭐ 추가
    }
  }
}
```

---

## 🔒 3. 보안 개선사항 적용

### 핵심 원칙

- **git commit**: git-guardian 전담 ⭐
- **gh pr create**: github-helper 전담 ⭐
- **개발자 에이전트**: 스테이징(`git add`)까지만

### 변경 내역

#### 3.1. master-orchestrator

```json
// ✅ 추가: Git/GitHub 읽기 권한
"git status": "allow",
"git status --short": "allow",
"git diff": "allow",
"git diff --staged": "allow",
"git log --oneline -10": "allow",
"git branch --show-current": "allow",
"git branch --list": "allow",
"gh pr view *": "allow",
"gh pr checks *": "allow"
```

**이유**: 조율을 위한 상태 확인 필요

---

#### 3.2. feature-developer

```json
// ❌ 제거
"git commit -m *": "ask",  // 제거됨 (git-guardian 전담)
```

**이유**: 스테이징까지만 담당

---

#### 3.3. test-specialist

```json
// ❌ 제거
"git commit -m *": "ask",  // 제거됨 (git-guardian 전담)
```

**이유**: 스테이징까지만 담당

---

#### 3.4. security-scanner

```json
// ✅ 추가: 문서 읽기 권한
"cat docs/**/*.md": "allow",
```

**이유**: 문서 보안 검증 협업 필요

---

#### 3.5. doc-manager (구 doc-validator)

```json
// ❌ 제거
"git commit -m *": "ask",  // 제거됨 (git-guardian 전담)

// ✅ 추가
"git add .agents/agents/*.md": "ask",
```

**이유**: 스테이징까지만 담당

---

#### 3.6. git-guardian

```json
// ❌ 제거
"git push -u origin *": "ask",  // 제거됨 (github-helper 전담)

// ✅ 유지: commit 전담
"git commit -m *": "ask",  // ⭐ git-guardian만 가능
```

**이유**: 로컬 Git 작업만 담당, push는 github-helper 전담

---

#### 3.7. Global permission

```json
// ❌ 제거
"git commit -m *": "ask",  // 제거됨 (git-guardian 전담)
"gh pr create *": "ask",   // 제거됨 (github-helper 전담)

// ✅ 유지: 보안
"git commit --no-verify *": "deny",  // pre-commit hook 우회 차단
```

**이유**: 권한 집중화 및 보안 강화

---

## 📊 권한 매트릭스 (변경 후)

| Agent                   | `git add`               | `git commit` | `git push` | `gh pr create` | Git Read | GitHub Read | Agent Prompts |
| ----------------------- | ----------------------- | ------------ | ---------- | -------------- | -------- | ----------- | ------------- |
| **master-orchestrator** | ❌                      | ❌           | ❌         | ❌             | ✅ ⭐    | ✅ ⭐       | ❌            |
| **feature-developer**   | ✅ (src/\*\*)           | ❌ ⭐        | ❌         | ❌             | ✅       | ✅          | ❌            |
| **test-specialist**     | ✅ (test/\*\*)          | ❌ ⭐        | ❌         | ❌             | ✅       | ✅          | ❌            |
| **lint-formatter**      | ✅ (src/\*\*)           | ❌           | ❌         | ❌             | ✅       | ❌          | ❌            |
| **git-guardian**        | ✅ (all)                | ✅ ⭐        | ❌ ⭐      | ❌             | ✅       | ❌          | ❌            |
| **security-scanner**    | ❌                      | ❌           | ❌         | ❌             | ✅       | ✅          | ❌            |
| **github-helper**       | ❌                      | ❌           | ❌         | ✅ ⭐          | ✅       | ✅          | ❌            |
| **doc-manager**         | ✅ (docs/**, agents/**) | ❌ ⭐        | ❌         | ❌             | ✅       | ✅          | ✅ ⭐         |

**⭐ = 주요 변경사항**

---

## 🔧 적용 방법

### Step 1: 백업

```bash
cp opencode.json opencode.json.backup-$(date +%Y%m%d-%H%M%S)
```

### Step 2: 교체

```bash
cp docs/opencode-complete.json opencode.json
```

### Step 3: 검증

```bash
cat opencode.json | jq . > /dev/null && echo "✅ JSON valid" || echo "❌ JSON invalid"
```

### Step 4: opencode 재시작

- VSCode의 opencode 터미널을 닫고 다시 실행

---

## ✅ 적용 후 확인 사항

### 1. 권한 테스트

```bash
# master-orchestrator: Git 읽기 가능해야 함
git status
git diff

# feature-developer: git commit 차단되어야 함 (에러 메시지 확인)
```

### 2. 새 에이전트 확인

- lint-formatter 에이전트 사용 가능 확인
- doc-manager 에이전트 사용 가능 확인 (구 doc-validator)

### 3. 워크플로우 테스트

```bash
# 1. feature-developer가 스테이징
git add src/Button.tsx

# 2. git-guardian이 commit
git commit -m "feat: button component"

# 3. github-helper가 PR 생성
gh pr create --title "feat: button" --body "..."
```

---

## 🚨 주의사항

### doc-validator → doc-manager 변경으로 인한 영향

1. **프롬프트 파일 이름 변경 필요**:
   ```bash
   mv .agents/agents/doc-validator.md .agents/agents/doc-manager.md
   ```
2. **프롬프트 내용 수정 필요**:
   - 역할 확장 반영
   - 에이전트 프롬프트 관리 책임 추가
   - "명령 실행 요청 규칙" 섹션 추가

3. **기존 참조 업데이트**:
   - README.md, 문서 등에서 doc-validator → doc-manager로 변경

---

## 📝 다음 작업 (opencode 재시작 후)

### 1. lint-formatter 에이전트 파일 생성

```bash
cp /tmp/lint-formatter.md .agents/agents/lint-formatter.md
bash .agents/skills/agent-identifier/scripts/validate-agent.sh .agents/agents/lint-formatter.md
```

### 2. doc-manager 프롬프트 업그레이드

- `.agents/agents/doc-validator.md` → `.agents/agents/doc-manager.md` 이름 변경
- 프롬프트 내용 업데이트 (역할 확장 반영)

### 3. doc-manager에게 작업 위임

- 모든 에이전트 프롬프트에 "명령 실행 요청 규칙" 섹션 추가
  - feature-developer
  - test-specialist
  - security-scanner
  - git-guardian
  - github-helper
  - lint-formatter

### 4. git-guardian에게 commit 요청

- 모든 변경사항 commit

### 5. 테스트 및 검증

- 새 권한 구조 동작 확인
- 에이전트 트리거 테스트

---

**문서 버전**: 1.0.0  
**작성일**: 2025-02-08  
**상태**: ✅ 적용 준비 완료  
**다음 단계**: opencode.json 교체 → opencode 재시작
