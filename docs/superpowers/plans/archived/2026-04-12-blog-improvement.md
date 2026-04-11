> ✅ **완료** — 2026-04-12

# 블로그 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 기능을 정리(RSS/SNS 제거, 스타일 통일, Subject 제거)하고 검색·네비게이션·읽기 시간 기능을 추가한다.

**Architecture:** Phase 1(제거·수정)을 먼저 완료한 후 Phase 2(신규 기능)를 구현한다. 검색은 클라이언트 사이드(index.json 기반), 네비게이션은 TanStack Query 캐시 활용, 읽기 시간은 MDX 렌더링 완료 후 textContent 계산 방식을 사용한다.

**Tech Stack:** React 19, TanStack Router v1, TanStack Query, Vitest, Tailwind CSS (ink/bg/rule 디자인 토큰), i18next, Zod

---

## 파일 맵

### 삭제

- `netlify/functions/rss.mts`
- `netlify/edge-functions/rate-limit-rss.ts`
- `src/2-features/post/ui/post-share-buttons.tsx`
- `src/2-features/post/ui/post-share-buttons.test.tsx`

### 수정

- `netlify.toml` — edge_functions RSS 설정 제거
- `src/3-widgets/footer.tsx` — gray 토큰 → ink3 (RSS 아이콘은 이미 제거됨)
- `src/2-features/contact/ui/contact-form.tsx` — Subject 필드 제거, gray→ink 토큰
- `src/2-features/contact/model/contact-form.schema.ts` — subject 필드 제거
- `src/2-features/contact/model/contact-form.schema.test.ts` — subject 테스트 제거
- `src/2-features/contact/__tests__/mail-handler.test.ts` — subject 참조 제거
- `netlify/functions/mail.mts` — subject 제거, 고정 제목 사용
- `src/5-shared/config/i18n/locales/ko.json` — subject 키 제거, 신규 키 추가
- `src/5-shared/config/i18n/locales/en.json` — subject 키 제거, 신규 키 추가
- `src/5-shared/config/i18n/locales/ja.json` — subject 키 제거, 신규 키 추가
- `src/2-features/series/ui/series-list.tsx` — 빈 상태 텍스트 i18n 처리
- `src/2-features/post/model/post.schema.ts` — GetPostsProps에 query 필드 추가
- `src/2-features/post/util/get-posts.ts` — query 기반 클라이언트 필터 추가
- `src/2-features/post/util/get-posts.test.ts` — query 필터 테스트 추가
- `src/2-features/post/ui/post-card-list.tsx` — query prop 추가
- `src/4-pages/$locale/posts/index.tsx` — q 쿼리파라미터, PostSearchInput 추가
- `src/4-pages/$locale/posts/$.tsx` — PostShareButtons 제거, PostNavigation·읽기시간 추가

### 신규

- `src/2-features/post/ui/post-search-input.tsx`
- `src/2-features/post/ui/post-navigation.tsx`
- `src/2-features/post/util/calc-reading-time.ts`
- `src/2-features/post/util/calc-reading-time.test.ts`
- `src/2-features/post/util/get-all-posts.ts` — 네비게이션용 전체 포스트 fetch

---

## Task 1: RSS 기능 제거

**Files:**

- Delete: `netlify/functions/rss.mts`
- Delete: `netlify/edge-functions/rate-limit-rss.ts`
- Modify: `netlify.toml`
- Modify: `src/3-widgets/footer.tsx`

- [ ] **Step 1: RSS Netlify Function 삭제**

```bash
rm netlify/functions/rss.mts
rm netlify/edge-functions/rate-limit-rss.ts
```

- [ ] **Step 2: netlify.toml에서 RSS edge function 설정 제거**

`netlify.toml` 파일에서 다음 블록을 제거한다:

```toml
# 제거할 내용:
[[edge_functions]]
  path = "/api/rss"
  function = "rate-limit-rss"
```

최종 `netlify.toml`:

```toml
[dev]
  framework = "tanstack-router"
  command = "pnpm dev"
  port = 8888
  targetPort = 5173
  functions = "netlify/functions"

[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from   = "/api/*"
  to     = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 3: footer.tsx gray 토큰 → ink 토큰으로 교체**

현재 `src/3-widgets/footer.tsx`:

```tsx
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 py-6 text-center text-gray-600 dark:text-gray-400">
      © {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.
    </footer>
  );
}
```

교체 후:

```tsx
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-10 py-6 text-center text-ink3">
      © {currentYear} Chanho Kim&apos;s dev Blog. All rights reserved.
    </footer>
  );
}
```

- [ ] **Step 4: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add netlify.toml src/3-widgets/footer.tsx
git commit -m "feat: RSS 기능 및 footer RSS 아이콘 제거"
```

---

## Task 2: SNS 공유 버튼 제거

**Files:**

- Delete: `src/2-features/post/ui/post-share-buttons.tsx`
- Delete: `src/2-features/post/ui/post-share-buttons.test.tsx`
- Modify: `src/4-pages/$locale/posts/$.tsx`

- [ ] **Step 1: post-share-buttons 파일 삭제**

```bash
rm src/2-features/post/ui/post-share-buttons.tsx
rm src/2-features/post/ui/post-share-buttons.test.tsx
```

- [ ] **Step 2: posts/$.tsx에서 PostShareButtons 제거**

`src/4-pages/$locale/posts/$.tsx`에서 다음을 제거한다:

```tsx
// 제거할 import
import PostShareButtons from '@/2-features/post/ui/post-share-buttons';
```

