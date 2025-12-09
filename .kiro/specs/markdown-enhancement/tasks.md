# 구현 계획: 마크다운 고급화

> **참고**: 이 구현 계획은 `blog` 리포지터리의 작업에 초점을 맞춥니다. `content` 리포지터리의 `generate-index.ts` 스크립트는 별도로 업데이트해야 하며, 이 작업 목록에는 포함되지 않습니다. index.json에 readingTime 필드가 추가되면 자동으로 포스트 목록에서 사용할 수 있습니다.

## 2. 읽기 시간 계산 기능 구현

- [ ] 2.1 calculateReadingTime 유틸리티 함수 구현
  - `src/entities/mdx/util/calculate-reading-time.ts` 생성
  - MDX/마크다운 구문 제거 로직 구현
  - 단어 수 계산 (분당 200단어 기준)
  - 가장 가까운 분으로 반올림, 최소 1분
  - _요구사항: 7.1, 7.2, 7.3, 7.4_

- [ ]\* 2.2 calculateReadingTime 속성 테스트 작성
  - **속성 17: 읽기 시간 계산**
  - **속성 18: 읽기 시간 정수성**
  - **검증: 요구사항 7.1, 7.4**

- [ ] 2.3 Frontmatter 스키마에 readingTime 필드 추가
  - `src/entities/mdx/model/mdx.schema.ts` 업데이트
  - `readingTime: z.number().optional()` 추가
  - Frontmatter 타입 자동 업데이트
  - _요구사항: 7.5, 8.1_

- [ ] 2.4 getMarkdown 함수에 읽기 시간 계산 통합
  - `src/entities/mdx/util/get-markdown.ts` 업데이트
  - calculateReadingTime 호출 및 frontmatter에 추가
  - _요구사항: 7.5, 9.3_

- [ ] 2.5 ReadingTime 표시 컴포넌트 구현
  - `src/features/post/ui/reading-time.tsx` 생성
  - locale에 따른 텍스트 현지화 (한국어, 영어, 일본어)
  - "1분 읽기" vs "N분 읽기" 형식 처리
  - _요구사항: 7.3, 7.5_

- [ ] 2.6 포스트 상세 페이지에 읽기 시간 표시
  - `src/app/[locale]/posts/[...slug]/page.tsx` 또는 MDXComponent 업데이트
  - ReadingTime 컴포넌트 통합
  - 메타데이터 섹션에 배치
  - _요구사항: 7.5_

- [ ]\* 2.7 읽기 시간 표시 속성 테스트 작성
  - **속성 19: 읽기 시간 표시**
  - **검증: 요구사항 7.5**

- [ ] 2.8 체크포인트 - 읽기 시간 기능 검증
  - 모든 테스트 통과 확인
  - 포스트 상세 페이지에서 읽기 시간 표시 확인
  - 질문이 있으면 사용자에게 문의

## 3. 포스트 목록 페이지에 읽기 시간 표시

- [ ] 3.1 포스트 목록 페이지에 읽기 시간 표시
  - `src/features/post/ui/post-basic-card.tsx` 업데이트
  - ReadingTime 컴포넌트 추가
  - 상세 페이지와 동일한 형식 사용
  - index.json에서 readingTime 필드 읽어오기
  - _요구사항: 8.2, 8.3_

- [ ]\* 3.2 목록 페이지 읽기 시간 표시 속성 테스트 작성
  - **속성 21: 목록 페이지 읽기 시간 표시**
  - **속성 22: 읽기 시간 형식 일관성**
  - **검증: 요구사항 8.2, 8.3**

## 4. 헤딩 추출 및 TOC 데이터 생성

- [ ] 4.1 Heading 타입 정의
  - `src/entities/mdx/model/mdx.schema.ts`에 Heading 인터페이스 추가
  - `{ id: string; text: string; level: 2 | 3 }` 구조
  - _요구사항: 4.1, 4.2_

- [ ] 4.2 extractHeadings 유틸리티 함수 구현
  - `src/entities/mdx/util/extract-headings.ts` 생성
  - MDX 소스를 AST로 파싱
  - h2와 h3 요소 추출
  - 텍스트에서 slug 생성하여 고유 ID 할당
  - _요구사항: 4.1, 4.2_

- [ ]\* 4.3 extractHeadings 속성 테스트 작성
  - **속성 9: 헤딩 추출 완전성**
  - **속성 10: 계층 구조 보존**
  - **검증: 요구사항 4.1, 4.2**

