# Chanho.dev DESIGN.md

version: 2
name: chanho-dev-neutral-editorial-blog
description: 무채색 canvas, 잉크 대비, 세리프 중심의 정적 에디토리얼 블로그 디자인 시스템. 색채 장식을 제거하고 현재 블로그의 책 같은 읽기 경험을 더 선명하게 유지한다.

## 1. Visual Theme & Atmosphere

### 방향

이 블로그는 개발자의 지식, 사유, 기록을 오래 읽히는 문서처럼 보여주는 정적 블로그다. 첫인상은 차분하고 선명해야 하며, 인터페이스는 글을 방해하지 않아야 한다.

- **Neutral editorial**: 차가운 개발자 대시보드가 아니라 무채색 표면, 잉크, 여백, 조용한 강조를 기반으로 한다.
- **Static-first**: 과한 애니메이션, 유리 질감, floating card, gradient hero를 사용하지 않는다.
- **Reading-first**: 포스트 상세, 목록, 태그, 목차는 장식보다 스캔성과 읽기 흐름을 우선한다.
- **Quiet but precise**: 색채는 절제하지만 레이아웃은 정확하고, 컴포넌트 상태는 명확해야 한다.

### Reference 해석

외부 디자인 레퍼런스에서는 clean editorial layout과 정적 문서 감각만 가져온다. 색상은 브랜드나 특정 hue를 따르지 않고 무채색으로 재해석한다.

- CTA, 활성 상태, 링크 hover, 중요한 구분은 `--accent` 계열을 쓰되 모든 값은 무채색으로 유지한다.
- canvas는 흰색, 회색, 검정 사이의 계조로만 구성한다.
- serif display는 제목과 본문 중심으로 사용하되, 코드와 UI 보조 정보는 monospace/sans를 허용한다.
- dark mode도 hue가 섞이지 않은 charcoal과 off-white 텍스트로 유지한다.

## 2. Color Palette & Roles

Tailwind v4 토큰은 `src/app/globals.css`의 CSS custom properties를 기준으로 관리한다. 기존 토큰명은 유지하되, 다음 색상 방향으로 조정한다.

### Light Mode

| Token             | Hex       | Role                                   |
| ----------------- | --------- | -------------------------------------- |
| `--bg`            | `#fafafa` | 전체 페이지 배경, 밝은 neutral canvas  |
| `--bg2`           | `#f2f2f2` | blockquote, code wrapper, subtle panel |
| `--ink`           | `#111111` | 제목, 주요 텍스트, 강한 테두리         |
| `--ink2`          | `#3d3d3d` | 본문, 보조 제목                        |
| `--ink3`          | `#6f6f6f` | 날짜, 태그, caption, secondary nav     |
| `--rule`          | `#d8d8d8` | 구분선, 약한 테두리                    |
| `--accent`        | `#2f2f2f` | CTA, 활성 상태, 강조 링크              |
| `--accent-strong` | `#111111` | hover, pressed, error emphasis         |
| `--accent-soft`   | `#e8e8e8` | badge, selected background             |
| `--code-bg`       | `#1f1f1f` | code block surface                     |
| `--code-ink`      | `#f5f5f5` | code block foreground                  |

### Dark Mode

| Token             | Hex       | Role                                   |
| ----------------- | --------- | -------------------------------------- |
| `--bg`            | `#111111` | 전체 dark canvas                       |
| `--bg2`           | `#1f1f1f` | blockquote, code wrapper, subtle panel |
| `--ink`           | `#f5f5f5` | 제목, 주요 텍스트                      |
| `--ink2`          | `#d4d4d4` | 본문                                   |
| `--ink3`          | `#a3a3a3` | 날짜, 태그, caption                    |
| `--rule`          | `#3a3a3a` | 구분선, 약한 테두리                    |
| `--accent`        | `#e5e5e5` | CTA, 활성 상태, 강조 링크              |
| `--accent-strong` | `#ffffff` | hover, focus, error emphasis           |
| `--accent-soft`   | `#2a2a2a` | badge, selected background             |
| `--code-bg`       | `#0f0f0f` | code block surface                     |
| `--code-ink`      | `#f5f5f5` | code block foreground                  |

