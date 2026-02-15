# SEO 메타 태그 (태그 필터링 페이지는 00-tag-feature.md로 이동)

## 배경
- 현재 블로그에 SEO 메타 태그가 전혀 없음
- ~~태그(tag) 기반 포스트 필터링 페이지가 없음~~ → **00-tag-feature.md로 분리**
- E2E 테스트 TODO 3곳 미해결

## 핵심 결정: TanStack Router 내장 `head` 사용
- ~~react-helmet-async~~ 사용하지 않음
- TanStack Router v1이 `routeOptions.head` + `<HeadContent />` + `<Scripts />`를 내장 지원
- 추가 의존성 불필요, 라우트 loader 데이터와 직접 연동, 자동 중복 제거

## 작업 항목

### A. 전 페이지 SEO 메타 태그 (`routeOptions.head`)

**Root Route (`__root.tsx`)**:
```tsx
import { HeadContent } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Chan Blog' },
      { name: 'description', content: '개발 블로그' },
      { property: 'og:site_name', content: 'Chan Blog' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      {/* ... 기존 레이아웃 ... */}
    </>
  ),
})
```

**각 라우트별**:
- ⏳ `/$locale/index.tsx` — 홈 페이지 title + description + OG tags
- ⏳ `/$locale/posts/index.tsx` — 포스트 목록 title + description
- ⏳ `/$locale/posts/$.tsx` — 포스트 상세: loader에서 frontmatter 읽어 동적 title, description, og:image, og:article
- ⏳ `/$locale/about.tsx` — About 페이지 meta
- ⏳ `/$locale/contact.tsx` — Contact 페이지 meta
- ⏳ `/$locale/tags/index.tsx` — 태그 목록 페이지 meta (신규, **00-tag-feature.md 참고**)
- ⏳ `/$locale/tags/$tag.tsx` — 태그별 포스트 목록 meta (신규, **00-tag-feature.md 참고**)

### B. ~~태그 필터링 페이지~~ → **00-tag-feature.md로 이동**

### C. E2E 테스트 TODO 해결
- ⏳ 현재 E2E 테스트에 TODO 3곳 존재 → 구체적 테스트 작성
- **검색 필요**: grep으로 E2E 테스트 TODO 위치 확인

## Phase별 작업 계획

### Phase 1: Root Route에 `<HeadContent />` 설정 + 기존 페이지 head 추가
- ⏳ `__root.tsx`에 `<HeadContent />` 추가
- ⏳ 홈, About, Contact 페이지 meta 추가

### Phase 2: ~~태그 필터링 페이지 신규 개발~~ → **00-tag-feature.md로 이동**

### Phase 3: 포스트 상세 동적 메타 + OG tags
- ⏳ `/$locale/posts/$.tsx` loader에서 frontmatter 읽기
- ⏳ 동적 title, description, og:image 생성

### Phase 4: E2E 테스트 TODO 해결
- ⏳ E2E 테스트 TODO 3곳 구체화

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
