---
priority: P1
title: Next.js → TanStack Router 마이그레이션 상세 계획
description: CSR Only 방식의 기술 문서 및 구현 가이드 (참조용)
created: 2026-02-07
updated: 2026-02-07
version: 2.0.0
status: reference
related:
  - P0-migration-checklist.md
  - ../architecture.md
  - ../development.md
references:
  - https://tanstack.com/router
  - https://vitejs.dev/
  - https://sharp.pixelplumbing.com/
---

# 🚀 Next.js → TanStack Router (CSR) 마이그레이션 계획

> **작성일**: 2026-02-07  
> **버전**: 2.0.0 (CSR Only)  
> **대상 프로젝트**: Chanho's Dev Blog

**✅ 실행 체크리스트**: [P0-migration-checklist.md](./P0-migration-checklist.md)

---

## 📋 마이그레이션 개요

### 목표

- **From**: Next.js 16 (App Router, SSR)
- **To**: TanStack Router + Vite (CSR Only)
- **배포**: Netlify 유지 (정적 호스팅 + Functions)
- **이유**:
  - Next.js 의존성 감소
  - MDX 처리 자유도 향상
  - 학습 곡선 개선
  - 구현 복잡도 감소 (SSR 제거)

### 예상 작업 기간

- **기본 마이그레이션**: 1-2주
- **테스트 및 최적화**: 1주
- **총 예상 기간**: 2-3주

### 주요 결정 사항

- ✅ **CSR Only**: TanStack Start 사용 안 함 (안정성 우선)
- ✅ **Netlify Functions 유지**: 보안 로직 (Turnstile, 메일 전송)
- ✅ **Sharp 이미지 최적화**: 빌드 시 수동 최적화
- ✅ **Google Fonts 웹폰트**: 영어, 한국어, 일본어 지원
- ✅ **SEO**: 현재 고려 대상 아님 (개인 블로그)

---

## 🔍 현재 구조 분석 요약

### Next.js 의존적인 부분 (제거 대상)

1. **App Router**: `app/[locale]/` 구조 → TanStack Router 파일 기반 라우팅
2. **서버 컴포넌트**: `'use server'` 지시어 → 제거
3. **generateStaticParams**: 정적 생성 경로 → 제거 (CSR)
4. **ISR**: `revalidate: 60` → 클라이언트 캐싱으로 대체
5. **next/image**: 이미지 최적화 → Sharp + `<picture>` 태그
6. **next/font**: Google Fonts 최적화 → 웹폰트 직접 로드
7. **next/script**: Cloudflare Turnstile → 일반 `<script>` 태그
8. **Metadata API**: SEO 메타데이터 → 일반 HTML 메타 태그
9. **Next.js Link**: 클라이언트 라우팅 → TanStack Router Link

### Next.js 독립적인 부분 (그대로 유지)

1. ✅ **FSD 아키텍처**: features, entities, shared, widgets
2. ✅ **Zustand 상태 관리**: theme-store, locale-store
3. ✅ **i18next 다국어**: ko/en/ja 지원
4. ✅ **Tailwind CSS**: 스타일링
5. ✅ **Vitest/Playwright**: 테스트
6. ✅ **Storybook**: 컴포넌트 문서화
7. ✅ **Netlify Functions**: API 엔드포인트 (Contact 폼)
8. ✅ **MDX 처리**: @mdx-js/mdx로 대체

---

## 📦 의존성 변경 계획

### 제거할 패키지

```bash
pnpm remove next next-mdx-remote-client eslint-config-next @netlify/plugin-nextjs @storybook/nextjs-vite
```

### 추가할 패키지

```bash
# 라우터
pnpm add @tanstack/react-router @tanstack/router-devtools

# 빌드 도구
pnpm add -D vite @vitejs/plugin-react vite-tsconfig-paths @tanstack/router-vite-plugin

# MDX
pnpm add @mdx-js/mdx @mdx-js/react

# 이미지 최적화
pnpm add -D sharp vite-plugin-image-optimizer

# Storybook
pnpm add -D @storybook/react-vite
```

**의존성 요약**:

