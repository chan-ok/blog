# Code Quality Check Hook

코드 품질을 검증하는 훅입니다. 포맷팅, 린트, 타입 체크를 수행합니다.

## 트리거 조건

- **이벤트**: 수동 실행 (버튼 클릭)
- **이름**: "코드 품질 검증"
- **설명**: "포맷팅, 린트, 타입 체크를 실행합니다"

## 실행 프롬프트

코드 품질 검증을 시작합니다.

다음 단계를 순차적으로 실행해주세요:

---

### 1단계: Prettier 포맷팅 검증

```bash
pnpm fmt
```

**확인 사항**:

- 포맷팅이 적용된 파일 목록 확인
- 변경된 파일이 있으면 요약 출력
- 에러 발생 시 상세 내용 출력

---

### 2단계: ESLint 검증

```bash
pnpm lint
```

**확인 사항**:

- Lint 에러 및 경고 개수 확인
- 에러가 있으면 파일별로 그룹화하여 출력
- 자동 수정 가능한 에러가 있으면 안내

**에러 발견 시**:

```
❌ ESLint 에러 발견:

📁 src/features/contact/contact-form.tsx
  - Line 15: 'useState' is not defined (no-undef)
  - Line 23: Missing return type on function (explicit-function-return-type)

📁 src/shared/ui/button.tsx
  - Line 8: Unexpected any. Specify a different type (no-explicit-any)

💡 자동 수정 가능한 에러: 2개
   실행: pnpm lint --fix
```

---

### 3단계: TypeScript 타입 체크

```bash
pnpm tsc --noEmit
```

**확인 사항**:

- 타입 에러 개수 확인
- 에러가 있으면 파일별로 그룹화하여 출력
- 에러 심각도 표시

**에러 발견 시**:

```
❌ TypeScript 타입 에러 발견:

📁 src/features/post/api/get-posts.ts
  - Line 12: Type 'string' is not assignable to type 'number'
  - Line 18: Property 'id' does not exist on type 'Post'

📁 src/shared/types/post.ts
  - Line 5: Interface 'PostMetadata' incorrectly extends interface 'Base'
```

---

### 4단계: 테스트 실행 (선택적)

사용자에게 물어보기:
"테스트도 함께 실행하시겠습니까? (y/n)"

**Yes인 경우**:

```bash
pnpm test:run
```

**확인 사항**:

- 테스트 통과/실패 개수
- 실패한 테스트 목록
- 테스트 커버리지 요약

---

### 5단계: 최종 요약

모든 검증이 완료되면 다음 형식으로 요약 출력:

```
✅ 코드 품질 검증 완료

📊 검증 결과:
  ✅ Prettier: 통과 (3개 파일 포맷팅됨)
  ✅ ESLint: 통과 (0 에러, 2 경고)
  ✅ TypeScript: 통과 (0 에러)
  ✅ Tests: 통과 (24/24 테스트)

🎉 모든 검증을 통과했습니다! 커밋 준비가 완료되었습니다.
```

**에러가 있는 경우**:

```
❌ 코드 품질 검증 실패

📊 검증 결과:
  ✅ Prettier: 통과
  ❌ ESLint: 실패 (3 에러, 5 경고)
  ❌ TypeScript: 실패 (7 에러)
  ⏭️  Tests: 건너뜀

⚠️  다음 문제를 해결해주세요:
  1. ESLint 에러 3개 수정 필요
  2. TypeScript 타입 에러 7개 수정 필요

💡 자동 수정 시도: pnpm lint --fix
```

---

## 추가 옵션

사용자가 원하면 다음 추가 검증도 수행:

### 번들 사이즈 분석

```bash
pnpm build
```

- 빌드 성공 여부 확인
- 번들 사이즈 경고 확인

### 의존성 보안 체크

```bash
pnpm audit
```

- 보안 취약점 개수 확인
- 심각도별 분류

---

## 실행 규칙

1. **순차 실행**: 각 단계를 순서대로 실행
2. **에러 처리**: 에러 발생 시에도 다음 단계 계속 진행
3. **명확한 출력**: 각 단계의 결과를 명확하게 표시
4. **액션 제안**: 문제 발견 시 해결 방법 제안
5. **최종 요약**: 모든 검증 결과를 한눈에 볼 수 있도록 요약

---

## 참고 문서

- [rule.md](../docs/rule.md) - 코드 스타일 규칙
- [ai-checklist.md](../docs/ai-checklist.md) - AI 검증 체크리스트
- [testing.md](../docs/testing.md) - 테스팅 가이드
