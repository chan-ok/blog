# 블로그 디자인 개편 스펙

**작성일:** 2026-04-11  
**상태:** 승인됨  
**대상 브랜치:** develop

---

## 개요

현재 블로그의 일반적인 AI 생성 느낌을 탈피하여, 책을 읽는 듯한 몰입감과 개성 있는 에디토리얼 스타일로 전면 개편한다. 세 개의 독립 프로젝트로 구성되며, 순서대로 구현한다.

---

## 프로젝트 1 — 디자인 전면 개편 (Book Aesthetic)

### 색상 팔레트

| 토큰     | 라이트    | 다크      | 용도             |
| -------- | --------- | --------- | ---------------- |
| `--bg`   | `#f7f8fa` | `#12141a` | 페이지 배경      |
| `--bg2`  | `#f0f1f4` | `#1c1f28` | 인용구·코드 배경 |
| `--ink`  | `#0f1117` | `#e8eaf0` | 제목·강조 텍스트 |
| `--ink2` | `#3a3d47` | `#a8acba` | 본문 텍스트      |
| `--ink3` | `#8a8e9a` | `#6a6e7e` | 메타·보조 텍스트 |
| `--rule` | `#e2e4ea` | `#2a2e3a` | 구분선·테두리    |

색상 포인트(파랑, 초록 등) 전면 제거. 흑백·회색 계열만 사용.

### 폰트

```css
font-family: 'Noto Serif KR', 'Noto Serif JP', 'Noto Serif', serif;
```

- **한국어:** Noto Serif KR
- **일본어:** Noto Serif JP
- **영어/라틴:** Noto Serif
- 세 언어 모두 세리프 계열로 통일
- Google Fonts에서 400·600·700 weight 로드
- 기존 Inter, Noto Sans KR, Noto Sans JP 제거

### 헤더 — 중앙 마스트헤드

```
┌─────────────────────────────────────────┐
│           CHANHO.DEV                    │  ← 중앙, 대문자, 자간 넓게
│         개발 · 사유 · 기록               │  ← 소tagline
├──────┬──────┬──────┬──────┬─────────────┤
│ABOUT │POSTS │SERIES│CNTCT │ 🌙          │  ← 구분선 nav
└──────┴──────┴──────┴──────┴─────────────┘
```

- 로고: 대문자, letter-spacing 8px, 32px, 700 weight
- tagline: 10px, letter-spacing 2.5px
- nav: 소문자 대신 uppercase, 11px, letter-spacing 1.5px
- 하단 구분선: `2px solid var(--ink)` (헤더 하단)
- nav 항목 간 세로 구분선: `1px solid var(--rule)`
- 활성 항목: `background: var(--ink); color: var(--bg)` (반전)
- 스크롤 시 floating/blur 효과 제거 — 항상 심플하게 유지

**메뉴 구성 (신규):**

- About
- Posts
- **Series** (신규 — 기존 없던 메뉴)
- Contact

### 홈 화면 — 에디토리얼 표지

헤더 아래 단일 컬럼 구성:

```
[소개 레이블]         ← 9px, letter-spacing 4px, 대문자
[큰 소개 문구]        ← 32~36px, 세리프, 2~3줄
[한 단락 본문]        ← 15~16px, line-height 2.0
────────────────────  ← 구분선
[최근 글 레이블]      ← 9px, letter-spacing 4px
[목차형 글 목록]      ← 번호 · 제목 · 태그 · 날짜
```

- 최대 너비: 680px, 중앙 정렬
- 상하 패딩: 64px
- 최근 글 5~7개 표시

### 포스트 목록 — 목차형 (Table of Contents)

이미지 없음. 텍스트만으로 구성:

```
All Posts                              12 articles
──────────────────────────────────────────────────
01  오래된 책을 꺼냈을 때의 설렘에 대하여          2026.03
    일상 · 독서
──────────────────────────────────────────────────
02  React 19 컴파일러를 프로덕션에 적용하며        2026.02
    개발 · React
```

- 번호: 2자리 `01`, `02`... 9px, 회색
- 제목: 16px, 600 weight
- 태그·날짜: 10px, `var(--ink3)`
- 행 간격: 상하 패딩 16px
- 행 구분선: `1px solid var(--rule)`
- 헤더 구분선: `1px solid var(--rule)` (굵기 차별화)

기존 `PostCard` 컴포넌트의 `basic`, `compact`, `simple` variant는 모두 새 목차형으로 교체.

### 포스트 상세 — 읽기 뷰

```
[카테고리 레이블]   ← 9px, 대문자
[글 제목]          ← 32px, 700, line-height 1.28
[날짜 | 읽기시간 | 태그]  ← 구분선
                    ← 48px 여백
[본문]              ← 16px, line-height 2.1, max-width 620px
```

- 읽기 컬럼 최대 너비: 620px (마스트헤드 680px보다 좁게)
- 좌우 패딩: 80px (데스크탑 기준)
- 본문 폰트: 16px, line-height 2.1
- 제목-본문 사이 구분선: `1px solid var(--ink)` (강조)

### 마크다운 컴포넌트 스타일

**Blockquote:**

```
border-left: 3px solid var(--ink)
background: var(--bg2)
padding: 20px 28px
font-style: italic
font-size: 15px, line-height 1.9
```

