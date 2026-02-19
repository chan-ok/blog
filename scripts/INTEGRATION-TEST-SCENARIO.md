# Phase 2-3: 멀티 에이전트 통합 테스트 시나리오

> **목표**: consultant → spec-manager → task-manager → worker 전체 플로우 검증

## 📋 테스트 시나리오

### 시나리오 1: 간단한 유틸 함수 추가

**목표**: 숫자 포맷팅 함수 추가를 통한 전체 플로우 검증

**예상 소요 시간**: 5분 이내

---

## 🚀 사전 준비

### 1. 환경 확인

```bash
# 디렉토리 확인
ls -la .multi-agent/
ls -la .beads/

# Git 상태 확인 (클린한 상태)
git status
```

### 2. 시스템 시작

#### Terminal 1: tmux 세션

```bash
bash scripts/start-multi-agent.sh
```

**확인 사항**:
- [ ] 6개 pane 생성됨
- [ ] 각 pane에 안내 메시지 표시됨

#### Terminal 2: watchman 트리거

```bash
bash scripts/setup-watchman.sh
```

**확인 사항**:
- [ ] "Watchman triggers configured successfully" 출력
- [ ] 7개 트리거 설정됨

---

## 📝 통합 테스트 실행

### Step 1: Consultant (Pane 0) - 요구사항 입력

**작업**:
1. Pane 0에서 `opencode` 실행
2. consultant 에이전트 선택
3. 다음 요구사항 입력:

```
"src/shared/lib/utils/에 숫자 포맷팅 함수를 추가해줘.
- 함수명: formatNumber
- 입력: number, locale (기본값: 'ko-KR')
- 출력: 천 단위 콤마로 구분된 문자열
- 예시: formatNumber(1234567) → '1,234,567'
- 테스트 작성 필수"
```

**예상 동작**:
- Consultant가 요구사항 분석
- FSD 아키텍처에 맞는 파일 위치 결정 (`src/shared/lib/utils/formatNumber.ts`)
- 명세서 초안 작성

**생성될 파일**: `.multi-agent/specs/format-number-{timestamp}.yaml`

**확인 사항**:
- [ ] Consultant가 명세서 작성 시작
- [ ] YAML 파일 생성 예정 안내

---

### Step 2: 명세서 파일 생성 확인

**작업** (Terminal 3):
```bash
# 명세서 파일 생성 대기
watch -n 1 "ls -la .multi-agent/specs/ | tail -5"
```

**생성될 파일 예시**:
```yaml
# .multi-agent/specs/format-number-20260220-010000.yaml
version: "1.0"
created_at: "2026-02-20T01:00:00Z"
created_by: "consultant"

requirements:
  feature: "숫자 포맷팅 함수 추가"
  description: |
    src/shared/lib/utils/에 formatNumber 함수 추가
    - 입력: number, locale (기본값: 'ko-KR')
    - 출력: 천 단위 콤마로 구분된 문자열
  
  fsd_layer: "shared"
  fsd_slice: "lib"
  fsd_segment: "utils"
  
  files:
    - path: "src/shared/lib/utils/formatNumber.ts"
      type: "implementation"
    - path: "src/shared/lib/utils/formatNumber.test.ts"
      type: "test"
  
  testing:
    required: true
    types: ["unit", "property-based"]
    coverage_target: 100%
```

**확인 사항**:
- [ ] YAML 파일 생성됨
- [ ] FSD 아키텍처 준수 (`shared/lib/utils`)
- [ ] 테스트 요구사항 포함

---

### Step 3: SpecManager (Pane 2) - 명세서 검증

**예상 동작** (자동):
- watchman이 Pane 2에 알림: `[HH:MM:SS] 📄 Spec changed`
- SpecManager가 opencode 실행 중이라면 자동으로 명세서 검증 시작

**작업** (Pane 2에서):
1. `opencode` 실행 (아직 실행 안 했다면)
2. spec-manager 에이전트 선택
3. 명세서 검증 시작

**검증 항목**:
- [ ] FSD 아키텍처 준수 (`src/shared/lib/utils/`)
- [ ] 파일 경로 유효성
- [ ] 테스트 요구사항 포함
- [ ] TypeScript strict 모드 준수
- [ ] 보안 고려사항 (입력 검증)