- [ ] 4.4 MDX 컴포넌트에서 헤딩 추출 통합
  - `src/entities/mdx/index.tsx` 업데이트
  - extractHeadings 호출하여 TOC 데이터 생성
  - 헤딩이 2개 미만이면 TOC 데이터 null 처리
  - _요구사항: 4.5, 9.2_

## 5. 향상된 헤딩 컴포넌트 구현

- [ ] 5.1 setMdxComponents에 ID가 있는 헤딩 추가
  - `src/entities/mdx/util/set-mdx-components.tsx` 업데이트
  - h2, h3 컴포넌트에 slug화된 ID 추가
  - TOC 네비게이션을 위한 앵커 포인트 생성
  - _요구사항: 4.3, 4.4_

## 6. TOC 컴포넌트 구현

- [ ] 6.1 useActiveHeading 훅 구현
  - `src/features/post/hooks/use-active-heading.ts` 생성
  - Intersection Observer를 사용하여 보이는 헤딩 추적
  - 가장 위에 보이는 헤딩의 ID 반환
  - 브라우저 호환성 처리
  - _요구사항: 5.1, 5.2, 5.3, 5.4_

- [ ]\* 6.2 useActiveHeading 속성 테스트 작성
  - **속성 13: 가시 헤딩 감지**
  - **속성 14: 활성 TOC 항목 하이라이트**
  - **검증: 요구사항 5.1, 5.2**

- [ ] 6.3 TableOfContents 컴포넌트 구현
  - `src/features/post/ui/table-of-contents.tsx` 생성
  - 계층적 헤딩 렌더링 (h2는 부모, h3는 자식)
  - 각 항목을 클릭 가능한 링크로 렌더링
  - 활성 섹션 하이라이트 (useActiveHeading 사용)
  - 부드러운 스크롤 동작 구현
  - _요구사항: 4.2, 4.3, 4.4, 5.2, 6.1, 6.2_

- [ ]\* 6.4 TableOfContents 속성 테스트 작성
  - **속성 11: TOC 항목 클릭 가능성**
  - **속성 12: TOC 클릭 시 스크롤**
  - **속성 15: 부드러운 스크롤 동작**
  - **속성 16: 스크롤 완료 후 위치**
  - **검증: 요구사항 4.3, 4.4, 6.1, 6.2**

- [ ] 6.5 모바일 반응형 TOC 구현
  - 768px 미만에서 접을 수 있는 드로어 형식
  - 확장 버튼/아이콘 추가
  - 항목 선택 후 자동 접기
  - _요구사항: 10.1, 10.2, 10.3, 10.4_

- [ ] 6.6 포스트 상세 페이지에 TOC 통합
  - `src/app/[locale]/posts/[...slug]/page.tsx` 업데이트
  - TableOfContents 컴포넌트 배치 (사이드바 또는 상단)
  - 헤딩 데이터 전달
  - _요구사항: 4.3_

## 7. 코드 블록 개선 - 기본 구조

- [ ] 7.1 CopyButton 컴포넌트 구현
  - `src/entities/mdx/ui/copy-button.tsx` 생성
  - Clipboard API를 사용한 복사 기능
  - 성공/실패 시각적 피드백 (아이콘 변경, 툴팁 등)
  - 브라우저 호환성 처리 및 폴백
  - 접근성: aria-label, 키보드 네비게이션
  - _요구사항: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]\* 7.2 CopyButton 속성 테스트 작성
  - **속성 2: 클립보드 라운드 트립**
  - **속성 3: 복사 성공 피드백**
  - **검증: 요구사항 1.2, 1.3**

- [ ] 7.3 LanguageLabel 컴포넌트 구현
  - `src/entities/mdx/ui/language-label.tsx` 생성
  - className에서 언어 정보 추출
  - 일관된 위치에 레이블 표시
  - 언어 메타데이터 없을 때 처리
  - _요구사항: 3.1, 3.2, 3.3_

- [ ]\* 7.4 LanguageLabel 속성 테스트 작성
  - **속성 6: 언어 레이블 표시**
  - **검증: 요구사항 3.1**

## 8. 코드 블록 개선 - EnhancedCodeBlock 통합

- [ ] 8.1 EnhancedCodeBlock 컴포넌트 구현
  - `src/entities/mdx/ui/enhanced-code-block.tsx` 생성
  - CopyButton, LanguageLabel 통합
  - 라인 넘버 렌더링 (CSS 기반)
  - 코드 내용과 라인 넘버 분리 (선택 시 라인 넘버 제외)
  - 일관된 패딩과 마진 스타일
  - 다크/라이트 모드 테마 지원
  - _요구사항: 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 11.1, 11.2, 11.3, 11.4_