### Color Rules

- 기본 화면은 `--bg`, `--ink`, `--rule`만으로도 성립해야 한다.
- `--accent`는 hue가 아니라 명도 대비를 통한 강조로만 사용한다.
- 성공/경고/위험 callout은 색상 hue로 구분하지 않는다. 아이콘, 제목, border 강도, neutral accent만 사용한다.
- 파랑, 보라, 초록, 노랑, 주황, 빨강 같은 chromatic hue와 gradient는 이 블로그의 기본 디자인 언어가 아니다.

## 3. Typography Rules

현재 블로그의 세리프 중심 방향을 유지한다. 다국어 블로그이므로 한국어, 일본어, 영어가 모두 안정적으로 보여야 한다.

### Font Families

| Role               | Stack                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| Serif body/display | `'Noto Serif KR', 'Noto Serif JP', 'Noto Serif', serif`               |
| UI sans fallback   | `Inter, ui-sans-serif, system-ui, sans-serif`                         |
| Code               | `JetBrains Mono, 'SFMono-Regular', Consolas, ui-monospace, monospace` |

### Type Scale

| Token        |   Size | Weight | Line Height | Use                     |
| ------------ | -----: | -----: | ----------: | ----------------------- |
| `display-lg` | `40px` |  `700` |      `1.18` | 홈 소개, 큰 페이지 제목 |
| `display-md` | `32px` |  `700` |      `1.25` | 포스트 상세 제목        |
| `title-lg`   | `24px` |  `700` |      `1.35` | 섹션 제목               |
| `title-md`   | `20px` |  `700` |      `1.45` | MDX h2, 카드 제목       |
| `title-sm`   | `16px` |  `600` |      `1.45` | 목록 제목, h3           |
| `body`       | `16px` |  `400` |       `2.0` | 포스트 본문             |
| `body-sm`    | `14px` |  `400` |       `1.7` | 보조 설명               |
| `caption`    | `11px` |  `500` |       `1.4` | 날짜, 태그, 메타        |
| `label`      | `10px` |  `600` |       `1.4` | uppercase section label |
| `code`       | `14px` |  `400` |      `1.65` | inline/pre code         |

### Typography Rules

- 본문은 line-height `1.9-2.1`을 유지한다.
- section label은 uppercase, letter-spacing `0.14em-0.22em` 범위만 사용한다.
- 본문 문단 폭은 포스트 상세 기준 `620px` 전후로 제한한다.
- hero-scale 타입은 홈 첫 화면과 페이지 대표 제목에만 사용한다.
- 버튼, 토글, compact nav 내부에서는 작은 크기와 안정적인 line-height를 사용한다.

## 4. Layout Principles

### Page Widths

| Area                     |          Max Width |
| ------------------------ | -----------------: |
| Masthead/nav inner       |            `960px` |
| Home editorial intro     |            `680px` |
| Post list                |            `760px` |
| Post reading column      |            `620px` |
| Code/table overflow area | `min(100%, 760px)` |

### Spacing

| Token      |  Value | Use                       |
| ---------- | -----: | ------------------------- |
| `space-1`  |  `4px` | tiny icon gap             |
| `space-2`  |  `8px` | compact controls          |
| `space-3`  | `12px` | nav padding, chip padding |
| `space-4`  | `16px` | list row inner spacing    |
| `space-6`  | `24px` | component block spacing   |
| `space-8`  | `32px` | section inner spacing     |
| `space-12` | `48px` | page section gap          |
| `space-16` | `64px` | page top/bottom rhythm    |
| `space-24` | `96px` | major editorial section   |

### Layout Rules

- 페이지 섹션은 full-width band 또는 단일 column layout으로 둔다.
- 반복 항목만 card로 취급한다. page section을 floating card처럼 만들지 않는다.
- 카드 안에 카드를 중첩하지 않는다.
- mobile에서는 좌우 padding `20px-24px`, desktop에서는 `32px-80px` 범위로 둔다.
- 화면 상단에는 브랜드 마스트헤드, navigation, 읽기 흐름이 명확히 보여야 한다.

## 5. Component Styling

