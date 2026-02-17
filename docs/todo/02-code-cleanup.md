# 레거시 제거 + 컴포넌트 재배치 + i18n + 타입 안전성

## 배경
- 프로젝트에 Next.js 시절 레거시 코드, 잘못 배치된 컴포넌트, i18n 하드코딩, 타입 안전성 부족 문제가 존재한다.
- 이전 세션 분석에서 `as any` 27개 (14개 자동생성), i18n 하드코딩 4곳, TODO 7개 확인됨.

## 작업 항목

### A. 레거시 코드 제거

#### ✅ 완료
- ✅ `src/shared/` 폴더 삭제 완료 (glob 검색 결과 없음)
- ✅ `routeTree.gen.ts` 이동 완료 (`src/5-shared/config/route/` 또는 자동생성)

#### ⏳ 남은 작업
- ⏳ `NEXT_PUBLIC_` 환경변수 타입 정의 제거
  - **파일**: `src/5-shared/types/global.d.ts` (line 33-34)
  - **현재**: `NEXT_PUBLIC_GIT_RAW_URL`, `NEXT_PUBLIC_CONTENT_REPO_URL` 타입 정의 존재
  - **조치**: 사용하지 않으면 타입 정의 삭제, 또는 `VITE_*`로 전환

- ⏳ `process.env` → `import.meta.env` 전환 검토
  - **Playwright**: `process.env.CI` 사용 (빌드 도구이므로 유지 가능)
  - **Netlify Functions**: `process.env` 사용 (서버사이드이므로 유지)
  - **클라이언트 코드**:
    - `src/5-shared/stores/*.ts`: `process.env.NODE_ENV` → `import.meta.env.MODE` 전환 검토
    - `fast-check-problem.test.tsx`: `process.env.DEBUG` → `import.meta.env.VITE_DEBUG` 전환 검토

### B. 컴포넌트 재배치 (FSD 적절성)

#### ✅ 완료
없음 (모든 컴포넌트가 아직 원래 위치에 있음)

#### ⏳ 이동 대상

| 현재 위치 | 이동 대상 | 이유 | 상태 |
|-----------|----------|------|------|
| `src/5-shared/components/reply/index.tsx` | `src/2-features/post/ui/reply.tsx` | Giscus 댓글 위젯, 포스트 상세 페이지에서만 사용 | ⏳ 미완료 |
| `src/5-shared/components/turnstile/index.tsx` | `src/2-features/contact/ui/turnstile-widget.tsx` | Cloudflare Turnstile, contact-form에서만 사용 | ⏳ 미완료 |
| `src/5-shared/components/ui/fast-check-problem.test.tsx` | 삭제 또는 `docs/examples/`로 이동 | 학습용 테스트 예제, 프로덕션 코드 아님 | ⏳ 미완료 |
| `src/5-shared/components/ui/fast-check-solution.test.tsx` | 삭제 또는 `docs/examples/`로 이동 | 학습용 테스트 예제, 프로덕션 코드 아님 | ⏳ 미완료 |

**주의사항**:
- 이동 시 import 경로도 모두 수정해야 한다.
- 이동 후 기존 폴더가 비면 삭제한다.

### C. i18n 하드코딩 제거

#### ⏳ 대상 (4곳)
- ⏳ "Read More" → `t('post.readMore')` 등 번역 키 사용
- ⏳ 한국어 에러 메시지 하드코딩 → 번역 키 전환
- ⏳ ThemeToggle의 aria-label → 번역 키 전환
- ⏳ Footer 텍스트 → 번역 키 전환

**검색 필요**: grep으로 실제 하드코딩된 위치 확인

### D. 타입 안전성 강화

#### ⏳ 대상
- ⏳ `as any` 정리 (자동생성 14개 제외, 나머지 13개 검토)
- ⏳ Zod 스키마 검증 누락 부분 보강
- ⏳ `data-testid` 추가 (테스트 가능성 향상)

**검색 필요**: grep `as any`로 실제 위치 확인

## Phase별 작업 계획

### Phase 1: 레거시 코드 제거 + 컴포넌트 재배치
- ⏳ `NEXT_PUBLIC_` 타입 정의 제거
- ⏳ `process.env` → `import.meta.env` 전환 (클라이언트 코드만)
- ⏳ reply, turnstile 컴포넌트 이동
- ⏳ fast-check 예제 파일 정리

### Phase 2: i18n 하드코딩 제거
- ⏳ grep 검색으로 하드코딩 위치 확인
- ⏳ 번역 키 추가 및 적용

### Phase 3: 타입 안전성 강화
- ⏳ `as any` 사용처 확인 및 타입 개선
- ⏳ Zod 스키마 검증 보강
- ⏳ `data-testid` 추가

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