콜아웃(`[!INFO]`, `[!WARNING]` 등) — 기존 색상(파랑, 노랑 등) 제거, 흑백 계열로 통일:

- INFO: `var(--bg2)` 배경, `var(--ink)` 테두리
- WARNING: 동일 (아이콘으로만 구분)
- DANGER: 동일
- SUCCESS: 동일

**Heading:**

- h1: 28px, border-bottom `1px solid var(--ink)`, pt-16, mb-6
- h2: 22px, border-bottom `1px solid var(--rule)`, pt-12, mb-4
- h3: 18px, pt-10, mb-4 (구분선 없음)

**태그 칩:**

- 테두리만: `border: 1px solid var(--rule)`
- 색상 없음, `var(--ink3)` 텍스트
- border-radius 제거 (사각형)

---

## 프로젝트 2 — 몰입형 읽기 모드

포스트 상세 페이지(`/$locale/posts/$`)에만 적용.

### 동작 규칙

| 조건                         | 동작                                |
| ---------------------------- | ----------------------------------- |
| 스크롤 다운 (200px 이상)     | 헤더 숨김 (slide-up 애니메이션)     |
| 스크롤 업                    | 헤더 재표시 (slide-down 애니메이션) |
| 페이지 최상단 (scrollY < 50) | 항상 헤더 표시                      |
| 포스트 상세 외 페이지        | 기존 동작 유지                      |

### 구현 방식

- `useImmersiveReader` 훅 신규 작성 (`5-shared/hooks/`)
  - 현재 라우트가 포스트 상세인지 감지
  - 스크롤 방향(up/down) 감지
  - `isHidden: boolean` 반환
- 헤더에서 `isHidden` 상태에 따라 `translate-y-[-100%]` 적용
- 애니메이션: `transition: transform 300ms ease`
- ScrollProgressBar는 헤더와 독립적으로 항상 표시 유지

### 숨김 대상

- 헤더 전체
- 모바일 TOC (본문 상단 표시되는 것)
- 데스크탑 TOC는 사이드바이므로 유지

---

## 프로젝트 3 — Series 메뉴 (큐레이션)

### 개념

내가 작성한 글(Posts)과 외부 스크랩 자료를 하나의 주제로 묶어 발행하는 큐레이션 단위.

```
Series
└── "FSD 아키텍처 탐구"
    ├── [내 글] FSD를 6개월 쓰고 난 후기
    ├── [스크랩] Feature Sliced Design 공식 문서
    └── [스크랩] Dan Abramov의 설계 철학
```

### 데이터 구조

`blog-content` 리포지터리에 `series/index.json` 추가:

```json
[
  {
    "slug": "fsd-architecture",
    "title": "FSD 아키텍처 탐구",
    "description": "Feature-Sliced Design을 실무에 적용하면서 배운 것들",
    "createdAt": "2026-03-01",
    "items": [
      {
        "type": "post",
        "path": "ko/fsd-retrospective",
        "title": "FSD를 6개월 쓰고 난 후기"
      },
      {
        "type": "scrap",
        "url": "https://feature-sliced.design/docs",
        "title": "Feature Sliced Design 공식 문서",
        "comment": "공식 문서 중 Architecture 섹션이 핵심"
      }
    ]
  }
]
```

### 페이지 구성

**`/series`** — 시리즈 목록:

- 목차형 스타일 동일하게 적용
- 번호 · 시리즈 제목 · 항목 수 · 날짜

**`/series/:slug`** — 시리즈 상세:

- 시리즈 제목 + 설명
- 글 목록 (내 글: 내부 링크 / 스크랩: 외부 링크 + 한 줄 코멘트)
- 내 글 vs 스크랩 시각적 구분 (아이콘 또는 레이블)

### FSD 레이어 배치

- `2-features/series/` 신규 생성
  - `model/series.schema.ts` — 타입 정의
  - `util/get-series.ts` — fetch 로직
  - `ui/series-list.tsx`, `ui/series-detail.tsx`
- `4-pages/$locale/series/index.tsx`, `4-pages/$locale/series/$slug.tsx`

---

## 구현 순서

1. **프로젝트 1** — 디자인 개편
   - globals.css: 폰트, CSS 변수
   - Header: 마스트헤드로 교체, 메뉴 추가
   - 홈 화면: 에디토리얼 표지 레이아웃
   - PostCard → TOC형 목록 컴포넌트로 교체
   - 마크다운 컴포넌트 스타일 업데이트 (typography, blockquote, tag-chip)

2. **프로젝트 2** — 몰입형 읽기 모드
   - `useImmersiveReader` 훅
   - Header에 연결
   - 포스트 상세 페이지 통합

3. **프로젝트 3** — Series 기능
   - 데이터 스키마 설계
   - fetch 유틸
   - UI 컴포넌트
   - 라우트 추가

---

## 비고

- 다크모드: 기존 토글 유지. CSS 변수로 자동 전환.
- 반응형: 모바일에서 마스트헤드는 로고+nav 간소화 (tagline 숨김)
- `blog-content` 리포지터리 변경은 별도로 진행 (Series 데이터 추가)
- 기존 테스트 유지. 컴포넌트 교체 시 스냅샷 테스트 업데이트.
