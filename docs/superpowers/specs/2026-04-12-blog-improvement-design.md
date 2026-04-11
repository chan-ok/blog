# 블로그 개선 설계 문서

**날짜**: 2026-04-12  
**목적**: 기존 기능 정리 및 독자 경험 개선

---

## 블로그 목적

1. 축적한 지식과 자료 종합 공유
2. 개인 고찰 및 생각 정리 공유
3. 개인 홍보 (이력, 경력, 연락수단)

---

## Phase 1: 제거·수정

### 1. 스타일 불일치 개선

**대상 파일**: `contact-form.tsx`, `footer.tsx`

**문제**: `gray-xxx` Tailwind 하드코딩 클래스 사용. 나머지 블로그는 `ink/bg/rule` 디자인 토큰 사용.

**변경 내용**:

- 텍스트 색상: `text-gray-600 dark:text-gray-400` → `text-ink3`
- 입력 테두리: `border-gray-200 dark:border-gray-700` → `border-rule`
- 배경: `dark:bg-gray-800` → `bg-bg`
- 포커스 링: `focus:outline-blue-800` → `focus:outline-ink`
- `post-share-buttons.tsx`는 삭제 예정이므로 수정 제외

### 2. 시리즈 빈 상태 텍스트 다국어 처리

**대상 파일**: `src/2-features/series/ui/series-list.tsx`

**문제**: `"아직 발행된 시리즈가 없습니다."` 한국어 하드코딩.

**변경 내용**:

- `useTranslation()` 훅 추가
- 문자열 → `t('series.empty')` 교체
- 한/영/일 i18n JSON 파일에 `series.empty` 키 추가

### 3. SNS 공유 버튼 전부 제거

**삭제 파일**:

- `src/2-features/post/ui/post-share-buttons.tsx`
- `src/2-features/post/ui/post-share-buttons.test.tsx`

**수정 파일**:

- `src/4-pages/$locale/posts/$.tsx`: `PostShareButtons` import 및 렌더링 코드 제거

### 4. RSS 기능 전체 제거

**삭제 파일**:

- `netlify/functions/rss.mts`
- `netlify/edge-functions/rate-limit-rss.ts`

**수정 파일**:

- `src/3-widgets/footer.tsx`: RSS 아이콘 링크 제거
- `netlify.toml`: RSS 관련 redirect/config 제거

### 5. Contact 폼 Subject 필드 제거

**대상**: `from(이메일) + subject + message` → `from(이메일) + message`

**수정 파일**:

- `src/2-features/contact/ui/contact-form.tsx`: Subject `Field.Root` 블록 제거
- `src/2-features/contact/model/contact-form.schema.ts` (또는 유사 파일): `subject` 필드 제거
- `netlify/functions/mail.mts`: subject 처리 코드 제거
- 한/영/일 i18n 파일: `contact.subject`, `contact.subjectPlaceholder` 키 제거

---

## Phase 2: 신규 기능

### 6. 포스트 검색 기능

**위치**: `/$locale/posts/` — 태그 필터바 위

**동작**:

- URL 쿼리파라미터 `?q=keyword`로 검색어 상태 관리 (북마크/공유 가능)
- 태그 필터(`?tags=`)와 AND 조건으로 동시 적용
- 검색 대상: `title`, `tags`, `summary` (index.json 기반 클라이언트 필터링)
- 대소문자 구분 없음

**FSD 구조**:

- `src/2-features/post/ui/post-search-input.tsx` 신규 추가
  - 입력 시 URL `?q=` 파라미터 업데이트 (debounce 300ms)
  - 블로그 디자인 토큰(`ink/bg/rule`) 사용
- `src/4-pages/$locale/posts/index.tsx`: `q` 파라미터 파싱 → `PostCardList`에 전달
- `src/2-features/post/util/get-posts.ts` (또는 필터 유틸): `q` 기반 클라이언트 필터 추가

**검색 로직**:

```
query = q.toLowerCase()
match = post.title.toLowerCase().includes(query)
     || post.tags?.some(tag => tag.toLowerCase().includes(query))
     || post.summary?.toLowerCase().includes(query)
```

### 7. 이전/다음 포스트 네비게이션

**위치**: 포스트 상세 페이지 하단 — `Reply` 컴포넌트 바로 위

**순서 기준**: 전체 포스트 날짜 내림차순 (최신 → 오래된 순)

**방향 정의**:

- 이전(Prev): 현재보다 오래된 포스트 (날짜 내림차순에서 다음 인덱스)
- 다음(Next): 현재보다 최신 포스트 (날짜 내림차순에서 이전 인덱스)

**데이터**: TanStack Query로 `index.json` fetch — 네비게이션 전용 쿼리 키(`['posts-all', locale]`) 사용 (Posts 목록 캐시 키는 `['posts', locale, tags]`로 tags 의존성 있어 별도 관리)

**FSD 구조**:

- `src/2-features/post/ui/post-navigation.tsx` 신규 추가
  - 좌(Prev) / 우(Next) 양쪽 배치
  - 포스트가 없는 방향은 빈 공간 처리
  - 블로그 디자인 토큰 사용

**렌더링 조건**: `mdxStatus === 'success'` 후 표시

### 8. 포스트 읽기 예상 시간

**위치**: 포스트 상세 메타 헤더 — 날짜 옆 (예: `2024.03.15 · 약 5분`)

**계산 시점**: `mdxStatus === 'success'` 후 `contentRef.current.textContent` 추출

**계산 방식**:

- 한국어(`ko`): 분당 500자 기준 → `Math.ceil(charCount / 500)`
- 영어/일본어(`en`, `ja`): 분당 200단어 기준 → `Math.ceil(wordCount / 200)`
- 1분 미만: "1분 미만" 표시
- N분 이상: "약 N분" 표시

**FSD 구조**:

- `src/2-features/post/util/calc-reading-time.ts` 신규 추가
  - 입력: `(text: string, locale: LocaleType) => string`
  - 출력: 표시용 문자열

---

## 비고

- summary 카드 표시는 현 시점 미구현 결정 (추후 재검토)
- LinkedIn 공유 버튼은 SNS 공유 버튼 전체 제거에 포함
- 접근 방식: Phase 1 완료 후 Phase 2 진행 (A안)