- [ ]\* 8.2 EnhancedCodeBlock 속성 테스트 작성
  - **속성 1: 복사 버튼 존재**
  - **속성 4: 라인 넘버 표시**
  - **속성 5: 라인 넘버 순차성**
  - **속성 7: 구문 하이라이팅 적용**
  - **속성 8: 일관된 스타일**
  - **검증: 요구사항 1.1, 2.1, 2.3, 11.1, 11.2**

- [ ] 8.3 setMdxComponents에 EnhancedCodeBlock 통합
  - `src/entities/mdx/util/set-mdx-components.tsx` 업데이트
  - 현재 `pre` 컴포넌트를 EnhancedCodeBlock으로 교체
  - 원시 코드 내용 전달 (복사용)
  - className 전달 (언어 정보)
  - _요구사항: 9.1_

- [ ]\* 8.4 MDX 통합 속성 테스트 작성
  - **속성 23: 커스텀 컴포넌트 통합**
  - **속성 24: 원본 콘텐츠 불변성**
  - **속성 25: 읽기 시간 처리 순서**
  - **속성 26: 플러그인 호환성**
  - **검증: 요구사항 9.1, 9.2, 9.3, 9.4**

## 9. 스타일링 및 접근성

- [ ] 9.1 코드 블록 다크/라이트 테마 스타일 추가
  - highlight.js 테마 CSS 임포트 또는 커스텀 스타일
  - 다크 모드와 라이트 모드에 따른 조건부 클래스
  - _요구사항: 11.3, 11.4_

- [ ] 9.2 TOC 접근성 개선
  - `<nav>` 요소로 감싸기
  - `aria-label="목차"` 추가
  - 활성 항목에 `aria-current="location"` 추가
  - 키보드 네비게이션 테스트
  - _요구사항: 4.3_

- [ ] 9.3 코드 블록 접근성 개선
  - 복사 버튼 aria-label 추가
  - 복사 성공/실패 시 aria-live 영역 추가
  - 키보드로 복사 버튼 포커스 가능 확인
  - _요구사항: 1.1_

- [ ] 9.4 읽기 시간 접근성 개선
  - `<time>` 요소 사용 또는 aria-label 추가
  - 스크린 리더 친화적 마크업
  - _요구사항: 7.5_

## 10. 국제화 (i18n)

- [ ] 10.1 읽기 시간 텍스트 현지화
  - ReadingTime 컴포넌트에 locale별 텍스트 추가
  - 한국어: "1분 읽기", "N분 읽기"
  - 영어: "1 min read", "N min read"
  - 일본어: "1分で読めます", "N分で読めます"
  - _요구사항: 7.5_

- [ ] 10.2 복사 버튼 텍스트 현지화
  - CopyButton 컴포넌트에 locale별 텍스트 추가
  - 한국어: "복사", "복사됨!", "복사 실패"
  - 영어: "Copy", "Copied!", "Copy failed"
  - 일본어: "コピー", "コピーしました!", "コピー失敗"
  - _요구사항: 1.3, 1.4_

- [ ] 10.3 TOC 제목 현지화
  - TableOfContents 컴포넌트에 locale별 제목 추가
  - 한국어: "목차"
  - 영어: "Table of Contents"
  - 일본어: "目次"
  - _요구사항: 4.3_

## 11. 최종 체크포인트

- [ ]\* 11.1 모든 테스트 실행 및 통과 확인
  - 모든 속성 기반 테스트 실행 (최소 100회 반복)
  - 모든 단위 테스트 실행
  - 테스트 실패 시 사용자에게 문의
  - _요구사항: 전체_

- [ ]\* 11.2 E2E 테스트 작성 및 실행
  - Playwright로 실제 브라우저에서 복사 버튼 테스트
  - TOC 링크 클릭 및 스크롤 동작 테스트
  - 모바일 뷰포트에서 TOC 드로어 테스트
  - 다크/라이트 모드 전환 테스트
  - _요구사항: 전체_

- [ ] 11.3 기존 rehype/remark 플러그인 호환성 확인
  - rehype-highlight가 정상 작동하는지 확인
  - 다른 플러그인과 충돌 없는지 확인
  - _요구사항: 9.4_

- [ ]\* 11.4 성능 검증
  - 큰 문서에서 TOC 생성 성능 확인
  - 코드 블록 렌더링 성능 확인
  - 읽기 시간 계산 성능 확인
  - _요구사항: 전체_
