# 테스트 + 스토리북 커버리지 확대

## 배경
- 현재 유닛 테스트 커버리지 약 46%, 목표 80%
- 스토리 6개, 약 35% 커버리지
- Property-based 테스트 확대 필요

## 작업 항목

### A. 유닛 테스트 확대 (46% → 80%)

**우선순위 높음** (핵심 비즈니스 로직):
- `src/2-features/post/util/get-posts.ts` — 포스트 목록 가져오기
- `src/2-features/contact/ui/contact-form.tsx` — 폼 제출 + 검증
- `src/2-features/contact/util/submit-form-with-token.ts` — API 호출
- `src/5-shared/config/api/index.ts` — API 설정

**우선순위 중간** (UI 컴포넌트):
- `src/2-features/post/ui/post-simple-card.tsx`
- `src/2-features/post/ui/post-basic-card.tsx`
- `src/2-features/post/ui/post-card-list.tsx`
- `src/2-features/post/ui/recent-post-block.tsx`
- `src/5-shared/components/toggle/theme-toggle/index.tsx`
- `src/5-shared/components/toggle/locale-toggle/index.tsx`

**우선순위 낮음** (페이지 + 위젯):
- `src/3-widgets/header.tsx`, `footer.tsx` (이미 일부 존재)
- 각 페이지 컴포넌트 (이미 일부 존재)

### B. 스토리북 확대

**신규 스토리 필요**:
- PostSimpleCard, PostBasicCard, PostCardList
- ThemeToggle, LocaleToggle
- ContactForm
- Typography (h1-h6)
- ErrorPage (이미 있을 수 있음, 확인 필요)

### C. Property-based 테스트 확대
- Zod 스키마 기반 Arbitrary 생성
- 폼 입력 검증 (contact-form.schema)
- URL/경로 파싱 로직
- i18n 키 완전성 검증

## Phase별 작업 계획
- **Phase 1**: 핵심 비즈니스 로직 테스트 (get-posts, contact 관련)
- **Phase 2**: UI 컴포넌트 테스트 + 스토리 추가
- **Phase 3**: Property-based 테스트 + E2E 확대

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
