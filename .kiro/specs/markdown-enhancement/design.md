# 설계 문서: 마크다운 고급화

## 개요

이 설계 문서는 블로그의 마크다운 렌더링 기능을 향상시키기 위한 아키텍처와 구현 전략을 설명합니다. 개선 사항은 다음과 같습니다:

1. **코드 블록 개선**: 복사 버튼, 라인 넘버, 언어 레이블
2. **목차 (TOC)**: 자동 생성 및 현재 섹션 하이라이트
3. **읽기 시간**: 예상 읽기 시간 계산 및 표시

이러한 기능들은 `next-mdx-remote-client`로 구동되는 기존 MDX 렌더링 파이프라인과 원활하게 통합되며, 프로젝트에 이미 구축된 Feature-Sliced Design (FSD) 아키텍처 패턴을 따릅니다.

## 아키텍처

### 현재 MDX 렌더링 흐름

```
MDX 파일 (blog-content 리포지터리)
    ↓
getMarkdown() - GitHub에서 원시 MDX 가져오기
    ↓
gray-matter - frontmatter 추출
    ↓
MDXRemote (next-mdx-remote-client/rsc)
    ↓
커스텀 MDX 컴포넌트 (setMdxComponents)
    ↓
렌더링된 HTML
```

### 새로운 기능이 추가된 향상된 흐름

```
MDX 파일 (blog-content 리포지터리)
    ↓
getMarkdown() - 원시 MDX 가져오기
    ↓
calculateReadingTime() - 단어 수 추출 → 읽기 시간
    ↓
gray-matter - frontmatter + 읽기 시간 추출
    ↓
extractHeadings() - h2/h3를 위한 AST 파싱 → TOC 데이터
    ↓
향상된 컴포넌트가 포함된 MDXRemote
    ├─ 향상된 코드 블록 (복사, 라인 넘버, 언어 레이블)
    ├─ 향상된 헤딩 (TOC 네비게이션을 위한 ID 포함)
    └─ TOC 컴포넌트 (활성 추적이 있는 사이드바)
    ↓
향상된 기능이 포함된 렌더링된 HTML
```

## 컴포넌트 및 인터페이스

### 1. 코드 블록 개선

#### 컴포넌트: `EnhancedCodeBlock`

**위치**: `src/entities/mdx/ui/enhanced-code-block.tsx`

**Props**:

```typescript
interface EnhancedCodeBlockProps {
  children: React.ReactNode;
  className?: string; // 언어 정보 포함 (예: "language-typescript")
  raw?: string; // 복사를 위한 원시 코드 내용
}
```

**하위 컴포넌트**:

- **CopyButton**: `src/entities/mdx/ui/copy-button.tsx`

  ```typescript
  interface CopyButtonProps {
    code: string;
  }
  ```

- **LineNumbers**: 코드 블록 내에서 인라인으로 렌더링

  ```typescript
  interface LineNumbersProps {
    lines: number; // 전체 라인 수
  }
  ```

- **LanguageLabel**: `src/entities/mdx/ui/language-label.tsx`
  ```typescript
  interface LanguageLabelProps {
    language: string;
  }
  ```

#### 통합

`EnhancedCodeBlock`은 `setMdxComponents()`의 현재 `pre` 컴포넌트를 대체합니다:

```typescript
// 현재
pre: ({ children }) => <pre className="...">{children}</pre>

// 향상됨
pre: ({ children, ...props }) => <EnhancedCodeBlock {...props}>{children}</EnhancedCodeBlock>
```

### 2. 목차 (TOC)

#### 컴포넌트: `TableOfContents`

**위치**: `src/features/post/ui/table-of-contents.tsx`

**Props**:

```typescript
interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
}

interface Heading {
  id: string;
  text: string;
  level: 2 | 3; // h2와 h3만
}
```

**기능**:

