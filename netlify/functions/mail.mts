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
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject length is over'),
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

    const { from, subject, message, turnstileToken } = parsed.data;

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
      subject,
      text: `
      from: ${from}
      
      ${message}
      `,
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