### Header / Masthead

- 배경은 `--bg`, 텍스트는 `--ink`.
- 하단 border는 기본보다 강하게 둔다. 예: `2px solid var(--ink)`.
- 로고는 중앙 정렬, uppercase, 넓은 letter spacing을 유지한다.
- tagline은 작은 caption으로 유지한다. 색은 `--ink3`.
- scroll blur, glassmorphism, floating shadow는 사용하지 않는다.
- 포스트 상세의 immersive reader에서는 header hide/show만 허용한다.

### Navigation

- nav item은 작은 uppercase label로 구성한다.
- active 상태는 `--ink` 배경 + `--bg` 텍스트 또는 neutral `--accent` underline 중 하나만 사용한다.
- hover는 배경 반전이나 neutral underline처럼 즉시 이해되는 효과를 사용한다.
- 토글 버튼은 아이콘 중심으로 두고, label을 화면에 길게 노출하지 않는다.

### Buttons

| Variant   | Style                                                      |
| --------- | ---------------------------------------------------------- |
| Primary   | neutral `--accent` background, light text, 8px radius 이하 |
| Secondary | transparent or `--bg2`, `--rule` border, `--ink` text      |
| Text link | transparent, neutral `--accent` text, underline on hover   |
| Danger    | red fill을 쓰지 않고 `--accent-strong` border/text 우선    |

Rules:

- 버튼 radius는 `8px` 이하를 기본으로 한다.
- CTA가 아닌 버튼은 색면을 과하게 쓰지 않는다.
- focus-visible은 반드시 보인다. `outline` 또는 `ring`은 neutral `--accent` 계열을 사용한다.

### Post List Item

목차형 목록을 기본으로 한다.

- 번호: `caption`, `--ink3`, tabular 느낌.
- 제목: `title-sm`, `--ink`, hover underline.
- 태그/날짜: `caption`, `--ink3`.
- 행 구분선: `1px solid var(--rule)`.
- 이미지를 기본 목록 카드에 넣지 않는다.

### Post Detail

- title 위에는 category/tag label을 작게 배치할 수 있다.
- title 아래 metadata는 한 줄 또는 두 줄로 정리한다.
- 본문 시작 전 여백은 충분히 둔다. 최소 `40px`.
- TOC는 보조 도구다. 본문보다 시각적으로 강하면 안 된다.
- scroll progress bar는 얇고 조용하게 유지한다. neutral accent를 써도 높이는 `2px-3px`.

### Markdown Content

#### Headings

- h1: 강한 border-bottom, 넓은 top padding.
- h2: 약한 border-bottom, 충분한 top padding.
- h3 이하: border 없이 텍스트 위계로 구분한다.

#### Paragraph

- 문단 간격은 `1.1em-1.4em`.
- 긴 기술 문서도 답답하지 않게 line-height를 넉넉하게 둔다.

#### Blockquote

- 좌측 `3px` border.
- background는 `--bg2`.
- italic은 일반 인용에만 사용한다.
- callout은 italic을 쓰지 않는다.

#### Code

- inline code는 `--bg2` 배경, 작은 padding, `4px-6px` radius.
- code block은 dark-friendly surface를 사용하되 페이지 전체보다 강한 검정 덩어리가 되지 않게 한다.
- code block 안의 line-height는 `1.6` 이상.

#### Tables

- horizontal overflow를 허용한다.
- header row는 `--bg2`.
- border는 `--rule`.
- zebra striping은 쓰지 않거나 매우 약하게 둔다.

### Tags / Badges

- tag chip은 작은 border 또는 `--accent-soft` 배경을 사용한다.
- radius는 `999px`보다 `6px-8px`를 우선한다. pill은 필터 UI처럼 의미가 있을 때만 사용한다.
- 태그 색을 여러 hue로 나누지 않는다.

### Forms

- input background는 `--bg`, border는 `--rule`.
- focused 상태는 `--accent` border/ring.
- error는 붉은 면보다 명확한 텍스트와 border로 표시한다.
- Turnstile, 외부 위젯 주변은 여백을 충분히 둔다.

## 6. Depth & Elevation

