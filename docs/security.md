> 이 문서의 상위 문서: [agents.md](./agents.md)

# 보안

## 환경 변수

### 지시사항

- **클라이언트 노출 가능**: `VITE_*` 접두사
- **서버 전용**: Netlify Functions 환경 변수 (접두사 없음)
- **하드코딩 금지**: 환경 변수 사용 필수

### 예제

```typescript
// ✅ Good - Netlify Functions에서 서버 환경 변수
const secretKey = process.env.TURNSTILE_SECRET_KEY;

// ✅ Good - 클라이언트에서 VITE_ 변수
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// ❌ Bad - 하드코딩
const apiKey = 're_xxxxxxxxxxxxxxxxxxxx';
```

### 주의사항

- ⚠️ `.env.local` 파일은 Git에 커밋 금지
- ⚠️ 서버 환경 변수를 클라이언트에 노출 금지

## 입력 검증

### 지시사항

- **Zod 스키마** 검증 필수
- **사용자 입력 sanitize** - DOMPurify 사용 (`isomorphic-dompurify`)

### 예제

```typescript
import { z } from 'zod';
import { sanitizeInput } from '@/5-shared/util/sanitize';

// Zod 스키마 + transform으로 sanitize
export const ContactFormInputsSchema = z.object({
  from: z.string().email('Invalid email'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject length is over')
    .transform(sanitizeInput),
  message: z.string().min(1, 'Message is required').transform(sanitizeInput),
});
```

## XSS 방지

### 지시사항

- React 기본 이스케이프 신뢰
- `dangerouslySetInnerHTML` 사용 금지 (MDX 제외)
- MDX는 `gray-matter + rehype/remark` + rehype/remark 플러그인 사용

### 주의사항

- ⚠️ 사용자 입력을 직접 렌더링하지 말 것
- ⚠️ MDX 콘텐츠도 외부 리포지터리에서 가져오므로 sanitization 중요