- 계층적 렌더링 (h2는 부모, h3는 자식)
- Intersection Observer를 사용한 활성 섹션 하이라이트
- 클릭 시 부드러운 스크롤
- 반응형: 데스크톱에서는 사이드바, 모바일에서는 접을 수 있는 드로어

#### 유틸리티: `extractHeadings`

**위치**: `src/entities/mdx/util/extract-headings.ts`

```typescript
export function extractHeadings(source: string): Heading[] {
  // MDX 소스를 AST로 파싱
  // h2와 h3 요소 추출
  // 고유 ID 생성 (텍스트에서 slug 생성)
  // Heading 객체 배열 반환
}
```

#### 훅: `useActiveHeading`

**위치**: `src/features/post/hooks/use-active-heading.ts`

```typescript
export function useActiveHeading(headingIds: string[]): string | null {
  // Intersection Observer를 사용하여 보이는 헤딩 추적
  // 가장 위에 보이는 헤딩의 ID 반환
}
```

#### 향상된 헤딩 컴포넌트

헤딩은 TOC 네비게이션을 위해 ID가 필요합니다. `setMdxComponents()` 업데이트:

```typescript
h2: ({ children }) => {
  const id = slugify(children);
  return <h2 id={id} className="...">{children}</h2>;
}
```

### 3. 읽기 시간

#### 유틸리티: `calculateReadingTime`

**위치**: `src/entities/mdx/util/calculate-reading-time.ts`

```typescript
export function calculateReadingTime(content: string): number {
  // MDX/마크다운 구문 제거
  // 단어 수 계산
  // 시간 계산: 단어 수 / 200 (분당 단어 수)
  // 가장 가까운 분으로 반올림, 최소 1
  return readingTimeInMinutes;
}
```

#### 통합 지점

**A. `getMarkdown()`에서 (상세 페이지용)**:

```typescript
export default async function getMarkdown(...) {
  const { content, data } = matter(response.data);
  const readingTime = calculateReadingTime(content);

  return {
    content,
    frontmatter: { ...data, readingTime } as Frontmatter,
    source: response.data,
  };
}
```

**B. `generate-index.ts`에서 (blog-content 리포지터리)**:

```typescript
// index.json의 각 포스트 메타데이터에 readingTime 추가
const readingTime = calculateReadingTime(content);
metadata.readingTime = readingTime;
```

**C. Frontmatter 스키마 업데이트**:

```typescript
export const FrontmatterSchema = z.object({
  // ... 기존 필드
  readingTime: z.number().optional(),
});
```

#### 표시 컴포넌트: `ReadingTime`

**위치**: `src/features/post/ui/reading-time.tsx`

```typescript
interface ReadingTimeProps {
  minutes: number;
  locale: LocaleType;
}

export function ReadingTime({ minutes, locale }: ReadingTimeProps) {
  const text = minutes === 1 ? '1분 읽기' : `${minutes}분 읽기`;
  // locale에 따라 텍스트 현지화
  return <span className="...">{text}</span>;
}
```

## 데이터 모델

### 업데이트된 Frontmatter 타입

```typescript
export const FrontmatterSchema = z.object({
  id: z.number(),
  title: z.string(),
  thumbnail: z.string().optional(),
  summary: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  path: z.array(z.string()),
  published: z.boolean().default(false),
  readingTime: z.number().optional(), // 새로 추가
});
```

### Heading 타입

```typescript
export interface Heading {
  id: string; // Slug화된 헤딩 텍스트
  text: string; // 원본 헤딩 텍스트
  level: 2 | 3; // 헤딩 레벨
}
```

### TOC 상태

```typescript
interface TOCState {
  headings: Heading[];
  activeId: string | null;
  isOpen: boolean; // 모바일 드로어용
}
```

## 정확성 속성