```tsx
// 제거할 렌더링 코드 (mdxStatus === 'success' && frontmatter && 블록)
{/* 공유 버튼: MDX 로딩 완료 후 댓글 위에 표시 */}
{mdxStatus === 'success' && frontmatter && (
  <PostShareButtons
    title={frontmatter.title ?? ''}
    url={window.location.href}
  />
)}
```

- [ ] **Step 3: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/4-pages/\$locale/posts/\$.tsx
git commit -m "feat: SNS 공유 버튼 제거"
```

---

## Task 3: Contact Subject 필드 제거

**Files:**

- Modify: `src/2-features/contact/model/contact-form.schema.ts`
- Modify: `src/2-features/contact/model/contact-form.schema.test.ts`
- Modify: `src/2-features/contact/ui/contact-form.tsx`
- Modify: `netlify/functions/mail.mts`
- Modify: `src/2-features/contact/__tests__/mail-handler.test.ts`

- [ ] **Step 1: contact-form.schema.ts에서 subject 제거**

```ts
// src/2-features/contact/model/contact-form.schema.ts
import { Form } from '@base-ui/react';
import z from 'zod';

import { sanitizeInput } from '@/5-shared/util/sanitize';

export const ContactFormInputsSchema = z.object({
  from: z.email('Invalid email'),
  message: z.string().min(1, 'Message is required').transform(sanitizeInput),
});

export type ContactFormInputs = z.infer<typeof ContactFormInputsSchema>;

export interface FormState {
  serverErrors?: Form.Props['errors'];
}
```

- [ ] **Step 2: contact-form.schema.test.ts 업데이트**

subject 관련 테스트를 제거하고 message 소독 테스트만 남긴다:

```ts
// src/2-features/contact/model/contact-form.schema.test.ts
import { describe, it, expect } from 'vitest';

import { ContactFormInputsSchema } from './contact-form.schema';

describe('ContactFormInputsSchema sanitization 통합', () => {
  const validEmail = 'test@example.com';

  describe('message 필드 소독', () => {
    it('HTML 태그가 제거되어야 한다', () => {
      const input = {
        from: validEmail,
        message: '<div onclick="evil()">Click me</div>',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe('Click me');
      expect(result.message).not.toContain('<div');
    });

    it('중첩된 악성 태그가 모두 제거되어야 한다', () => {
      const input = {
        from: validEmail,
        message: '<p><script>alert(1)</script>Safe text</p>',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe('Safe text');
    });
  });

  describe('정상 입력 처리', () => {
    it('HTML이 없는 정상 입력은 그대로 유지되어야 한다', () => {
      const input = {
        from: validEmail,
        message: 'This is a normal message.',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe('This is a normal message.');
    });

    it('유니코드 문자는 보존되어야 한다', () => {
      const input = {
        from: validEmail,
        message: 'こんにちは 🎉',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe('こんにちは 🎉');
    });
  });

  describe('검증 실패 케이스', () => {
    it('빈 message는 검증에 실패해야 한다', () => {
      const input = {
        from: validEmail,
        message: '',
      };

      expect(() => ContactFormInputsSchema.parse(input)).toThrow();
    });

    it('유효하지 않은 이메일은 검증에 실패해야 한다', () => {
      const input = {
        from: 'not-an-email',
        message: 'Normal message',
      };

      expect(() => ContactFormInputsSchema.parse(input)).toThrow();
    });
  });
});
```

- [ ] **Step 3: 테스트 실행 확인**

```bash
pnpm test run src/2-features/contact/model/contact-form.schema.test.ts
```

Expected: 모든 테스트 PASS

- [ ] **Step 4: mail.mts에서 subject 제거 및 고정 제목 사용**

```ts
// netlify/functions/mail.mts
import { Resend } from 'resend';
import z from 'zod';

type NetlifyEvent = {
  httpMethod:
    | 'GET'
    | 'get'
    | 'POST'
    | 'post'
    | 'PATCH'
    | 'patch'
    | 'PUT'
    | 'put'
    | 'DELETE'
    | 'delete';
  queryStringParameters?: Record<string, string>;
  body?: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};

const MailBodySchema = z.object({
  from: z.string().email('Invalid email'),
  message: z.string().min(1, 'Message is required'),
  turnstileToken: z.string().min(1, 'Turnstile token is required'),
});

export const handler = async (
  event: NetlifyEvent
): Promise<NetlifyResponse> => {
  try {
    if (event.httpMethod.toUpperCase() !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!event.body) {
      return { statusCode: 400, body: 'Empty request body' };
    }

    // 1. JSON 파싱 + 서버 측 입력 검증
    const rawBody = JSON.parse(event.body);
    const parsed = MailBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid payload',
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        }),
      };
    }

    const { from, message, turnstileToken } = parsed.data;

    if (!turnstileToken) {
      return { statusCode: 400, body: 'Missing Turnstile token' };
    }

    // 2. Turnstile 서버 검증
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      return {
        statusCode: 500,
        body: 'Missing TURNSTILE_SECRET_KEY in environment',
      };
    }

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
        }),
      }
    );

    const verifyJson = await verifyRes.json();

    if (!verifyJson.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Turnstile verification failed',
        }),
      };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: 'Missing RESEND_API_KEY',
      };
    }
    const resend = new Resend(apiKey);
    const email = await resend.emails.send({
      from: 'contact@chanho.dev',
      to: 'kiss.yagni.dry@gmail.com',
      subject: 'chan-ok.com 블로그 문의',
      text: `from: ${from}\n\n${message}`,
    });

    if (email.error) {
      throw new Error(email.error.message);
    }

    // 4. 성공 응답
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'sent',
        resendId: email.data?.id,
      }),
    };
  } catch (err: unknown) {
    return {
      statusCode: 500,
      body: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
};
```

- [ ] **Step 5: mail-handler.test.ts 업데이트**

subject 참조를 제거하고 테스트 페이로드 수정:

```ts
// src/2-features/contact/__tests__/mail-handler.test.ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { handler } from '../../../../netlify/functions/mail.mts';

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.resetAllMocks();
  process.env = { ...originalEnv };
});

