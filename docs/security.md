# 🔒 보안 가이드

> 이 문서는 프로젝트의 보안 관련 규칙과 베스트 프랙티스를 정의합니다.

## 환경 변수 관리

### 클라이언트 vs 서버 환경 변수

Next.js에서 환경 변수는 접두사에 따라 노출 범위가 결정됩니다:

| 접두사          | 노출 범위         | 용도             |
| --------------- | ----------------- | ---------------- |
| `NEXT_PUBLIC_*` | 클라이언트 + 서버 | 공개 가능한 설정 |
| (접두사 없음)   | 서버만            | 민감한 정보      |

### 현재 프로젝트의 환경 변수

```bash
# ✅ 클라이언트에 노출 가능 (공개)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx    # Turnstile 사이트 키
NEXT_PUBLIC_GIT_RAW_URL=xxx           # 콘텐츠 리포지터리 URL

# 🔒 서버에서만 사용 (비공개)
TURNSTILE_SECRET_KEY=xxx              # Turnstile 시크릿 키
RESEND_API_KEY=xxx                    # Resend API 키
```

### 환경 변수 사용 예시

```typescript
// ✅ Good - 서버 컴포넌트에서 서버 환경 변수 사용
// src/app/api/mail/route.ts
const secretKey = process.env.TURNSTILE_SECRET_KEY;

// ✅ Good - 클라이언트에서 NEXT_PUBLIC_ 변수 사용
// src/shared/config/turnstile.ts
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// ❌ Bad - 서버 환경 변수를 클라이언트에서 사용 시도
// 클라이언트에서는 undefined가 됨
const apiKey = process.env.RESEND_API_KEY; // undefined!
```

### 환경 변수 하드코딩 금지

```typescript
// ❌ Bad - 하드코딩
const apiKey = 're_xxxxxxxxxxxxxxxxxxxx';
fetch('https://api.resend.com/emails', {
  headers: { Authorization: `Bearer ${apiKey}` },
});

// ✅ Good - 환경 변수 사용
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error('RESEND_API_KEY is not configured');
}
fetch('https://api.resend.com/emails', {
  headers: { Authorization: `Bearer ${apiKey}` },
});
```

## XSS (Cross-Site Scripting) 방지

### 입력 새니타이징 (Input Sanitization)

사용자 입력에서 악성 HTML/스크립트를 제거하기 위해 DOMPurify를 사용합니다:

```typescript
// src/shared/util/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  if (input == null) {
    return '';
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

**Zod 스키마에서 transform으로 적용**:

```typescript
// src/features/contact/model/contact-form.schema.ts
import { sanitizeInput } from '@/shared/util/sanitize';

export const ContactFormInputsSchema = z.object({
  from: z.email('Invalid email'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject length is over')
    .transform(sanitizeInput), // HTML 태그 제거
  message: z.string().min(1, 'Message is required').transform(sanitizeInput),
});
```

**isomorphic-dompurify 사용 이유**:

- SSR 환경에서도 동작 (Node.js + 브라우저 모두 지원)
- Next.js의 서버 컴포넌트와 호환

### MDX 렌더링 시 주의사항

MDX 콘텐츠는 외부 리포지터리에서 가져오므로 sanitization이 중요합니다:

```typescript
// src/entities/mdx/render-mdx.tsx
import { MDXRemote } from 'next-mdx-remote-client';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

// rehype/remark 플러그인으로 안전한 렌더링
const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  },
};
```

### 사용자 입력 검증 (Zod)

```typescript
// src/features/contact/util/contact-schema.ts
import { z } from 'zod';

export const contactSchema = z.object({
  email: z
    .string()
    .email('유효한 이메일을 입력하세요')
    .max(100, '이메일이 너무 깁니다'),
  subject: z
    .string()
    .min(1, '제목을 입력하세요')
    .max(200, '제목이 너무 깁니다'),
  message: z
    .string()
    .min(10, '메시지는 10자 이상이어야 합니다')
    .max(5000, '메시지가 너무 깁니다'),
});

// 사용
const result = contactSchema.safeParse(formData);
if (!result.success) {
  // 검증 실패 처리
  return { errors: result.error.flatten() };
}
```

### dangerouslySetInnerHTML 최소화

```typescript
// ❌ Bad - 사용자 입력을 직접 렌더링
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good - 필요한 경우에만 sanitize 후 사용
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// ✅ Better - MDX 컴포넌트 사용
<MDXRemote source={content} components={mdxComponents} />
```

## 봇 방지 (Cloudflare Turnstile)

### Turnstile 통합

Contact 폼에 Turnstile을 통합하여 봇 요청을 방지합니다:

```typescript
// src/shared/components/turnstile/turnstile.tsx
'use client';

import { Turnstile as TurnstileWidget } from '@marsidev/react-turnstile';

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
}

export function Turnstile({ onSuccess, onError }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error('Turnstile site key is not configured');
    return null;
  }

  return (
    <TurnstileWidget
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
```

### 서버 사이드 토큰 검증

```typescript
// netlify/functions/mail.mts
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    }
  );

  const data = await response.json();
  return data.success === true;
}

// 사용
export async function handler(event: HandlerEvent) {
  const { turnstileToken, ...formData } = JSON.parse(event.body);

  // 토큰 검증
  const isValid = await verifyTurnstile(turnstileToken);
  if (!isValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid turnstile token' }),
    };
  }

  // 이메일 발송 로직...
}
```

## Rate Limiting

### Netlify Functions에서 Rate Limiting

```typescript
// netlify/functions/mail.mts
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1분
  maxRequests: 5, // 최대 5회
};

// 간단한 메모리 기반 rate limiting (프로덕션에서는 Redis 권장)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
```

## 의존성 보안

### 정기적인 보안 점검

```bash
# 보안 취약점 확인
pnpm audit

# 취약점 자동 수정 (가능한 경우)
pnpm audit --fix

# 의존성 업데이트
pnpm update
```

### Dependabot 설정

GitHub Dependabot을 활성화하여 자동으로 보안 업데이트를 받습니다:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

## 보안 체크리스트

### 코드 작성 시

- [ ] 환경 변수에 민감한 정보를 하드코딩하지 않았는가?
- [ ] 서버 환경 변수를 클라이언트에 노출하지 않았는가?
- [ ] 사용자 입력을 Zod로 검증했는가?
- [ ] `dangerouslySetInnerHTML`을 사용했다면 sanitize했는가?

### 배포 전

- [ ] `.env.local`이 `.gitignore`에 포함되어 있는가?
- [ ] Netlify 환경 변수가 올바르게 설정되어 있는가?
- [ ] `pnpm audit`으로 보안 취약점을 확인했는가?

### 정기 점검

- [ ] 의존성 보안 업데이트 확인 (월 1회)
- [ ] Turnstile 대시보드에서 봇 트래픽 확인
- [ ] Netlify Functions 로그에서 이상 요청 확인

## 관련 문서

- [개발 규칙](./rule.md) - 핵심 개발 원칙
- [배포 가이드](./deployment.md) - 환경 변수 설정
- [AI 검증 체크리스트](./ai-checklist.md) - 보안 검증 항목

---

> 📖 전체 문서 목록은 [문서 홈](../README.md)을 참고하세요.