**검증 통과 시 생성될 파일**: `.multi-agent/queue/task-manager-{timestamp}.json`

**확인 사항**:
- [ ] SpecManager가 검증 완료
- [ ] queue 파일 생성됨
- [ ] Pane 1에 알림 표시 예상

---

### Step 4: TaskManager (Pane 1) - 태스크 분해

**예상 동작** (자동):
- watchman이 Pane 1에 알림: `[HH:MM:SS] 📨 New task-manager message`
- TaskManager가 queue 메시지 수신

**작업** (Pane 1에서):
1. `opencode` 실행 (아직 실행 안 했다면)
2. task-manager 에이전트 선택
3. queue 메시지 읽고 태스크 분해

**생성될 beads 태스크**:
```bash
bd create "formatNumber 함수 구현" \
  --priority P0 \
  --description "src/shared/lib/utils/formatNumber.ts 생성, TypeScript strict 모드, JSDoc 주석 포함"

bd create "formatNumber 테스트 작성" \
  --priority P0 \
  --description "formatNumber.test.ts 생성, Unit 테스트, Property-based 테스트, 커버리지 100%"
```

**생성될 worker 할당 파일**: `.multi-agent/queue/worker-1-{timestamp}.json`

**확인 사항** (Terminal 3):
```bash
# beads 태스크 확인
bd list

# 예상 출력:
# ○ blog-xxx [● P0] [task] - formatNumber 함수 구현
# ○ blog-yyy [● P0] [task] - formatNumber 테스트 작성
```

- [ ] beads 태스크 2개 생성됨
- [ ] worker queue 파일 생성됨
- [ ] Pane 3에 알림 표시 예상

---

### Step 5: Worker-1 (Pane 3) - 코드 구현

**예상 동작** (자동):
- watchman이 Pane 3에 알림: `[HH:MM:SS] 📨 New worker-1 message`
- Worker-1이 queue 메시지 수신

**작업** (Pane 3에서):
1. `opencode` 실행
2. worker 에이전트 선택
3. queue 메시지 읽고 구현 시작

**생성될 파일**:
```typescript
// src/shared/lib/utils/formatNumber.ts
/**
 * 숫자를 로케일에 맞게 포맷팅합니다.
 * @param num - 포맷팅할 숫자
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 천 단위 콤마로 구분된 문자열
 * @example
 * ```ts
 * formatNumber(1234567) // '1,234,567'
 * formatNumber(1234567, 'en-US') // '1,234,567'
 * ```
 */
export function formatNumber(num: number, locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale).format(num)
}
```

```typescript
// src/shared/lib/utils/formatNumber.test.ts
import { describe, it, expect } from 'vitest'
import { fc } from 'fast-check'
import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
  it('천 단위 콤마로 구분', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(0)).toBe('0')
  })

  it('다양한 로케일 지원', () => {
    expect(formatNumber(1234567, 'en-US')).toBe('1,234,567')
    expect(formatNumber(1234567, 'de-DE')).toBe('1.234.567')
  })

  // Property-based 테스트
  it('모든 숫자에 대해 문자열 반환', () => {
    fc.assert(
      fc.property(fc.integer(), (num) => {
        const result = formatNumber(num)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    )
  })
})
```

**Git 작업**:
```bash
git add src/shared/lib/utils/formatNumber.ts
git add src/shared/lib/utils/formatNumber.test.ts
git commit -m "feat(shared): formatNumber 함수 추가

- 숫자를 로케일에 맞게 포맷팅
- 기본 로케일: ko-KR
- 테스트 포함 (Unit + Property-based)

[blog-xxx]"
```

**beads 업데이트**:
```bash
bd close blog-xxx  # formatNumber 함수 구현
```

**확인 사항** (Terminal 3):
```bash
# 파일 생성 확인
ls -la src/shared/lib/utils/formatNumber*

# Git 로그 확인
git log --oneline -1

# beads 상태 확인
bd list
```

- [ ] `formatNumber.ts` 생성됨
- [ ] `formatNumber.test.ts` 생성됨
- [ ] Git commit 완료
- [ ] beads issue 닫힘

---

### Step 6: 테스트 실행

**작업** (Terminal 3):
```bash
# 테스트 실행
pnpm test formatNumber

# 커버리지 확인
pnpm coverage -- formatNumber
```