describe('netlify/functions/mail.mts', () => {
  it('returns 400 when payload is invalid (server-side validation)', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    process.env.RESEND_API_KEY = 're_test_key';

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        from: 'not-an-email',
        message: '',
        turnstileToken: 'turnstile-token',
      }),
    } as const;

    const res = await handler(event);

    expect(res.statusCode).toBe(400);

    const parsed = JSON.parse(res.body);
    expect(parsed.error).toBe('Invalid payload');
    expect(Array.isArray(parsed.issues)).toBe(true);
    expect(parsed.issues.length).toBeGreaterThan(0);
  });

  it('does not expose Turnstile verifyJson detail on failure', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    process.env.RESEND_API_KEY = 're_test_key';

    const turnstileResponse = {
      success: false,
      'error-codes': ['invalid-input-response'],
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => turnstileResponse,
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        from: 'test@example.com',
        message: 'world',
        turnstileToken: 'turnstile-token',
      }),
    } as const;

    const res = await handler(event);

    expect(res.statusCode).toBe(400);

    const parsed = JSON.parse(res.body);
    expect(parsed.error).toBe('Turnstile verification failed');
    expect(parsed.detail).toBeUndefined();
  });
});
```

- [ ] **Step 6: mail-handler 테스트 실행**

```bash
pnpm test run src/2-features/contact/__tests__/mail-handler.test.ts
```

Expected: 모든 테스트 PASS

- [ ] **Step 7: contact-form.tsx 업데이트 (Subject 필드 제거)**

```tsx
// src/2-features/contact/ui/contact-form.tsx
import { TurnstileWidget } from '@/5-shared/components/turnstile';
import { Field, Form } from '@base-ui/react';
import Button from '@/5-shared/components/ui/button';
import { useActionState, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type FormState } from '../model/contact-form.schema';
import { submitFormWithToken } from '../util/submit-form-with-token';

export default function ContactForm() {
  const { t } = useTranslation();
  const [token, setToken] = useState<string>('');
  const [state, formAction, loading] = useActionState<FormState, FormData>(
    submitFormWithToken(token),
    {}
  );

  return (
    <Form
      action={formAction}
      errors={state.serverErrors}
      className="flex flex-col space-y-4"
    >
      <Field.Root name="from" className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-medium text-ink">
          {t('contact.from')}
        </Field.Label>
        <Field.Control
          type="email"
          required
          placeholder={t('contact.fromPlaceholder')}
          className="h-10 w-full border border-rule bg-bg text-ink pl-3.5 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-ink"
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>

      <Field.Root name="message" className="flex flex-col items-start gap-1">
        <Field.Label className="text-sm font-medium text-ink">{t('contact.message')}</Field.Label>
        <Field.Control
          render={({ className, ...controlProps }) => (
            <textarea
              {...controlProps}
              placeholder={t('contact.placeholder')}
              className={`h-60 w-full resize-none border border-rule bg-bg text-ink p-2 text-base focus:outline-2 focus:-outline-offset-1 focus:outline-ink ${className ?? ''}`}
            />
          )}
        />
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>
      <Field.Root name="submit" className="container">
        <div className="flex justify-between max-md:flex-col-reverse max-md:gap-4">
          <TurnstileWidget onSuccess={setToken} />
          <Button
            type="submit"
            variant="primary"
            className="flex h-12 w-40 items-center justify-center border border-rule bg-bg2 px-3.5 text-base leading-6 font-medium text-ink outline-0 select-none hover:bg-bg focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ink active:bg-bg2 data-disabled:text-ink3"
            disabled={!token || loading}
            focusableWhenDisabled
          >
            {!token
              ? t('contact.checkRobot')
              : loading
                ? t('contact.sending')
                : t('contact.submit')}
          </Button>
        </div>
        <Field.Error className="text-sm text-red-800" />
      </Field.Root>
    </Form>
  );
}
```

- [ ] **Step 8: i18n에서 subject/share 키 제거**

세 파일(`ko.json`, `en.json`, `ja.json`)에서 각각 수정:

**ko.json** — contact 섹션 최종:

```json
"contact": {
  "from": "보내는 분",
  "fromPlaceholder": "이메일 주소를 입력해주세요...",
  "message": "내용",
  "placeholder": "메시지를 작성해주세요...",
  "checkRobot": "로봇 확인",
  "sending": "전송 중...",
  "submit": "보내기",
  "errors": {
    "required": "필수 항목입니다",
    "invalidEmail": "올바른 이메일 형식이 아닙니다"
  }
}
```

post 섹션에서 `share`, `copyLink`, `copied` 키 제거. 최종:

```json
"post": {
  "recentPosts": "최근 포스트",
  "noPosts": "포스트가 없습니다. 콘텐츠 저장소를 확인해주세요.",
  "readMore": "더 보기",
  "loading": "포스트 로딩 중...",
  "tags": "태그",
  "filterAll": "전체",
  "series": {
    "otherPosts": "이 시리즈의 다른 글"
  }
}
```

**en.json** — contact 섹션 최종:

```json
"contact": {
  "from": "From",
  "fromPlaceholder": "Enter your email address...",
  "message": "Message",
  "placeholder": "Write your message...",
  "checkRobot": "Check Robot",
  "sending": "Sending...",
  "submit": "Submit",
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email format"
  }
}
```

post 섹션에서 `share`, `copyLink`, `copied` 키 제거.

**ja.json** — contact 섹션 최종:

```json
"contact": {
  "from": "送信者",
  "fromPlaceholder": "メールアドレスを入力してください...",
  "message": "内容",
  "placeholder": "メッセージを入力してください...",
  "checkRobot": "ロボット確認",
  "sending": "送信中...",
  "submit": "送信",
  "errors": {
    "required": "必須項目です",
    "invalidEmail": "メールアドレスの形式が正しくありません"
  }
}
```

post 섹션에서 `share`, `copyLink`, `copied` 키 제거.

- [ ] **Step 9: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 10: 커밋**

```bash
git add src/2-features/contact/ netlify/functions/mail.mts src/5-shared/config/i18n/
git commit -m "feat: contact 폼 subject 필드 제거 및 스타일 토큰 통일"
```

---

## Task 4: 시리즈 빈 상태 다국어 처리

**Files:**

- Modify: `src/2-features/series/ui/series-list.tsx`

(i18n 키는 Task 3에서 이미 추가됨)

- [ ] **Step 1: 세 locale 파일에 series.empty 키 추가**

`ko.json`의 최상위에 `series` 객체 추가:

```json
"series": {
  "empty": "아직 발행된 시리즈가 없습니다."
}
```

`en.json`:

```json
"series": {
  "empty": "No series published yet."
}
```

`ja.json`:

```json
"series": {
  "empty": "まだシリーズが公開されていません。"
}
```

- [ ] **Step 2: series-list.tsx 업데이트**

```tsx
// src/2-features/series/ui/series-list.tsx
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import Link from '@/5-shared/components/ui/link';
import type { Series } from '../model/series.schema';

