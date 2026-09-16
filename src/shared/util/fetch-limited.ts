const REMOTE_REQUEST_TIMEOUT_MS = 5_000;
export const MAX_REMOTE_CONTENT_BYTES = 2 * 1024 * 1024;

export interface LimitedTextResponse {
  status: number;
  text: string;
}

async function discardBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // The status code is sufficient; an error body is never trusted or rendered.
  }
}

async function readLimitedResponse(
  response: Response,
  maxBytes: number
): Promise<LimitedTextResponse> {
  if (!response.ok) {
    await discardBody(response);
    return { status: response.status, text: '' };
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength && /^\d+$/u.test(contentLength) && Number(contentLength) > maxBytes) {
    await discardBody(response);
    throw new Error('Remote response exceeds the size limit');
  }

  if (!response.body) {
    return { status: response.status, text: '' };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        throw new Error('Remote response exceeds the size limit');
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  });

  return {
    status: response.status,
    text: new TextDecoder().decode(body),
  };
}

export async function fetchTextWithLimit(
  url: string,
  maxBytes: number
): Promise<LimitedTextResponse> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new Error('Invalid response size limit');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMOTE_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });

    return await readLimitedResponse(response, maxBytes);
  } finally {
    clearTimeout(timeout);
  }
}