**예상 결과**:
```
 ✓ src/shared/lib/utils/formatNumber.test.ts (3)
   ✓ formatNumber (3)
     ✓ 천 단위 콤마로 구분
     ✓ 다양한 로케일 지원
     ✓ 모든 숫자에 대해 문자열 반환

Test Files  1 passed (1)
     Tests  3 passed (3)
  Duration  234ms

Coverage: 100%
```

**확인 사항**:
- [ ] 모든 테스트 통과
- [ ] 커버리지 100%

---

## ✅ 통합 테스트 성공 기준

### 1. Consultant → SpecManager 플로우
- [ ] 명세서 파일 생성됨 (`.multi-agent/specs/*.yaml`)
- [ ] watchman 트리거 동작 (Pane 2 알림)
- [ ] SpecManager가 명세서 읽음

### 2. SpecManager → TaskManager 플로우
- [ ] 명세서 검증 완료
- [ ] queue 파일 생성됨 (`.multi-agent/queue/task-manager-*.json`)
- [ ] watchman 트리거 동작 (Pane 1 알림)
- [ ] TaskManager가 메시지 읽음

### 3. TaskManager → Worker 플로우
- [ ] beads 태스크 2개 생성됨
- [ ] queue 파일 생성됨 (`.multi-agent/queue/worker-1-*.json`)
- [ ] watchman 트리거 동작 (Pane 3 알림)
- [ ] Worker가 메시지 읽음

### 4. Worker 실행
- [ ] `formatNumber.ts` 생성
- [ ] `formatNumber.test.ts` 생성
- [ ] Git commit 완료
- [ ] beads issue 닫힘
- [ ] 테스트 통과 (100% 커버리지)

### 5. 전체 플로우 시간
- [ ] 5분 이내 완료 (수동 개입 포함)

---

## 🐛 트러블슈팅

### Issue 1: watchman 알림이 표시되지 않음

**증상**: 파일 생성했지만 Pane에 메시지 없음

**해결**:
```bash
# watchman 트리거 재설정
bash scripts/setup-watchman.sh

# 트리거 동작 테스트
bash scripts/test-watchman-triggers.sh
```

### Issue 2: SpecManager가 명세서를 읽지 않음

**증상**: YAML 파일은 생성되었지만 검증이 시작되지 않음

**해결**:
1. Pane 2에서 opencode 실행 여부 확인
2. spec-manager 에이전트 선택 확인
3. 수동으로 명세서 파일 경로 전달

### Issue 3: TaskManager가 beads 태스크 생성 안 함

**증상**: queue 파일은 생성되었지만 beads issue 없음

**해결**:
```bash
# beads 초기화 확인
bd list

# 수동으로 태스크 생성
bd create "formatNumber 함수 구현" --priority P0
```

### Issue 4: Worker가 코드 생성 안 함

**증상**: queue 파일은 생성되었지만 파일 생성 안 됨

**해결**:
1. Pane 3에서 opencode 실행 여부 확인
2. worker 에이전트 선택 확인
3. Git 권한 확인 (opencode.json)

---

## 📊 테스트 결과 리포트

### 실행 날짜: ___________

### 플로우 성공 여부

| 단계 | 상태 | 소요 시간 | 비고 |
|------|------|-----------|------|
| Consultant → SpecManager | [ ] ✅ / [ ] ❌ | ___ 분 | |
| SpecManager → TaskManager | [ ] ✅ / [ ] ❌ | ___ 분 | |
| TaskManager → Worker | [ ] ✅ / [ ] ❌ | ___ 분 | |
| Worker 코드 생성 | [ ] ✅ / [ ] ❌ | ___ 분 | |
| 테스트 통과 | [ ] ✅ / [ ] ❌ | ___ 초 | |

**전체 소요 시간**: ___ 분

### 발견된 문제점

1. ___________________________________
2. ___________________________________
3. ___________________________________

### 개선 제안

1. ___________________________________
2. ___________________________________
3. ___________________________________

---

## 🎉 Phase 2 완료!

모든 통합 테스트가 통과하면 Phase 2 완료입니다.

**다음 단계**:
1. 테스트 결과를 blog-27s에 기록
2. 발견된 문제점을 별도 beads issue로 생성
3. Phase 3 계획 수립 (v3 완전 대체)
4. PR #66 최종 리뷰 및 머지
