import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { handler } from './mail.mts';

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  // @ts-expect-error - test environment global
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

    // @ts-expect-error - partial Response mock
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        from: 'not-an-email',
        subject: '',
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

    // @ts-expect-error - partial Response mock
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => turnstileResponse,
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        from: 'test@example.com',
        subject: 'hello',
        message: 'world',
        turnstileToken: 'turnstile-token',
      }),
    } as const;

    const res = await handler(event);

    expect(res.statusCode).toBe(400);

    const parsed = JSON.parse(res.body);
    expect(parsed.error).toBe('Turnstile verification failed');
    // detail 필드는 더 이상 노출되면 안 됨
    expect(parsed.detail).toBeUndefined();
  });
});

