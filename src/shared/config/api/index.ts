// api.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  ResponseType as AxiosResponseType,
} from 'axios';
import { ZodType } from 'zod';

// 최종 응답 타입(T + AxiosResponse)
export interface ApiResult<T> {
  data: T;
  axios: AxiosResponse<T>;
}

export interface ApiRequestOptions<T> extends Omit<
  AxiosRequestConfig,
  'method' | 'url' | 'data' | 'params' | 'responseType'
> {
  params?: Record<string, string | number | boolean>;
  responseType?: AxiosResponseType;
  signal?: AbortSignal;
  schema?: ZodType<T>;
}

/**
 * BASE_URL 결정 로직
 * 1. API_BASE_URL 이 있으면 그걸 사용
 * 2. 없고 브라우저 환경이면: 상대 경로 사용 (예: /api/...)
 * 3. 없고 Node 환경(Netlify Functions 등)이면:
 *    - Netlify가 제공하는 URL/DEPLOY_URL 활용
 *    - 없으면 로컬 개발 기본값 (http://localhost:8888) 사용
 */
function resolveBaseURL(): string {
  // API_BASE_URL이 있으면 그걸 사용
  const envBase = process.env.API_BASE_URL;
  if (envBase && envBase.length > 0) return envBase;

  // 브라우저 환경이면: 상대 경로 사용 (예: /api/...)
  if (typeof window !== 'undefined') return '';

  // Node 환경 (Netlify Functions / SSR 등)
  const siteUrl =
    process.env.URL ?? // Netlify 정식 URL
    process.env.DEPLOY_URL ?? // 배포 URL (preview 등)
    'http://localhost:8888'; // netlify dev 기본 포트

  return siteUrl;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: resolveBaseURL(),
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options?: ApiRequestOptions<T>
  ): Promise<ApiResult<T>> {
    const { schema, ...rest } = options ?? {};
    const res = await this.instance.request<T>({
      method,
      url,
      data,
      ...rest,
    });

    let parsed: T = res.data;

    if (schema) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new Error(
          `Zod validation failed: ${JSON.stringify(result.error.issues)}`
        );
      }
      parsed = result.data;
    }

    return {
      data: parsed,
      axios: res,
    };
  }

  get<T>(url: string, options?: ApiRequestOptions<T>) {
    return this.request<T>('GET', url, undefined, options);
  }

  post<T>(url: string, data?: unknown, options?: ApiRequestOptions<T>) {
    return this.request<T>('POST', url, data, options);
  }

  put<T>(url: string, data?: unknown, options?: ApiRequestOptions<T>) {
    return this.request<T>('PUT', url, data, options);
  }

  delete<T>(url: string, options?: ApiRequestOptions<T>) {
    return this.request<T>('DELETE', url, undefined, options);
  }
}

export const api = new ApiClient();