```json
{
  "dependencies": {
    "@tanstack/react-router": "^1.x.x",
    "@tanstack/router-devtools": "^1.x.x",
    "@mdx-js/mdx": "^3.x.x",
    "@mdx-js/react": "^3.x.x"
  },
  "devDependencies": {
    "vite": "^6.x.x",
    "@vitejs/plugin-react": "^4.x.x",
    "vite-tsconfig-paths": "^5.x.x",
    "@tanstack/router-vite-plugin": "^1.x.x",
    "sharp": "^0.33.x",
    "vite-plugin-image-optimizer": "^1.x.x",
    "@storybook/react-vite": "^10.x.x"
  }
}
```

---

## 🗂️ 디렉토리 구조 변경

### Before (Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── posts/
│   │       ├── page.tsx
│   │       └── [...slug]/page.tsx
│   └── globals.css
└── proxy.ts
```

### After (TanStack Router)

```
src/
├── routes/
│   ├── __root.tsx           # Root layout
│   ├── index.tsx            # / → /$locale 리다이렉트
│   ├── $locale.tsx          # Locale layout
│   └── $locale/
│       ├── index.tsx        # /$locale (홈)
│       ├── about.tsx        # /$locale/about
│       ├── contact.tsx      # /$locale/contact
│       └── posts/
│           ├── index.tsx    # /$locale/posts
│           └── $.tsx        # /$locale/posts/* (catch-all)
├── features/
├── entities/
├── shared/
├── widgets/
├── styles/
│   └── globals.css
└── main.tsx                 # 앱 엔트리포인트
```

---

## 🔄 주요 기능 매핑

### 1. 라우팅

#### Next.js (SSR)

```tsx
// app/[locale]/posts/[...slug]/page.tsx
'use server';
export default async function PostDetailPage(props) {
  const { locale, slug } = await props.params;
  const markdown = await getMarkdown([locale, ...slug].join('/') + '.mdx');
  return <MDXComponent source={markdown.source} />;
}
```

#### TanStack Router (CSR)

```tsx
// src/routes/$locale/posts/$.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/posts/$')({
  // Loader: 클라이언트에서 데이터 fetch
  loader: async ({ params }) => {
    const { locale, _splat } = params;
    const path = `${locale}/${_splat}.mdx`;
    const markdown = await getMarkdown(path);
    return { markdown };
  },
  component: PostDetailPage,
});

