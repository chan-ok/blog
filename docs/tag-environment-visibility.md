# 태그 기반 환경별 포스트 노출

## 요약

- **로컬(개발)**: `test`, `draft` 태그가 있는 포스트도 목록·태그 필터에 노출.
- **프로덕션**: `test`, `draft` 중 하나라도 가진 포스트는 목록과 사용 가능 태그 목록에서 제외.

## 구현 위치

- `src/2-features/post/util/get-posts.ts`
  - `DEV_ONLY_TAGS = ['test', 'draft']`
  - `isProduction()` → `!import.meta.env.DEV`
  - `hasDevOnlyTag(tags)` → 포스트가 dev-only 태그 보유 여부
  - `getPosts`: 프로덕션일 때 `hasDevOnlyTag`인 포스트 제외 후 pagination/태그 필터 적용
  - `getAvailableTags`: 프로덕션일 때 dev-only 태그가 있는 포스트 제외 후 태그 수집

## 테스트

- `get-posts.test.ts`: 개발 환경에서 test/draft 포스트 포함, 프로덕션에서 제외
- `get-available-tags.test.ts`: 개발 환경에서 draft/test 태그 포함 가능, 프로덕션에서 해당 포스트 제외 후 태그만 반환

## 참고

- [architecture.md - 개발 전용 태그 (test, draft)](./architecture.md)
- [development.md - 로컬 전용 포스트](./development.md)
