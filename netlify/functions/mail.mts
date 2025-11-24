import { Resend } from 'resend';

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

export const handler = async (
  event: NetlifyEvent
): Promise<NetlifyResponse> => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // ENV에서 Resend Key 읽기
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing RESEND_API_KEY env' }),
      };
    }

    const resend = new Resend(apiKey);

    // 클라이언트에서 보낸 body
    const body = JSON.parse(event.body || '{}');
    const { from, subject, message } = body.data;

    // Resend 이메일 발송
    const response = await resend.emails.send({
      from: 'contact@chanho.dev',
      to: 'kiss.yagni.dry@gmail.com',
      subject,
      text: `
      from: ${from}
      
      ${message}
      `,
    });

    console.log(`resend response: `, JSON.stringify(response));

    if (response.error?.statusCode !== 200) {
      return {
        statusCode: response.error?.statusCode as number,
        body: JSON.stringify({
          error: response.error?.message,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'sent',
        resendId: response.data?.id ?? null,
      }),
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unknown error' }),
    };
  }
};