이 블로그는 그림자보다 border와 여백으로 깊이를 만든다.

- 기본 shadow는 사용하지 않는다.
- card hover에서 lift, scale, glow를 사용하지 않는다.
- 필요한 경우 `0 1px 2px rgba(0, 0, 0, 0.06)` 이하의 매우 약한 shadow만 허용한다.
- dark mode에서 glow나 neon border를 사용하지 않는다.

## 7. Responsive Behavior

### Breakpoints

| Range          | Behavior                                                    |
| -------------- | ----------------------------------------------------------- |
| `< 640px`      | 단일 column, nav overflow 없이 wrapping 또는 compact layout |
| `640px-1024px` | 읽기 폭 유지, nav와 목록 간격 확장                          |
| `> 1024px`     | post detail에서 TOC side rail 허용                          |

### Mobile Rules

- 터치 타깃은 최소 `40px`, 권장 `44px`.
- nav item text가 겹치면 item 수를 줄이지 말고 padding/font-size를 조정한다.
- 제목은 viewport width 기반으로 무작정 키우지 않는다.
- 긴 단어, URL, code는 overflow-wrap 또는 scroll container로 처리한다.

## 8. Motion & Interaction

- 기본 transition은 `150ms-220ms ease`.
- header immersive hide/show는 `300ms ease-in-out`까지 허용한다.
- hover 효과는 색, underline, border 변화 중심으로 제한한다.
- scroll reveal, parallax, bouncy spring, background blob animation은 사용하지 않는다.
- `prefers-reduced-motion`을 존중한다.

## 9. Do's and Don'ts

### Do

- 무채색 배경과 잉크색 텍스트를 우선한다.
- neutral accent는 중요한 행동과 현재 위치를 알려줄 때만 쓴다.
- 포스트 목록은 목차처럼 빠르게 스캔되게 만든다.
- MDX 본문은 긴 글을 기준으로 읽기 폭과 행간을 검증한다.
- 기존 FSD 구조와 Tailwind v4 token 방식을 따른다.

### Don't

- Claude 브랜드 자산, 로고, 고유 마크를 복제하지 않는다.
- gradient orb, bokeh, glassmorphism, neon glow를 쓰지 않는다.
- 카드형 랜딩 페이지처럼 첫 화면을 구성하지 않는다.
- 포스트 목록을 이미지 중심 masonry나 marketing card grid로 바꾸지 않는다.
- 한 화면을 특정 hue 계열로 채우지 않는다.
- 문서형 블로그에 맞지 않는 SaaS dashboard density를 가져오지 않는다.

## 10. Agent Prompt Guide

이 프로젝트에서 UI를 수정하는 에이전트는 다음 기준을 따른다.

1. `DESIGN.md`를 먼저 읽고, `src/app/globals.css`의 토큰을 우선 수정한다.
2. 기존 컴포넌트 구조와 FSD 레이어 규칙을 유지한다.
3. 새 시각 효과를 추가하기 전에 현재 목적이 읽기 경험인지, 탐색인지, 입력인지 구분한다.
4. 색상 추가가 필요하면 먼저 무채색 `--accent`, `--accent-strong`, `--accent-soft` 안에서 해결한다.
5. 구현 후 light/dark, mobile/desktop, 긴 제목, 긴 태그, 긴 코드 블록을 확인한다.

### Ready-to-use Direction

> Build a neutral static editorial developer blog UI. Use achromatic canvas surfaces, dark ink text, grayscale accents, serif-first typography, precise borders, quiet navigation, and reading-first layouts. Avoid chromatic hues, gradients, glassmorphism, floating cards, neon, and marketing-style hero composition.

## 11. Source Notes

- getdesign.md Claude analysis: clean editorial layout과 정적 문서 감각만 참고하고, 색상은 무채색으로 재해석했다.
- VoltAgent/awesome-design-md: DESIGN.md는 에이전트가 시각 언어를 일관되게 읽기 위한 markdown design system 문서라는 용도를 참고했다.
- 이 문서는 Claude/Anthropic의 공식 디자인 시스템이 아니며, 브랜드 복제가 아니라 개인 블로그에 맞춘 참고 번역이다.