_속성(Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 본질적으로 시스템이 수행해야 하는 작업에 대한 공식적인 진술입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다._

### 코드 블록 속성

**속성 1: 복사 버튼 존재**
_모든_ 렌더링된 코드 블록에 대해, 복사 버튼이 DOM에 존재해야 합니다.
**검증: 요구사항 1.1**

**속성 2: 클립보드 라운드 트립**
_모든_ 코드 내용에 대해, 복사 버튼을 클릭한 후 클립보드에서 가져온 내용은 원본 코드와 동일해야 합니다.
**검증: 요구사항 1.2**

**속성 3: 복사 성공 피드백**
_모든_ 성공적인 복사 작업에 대해, 시스템은 성공을 나타내는 시각적 피드백을 제공해야 합니다.
**검증: 요구사항 1.3**

**속성 4: 라인 넘버 표시**
_모든_ 렌더링된 코드 블록에 대해, 각 코드 라인의 왼쪽에 라인 넘버가 표시되어야 합니다.
**검증: 요구사항 2.1**

**속성 5: 라인 넘버 순차성**
_모든_ 여러 줄 코드 블록에 대해, 라인 넘버는 1부터 시작하여 순차적으로 증가해야 합니다.
**검증: 요구사항 2.3**

**속성 6: 언어 레이블 표시**
_모든_ 언어 메타데이터가 있는 코드 블록에 대해, 언어 이름이 레이블로 표시되어야 합니다.
**검증: 요구사항 3.1**

**속성 7: 구문 하이라이팅 적용**
_모든_ 렌더링된 코드 블록에 대해, rehype-highlight 플러그인에 의한 구문 하이라이팅 클래스가 적용되어야 합니다.
**검증: 요구사항 11.1**

**속성 8: 일관된 스타일**
_모든_ 렌더링된 코드 블록에 대해, 패딩과 마진 스페이싱이 일관되게 적용되어야 합니다.
**검증: 요구사항 11.2**

### 목차 (TOC) 속성

**속성 9: 헤딩 추출 완전성**
_모든_ MDX 문서에 대해, 추출된 h2와 h3 헤딩의 수는 원본 문서의 h2와 h3 헤딩 수와 동일해야 합니다.
**검증: 요구사항 4.1**

**속성 10: 계층 구조 보존**
_모든_ 헤딩 구조에 대해, 생성된 TOC는 원본 문서의 헤딩 레벨 계층을 보존해야 합니다.
**검증: 요구사항 4.2**

**속성 11: TOC 항목 클릭 가능성**
_모든_ TOC 항목에 대해, 각 항목은 클릭 가능한 링크로 렌더링되어야 합니다.
**검증: 요구사항 4.3**

**속성 12: TOC 클릭 시 스크롤**
_모든_ TOC 링크 클릭에 대해, 뷰포트는 해당 헤딩으로 스크롤되어야 합니다.
**검증: 요구사항 4.4**

**속성 13: 가시 헤딩 감지**
_모든_ 스크롤 이벤트에 대해, 시스템은 현재 뷰포트에 보이는 헤딩을 감지해야 합니다.
**검증: 요구사항 5.1**

**속성 14: 활성 TOC 항목 하이라이트**
_모든_ 보이는 헤딩에 대해, 해당 TOC 항목이 하이라이트되어야 합니다.
**검증: 요구사항 5.2**

**속성 15: 부드러운 스크롤 동작**
_모든_ TOC 링크 클릭에 대해, 스크롤은 smooth behavior로 애니메이션되어야 합니다.
**검증: 요구사항 6.1**

**속성 16: 스크롤 완료 후 위치**
_모든_ 스크롤 애니메이션 완료 후, 대상 헤딩은 뷰포트 상단 근처에 위치해야 합니다.
**검증: 요구사항 6.2**

### 읽기 시간 속성

**속성 17: 읽기 시간 계산**
_모든_ MDX 문서에 대해, 읽기 시간은 단어 수를 기반으로 계산되어야 합니다.
**검증: 요구사항 7.1**

**속성 18: 읽기 시간 정수성**
_모든_ 계산된 읽기 시간에 대해, 결과는 정수(분)여야 합니다.
**검증: 요구사항 7.4**

**속성 19: 읽기 시간 표시**
_모든_ 포스트 상세 페이지에 대해, 읽기 시간이 메타데이터 섹션에 표시되어야 합니다.
**검증: 요구사항 7.5**

**속성 20: index.json에 읽기 시간 포함**
_모든_ 처리된 MDX 파일에 대해, 생성된 index.json 메타데이터는 readingTime 필드를 포함해야 합니다.
**검증: 요구사항 8.1**

**속성 21: 목록 페이지 읽기 시간 표시**
_모든_ 포스트 목록 항목에 대해, 읽기 시간이 표시되어야 합니다.
**검증: 요구사항 8.2**

**속성 22: 읽기 시간 형식 일관성**
_모든_ 읽기 시간 표시에 대해, 목록 페이지와 상세 페이지의 형식은 동일해야 합니다.
**검증: 요구사항 8.3**

### 통합 속성

**속성 23: 커스텀 컴포넌트 통합**
_모든_ MDX 렌더링에 대해, 코드 블록 개선은 커스텀 컴포넌트를 통해 통합되어야 합니다.
**검증: 요구사항 9.1**

**속성 24: 원본 콘텐츠 불변성**
_모든_ TOC 생성에 대해, 원본 MDX 콘텐츠는 수정되지 않아야 합니다.
**검증: 요구사항 9.2**

**속성 25: 읽기 시간 처리 순서**
_모든_ MDX 처리에 대해, 읽기 시간은 렌더링 전에 계산되어야 합니다.
**검증: 요구사항 9.3**

**속성 26: 플러그인 호환성**
_모든_ 향상된 기능 렌더링에 대해, 기존 rehype 및 remark 플러그인과 호환되어야 합니다.
**검증: 요구사항 9.4**

## 에러 처리

### 코드 블록 복사 실패

- Clipboard API를 사용할 수 없는 경우, 복사 버튼을 비활성화하거나 폴백 메커니즘 제공
- 복사 작업 실패 시, 사용자에게 명확한 에러 메시지 표시
- 타임아웃 처리: 복사 작업이 일정 시간 내에 완료되지 않으면 실패로 처리

### TOC 생성 실패

- MDX 파싱 실패 시, TOC를 표시하지 않고 조용히 실패
- 헤딩이 2개 미만인 경우, TOC 컴포넌트를 렌더링하지 않음
- Intersection Observer를 지원하지 않는 브라우저에서는 활성 하이라이트 기능 비활성화

### 읽기 시간 계산 실패

- 콘텐츠가 비어있거나 유효하지 않은 경우, 읽기 시간을 표시하지 않음
- 계산 중 에러 발생 시, 기본값(예: 1분)으로 폴백
- index.json 생성 중 에러는 로그에 기록하고 해당 포스트는 건너뜀

## 테스트 전략

### 단위 테스트

**유틸리티 함수**:

- `calculateReadingTime`: 다양한 단어 수에 대한 정확한 계산 검증
- `extractHeadings`: MDX AST 파싱 및 헤딩 추출 검증
- `slugify`: 헤딩 텍스트를 유효한 ID로 변환 검증

**컴포넌트**:

- `CopyButton`: 클릭 이벤트 및 클립보드 API 호출 검증
- `TableOfContents`: 헤딩 목록 렌더링 및 링크 생성 검증
- `ReadingTime`: 다양한 분 값에 대한 올바른 형식 표시 검증

### 속성 기반 테스트

**테스트 라이브러리**: `fast-check` (JavaScript/TypeScript용 속성 기반 테스트 라이브러리)

**설정**: 각 속성 기반 테스트는 최소 100회 반복 실행

**테스트 케이스**:

1. **코드 블록 속성 테스트**:
   - 임의의 코드 내용 생성 → 렌더링 → 복사 버튼 존재 확인
   - 임의의 코드 내용 생성 → 복사 → 클립보드 내용 일치 확인
   - 임의의 라인 수 생성 → 라인 넘버 순차성 확인

2. **TOC 속성 테스트**:
   - 임의의 h2/h3 헤딩 생성 → 추출 → 개수 일치 확인
   - 임의의 계층 구조 생성 → TOC 생성 → 계층 보존 확인
   - 임의의 헤딩 생성 → TOC 렌더링 → 모든 항목 클릭 가능 확인

3. **읽기 시간 속성 테스트**:
   - 임의의 단어 수 생성 → 읽기 시간 계산 → 정수 확인
   - 임의의 MDX 콘텐츠 생성 → 처리 → readingTime 필드 존재 확인

### 통합 테스트

- MDX 렌더링 파이프라인 전체 흐름 테스트
- 코드 블록, TOC, 읽기 시간이 함께 작동하는지 검증
- 기존 rehype/remark 플러그인과의 호환성 검증

### E2E 테스트 (Playwright)

- 실제 브라우저에서 복사 버튼 클릭 및 클립보드 확인
- TOC 링크 클릭 시 스크롤 동작 검증
- 모바일 뷰포트에서 TOC 드로어 동작 검증
- 다크/라이트 모드 전환 시 코드 블록 테마 변경 검증

## 성능 고려사항

### 코드 블록

- 라인 넘버는 CSS로 구현하여 DOM 노드 최소화
- 복사 버튼은 클릭 시에만 Clipboard API 호출
- 구문 하이라이팅은 서버 사이드에서 처리 (rehype-highlight)

### TOC

- `extractHeadings`는 서버 사이드에서 한 번만 실행
- Intersection Observer는 효율적인 가시성 감지 제공
- 헤딩 ID는 빌드 시 생성되어 클라이언트 계산 불필요

### 읽기 시간

- 계산은 서버 사이드에서 한 번만 수행
- index.json에 미리 계산된 값 저장하여 클라이언트 계산 불필요
- 단어 수 계산은 정규식으로 효율적으로 처리

## 접근성

### 코드 블록

- 복사 버튼에 `aria-label` 추가: "코드 복사"
- 복사 성공/실패 시 `aria-live` 영역으로 스크린 리더에 알림
- 키보드 네비게이션 지원: Tab으로 복사 버튼 포커스

### TOC

- `<nav>` 요소로 감싸고 `aria-label="목차"` 추가
- 현재 활성 항목에 `aria-current="location"` 추가
- 키보드 네비게이션 지원: Tab으로 TOC 항목 이동, Enter로 선택

### 읽기 시간

- `<time>` 요소 사용 또는 `aria-label`로 의미 전달
- 스크린 리더가 "5분 읽기"를 명확하게 읽을 수 있도록 마크업

## 국제화 (i18n)

### 읽기 시간 텍스트

- 한국어: "1분 읽기", "5분 읽기"
- 일본어: "1分で読めます", "5分で読めます"
- 영어: "1 min read", "5 min read"

### 복사 버튼 텍스트

- 한국어: "복사", "복사됨!", "복사 실패"
- 일본어: "コピー", "コピーしました!", "コピー失敗"
- 영어: "Copy", "Copied!", "Copy failed"

### TOC 제목

- 한국어: "목차"
- 일본어: "目次"
- 영어: "Table of Contents"

## 향후 확장 가능성

### 코드 블록

- 코드 블록 접기/펼치기 기능
- 특정 라인 하이라이트 기능
- 코드 실행 기능 (샌드박스)

### TOC

- TOC 위치 커스터마이징 (왼쪽/오른쪽)
- TOC 스타일 테마 선택
- 헤딩 레벨 필터링 (h2만, h3만 등)

### 읽기 시간

- 사용자별 읽기 속도 커스터마이징
- 이미지/비디오 포함 시 추가 시간 계산
- 읽기 진행률 표시 (스크롤 기반)
