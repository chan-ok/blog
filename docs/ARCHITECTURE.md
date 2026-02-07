# 아키텍처 가이드

## 📋 목차

- [개요](#개요)
- [대상](#대상)
- [리포지터리 구조](#리포지터리-구조)
- [FSD 아키텍처](#fsd-아키텍처)
- [콘텐츠 파이프라인](#콘텐츠-파이프라인)
- [국제화](#국제화)
- [기술 선택 이유](#기술-선택-이유)
- [성능 최적화](#성능-최적화)
- [과거 시행착오](#과거-시행착오)
- [참고 문서](#참고-문서)

## 개요

이 프로젝트는 Next.js 16 기반의 개인 개발 블로그로, **Feature-Sliced Design(FSD)** 아키텍처 패턴을 따릅니다. 콘텐츠와 코드를 분리하여 관리하는 독립적인 리포지터리 구조를 채택하고 있습니다.

## 대상

### ✅ 포함 대상

- 프로젝트 전체 구조를 이해하고 싶은 개발자
- FSD 아키텍처 레이어와 의존성 규칙을 파악하려는 경우
- 콘텐츠 파이프라인 흐름을 이해하려는 경우
- 기술 스택 선택 배경을 알고 싶은 경우

### ❌ 제외 대상

- 개발 환경 설정 및 시작 방법 → [development.md](./development.md) 참고
- AI 에이전트를 위한 코딩 규칙 → [agents.md](./agents.md) 참고
- 프로젝트 이력 및 의사결정 로그 → [project-log.md](./project-log.md) 참고

## 리포지터리 구조

### 이중 리포지터리 전략

#### 지시사항

이 프로젝트는 코드와 콘텐츠를 분리하여 관리합니다:

- **blog**: Next.js 애플리케이션 (UI, 렌더링, 비즈니스 로직)
- **blog-content**: MDX 콘텐츠 저장소 (다국어 포스트)

#### 데이터 흐름

\`\`\`
┌─────────────────────┐ ┌──────────────────────┐
│ blog │ │ blog-content │
│ (Next.js App) │ ◄───── │ (MDX Contents) │
│ │ fetch │ │
│ - UI/UX │ │ - Posts (ko/ja/en) │
│ - 렌더링 │ │ - index.json │
│ - 배포 │ │ │
└─────────────────────┘ └──────────────────────┘
│ │
│ push to main │ push to main
▼ ▼
┌─────────────┐ ┌──────────────────┐
│ Netlify │ │ GitHub Actions │
│ 배포 │ │ 인덱싱 생성 │
└─────────────┘ └──────────────────┘
\`\`\`

#### 예제

**blog (현재 리포지터리)**:

- **역할**: 블로그 애플리케이션
- **기술**: Next.js 16.0.10, React 19.2.3, TypeScript 5, Tailwind CSS v4
- **배포**: Netlify (main 브랜치 자동 배포)
- **URL**: https://chan-ok.com

**blog-content (콘텐츠 리포지터리)**:

- **역할**: MDX 포스트 및 정적 콘텐츠 저장
- **구조**: 다국어 폴더 (ko, ja, en)
- **자동화**: GitHub Actions로 \`index.json\` 자동 생성
- **URL**: https://github.com/chan-ok/blog-content

#### 주의사항

- ⚠️ blog-content는 별도 리포지터리이므로 \`blog/\` 디렉토리에서 콘텐츠 수정 불가
- ⚠️ 콘텐츠 추가 시 blog-content 리포지터리에서 작업 후 \`index.json\` 자동 생성 확인 필수
- ⚠️ 런타임에 GitHub Raw URL로 콘텐츠를 fetch하므로 네트워크 실패 처리 필요

## FSD 아키텍처

### 레이어 의존성

#### 지시사항

Feature-Sliced Design(FSD)는 단방향 의존성을 갖는 5개 레이어로 구성됩니다:

\`\`\`
app → widgets → features → entities → shared
\`\`\`

각 레이어는 자신보다 하위 레이어만 import할 수 있습니다.

#### 디렉토리 구조

\`\`\`
src/
├── app/ # 🗂️ App Layer (라우팅)
│ ├── [locale]/ # 다국어 라우팅
│ ├── globals.css
│ └── layout.tsx
│
├── widgets/ # 🧩 Widget Layer (복합 UI)
│ ├── footer.tsx
│ └── header.tsx
│
├── features/ # 🎯 Feature Layer (비즈니스 기능)
│ ├── about/
│ │ ├── model/
│ │ ├── ui/
│ │ └── util/
│ ├── contact/
│ │ ├── model/
│ │ ├── ui/
│ │ └── util/
│ └── post/
│ ├── ui/
│ └── util/
│
├── entities/ # 📦 Entity Layer (비즈니스 엔티티)
│ └── markdown/
│ ├── model/
│ ├── ui/
│ └── util/
│
├── shared/ # 🛠️ Shared Layer (공유 리소스)
│ ├── components/ # 독립적인 복합 컴포넌트 (유기체 이상)
│ │ ├── reply/
│ │ ├── toggle/
│ │ ├── turnstile/
│ │ └── ui/ # 순수 UI 컴포넌트 (원자, 분자)
│ ├── config/
│ ├── hooks/
│ ├── providers/
│ ├── stores/
│ ├── types/
│ └── util/
│
└── proxy.ts # 언어 감지 프록시
\`\`\`

#### 레이어별 역할

**1️⃣ App Layer (라우팅)**:

- Next.js의 파일 기반 라우팅
- 페이지 컴포넌트는 최소한의 로직만 포함
- 비즈니스 로직은 하위 레이어에 위임
- import 가능: widgets, features, entities, shared

**2️⃣ Widgets Layer (위젯)**:

- 복합 UI 컴포넌트 (여러 features 조합)
- Header, Footer 같은 레이아웃 컴포넌트
- import 가능: features, entities, shared

**3️⃣ Features Layer (기능)**:

- 독립적인 비즈니스 기능 단위
- \`api/\`, \`ui/\`, \`util/\` 서브 디렉토리 구조
- 다른 feature에 의존하지 않음
- import 가능: entities, shared만

**4️⃣ Entities Layer (엔티티)**:

- 비즈니스 도메인 엔티티
- 재사용 가능한 도메인 로직
- import 가능: shared만

**5️⃣ Shared Layer (공유)**:

- 어디서든 사용 가능한 공통 코드
- 다른 레이어에 의존하지 않음
- 유틸리티, 타입, 기본 UI 컴포넌트

**Shared 내부 구조 (Atomic Design 기반)**:

| 디렉토리           | 설명                                    | 예시                 |
| ------------------ | --------------------------------------- | -------------------- |
| \`components/\`    | 독립적인 복합 컴포넌트 (유기체 이상)    | toggle, turnstile    |
| \`components/ui/\` | 순수 프레젠테이션 컴포넌트 (원자, 분자) | Button, Input, Badge |

#### 예제

\`\`\`typescript
// ✅ Good - 올바른 의존성 방향
// src/features/post/ui/card.tsx
import { renderMDX } from '@/entities/markdown'; // entities 사용 OK
import { Button } from '@/shared/components/ui/button'; // shared 사용 OK

// ❌ Bad - 역방향 의존성
// src/shared/util/post-utils.ts
import { PostCard } from '@/features/post'; // ❌ shared → features 불가

// ❌ Bad - features 간 의존성
// src/features/contact/ui/form.tsx
import { PostCard } from '@/features/post'; // ❌ features 간 의존 불가
\`\`\`

#### 주의사항

- ⚠️ 역방향 import 절대 금지 (예: shared → features)
- ⚠️ features/ 간 import 절대 금지 (예: features/post → features/contact)
- ⚠️ 의존성 순환 발생 시 공통 로직을 하위 레이어로 이동

### 새 기능 추가 흐름

#### 지시사항

새로운 기능을 추가할 때 다음 순서를 따릅니다:

1. **Shared에 재사용 가능한 컴포넌트/유틸 추가**
2. **Entities에 도메인 로직 추가** (필요 시)
3. **Features에 비즈니스 기능 구현**
4. **Widgets에서 features 조합** (필요 시)
5. **App에서 라우팅 및 페이지 구성**

#### 예제

"태그 필터링" 기능 추가:

\`\`\`typescript
// 1. Shared - 재사용 가능한 Badge 컴포넌트
// src/shared/components/ui/badge/badge.tsx
export function Badge({ label, onClick }: BadgeProps) {
return <button onClick={onClick}>{label}</button>;
}

// 2. Features - 태그 필터링 기능
// src/features/post/ui/tag-filter.tsx
import { Badge } from '@/shared/components/ui/badge';

export function TagFilter({ tags, onFilter }: TagFilterProps) {
return (

<div>
{tags.map(tag => (
<Badge key={tag} label={tag} onClick={() => onFilter(tag)} />
))}
</div>
);
}

// 3. App - 페이지에서 사용
// src/app/[locale]/posts/page.tsx
import { TagFilter } from '@/features/post/ui/tag-filter';

export default function PostsPage() {
return <TagFilter tags={['react', 'nextjs']} onFilter={handleFilter} />;
}
\`\`\`

## 콘텐츠 파이프라인

### 전체 흐름

#### 지시사항

콘텐츠는 다음 단계로 처리됩니다:

1. 작성자가 blog-content 리포지터리에 MDX 포스트 push
2. GitHub Actions가 main 브랜치 트리거 감지
3. \`generate-index.ts\` 스크립트 실행하여 \`index.json\` 생성
4. blog 애플리케이션이 \`index.json\` fetch (목록 페이지)
5. 필요 시 MDX 파일 fetch (상세 페이지)
6. \`next-mdx-remote-client\`로 런타임 렌더링
7. 사용자에게 렌더링된 페이지 제공

#### 시퀀스 다이어그램

\`\`\`mermaid
sequenceDiagram
participant Writer as 작성자
participant BC as blog-content
participant GHA as GitHub Actions
participant Blog as blog (Next.js)
participant User as 사용자

    Writer->>BC: 1. MDX 포스트 push
    BC->>GHA: 2. main 브랜치 트리거
    GHA->>GHA: 3. generate-index.ts 실행
    GHA->>BC: 4. index.json 커밋

    User->>Blog: 5. 블로그 방문
    Blog->>BC: 6. index.json fetch (GitHub Raw)
    Blog->>BC: 7. MDX 파일 fetch (필요 시)
    Blog->>User: 8. 렌더링된 페이지 제공

\`\`\`

#### 예제

**index.json 구조**:

\`\`\`json
[
{
"id": "nextjs-16-upgrade",
"title": "Next.js 16으로 업그레이드 후기",
"createdAt": "2025-12-06T00:00:00.000Z",
"updatedAt": "2025-12-07T00:00:00.000Z",
"tags": ["nextjs", "react"],
"published": true,
"path": "/nextjs-16-upgrade"
}
]
\`\`\`

**목록 페이지에서 index.json fetch**:

\`\`\`typescript
// src/features/post/api/get-posts.ts
const response = await fetch(
\`\${process.env.NEXT_PUBLIC_GIT_RAW_URL}/\${locale}/index.json\`
);
const posts: PostMetadata[] = await response.json();
\`\`\`

**상세 페이지에서 MDX fetch**:

\`\`\`typescript
// src/features/post/api/get-post-content.ts
const response = await fetch(
\`\${process.env.NEXT_PUBLIC_GIT_RAW_URL}/\${locale}/\${slug}.mdx\`
);
const mdxSource = await response.text();
\`\`\`

#### 주의사항

- ⚠️ \`index.json\`은 GitHub Actions가 자동 생성하므로 수동 수정 금지
- ⚠️ MDX 파일 fetch 실패 시 에러 처리 필수
- ⚠️ Next.js fetch cache를 활용하여 불필요한 재요청 방지

### 페이지네이션

#### 지시사항

목록 페이지에서 페이지네이션을 구현할 때:

- \`index.json\`의 전체 포스트 목록을 클라이언트에서 분할
- URL 쿼리 파라미터로 현재 페이지 관리 (\`?page=2\`)
- 한 페이지당 10개 포스트 표시

#### 예제

\`\`\`typescript
// src/features/post/util/paginate-posts.ts
export function paginatePosts(posts: Post[], page: number, perPage = 10) {
const start = (page - 1) \* perPage;
const end = start + perPage;
return {
items: posts.slice(start, end),
total: posts.length,
totalPages: Math.ceil(posts.length / perPage),
};
}
\`\`\`

## 국제화

### URL 기반 라우팅

#### 지시사항

이 프로젝트는 URL 경로 기반으로 다국어를 지원합니다:

- \`/ko/posts/example\` - 한국어
- \`/ja/posts/example\` - 일본어
- \`/en/posts/example\` - 영어

URL에 locale이 없으면 \`proxy.ts\`가 자동으로 언어를 감지하여 리다이렉트합니다.

#### 언어 감지 프로세스

\`\`\`mermaid
graph TD
A[사용자 접속] --> B{경로에 locale 있음?}
B -->|Yes| C[해당 locale 페이지]
B -->|No| D[proxy.ts]
D --> E{NEXT_LOCALE 쿠키 확인}
E -->|Yes| G[쿠키 언어로 리다이렉트]
E -->|No| F{브라우저 언어 확인}
F -->|Yes| G[감지된 언어로 리다이렉트]
F -->|No| H[기본 언어 ko로 리다이렉트]
\`\`\`

#### 예제

**콘텐츠 구조 (blog-content)**:

\`\`\`
blog-content/
├── ko/
│ ├── post-1.mdx
│ ├── post-2.mdx
│ └── index.json (자동 생성)
├── ja/
│ ├── post-1.mdx
│ └── index.json (자동 생성)
└── en/
├── post-1.mdx
└── index.json (자동 생성)
\`\`\`

**언어 감지 프록시 (proxy.ts)**:

\`\`\`typescript
// src/proxy.ts
export async function GET(request: NextRequest) {
const locale = request.cookies.get('NEXT_LOCALE')?.value
|| detectBrowserLocale(request)
|| 'ko';

return NextResponse.redirect(new URL(\`/\${locale}\`, request.url));
}
\`\`\`

#### 주의사항

- ⚠️ \`NEXT_LOCALE\` 쿠키는 사용자가 언어 토글로 선택한 언어 저장 (영속성)
- ⚠️ 쿠키가 없으면 \`Accept-Language\` 헤더로 브라우저 언어 감지
- ⚠️ 지원하지 않는 언어는 기본 언어(ko)로 폴백

## 기술 선택 이유

### 1. 리포지터리 분리

**결정**: blog와 blog-content 분리

**이유**:

- 콘텐츠 작성과 코드 개발의 독립성
- 배포 파이프라인 분리 (콘텐츠 수정 시 전체 재배포 불필요)
- Git 히스토리 분리로 관리 용이성 증대
- 콘텐츠 작성자와 개발자의 역할 분리 가능

### 2. next-mdx-remote-client 채택

**결정**: 빌드 타임 MDX 대신 런타임 렌더링

**이유**:

- 콘텐츠가 외부 리포지터리에 있어 빌드 타임 접근 불가
- 동적 콘텐츠 로딩 가능 (콘텐츠 수정 시 재배포 불필요)
- Next.js 캐싱 전략으로 성능 보완

**트레이드오프**:

- 빌드 타임 MDX보다 초기 렌더링 느림
- 하지만 fetch cache로 두 번째 요청부터는 빠름

### 3. FSD 아키텍처

**결정**: Feature-Sliced Design 패턴 채택

**이유**:

- 확장 가능한 구조 (새 기능 추가 시 독립적)
- 명확한 의존성 방향 (레이어 간 순환 의존성 방지)
- 팀 협업 시 충돌 최소화
- 기능 단위 재사용 용이

### 4. URL 기반 i18n

**결정**: 쿠키/세션 대신 URL 경로로 언어 관리

**이유**:

- SEO 친화적 (검색 엔진이 언어별 페이지 인덱싱)
- 링크 공유 시 언어 유지 (URL에 locale 포함)
- CDN 캐싱 효율적 (언어별로 다른 캐시 키)
- 명확한 언어 컨텍스트 (URL만 봐도 언어 확인 가능)

**보완**:

- \`NEXT_LOCALE\` 쿠키로 사용자 선택 언어 저장 (영속성)
- 쿠키가 없으면 브라우저 언어 자동 감지

## 성능 최적화

### 1. React Compiler

React 19의 자동 최적화를 활용하여 수동 메모이제이션을 최소화합니다.

\`\`\`typescript
// ❌ Bad - 불필요한 useMemo
const sortedPosts = useMemo(
() => posts.sort((a, b) => b.createdAt - a.createdAt),
[posts]
);

// ✅ Good - React Compiler가 자동 최적화
const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
\`\`\`

### 2. 폰트 최적화

Google Fonts의 \`preload: true\` 설정과 서브셋 로딩:

\`\`\`typescript
// src/app/layout.tsx
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKR = Noto_Sans_KR({
subsets: ['latin'],
weight: ['400', '700'],
preload: true,
});
\`\`\`

### 3. 이미지 최적화

\`next/image\`를 사용하여 WebP/AVIF 자동 변환 및 Lazy loading:

\`\`\`typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  loading="lazy"
/>
\`\`\`

### 4. 코드 스플리팅

라우트 기반 자동 분할 및 동적 import:

\`\`\`typescript
import dynamic from 'next/dynamic';

const ContactForm = dynamic(() => import('@/features/contact/ui/form'), {
loading: () => <p>Loading...</p>,
});
\`\`\`

### 5. 데이터 캐싱

Next.js fetch cache로 \`index.json\` 캐싱:

\`\`\`typescript
const response = await fetch(url, {
next: { revalidate: 3600 }, // 1시간 캐싱
});
\`\`\`

## 과거 시행착오

### 1. Contact 봇 스팸 문제

**문제**: Contact 폼에 봇 스팸 발생

**시도**:

- ❌ Honeypot 필드만 사용 → 고급 봇에게 무용지물
- ❌ reCAPTCHA → 사용자 경험 저하 (이미지 선택 불편)

**해결**:

- ✅ Cloudflare Turnstile 도입 → 봇 차단 + 사용자 경험 유지
- ✅ Rate limiting (Netlify Functions) → API 남용 방지

### 2. 쿠키 영속성 문제

**문제**: 언어 선택 후 새로고침 시 기본 언어로 돌아감

**시도**:

- ❌ localStorage 사용 → SSR 환경에서 접근 불가
- ❌ URL 쿼리 파라미터 → SEO에 불리

**해결**:

- ✅ \`NEXT_LOCALE\` 쿠키 도입 → 서버/클라이언트 모두 접근 가능
- ✅ \`proxy.ts\`에서 쿠키 우선 확인 → 브라우저 언어는 폴백

### 3. MDX 렌더링 문제

**문제**: 외부 리포지터리 MDX를 빌드 타임에 처리 불가

**시도**:

- ❌ Git submodule → 빌드마다 submodule update 필요 (복잡)
- ❌ 빌드 시 blog-content clone → CI 시간 증가

**해결**:

- ✅ \`next-mdx-remote-client\`로 런타임 렌더링
- ✅ GitHub Raw URL로 fetch → 간단하고 빠름
- ✅ Next.js fetch cache로 성능 보완

## 참고 문서

- [agents.md](./agents.md) - AI 코딩 에이전트 가이드
- [development.md](./development.md) - 개발 환경 설정 및 시작 가이드
- [project-log.md](./project-log.md) - 프로젝트 이력 및 의사결정 로그