function PostDetailPage() {
  const { markdown } = Route.useLoaderData();
  return <MDXComponent source={markdown.source} />;
}
```

**차이점**:

- ❌ SSR 제거: 서버에서 사전 렌더링 안 함
- ✅ 클라이언트 Loader: 브라우저에서 데이터 fetch
- ✅ 코드 간결: `'use server'`, `await props.params` 불필요

---

### 2. 레이아웃

#### Next.js

```tsx
// app/[locale]/layout.tsx
export default function LocaleLayout({ children, params }) {
  return (
    <ThemeProvider>
      <LocaleProvider locale={params.locale}>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
```

#### TanStack Router

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chanho's dev blog</title>

        {/* Google Fonts (영어, 한국어, 일본어) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+KR:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* Cloudflare Turnstile */}
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          defer
        />
      </head>
      <body className="relative isolate antialiased">
        <Outlet />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </body>
    </html>
  );
}

// src/routes/$locale.tsx
export const Route = createFileRoute('/$locale')({
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale } = Route.useParams();

  return (
    <ThemeProvider>
      <LocaleProvider locale={locale}>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
          <Header />
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-6 pt-10">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );
}
```

---

### 3. MDX 처리

#### Next.js (next-mdx-remote-client)

```tsx
import { MDXRemote } from 'next-mdx-remote-client/rsc';

export default async function MDComponent({ path }) {
  const { source } = await getMarkdown(path);
  return <MDXRemote source={source} components={components} />;
}
```

#### TanStack Router (@mdx-js/mdx)

```tsx
// src/entities/markdown/util/get-markdown.ts
import { compile } from '@mdx-js/mdx';
import matter from 'gray-matter';

export async function getMarkdown(path: string, baseUrl?: string) {
  const url = `${baseUrl || import.meta.env.VITE_GIT_RAW_URL}/${path}`;
  const response = await fetch(url);
  const source = await response.text();
  const { data: frontmatter, content } = matter(source);

  // MDX 컴파일
  const compiled = await compile(content, {
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [rehypeHighlight],
    outputFormat: 'function-body',
  });

  return {
    source: String(compiled),
    frontmatter,
  };
}

// src/entities/markdown/index.tsx
import { useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';

export default function MDXComponent({ source, frontmatter }) {
  const MDXContent = useMemo(() => {
    const { default: Component } = new Function(source)(runtime);
    return Component;
  }, [source]);

  const components = setMdxComponents();

  return (
    <article>
      {frontmatter?.title && <h1>{frontmatter.title}</h1>}
      <MDXContent components={components} />
    </article>
  );
}
```

---

### 4. 이미지 최적화 (Sharp)

#### Sharp란?

**Sharp**는 Node.js 기반 **고성능 이미지 처리 라이브러리**입니다.

- **빠름**: libvips 기반 (ImageMagick보다 4-5배 빠름)
- **포맷**: JPEG, PNG, WebP, AVIF 등
- **기능**: 리사이징, 크롭, 품질 조정

#### 빌드 시 이미지 최적화

```javascript
// scripts/optimize-images.js
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

async function optimizeImages() {
  const images = await glob('public/image/**/*.{jpg,jpeg,png}');

  for (const imagePath of images) {
    const parsed = path.parse(imagePath);
    const outputDir = parsed.dir;

    // 1. WebP 생성 (80% 품질, 용량 30-50% 절감)
    await sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(`${outputDir}/${parsed.name}.webp`);

    // 2. AVIF 생성 (70% 품질, 용량 50-70% 절감)
    await sharp(imagePath)
      .avif({ quality: 70 })
      .toFile(`${outputDir}/${parsed.name}.avif`);

    console.log(`✅ Optimized: ${imagePath}`);
  }
}

optimizeImages();
```

#### package.json 스크립트

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js",
    "prebuild": "pnpm optimize:images",
    "build": "vite build"
  }
}
```

#### 최적화된 이미지 컴포넌트

```tsx
// src/shared/components/ui/image/index.tsx
interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
}: ImageProps) {
  const basePath = src.replace(/\.(jpg|jpeg|png)$/, '');

  return (
    <picture>
      {/* 최신 포맷부터 (브라우저가 지원하는 첫 번째 포맷 사용) */}
      <source srcSet={`${basePath}.avif`} type="image/avif" />
      <source srcSet={`${basePath}.webp`} type="image/webp" />

      {/* Fallback: 원본 이미지 */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="w-full h-full object-cover"
      />
    </picture>
  );
}
```

**최적화 효과**:
| 포맷 | 원본 (PNG 500KB) | JPEG (85%) | WebP (80%) | AVIF (70%) |
|------|-----------------|-----------|-----------|-----------|
| 용량 | 500 KB | 180 KB | 120 KB | 80 KB |
| 절감율 | - | 64% | 76% | 84% |

---

### 5. 웹폰트 (Google Fonts)

#### 다국어 폰트 설정

```tsx
// src/routes/__root.tsx
<head>
  {/* Preconnect: DNS 조회 시간 단축 */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossOrigin="anonymous"
  />

  {/* 영어 + 한국어 + 일본어 */}
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+KR:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap"
    rel="stylesheet"
  />
</head>
```

#### Tailwind CSS 설정

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Noto Sans',
          'Noto Sans KR',
          'Noto Sans JP',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
    },
  },
};
```

#### CSS 언어별 폰트

```css
/* src/styles/globals.css */
:root {
  --font-sans: 'Noto Sans', system-ui, sans-serif;
}

/* 한국어 */
:lang(ko) {
  font-family: 'Noto Sans KR', var(--font-sans);
}

/* 일본어 */
:lang(ja) {
  font-family: 'Noto Sans JP', var(--font-sans);
}

/* 영어 (기본) */
:lang(en) {
  font-family: 'Noto Sans', var(--font-sans);
}
```

---

### 6. Link 컴포넌트

#### Next.js

```tsx
import Link from 'next/link';

<Link href="/posts">Posts</Link>;
```

#### TanStack Router

```tsx
// src/shared/components/ui/link/index.tsx
import { Link as TanStackLink } from '@tanstack/react-router';
import { useLocaleStore } from '@/shared/stores/locale-store';

export default function Link({ href, ...props }) {
  const { locale } = useLocaleStore();

  // locale 자동 추가
  let localizedHref = href;
  if (href === '/') {
    localizedHref = `/${locale}`;
  } else if (href.startsWith('/') && !href.startsWith(`/${locale}`)) {
    localizedHref = `/${locale}${href}`;
  }

  return <TanStackLink to={localizedHref} {...props} />;
}
```

---

## 🔒 보안: CSR 환경에서 Netlify Functions 활용

### 문제: CSR에서 민감한 API 키 노출 위험

CSR은 모든 코드가 브라우저에서 실행되므로, 환경 변수가 노출될 수 있습니다.

```tsx
// ❌ 위험: 클라이언트에서 직접 API 호출
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);  // API Key 노출!
await resend.emails.send({ ... });
```

### 해결: Netlify Functions로 서버 로직 처리

#### 안전한 구조

```
[브라우저 (CSR)]
    ↓ 1. Turnstile 토큰 생성
    ↓ 2. POST /.netlify/functions/mail
    ↓    { turnstileToken, email, message }
    ↓
[Netlify Function (서버리스)]
    ↓ 3. Turnstile 검증 (Secret Key)
    ↓ 4. Rate Limiting
    ↓ 5. 입력 검증 (Zod)
    ↓ 6. Resend 메일 발송 (API Key)
    ↓ 7. 응답 반환
```

#### 클라이언트 (CSR)

```tsx
// src/features/contact/ui/contact-form.tsx
async function handleSubmit(data) {
  // 1. Turnstile 토큰 생성
  const turnstileToken = await turnstile.render();

  // 2. Netlify Function 호출
  const response = await fetch('/.netlify/functions/mail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      turnstileToken,
      email: data.email,
      message: data.message,
    }),
  });

  if (response.ok) {
    alert('메일이 전송되었습니다!');
  }
}
```

#### Netlify Function (기존 유지)

```typescript
// netlify/functions/mail.mts
import { Resend } from 'resend';

export const handler = async (event) => {
  const { turnstileToken, email, message } = JSON.parse(event.body);

  // 1. Turnstile 검증
  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY, // ✅ 서버에만 존재
        response: turnstileToken,
      }),
    }
  );

  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bot detected' }) };
  }

  // 2. Rate Limiting (선택)
  // ... 생략

  // 3. 입력 검증
  // ... Zod 검증

  // 4. 메일 발송
  const resend = new Resend(process.env.RESEND_API_KEY); // ✅ 서버에만 존재
  await resend.emails.send({
    from: 'contact@chanho.dev',
    to: 'kiss.yagni.dry@gmail.com',
    subject: `Contact from ${email}`,
    text: message,
  });

  return { statusCode: 200, body: JSON.stringify({ status: 'sent' }) };
};
```

### 보안 체크리스트

- ✅ Turnstile Secret Key는 Netlify Function에만 존재
- ✅ Resend API Key는 Netlify Function에만 존재
- ✅ 클라이언트는 토큰만 전송, 검증은 서버에서
- ✅ Rate Limiting으로 남용 방지
- ✅ Origin 검증으로 CSRF 방지

---

## 🛠️ 상세 마이그레이션 단계

### Phase 1: 환경 설정 (1-2일)

#### 1.1 패키지 설치/제거

```bash
# Next.js 제거
pnpm remove next next-mdx-remote-client eslint-config-next @netlify/plugin-nextjs @storybook/nextjs-vite

# TanStack Router 설치
pnpm add @tanstack/react-router @tanstack/router-devtools

# 빌드 도구
pnpm add -D vite @vitejs/plugin-react vite-tsconfig-paths @tanstack/router-vite-plugin

# MDX
pnpm add @mdx-js/mdx @mdx-js/react

# 이미지 최적화
pnpm add -D sharp vite-plugin-image-optimizer

# Storybook
pnpm add -D @storybook/react-vite
```

#### 1.2 Vite 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    tsconfigPaths(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 85 },
      jpg: { quality: 85 },
      webp: { quality: 80 },
      avif: { quality: 70 },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

#### 1.3 tsconfig.json 수정

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client", "@tanstack/react-router"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### 1.4 package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "optimize:images": "node scripts/optimize-images.js",
    "prebuild": "pnpm optimize:images"
  }
}
```

#### 1.5 환경 변수 변경

```bash
# .env
# NEXT_PUBLIC_* → VITE_*
VITE_GIT_RAW_URL=https://raw.githubusercontent.com/chan-ok/blog-content/main
VITE_CONTENT_REPO_URL=https://github.com/chan-ok/blog-content
VITE_TURNSTILE_SITE_KEY=...

