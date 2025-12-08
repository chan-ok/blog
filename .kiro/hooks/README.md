# Kiro Agent Hooks

이 디렉토리에는 개발 워크플로우를 자동화하는 Kiro Agent Hooks가 포함되어 있습니다.

## 설치된 훅 목록

### 1. 🎨 Auto Storybook Story Generator

**파일**: `auto-storybook.md`  
**트리거**: 새 컴포넌트 파일 생성 시 (`src/**/*.tsx`)  
**기능**: 새로운 React 컴포넌트가 생성되면 자동으로 Storybook 스토리 파일을 생성합니다.

**사용 방법**:

1. `src/` 디렉토리 내에 새 컴포넌트 파일 생성 (예: `src/shared/ui/card.tsx`)
2. Kiro가 자동으로 스토리 생성 프롬프트 표시
3. 또는 수동으로 훅 실행: Kiro 패널 → Agent Hooks → "Auto Storybook Story Generator"

**예시**:

```typescript
// src/shared/ui/card.tsx 생성 시
// → src/shared/ui/card.stories.tsx 자동 생성
```

---

### 2. ✅ Code Quality Check Hook

**파일**: `code-quality-check.md`  
**트리거**: 수동 실행 (버튼 클릭)  
**기능**: 포맷팅, 린트, 타입 체크를 순차적으로 실행하여 코드 품질을 검증합니다.

**사용 방법**:

1. Kiro 패널 → Agent Hooks → "Code Quality Check Hook" 클릭
2. 또는 커맨드 팔레트에서 "Run Agent Hook" 검색
3. 검증 결과 확인 및 문제 해결

**검증 항목**:

- ✅ Prettier 포맷팅
- ✅ ESLint 린트
- ✅ TypeScript 타입 체크
- ✅ 테스트 실행 (선택적)

**권장 사용 시점**:

- 커밋 전
- Pull Request 생성 전
- 배포 전

---

### 3. 📝 Auto Documentation Update Hook

**파일**: `auto-doc-update.md`  
**트리거**: 수동 실행 (버튼 클릭)  
**기능**: Git 변경사항을 분석하여 관련 문서를 자동으로 업데이트합니다.

**사용 방법**:

1. 기능 구현 완료 후
2. Kiro 패널 → Agent Hooks → "Auto Documentation Update Hook" 클릭
3. 업데이트된 문서 검토
4. 필요시 수동 수정 후 커밋

**업데이트 대상 문서**:

- `docs/changelog.md` - 변경 로그
- `docs/todo.md` - 완료 항목 체크
- `docs/architecture.md` - 아키텍처 변경사항
- `docs/implementation-plan.md` - 구현 진행 상황

**권장 사용 시점**:

- 새로운 기능 구현 완료 후
- 주요 리팩토링 완료 후
- 버그 수정 완료 후

---

## 훅 사용 가이드

### Kiro IDE에서 훅 실행하기

#### 방법 1: Agent Hooks 패널 사용

1. Kiro 사이드바 열기
2. "Agent Hooks" 섹션 찾기
3. 원하는 훅 클릭하여 실행

#### 방법 2: 커맨드 팔레트 사용

1. `Cmd/Ctrl + Shift + P` 로 커맨드 팔레트 열기
2. "Kiro: Run Agent Hook" 검색
3. 실행할 훅 선택

#### 방법 3: 자동 트리거

- 파일 생성/저장 시 자동으로 관련 훅 실행
- 예: 새 컴포넌트 생성 시 Storybook 훅 자동 실행

---

## 훅 커스터마이징

각 훅은 마크다운 파일로 작성되어 있어 쉽게 수정할 수 있습니다.

### 훅 수정 방법

1. `.kiro/hooks/` 디렉토리의 해당 `.md` 파일 열기
2. 프롬프트 내용 수정
3. 저장하면 즉시 반영

### 새 훅 추가 방법

1. `.kiro/hooks/` 디렉토리에 새 `.md` 파일 생성
2. 다음 구조로 작성:

   ```markdown
   # Hook Name

   설명

   ## 트리거 조건

   - 이벤트: ...
   - 파일 패턴: ...

   ## 실행 프롬프트

   실행할 내용...
   ```

3. Kiro 재시작 또는 훅 새로고침

---

## 개발 워크플로우 예시

### 새 기능 개발 시

1. **기능 구현**

   ```bash
   # 새 컴포넌트 생성
   touch src/features/search/ui/search-bar.tsx
   ```

   → 🎨 Auto Storybook 훅 자동 실행

2. **코드 품질 검증**
   - ✅ Code Quality Check Hook 실행
   - 모든 검증 통과 확인

3. **문서 업데이트**
   - 📝 Auto Documentation Update Hook 실행
   - 변경사항 문서화

4. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat(search): add search bar component"
   git push
   ```

---

## 트러블슈팅

### 훅이 실행되지 않을 때

1. Kiro IDE 재시작
2. `.kiro/hooks/` 디렉토리 권한 확인
3. 마크다운 파일 형식 확인

### 훅 실행 중 에러 발생 시

1. 에러 메시지 확인
2. 관련 명령어 수동 실행하여 테스트
3. 훅 프롬프트 내용 검토

### 자동 트리거가 작동하지 않을 때

1. 파일 패턴 확인
2. 제외 조건 확인
3. Kiro 설정에서 자동 트리거 활성화 확인

---

## 참고 문서

- [Kiro Hooks 공식 문서](https://docs.kiro.ai/hooks)
- [프로젝트 개발 룰](../docs/rule.md)
- [아키텍처 문서](../docs/architecture.md)
- [테스팅 가이드](../docs/testing.md)

---

## 피드백 및 개선

훅 사용 중 개선 아이디어나 버그를 발견하면:

1. 해당 훅 파일 수정
2. 또는 프로젝트 이슈로 등록
3. 팀과 공유하여 워크플로우 개선

---

## 스마트 트리거 설정

### 설정 파일: `.kiro/hooks.json`

모든 훅의 트리거 조건과 동작은 `.kiro/hooks.json` 파일에서 중앙 관리됩니다.

#### 설정 파일 구조

```json
{
  "hooks": [
    {
      "id": "hook-id",
      "name": "훅 이름",
      "description": "훅 설명",
      "trigger": {
        "type": "file-created | file-saved | manual",
        "pattern": "src/**/*.tsx",
        "exclude": ["**/*.test.tsx"]
      },
      "action": {
        "type": "agent-message",
        "promptFile": ".kiro/hooks/hook-name.md"
      },
      "enabled": true,
      "icon": "🎨"
    }
  ],
  "settings": {
    "autoTriggerEnabled": true,
    "showNotifications": true,
    "confirmBeforeRun": {
      "file-created": false,
      "file-saved": true,
      "manual": false
    }
  }
}
```

### 트리거 타입

#### 1. file-created (파일 생성 시)

```json
{
  "trigger": {
    "type": "file-created",
    "pattern": "src/**/*.tsx",
    "exclude": ["**/*.test.tsx", "**/*.stories.tsx"]
  }
}
```

**사용 예**: 새 컴포넌트 생성 시 Storybook 스토리 자동 생성

#### 2. file-saved (파일 저장 시)

```json
{
  "trigger": {
    "type": "file-saved",
    "pattern": "src/**/*.{ts,tsx}",
    "exclude": ["**/*.test.tsx"]
  }
}
```

**사용 예**: 파일 저장 시 자동 테스트 실행

#### 3. manual (수동 실행)

```json
{
  "trigger": {
    "type": "manual"
  }
}
```

**사용 예**: 코드 품질 검증, 문서 업데이트

### 훅 활성화/비활성화

#### 개별 훅 제어

`.kiro/hooks.json`에서 `enabled` 필드 수정:

```json
{
  "id": "auto-test-on-save",
  "enabled": false // 비활성화
}
```

#### 전체 자동 트리거 제어

```json
{
  "settings": {
    "autoTriggerEnabled": false // 모든 자동 트리거 비활성화
  }
}
```

### 알림 설정

```json
{
  "settings": {
    "showNotifications": true, // 훅 실행 시 알림 표시
    "confirmBeforeRun": {
      "file-created": false, // 파일 생성 시 확인 없이 실행
      "file-saved": true, // 파일 저장 시 확인 후 실행
      "manual": false // 수동 실행 시 확인 없이 실행
    }
  }
}
```

### 패턴 매칭 규칙

#### Glob 패턴 사용

```json
{
  "pattern": "src/**/*.tsx", // src 하위 모든 .tsx 파일
  "exclude": [
    "**/*.test.tsx", // 테스트 파일 제외
    "**/*.stories.tsx", // 스토리 파일 제외
    "**/page.tsx", // Next.js 페이지 제외
    "**/layout.tsx" // Next.js 레이아웃 제외
  ]
}
```

#### 다중 확장자

```json
{
  "pattern": "src/**/*.{ts,tsx,js,jsx}" // 여러 확장자 매칭
}
```

### 커스텀 훅 추가

1. **프롬프트 파일 생성**

   ```bash
   touch .kiro/hooks/my-custom-hook.md
   ```

2. **프롬프트 작성**

   ```markdown
   ---
   id: my-custom-hook
   name: My Custom Hook
   description: 커스텀 훅 설명
   trigger: manual
   enabled: true
   ---

   # My Custom Hook

   실행할 작업...
   ```

3. **hooks.json에 등록**

   ```json
   {
     "hooks": [
       {
         "id": "my-custom-hook",
         "name": "My Custom Hook",
         "description": "커스텀 훅 설명",
         "trigger": {
           "type": "manual"
         },
         "action": {
           "type": "agent-message",
           "promptFile": ".kiro/hooks/my-custom-hook.md"
         },
         "enabled": true,
         "icon": "⚡"
       }
     ]
   }
   ```

4. **Kiro 재시작**

### 디버깅

#### 훅이 실행되지 않을 때

1. **설정 확인**

   ```bash
   cat .kiro/hooks.json | grep -A 10 "hook-id"
   ```

2. **패턴 테스트**
   - 파일 경로가 패턴과 일치하는지 확인
   - 제외 패턴에 걸리지 않는지 확인

3. **로그 확인**
   - Kiro 개발자 도구 열기
   - Console에서 훅 실행 로그 확인

#### 훅 실행 순서

1. 파일 이벤트 발생 (생성/저장)
2. 패턴 매칭 확인
3. 제외 패턴 확인
4. `enabled` 상태 확인
5. `confirmBeforeRun` 설정 확인
6. 훅 실행

---

## 권장 설정

### 개발 중

```json
{
  "settings": {
    "autoTriggerEnabled": true,
    "showNotifications": true,
    "confirmBeforeRun": {
      "file-created": false, // 빠른 워크플로우
      "file-saved": true, // 의도하지 않은 실행 방지
      "manual": false
    }
  }
}
```

### 프로덕션 작업 중

```json
{
  "settings": {
    "autoTriggerEnabled": false, // 자동 트리거 비활성화
    "showNotifications": false
  }
}
```

### TDD 워크플로우

```json
{
  "hooks": [
    {
      "id": "auto-test-on-save",
      "enabled": true // 파일 저장 시 자동 테스트 활성화
    }
  ]
}
```
