# 레거시 제거 + 컴포넌트 재배치 + i18n + 타입 안전성

## 배경
- 프로젝트에 Next.js 시절 레거시 코드, 잘못 배치된 컴포넌트, i18n 하드코딩, 타입 안전성 부족 문제가 존재한다.
- 이전 세션 분석에서 `as any` 27개 (14개 자동생성), i18n 하드코딩 4곳, TODO 7개 확인됨.

## 작업 항목

### A. 레거시 코드 제거
- `src/shared/config/route/routeTree.gen.ts` → `src/5-shared/config/route/`로 이동 후 `src/shared/` 폴더 삭제
- `NEXT_PUBLIC_` 환경변수 참조 제거 (있다면)
- `process.env` → `import.meta.env` 전환 (있다면)

### B. 컴포넌트 재배치 (FSD 적절성)
다음 컴포넌트들이 현재 위치에 적절하지 않으므로 이동한다.

| 현재 위치 | 이동 대상 | 이유 |
|-----------|----------|------|
| `src/5-shared/components/reply/index.tsx` | `src/2-features/post/ui/reply.tsx` | Giscus 댓글 위젯, 포스트 상세 페이지에서만 사용 |
| `src/5-shared/components/turnstile/index.tsx` | `src/2-features/contact/ui/turnstile-widget.tsx` | Cloudflare Turnstile, contact-form에서만 사용 |
| `src/5-shared/components/ui/fast-check-problem.test.tsx` | 삭제 또는 `docs/examples/`로 이동 | 학습용 테스트 예제, 프로덕션 코드 아님 |
| `src/5-shared/components/ui/fast-check-solution.test.tsx` | 삭제 또는 `docs/examples/`로 이동 | 학습용 테스트 예제, 프로덕션 코드 아님 |

- 이동 시 import 경로도 모두 수정해야 한다.
- 이동 후 기존 폴더가 비면 삭제한다.

### C. i18n 하드코딩 제거 (4곳)
- "Read More" → `t('post.readMore')` 등 번역 키 사용
- 한국어 에러 메시지 하드코딩 → 번역 키 전환
- ThemeToggle의 aria-label → 번역 키 전환
- Footer 텍스트 → 번역 키 전환

### D. 타입 안전성 강화
- `as any` 정리 (자동생성 14개 제외, 나머지 13개 검토)
- Zod 스키마 검증 누락 부분 보강
- `data-testid` 추가 (테스트 가능성 향상)

## Phase별 작업 계획
- **Phase 1**: 레거시 코드 제거 + 컴포넌트 재배치
- **Phase 2**: i18n 하드코딩 제거
- **Phase 3**: 타입 안전성 강화

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
