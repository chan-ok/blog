# MDX 렌더링 시스템 통합 개선

## 배경
- 별도 저장소 `chan-ok/mdx-blog-parser`(private)에서 개발한 MDX 렌더링 기능 8가지를 현재 블로그에 통합한다.
- 현재 블로그의 MDX 렌더링은 기본적인 수준이며, mdx-blog-parser가 모든 면에서 우수하다.

## ✅ 완료된 작업

### 1. ✅ 코드 블록 (CodeBlock)
- 복사 버튼, 줄번호, 언어 뱃지, 다크모드 고정 구현 완료
- 파일: `src/1-entities/markdown/ui/code-block.tsx`
- 테스트: `code-block.test.tsx` 존재

### 2. ✅ 목차 (TableOfContents)
- IntersectionObserver 기반 활성 섹션 추적 구현 완료
- 모바일 반응형 (접이식), 데스크탑 사이드바 완료
- 파일: `src/2-features/post/ui/table-of-contents.tsx`
- 테스트: `table-of-contents.test.tsx` 존재
- **주의**: 현재 h2, h3만 포함 (`level: number; // 2 or 3`)
- **⚠️ TODO**: h1도 TOC에 포함하도록 수정 필요 (사용자 보고)

### 3. ✅ Mermaid 다이어그램
- lazy import, 코드블록 내 ```mermaid 감지, 다크모드 고정 완료
- 파일: `src/1-entities/markdown/ui/mermaid-diagram.tsx`
- 테스트: `mermaid-diagram.test.tsx` 존재

### 4. ✅ 테이블
- 반응형 가로 스크롤, overflow 처리 완료
- 파일: `src/1-entities/markdown/ui/table-wrapper.tsx`
- 테스트: `table-wrapper.test.tsx` 존재

### 5. ✅ 이미지 (ImageBlock)
- `<figure>` + `<figcaption>`, lazy loading, 에러 fallback 완료
- 파일: `src/1-entities/markdown/ui/image-block.tsx`
- 테스트: `image-block.test.tsx` 존재

### 6. ✅ 유틸리티
- 썸네일 추출: `extract-thumbnail.ts` + 테스트 완료
- 발췌문 추출: `extract-excerpt.ts` + 테스트 완료
- 읽기 시간: `reading-time.ts` + 테스트 완료

### 7. ✅ 타이포그래피
- h1-h6에 `id` 자동 생성 완료
- 파일: `src/1-entities/markdown/ui/typography.tsx`
- 테스트: `typography.test.tsx` 존재
- **⚠️ TODO**: 현재 포스트 헤더의 # 제거 필요 (사용자 보고)

### 8. ✅ MDX 컴파일 단순화
- `evaluate()` 기반 1단계 컴파일+실행 완료
- 파일: `src/1-entities/markdown/index.tsx`, `get-markdown.ts`

## 🔧 남은 작업

### A. TOC에 h1, h2, h3 모두 포함
**현재 상태**: `src/4-pages/$locale/posts/$.tsx`의 `extractHeadings()`가 h2, h3만 선택
```tsx
// 현재
const elements = contentRef.current.querySelectorAll('h2, h3');

// 수정 필요
const elements = contentRef.current.querySelectorAll('h1, h2, h3');
```

**영향 파일**:
- `src/4-pages/$locale/posts/$.tsx` (line 41)
- `src/2-features/post/ui/table-of-contents.tsx` (interface 주석 수정)

### B. 포스트 헤더의 # 제거
**현재 상태**: `$.tsx`의 46번 라인에서 `textContent?.replace('#', '')` 처리 중
```tsx
text: el.textContent?.replace('#', '').trim() || '',
```

**문제**: Markdown 파일에 `# 제목` 형식으로 작성된 경우 TOC에 `#` 기호가 남을 수 있음

**해결 방법**:
1. MDX 컴파일 시 rehype 플러그인으로 제거
2. 또는 `textContent` 추출 시 정규식으로 모든 `#` 제거

### C. MDX 컴포넌트 매핑 재확인
**파일**: `src/1-entities/markdown/util/set-md-components.tsx`

**확인 사항**:
- 모든 HTML 요소가 올바른 커스텀 컴포넌트로 매핑되었는지
- blockquote, code 등 추가 컴포넌트 확인

## Phase별 작업 계획

### ✅ Phase 1 완료
- ✅ 코드 블록 + 타이포그래피 + MDX 컴파일 단순화

### ✅ Phase 2 완료
- ✅ TOC + Mermaid

### ✅ Phase 3 완료
- ✅ 이미지 블록 + 테이블 + 유틸리티

### ✅ Phase 4 완료
- ✅ PostDetail 페이지 레이아웃 통합 + 전체 스타일 조정

### 🔧 Phase 5: 마이너 수정
- ⏳ TOC에 h1 포함 (현재 h2, h3만)
- ⏳ 포스트 헤더의 # 제거 로직 개선
- ⏳ MDX 컴포넌트 매핑 재확인

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
