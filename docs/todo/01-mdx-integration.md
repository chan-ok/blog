# MDX 렌더링 시스템 통합 개선

## 배경
- 별도 저장소 `chan-ok/mdx-blog-parser`(private)에서 개발한 MDX 렌더링 기능 8가지를 현재 블로그에 통합한다.
- 현재 블로그의 MDX 렌더링은 기본적인 수준이며, mdx-blog-parser가 모든 면에서 우수하다.

## 통합 대상 기능 (8가지)
1. **코드 블록 (CodeBlock)**: 복사 버튼, 줄번호, 언어 뱃지, 다크모드 고정 (highlight.js github-dark)
2. **목차 (TableOfContents)**: IntersectionObserver 기반 활성 섹션 추적, 모바일 반응형 (접이식), 데스크탑 사이드바
3. **Mermaid 다이어그램**: `mermaid` lazy import, 코드블록 내 ```mermaid 감지, 다크모드 고정
4. **테이블**: 반응형 가로 스크롤, overflow 처리
5. **이미지 (ImageBlock)**: `<figure>` + `<figcaption>`, lazy loading, 에러 fallback
6. **유틸리티**: 썸네일 추출, 발췌문(excerpt) 추출, 읽기 시간(readingTime) 계산
7. **타이포그래피**: h1-h6에 `id` + 앵커 링크 자동 생성 (`rehype-slug`, `rehype-autolink-headings`)
8. **MDX 컴파일 단순화**: `evaluate()` 기반 1단계 컴파일+실행 (현재 2단계 compile→run)

## 적응 필요 사항
- mdx-blog-parser는 shadcn/ui 사용 → 현재 블로그는 Base UI 또는 자체 컴포넌트 사용
- mdx-blog-parser는 @phosphor-icons 사용 → 현재 블로그는 lucide-react 사용
- 다크모드 고정: 코드블록, Mermaid 다이어그램은 다크모드 고정
- FSD 구조 준수: 모든 새 컴포넌트는 FSD 레이어에 맞게 배치

## 추가 필요 패키지
- `mermaid` (lazy import)
- `rehype-slug`
- `rehype-autolink-headings`

## 예상 파일 구조
```
src/1-entities/markdown/
├── index.tsx                    # MDXRenderer (evaluate 기반 1단계)
├── ui/
│   ├── code-block.tsx           # 코드 블록 (복사/줄번호/언어뱃지/다크모드고정)
│   ├── mermaid-diagram.tsx      # Mermaid (lazy/다크모드고정)
│   ├── image-block.tsx          # figure + figcaption + lazy
│   ├── table-wrapper.tsx        # 반응형 테이블
│   └── typography.tsx           # h1-h6 (id + 앵커)
├── util/
│   ├── get-markdown.ts          # MDX fetch + gray-matter + evaluate
│   ├── set-md-components.tsx    # 컴포넌트 매핑
│   ├── extract-thumbnail.ts     # 썸네일 추출
│   ├── extract-excerpt.ts       # 발췌문 추출
│   └── reading-time.ts          # 읽기 시간 계산
└── model/
    └── markdown.schema.ts       # Frontmatter Zod 스키마 (유지)

src/2-features/post/ui/
└── table-of-contents.tsx        # TOC (feature 레벨)

src/4-pages/$locale/posts/
└── $.tsx                        # PostDetail 레이아웃에 TOC 추가
```

## Phase별 작업 계획
- **Phase 1**: 코드 블록 + 타이포그래피 + MDX 컴파일 단순화
- **Phase 2**: TOC + Mermaid
- **Phase 3**: 이미지 블록 + 테이블 + 유틸리티
- **Phase 4**: PostDetail 페이지 레이아웃 통합 + 전체 스타일 조정

## 과제 2와의 관계
- `get-markdown.ts`의 Zod 검증, MDComponent 404 에러 처리는 이 과제에서 함께 개선한다.
- `src/shared/` 레거시 폴더 정리는 과제 2에서 처리한다.

## 공통 참고사항
- 코드 스타일: `docs/code-style.md` 준수
- 아키텍처: FSD 레이어 규칙 (`docs/architecture-rules.md`) 준수
- 테스팅: TDD (Red/Green/Refactor), 커버리지 80%+ (`docs/testing.md`)
- 언어: 한국어 문서/주석/커밋, 영어 코드 (`docs/language-rules.md`)
- Git: feature branch → develop PR (`docs/git-flow.md`)