# Netlify Functions용 (서버 환경 변수)
TURNSTILE_SECRET_KEY=...
RESEND_API_KEY=...
```

---

### Phase 2: 라우팅 구조 마이그레이션 (2-3일)

#### 2.1 디렉토리 생성

```bash
mkdir -p src/routes/$locale/posts
```

#### 2.2 엔트리포인트

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './styles/globals.css';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // hover 시 prefetch
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

#### 2.3 index.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chanho's dev blog</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 2.4 라우트 파일 생성

- `src/routes/__root.tsx`: Root layout
- `src/routes/index.tsx`: 리다이렉트
- `src/routes/$locale.tsx`: Locale layout
- `src/routes/$locale/index.tsx`: 홈
- `src/routes/$locale/about.tsx`: About
- `src/routes/$locale/contact.tsx`: Contact
- `src/routes/$locale/posts/index.tsx`: 포스트 목록
- `src/routes/$locale/posts/$.tsx`: 포스트 상세

---

### Phase 3: MDX 처리 (1일)

#### 3.1 getMarkdown 수정

```tsx
// src/entities/markdown/util/get-markdown.ts
import { compile } from '@mdx-js/mdx';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeHighlight from 'rehype-highlight';

export async function getMarkdown(path: string, baseUrl?: string) {
  const url = `${baseUrl || import.meta.env.VITE_GIT_RAW_URL}/${path}`;
  const response = await fetch(url);
  const source = await response.text();
  const { data: frontmatter, content } = matter(source);

  const compiled = await compile(content, {
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [rehypeHighlight],
    outputFormat: 'function-body',
  });

  return {
    source: String(compiled),
    frontmatter,
  };
}
```

#### 3.2 MDXComponent 수정

```tsx
// src/entities/markdown/index.tsx
import { useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';
import setMdxComponents from './util/set-md-components';

export default function MDXComponent({ source, frontmatter }) {
  const MDXContent = useMemo(() => {
    const { default: Component } = new Function(source)(runtime);
    return Component;
  }, [source]);

  const components = setMdxComponents();

  return (
    <article>
      {frontmatter?.title && <h1>{frontmatter.title}</h1>}
      <MDXContent components={components} />
    </article>
  );
}
```

---

### Phase 4: 컴포넌트 수정 (1-2일)

#### 4.1 Image 컴포넌트 생성

```tsx
// src/shared/components/ui/image/index.tsx
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
}) {
  const basePath = src.replace(/\.(jpg|jpeg|png)$/, '');

  return (
    <picture>
      <source srcSet={`${basePath}.avif`} type="image/avif" />
      <source srcSet={`${basePath}.webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}
```

#### 4.2 Link 컴포넌트 수정

```tsx
// src/shared/components/ui/link/index.tsx
import { Link as TanStackLink } from '@tanstack/react-router';
import { useLocaleStore } from '@/shared/stores/locale-store';

export default function Link({ href, ...props }) {
  const { locale } = useLocaleStore();

  let localizedHref = href;
  if (href === '/') {
    localizedHref = `/${locale}`;
  } else if (href.startsWith('/') && !href.startsWith(`/${locale}`)) {
    localizedHref = `/${locale}${href}`;
  }

  return <TanStackLink to={localizedHref} {...props} />;
}
```

#### 4.3 'use client', 'use server' 제거

```bash
# 전체 검색 및 제거
rg "'use (client|server)'" --files-with-matches | xargs sed -i '' "/'use (client|server)'/d"
```

#### 4.4 모든 next/image 교체

```bash
# 검색
rg "from 'next/image'"

# 수동 교체
# next/image → @/shared/components/ui/image
```

---

### Phase 5: 이미지 최적화 스크립트 (1일)

#### 5.1 Sharp 스크립트 작성

```javascript
// scripts/optimize-images.js
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';

async function optimizeImages() {
  const images = await glob('public/image/**/*.{jpg,jpeg,png}');

  for (const imagePath of images) {
    const parsed = path.parse(imagePath);
    const outputDir = parsed.dir;

    await sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(`${outputDir}/${parsed.name}.webp`);

    await sharp(imagePath)
      .avif({ quality: 70 })
      .toFile(`${outputDir}/${parsed.name}.avif`);

    console.log(`✅ ${imagePath}`);
  }
}

optimizeImages();
```

---

### Phase 6: Netlify 배포 설정 (0.5일)

#### 6.1 netlify.toml 수정

```toml
[build]
  command = "pnpm build"
  publish = "dist"  # Vite 빌드 출력
  functions = "netlify/functions"

[dev]
  port = 8888
  targetPort = 5173  # Vite 기본 포트

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 6.2 Netlify Functions 유지

- `netlify/functions/mail.mts` 그대로 유지
- 환경 변수 Netlify 대시보드에서 설정

---

### Phase 7: 테스트 (1-2일)

#### 7.1 Vitest

```bash
pnpm test
```

#### 7.2 Storybook

```typescript
// .storybook/main.ts
export default {
  framework: '@storybook/react-vite', // ✅ 변경
  stories: ['../src/**/*.stories.tsx'],
};
```

#### 7.3 E2E (Playwright)

```bash
pnpm e2e
```

---

## ⚠️ 주의사항

### 1. SEO 저하

- **문제**: CSR은 검색 엔진이 콘텐츠를 크롤링하기 어려움
- **완화**: 현재 SEO가 고려 대상이 아니므로 문제없음

### 2. 초기 로딩 느림

- **문제**: JavaScript 다운로드/실행 필요
- **완화**:
  - Code Splitting (TanStack Router 자동)
  - Prefetch (`defaultPreload: 'intent'`)
  - 이미지 최적화 (Sharp)

### 3. 보안

- **중요**: Netlify Functions 반드시 사용
- Turnstile, Resend API Key는 절대 클라이언트 노출 금지

---

## 💰 예상 비용 및 시간

| Phase    | 작업 내용     | 예상 시간                  |
| -------- | ------------- | -------------------------- |
| Phase 1  | 환경 설정     | 1-2일                      |
| Phase 2  | 라우팅        | 2-3일                      |
| Phase 3  | MDX           | 1일                        |
| Phase 4  | 컴포넌트      | 1-2일                      |
| Phase 5  | 이미지 최적화 | 1일                        |
| Phase 6  | 배포 설정     | 0.5일                      |
| Phase 7  | 테스트        | 1-2일                      |
| **합계** |               | **7.5-11.5일 (1.5-2.3주)** |

**안전 마진**: 2-3주 권장

---

## ✅ 최종 권장 사항

### CSR 방식의 장점

1. ✅ **구현 간단**: SSR 복잡도 제거
2. ✅ **안정성 높음**: TanStack Router 정식 릴리스
3. ✅ **보안 유지**: Netlify Functions 활용
4. ✅ **빠른 마이그레이션**: 2-3주 내 완료 가능

### 배포 전략 (권장)

1. **새 Git 브랜치 생성**: `migration/tanstack-router`
2. **Netlify Branch Deploy**: 스테이징 환경 테스트
3. **QA 테스트**: 모든 기능 검증
4. **프로덕션 배포**: 메인 브랜치 머지

### 롤백 계획

- Git 브랜치로 즉시 이전 버전 복구 가능
- Netlify는 이전 배포 버전 원클릭 롤백 지원

---

## 📚 참고 자료

- [TanStack Router 공식 문서](https://tanstack.com/router)
- [Vite 공식 문서](https://vitejs.dev/)
- [Sharp 공식 문서](https://sharp.pixelplumbing.com/)
- [MDX 공식 문서](https://mdxjs.com/)
- [Netlify Functions 문서](https://docs.netlify.com/functions/overview/)

---

**문서 버전**: 2.0.0 (CSR Only)  
**최종 수정일**: 2026-02-07  
**작성자**: OpenCode (Claude)

---

**📋 [목차로 돌아가기](./README.md)**