interface SeriesListProps {
  seriesList: Series[];
  locale: string;
}

export default function SeriesList({ seriesList, locale }: SeriesListProps) {
  const { t } = useTranslation();

  if (seriesList.length === 0) {
    return (
      <p className="text-ink3 text-sm py-8 text-center">
        {t('series.empty')}
      </p>
    );
  }

  return (
    <ol>
      {seriesList.map((series, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        const date = new Date(series.createdAt);
        const formattedDate = format(date, 'yyyy.MM');
        const href = `/${locale}/series/${series.slug}`;

        return (
          <li
            key={series.slug}
            className="flex items-baseline gap-3 py-4 border-b border-rule first:border-t"
          >
            <span className="text-[9px] text-ink3 min-w-[18px] shrink-0">
              {num}
            </span>
            <Link href={href} className="flex-1 group">
              <span className="block text-[15px] font-semibold text-ink leading-[1.35] mb-1 group-hover:underline underline-offset-2">
                {series.title}
              </span>
              {series.description && (
                <span className="text-[10px] text-ink3">
                  {series.description}
                </span>
              )}
            </Link>
            <span className="text-[10px] text-ink3 shrink-0 tabular-nums">
              {series.items.length}편 · {formattedDate}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SeriesListSkeleton() {
  return (
    <ol>
      {[...Array(3)].map((_, i) => (
        <li
          key={i}
          className="flex gap-3 py-4 border-b border-rule first:border-t"
        >
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-16 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/2-features/series/ui/series-list.tsx src/5-shared/config/i18n/
git commit -m "feat: 시리즈 빈 상태 텍스트 i18n 처리"
```

---

## Task 5: 포스트 검색 기능

**Files:**

- Modify: `src/2-features/post/model/post.schema.ts`
- Modify: `src/2-features/post/util/get-posts.ts`
- Modify: `src/2-features/post/util/get-posts.test.ts`
- Modify: `src/2-features/post/ui/post-card-list.tsx`
- Create: `src/2-features/post/ui/post-search-input.tsx`
- Modify: `src/4-pages/$locale/posts/index.tsx`

- [ ] **Step 1: 세 locale 파일에 검색 관련 키 추가**

각 locale 파일의 `post` 객체에 추가:

`ko.json`:

```json
"searchPlaceholder": "포스트 검색...",
"noSearchResults": "검색 결과가 없습니다."
```

`en.json`:

```json
"searchPlaceholder": "Search posts...",
"noSearchResults": "No results found."
```

`ja.json`:

```json
"searchPlaceholder": "記事を検索...",
"noSearchResults": "検索結果がありません。"
```

- [ ] **Step 3: GetPostsProps에 query 필드 추가**

```ts
// src/2-features/post/model/post.schema.ts
import { Frontmatter as PostInfo } from '@/1-entities/markdown/model/markdown.schema';

export interface GetPostsProps {
  locale: LocaleType;
  page?: number;
  size?: number;
  tags?: string[];
  /** 제목·태그·summary 클라이언트 검색어 */
  query?: string;
}

export interface GetAvailableTagsProps {
  locale: LocaleType;
}

export interface PagingPosts {
  posts: PostInfo[];
  total: number;
  page: number;
  size: number;
}
```

- [ ] **Step 2: query 필터 테스트 작성 (실패 확인)**

`src/2-features/post/util/get-posts.test.ts` 파일에 다음 테스트를 추가한다 (기존 테스트 아래에):

```ts
describe('query 검색 필터', () => {
  beforeEach(() => {
    import.meta.env.VITE_GIT_RAW_URL = baseURL;
  });

  it('query가 title에 포함되면 해당 포스트가 반환되어야 한다', async () => {
    mockApiGet([
      {
        title: 'React 훅 완전 가이드',
        path: ['2024', 'react-hooks'],
        tags: ['react'],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'TypeScript 고급 패턴',
        path: ['2024', 'ts-patterns'],
        tags: ['typescript'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko', query: 'React' });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('React 훅 완전 가이드');
  });

  it('query가 tags에 포함되면 해당 포스트가 반환되어야 한다', async () => {
    mockApiGet([
      {
        title: '포스트 A',
        path: ['2024', 'a'],
        tags: ['frontend', 'performance'],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: '포스트 B',
        path: ['2024', 'b'],
        tags: ['backend'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko', query: 'performance' });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('포스트 A');
  });

  it('query가 summary에 포함되면 해당 포스트가 반환되어야 한다', async () => {
    mockApiGet([
      {
        title: '포스트 A',
        path: ['2024', 'a'],
        tags: [],
        summary: '렌더링 최적화 기법을 다룹니다',
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: '포스트 B',
        path: ['2024', 'b'],
        tags: [],
        summary: '데이터베이스 설계 원칙',
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko', query: '최적화' });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('포스트 A');
  });

  it('query는 대소문자를 구분하지 않아야 한다', async () => {
    mockApiGet([
      {
        title: 'React Hooks Guide',
        path: ['2024', 'react-hooks'],
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko', query: 'react' });

    expect(result.posts).toHaveLength(1);
  });

  it('query가 빈 문자열이면 전체 포스트가 반환되어야 한다', async () => {
    mockApiGet([
      {
        title: '포스트 A',
        path: ['2024', 'a'],
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: '포스트 B',
        path: ['2024', 'b'],
        tags: [],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({ locale: 'ko', query: '' });

    expect(result.posts).toHaveLength(2);
  });

  it('query와 tags 필터가 AND 조건으로 동작해야 한다', async () => {
    mockApiGet([
      {
        title: 'React 성능 최적화',
        path: ['2024', 'react-perf'],
        tags: ['react', 'performance'],
        createdAt: '2024-01-01T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'React 기본 개념',
        path: ['2024', 'react-basics'],
        tags: ['react'],
        createdAt: '2024-01-02T00:00:00.000Z',
        published: true,
        series: undefined,
      },
      {
        title: 'Vue 성능 최적화',
        path: ['2024', 'vue-perf'],
        tags: ['vue', 'performance'],
        createdAt: '2024-01-03T00:00:00.000Z',
        published: true,
        series: undefined,
      },
    ]);

    const result = await getPosts({
      locale: 'ko',
      query: '최적화',
      tags: ['react'],
    });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('React 성능 최적화');
  });
});
```

- [ ] **Step 3: 테스트 실행하여 실패 확인**

```bash
pnpm test run src/2-features/post/util/get-posts.test.ts
```

Expected: 새로 추가한 query 테스트들이 FAIL (query 필터 미구현)

- [ ] **Step 4: get-posts.ts에 query 필터 구현**

기존 태그 필터 아래에 query 필터 추가:

```ts
// src/2-features/post/util/get-posts.ts
// ...기존 코드...

export async function getPosts(props: GetPostsProps): Promise<PagingPosts> {
  const { locale, page = 0, size = 10, tags = [], query = '' } = props;

  // ...기존 fetch 로직...

  filteredPosts = filteredPosts.filter(
    (post) =>
      tags.length === 0 || tags.some((tag) => (post.tags ?? []).includes(tag))
  );

  // query 필터: title, tags, summary에서 대소문자 무관 검색
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(q) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(q)) ||
        post.summary?.toLowerCase().includes(q)
    );
  }

  // ...기존 페이지네이션 로직...
}
```

- [ ] **Step 5: 테스트 실행하여 통과 확인**

```bash
pnpm test run src/2-features/post/util/get-posts.test.ts
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: PostSearchInput 컴포넌트 작성**

```tsx
// src/2-features/post/ui/post-search-input.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';

interface PostSearchInputProps {
  locale: string;
  initialValue?: string;
  selectedTags?: string[];
}

/**
 * 포스트 검색 입력창.
 * 입력 후 300ms debounce로 URL ?q= 파라미터를 업데이트한다.
 * 태그 필터(tags=)와 함께 동작한다.
 */
export default function PostSearchInput({
  locale,
  initialValue = '',
  selectedTags = [],
}: PostSearchInputProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL 파라미터와 로컬 상태 동기화
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const updateUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (selectedTags.length > 0) {
        params.set('tags', selectedTags.map(encodeURIComponent).join(','));
      }
      if (q.trim()) {
        params.set('q', q.trim());
      }
      const search = params.toString();
      navigate({
        to: `/$locale/posts/`,
        params: { locale },
        search: search ? Object.fromEntries(params) : {},
        replace: true,
      });
    },
    [locale, navigate, selectedTags]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateUrl(newValue);
    }, 300);
  };

  const handleClear = () => {
    setValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    updateUrl('');
  };

  return (
    <div className="relative mb-4">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={t('post.searchPlaceholder')}
        className="w-full h-9 pl-8 pr-8 border border-rule bg-bg text-ink text-[13px] placeholder:text-ink3 focus:outline-2 focus:-outline-offset-1 focus:outline-ink"
        aria-label={t('post.searchPlaceholder')}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink"
          aria-label="검색어 지우기"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: PostCardList에 query prop 추가**

```tsx
// src/2-features/post/ui/post-card-list.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import type { LocaleType } from '@/5-shared/types/common.schema';
import PostCard from '@/2-features/post/ui/post-card';
import { getPosts } from '../util/get-posts';

interface PostCardListProps {
  locale: LocaleType;
  tags?: string[];
  query?: string;
}

export default function PostCardList({ locale, tags = [], query = '' }: PostCardListProps) {
  const { t } = useTranslation();

  const { data: pagingPosts } = useSuspenseQuery({
    queryKey: ['posts', locale, tags, query],
    queryFn: () => getPosts({ locale, tags, query }),
    retry: 3,
    staleTime: 1000 * 60 * 5,
  });

  const posts = pagingPosts.posts;

  if (!posts || posts.length === 0) {
    return (
      <p className="text-ink3 text-sm py-8 text-center">
        {query ? t('post.noSearchResults') : t('post.noPosts')}
      </p>
    );
  }

  return (
    <ol>
      {posts.map((post, idx) => (
        <PostCard
          key={post.path.join('/')}
          index={idx + 1}
          locale={locale}
          {...post}
        />
      ))}
    </ol>
  );
}

export function PostCardListSkeleton() {
  return (
    <ol>
      {[...Array(5)].map((_, i) => (
        <li key={i} className="flex gap-3 py-4 border-b border-rule">
          <div className="w-4 h-3 bg-bg2 rounded animate-pulse" />
          <div className="flex-1 h-4 bg-bg2 rounded animate-pulse" />
          <div className="w-12 h-3 bg-bg2 rounded animate-pulse" />
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 8: posts/index.tsx에 q 파라미터 및 PostSearchInput 추가**

```tsx
// src/4-pages/$locale/posts/index.tsx
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { z } from 'zod';

import PostCardList, {
  PostCardListSkeleton,
} from '@/2-features/post/ui/post-card-list';
import PostSearchInput from '@/2-features/post/ui/post-search-input';
import TagFilterBar from '@/2-features/post/ui/tag-filter-bar';
import { getAvailableTags } from '@/2-features/post/util/get-available-tags';
import { parseLocale } from '@/5-shared/types/common.schema';
import {
  buildMeta,
  buildCanonicalLink,
  getPostsDescription,
} from '@/5-shared/util/build-meta';

const searchSchema = z.object({
  tags: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute('/$locale/posts/')({
  component: PostsPageWithSuspense,
  validateSearch: (search) => searchSchema.parse(search),
  head: ({ params }) => {
    const locale = params.locale;
    const description = getPostsDescription(locale);
    return {
      meta: buildMeta({
        title: 'Posts | chan-ok.com',
        description,
        locale,
        path: `/${locale}/posts`,
      }),
      links: buildCanonicalLink(`/${locale}/posts`),
    };
  },
});

function PostsPageWithSuspense() {
  return (
    <Suspense fallback={<PostCardListSkeleton />}>
      <PostsPage />
    </Suspense>
  );
}

function PostsPage() {
  const { locale } = Route.useParams();
  const search = useSearch({ from: Route.fullPath });
  const parsedLocale = parseLocale(locale);
  const tags = search.tags
    ? search.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
  const query = search.q ?? '';

  const { data: availableTags } = useSuspenseQuery({
    queryKey: ['availableTags', parsedLocale],
    queryFn: () => getAvailableTags({ locale: parsedLocale }),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-rule">
        <p className="text-[9px] tracking-[4px] uppercase text-ink3">
          All Posts
        </p>
      </div>
      <PostSearchInput
        locale={locale}
        initialValue={query}
        selectedTags={tags}
      />
      <TagFilterBar
        locale={locale}
        availableTags={availableTags}
        selectedTags={tags}
      />
      <Suspense fallback={<PostCardListSkeleton />}>
        <PostCardList locale={parsedLocale} tags={tags} query={query} />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 9: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 10: 커밋**

```bash
git add src/2-features/post/ src/4-pages/\$locale/posts/index.tsx
git commit -m "feat: 포스트 클라이언트 사이드 검색 기능 추가"
```

---

## Task 6: 이전/다음 포스트 네비게이션

**Files:**

- Create: `src/2-features/post/util/get-all-posts.ts`
- Create: `src/2-features/post/ui/post-navigation.tsx`
- Modify: `src/4-pages/$locale/posts/$.tsx`

- [ ] **Step 1: 세 locale 파일에 네비게이션 키 추가**

각 locale 파일의 `post` 객체에 추가:

`ko.json`:

```json
"prev": "이전 포스트",
"next": "다음 포스트"
```

`en.json`:

```json
"prev": "Previous Post",
"next": "Next Post"
```

`ja.json`:

```json
"prev": "前の記事",
"next": "次の記事"
```

- [ ] **Step 2: get-all-posts.ts 작성**

네비게이션에서는 tag/query 필터 없이 전체 포스트가 필요하므로 별도 유틸을 만든다.

```ts
// src/2-features/post/util/get-all-posts.ts
import { api } from '@/5-shared/config/api';
import { compareDesc } from 'date-fns';

import { Frontmatter as PostInfo } from '@/1-entities/markdown/model/markdown.schema';
import type { LocaleType } from '@/5-shared/types/common.schema';
import { isProduction, hasDevOnlyTag } from './get-posts';

/** 네비게이션용 전체 포스트 목록 (필터 없이 날짜 내림차순) */
export async function getAllPosts(locale: LocaleType): Promise<PostInfo[]> {
  const baseURL = import.meta.env.VITE_GIT_RAW_URL;

  if (!baseURL) {
    return [];
  }

  try {
    const response = await api.get<PostInfo[]>(`/${locale}/index.json`, {
      baseURL,
    });

    if (response.axios.status !== 200 || !response.data) {
      return [];
    }

    let posts = response.data
      .toSorted((a, b) => compareDesc(a.createdAt, b.createdAt))
      .filter((post) => post.published);

    if (isProduction()) {
      posts = posts.filter((post) => !hasDevOnlyTag(post.tags ?? []));
    }

    return posts;
  } catch {
    return [];
  }
}
```

- [ ] **Step 3: PostNavigation 컴포넌트 작성**

```tsx
// src/2-features/post/ui/post-navigation.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Link from '@/5-shared/components/ui/link';
import type { LocaleType } from '@/5-shared/types/common.schema';
import { getAllPosts } from '../util/get-all-posts';

interface PostNavigationProps {
  /** 현재 포스트 path (예: "2024/my-post") */
  currentPath: string;
  locale: LocaleType;
}

/**
 * 포스트 상세 하단 이전/다음 포스트 네비게이션.
 * 전체 포스트 날짜 내림차순 기준으로 prev(오래된)/next(최신)를 표시한다.
 */
export default function PostNavigation({
  currentPath,
  locale,
}: PostNavigationProps) {
  const { t } = useTranslation();

  const { data: allPosts } = useSuspenseQuery({
    queryKey: ['posts-all', locale],
    queryFn: () => getAllPosts(locale),
    staleTime: 1000 * 60 * 5,
  });

  const currentIndex = allPosts.findIndex(
    (post) => post.path.join('/') === currentPath
  );

  if (currentIndex === -1) return null;

  // 날짜 내림차순: index+1 = 더 오래된 포스트(이전), index-1 = 더 최신 포스트(다음)
  const prevPost = allPosts[currentIndex + 1] ?? null;
  const nextPost = allPosts[currentIndex - 1] ?? null;

  if (!prevPost && !nextPost) return null;

  return (
    <nav
      className="flex justify-between gap-4 py-8 border-t border-rule"
      aria-label="포스트 네비게이션"
    >
      {/* 이전 포스트 (더 오래된) */}
      <div className="flex-1 min-w-0">
        {prevPost && (
          <Link
            href={`/${locale}/posts/${prevPost.path.join('/')}`}
            className="group flex flex-col gap-1"
          >
            <span className="flex items-center gap-1 text-[10px] tracking-[1.5px] uppercase text-ink3">
              <ChevronLeft size={12} aria-hidden="true" />
              {t('post.prev')}
            </span>
            <span className="text-[13px] font-medium text-ink2 group-hover:text-ink group-hover:underline underline-offset-2 leading-snug line-clamp-2">
              {prevPost.title}
            </span>
          </Link>
        )}
      </div>

      {/* 다음 포스트 (더 최신) */}
      <div className="flex-1 min-w-0 text-right">
        {nextPost && (
          <Link
            href={`/${locale}/posts/${nextPost.path.join('/')}`}
            className="group flex flex-col gap-1 items-end"
          >
            <span className="flex items-center gap-1 text-[10px] tracking-[1.5px] uppercase text-ink3">
              {t('post.next')}
              <ChevronRight size={12} aria-hidden="true" />
            </span>
            <span className="text-[13px] font-medium text-ink2 group-hover:text-ink group-hover:underline underline-offset-2 leading-snug line-clamp-2">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export function PostNavigationSkeleton() {
  return (
    <div className="flex justify-between gap-4 py-8 border-t border-rule">
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-2 w-16 bg-bg2 rounded animate-pulse" />
        <div className="h-4 w-32 bg-bg2 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex flex-col gap-2 items-end">
        <div className="h-2 w-16 bg-bg2 rounded animate-pulse" />
        <div className="h-4 w-32 bg-bg2 rounded animate-pulse" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: posts/$.tsx에 PostNavigation 추가**

`src/4-pages/$locale/posts/$.tsx`에서 import 추가:

```tsx
import PostNavigation, {
  PostNavigationSkeleton,
} from '@/2-features/post/ui/post-navigation';
```

Reply 컴포넌트 바로 위에 PostNavigation 추가:

```tsx
{/* 이전/다음 포스트 네비게이션 */}
{mdxStatus === 'success' && (
  <Suspense fallback={<PostNavigationSkeleton />}>
    <PostNavigation
      currentPath={_splat}
      locale={parseLocale(locale)}
    />
  </Suspense>
)}
{mdxStatus === 'success' && <Reply locale={parseLocale(locale)} />}
```

- [ ] **Step 5: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add src/2-features/post/util/get-all-posts.ts src/2-features/post/ui/post-navigation.tsx src/4-pages/\$locale/posts/\$.tsx src/5-shared/config/i18n/
git commit -m "feat: 포스트 이전/다음 네비게이션 추가"
```

---

## Task 7: 포스트 읽기 예상 시간

**Files:**

- Create: `src/2-features/post/util/calc-reading-time.ts`
- Create: `src/2-features/post/util/calc-reading-time.test.ts`
- Modify: `src/4-pages/$locale/posts/$.tsx`

- [ ] **Step 1: calc-reading-time 테스트 작성 (실패 확인)**

```ts
// src/2-features/post/util/calc-reading-time.test.ts
import { describe, it, expect } from 'vitest';
import { calcReadingTime } from './calc-reading-time';

describe('calcReadingTime', () => {
  describe('한국어 (ko) — 분당 500자', () => {
    it('500자 미만이면 "1분 미만"을 반환해야 한다', () => {
      const text = '가'.repeat(300);
      expect(calcReadingTime(text, 'ko')).toBe('1분 미만');
    });

    it('500자이면 "약 1분"을 반환해야 한다', () => {
      const text = '가'.repeat(500);
      expect(calcReadingTime(text, 'ko')).toBe('약 1분');
    });

    it('1000자이면 "약 2분"을 반환해야 한다', () => {
      const text = '가'.repeat(1000);
      expect(calcReadingTime(text, 'ko')).toBe('약 2분');
    });

    it('501자이면 "약 2분"을 반환해야 한다 (올림)', () => {
      const text = '가'.repeat(501);
      expect(calcReadingTime(text, 'ko')).toBe('약 2분');
    });
  });

  describe('영어 (en) — 분당 200단어', () => {
    it('200단어 미만이면 "Less than 1 min"을 반환해야 한다', () => {
      const text = Array(100).fill('word').join(' ');
      expect(calcReadingTime(text, 'en')).toBe('Less than 1 min');
    });

    it('200단어이면 "~1 min read"를 반환해야 한다', () => {
      const text = Array(200).fill('word').join(' ');
      expect(calcReadingTime(text, 'en')).toBe('~1 min read');
    });

    it('400단어이면 "~2 min read"를 반환해야 한다', () => {
      const text = Array(400).fill('word').join(' ');
      expect(calcReadingTime(text, 'en')).toBe('~2 min read');
    });
  });

  describe('일본어 (ja) — 분당 200단어', () => {
    it('200단어 미만이면 "1分未満"을 반환해야 한다', () => {
      const text = Array(100).fill('word').join(' ');
      expect(calcReadingTime(text, 'ja')).toBe('1分未満');
    });

    it('200단어이면 "約1分"을 반환해야 한다', () => {
      const text = Array(200).fill('word').join(' ');
      expect(calcReadingTime(text, 'ja')).toBe('約1分');
    });
  });

  describe('빈 텍스트', () => {
    it('빈 문자열이면 ko에서 "1분 미만"을 반환해야 한다', () => {
      expect(calcReadingTime('', 'ko')).toBe('1분 미만');
    });
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

```bash
pnpm test run src/2-features/post/util/calc-reading-time.test.ts
```

Expected: FAIL (파일 없음)

- [ ] **Step 3: calc-reading-time.ts 구현**

```ts
// src/2-features/post/util/calc-reading-time.ts
import type { LocaleType } from '@/5-shared/types/common.schema';

/** 로케일별 읽기 속도 및 표시 문자열 설정 */
const READING_CONFIG: Record<
  LocaleType,
  {
    /** 분당 처리 단위 수 */
    rate: number;
    /** 단위 카운트 방식 */
    countMethod: 'chars' | 'words';
    /** 분 미만 표시 문자열 */
    lessThanMin: string;
    /** N분 표시 함수 */
    format: (minutes: number) => string;
  }
> = {
  ko: {
    rate: 500,
    countMethod: 'chars',
    lessThanMin: '1분 미만',
    format: (m) => `약 ${m}분`,
  },
  en: {
    rate: 200,
    countMethod: 'words',
    lessThanMin: 'Less than 1 min',
    format: (m) => `~${m} min read`,
  },
  ja: {
    rate: 200,
    countMethod: 'words',
    lessThanMin: '1分未満',
    format: (m) => `約${m}分`,
  },
};

/**
 * 텍스트와 로케일을 받아 읽기 예상 시간 문자열을 반환한다.
 * @param text - MDX 렌더링 후 contentRef.current.textContent
 * @param locale - 현재 로케일
 */
export function calcReadingTime(text: string, locale: LocaleType): string {
  const config = READING_CONFIG[locale];
  const trimmed = text.trim();

  const count =
    config.countMethod === 'chars'
      ? trimmed.length
      : trimmed.split(/\s+/).filter(Boolean).length;

  const exactMinutes = count / config.rate;

  // 정확한 분이 1 미만이면 "1분 미만" 표시 (Math.ceil 적용 전 비교)
  if (exactMinutes < 1) return config.lessThanMin;

  return config.format(Math.ceil(exactMinutes));
}
```

- [ ] **Step 4: 테스트 실행하여 통과 확인**

```bash
pnpm test run src/2-features/post/util/calc-reading-time.test.ts
```

Expected: 모든 테스트 PASS

- [ ] **Step 5: posts/$.tsx에 읽기 시간 추가**

`src/4-pages/$locale/posts/$.tsx`에서 읽기 시간 상태와 계산 로직 추가:

import 추가:

```tsx
import { calcReadingTime } from '@/2-features/post/util/calc-reading-time';
```

컴포넌트 내 상태 추가 (기존 `const [headings, setHeadings] = useState<Heading[]>([]);` 아래):

```tsx
const [readingTime, setReadingTime] = useState<string>('');
```

기존 `useEffect` (MutationObserver) 내에서 headings 추출 후 읽기 시간 계산 추가:

```tsx
const extractHeadings = () => {
  if (!contentRef.current) return;

  const elements = contentRef.current.querySelectorAll('h1, h2, h3');
  const extracted: Heading[] = Array.from(elements)
    .filter((el) => el.id)
    .map((el) => ({
      id: el.id,
      text: el.textContent?.replace('#', '').trim() || '',
      level: parseInt(el.tagName[1], 10),
    }));

  setHeadings(extracted);

  // 읽기 시간 계산: textContent 기반
  const text = contentRef.current.textContent ?? '';
  setReadingTime(calcReadingTime(text, parseLocale(locale)));
};
```

날짜 표시 부분 수정 (읽기 시간을 날짜 옆에 추가):

```tsx
{frontmatter.createdAt && (
  <div className="mb-4 flex items-center gap-3 text-[11px] tracking-[1px] text-ink3 tabular-nums">
    <span>{format(frontmatter.createdAt, 'yyyy.MM.dd')}</span>
    {readingTime && (
      <>
        <span aria-hidden="true">·</span>
        <span>{readingTime}</span>
      </>
    )}
  </div>
)}
```

- [ ] **Step 6: 타입 체크 실행**

```bash
pnpm tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add src/2-features/post/util/calc-reading-time.ts src/2-features/post/util/calc-reading-time.test.ts src/4-pages/\$locale/posts/\$.tsx
git commit -m "feat: 포스트 읽기 예상 시간 표시 추가"
```

---

## 완료 확인

- [ ] `pnpm tsc --noEmit` — 타입 오류 없음
- [ ] `pnpm lint` — lint 오류 없음
- [ ] `pnpm test run` — 새로 추가한 테스트 모두 통과
