import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { handler } from '../../../../netlify/functions/rss.mts';

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env = { ...originalEnv };
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.resetAllMocks();
  process.env = { ...originalEnv };
});

// 테스트용 유효한 PostInfo 목 데이터 생성 헬퍼
function makePost(overrides: Partial<{
  title: string;
  path: string[];
  tags: string[];
  createdAt: string;
  published: boolean;
  summary: string;
  series?: string;
}> = {}) {
  return {
    title: '테스트 포스트',
    path: ['2024', 'test-post'],
    tags: ['react'],
    createdAt: '2024-01-01T00:00:00Z',
    published: true,
    summary: '요약입니다.',
    series: undefined as string | undefined,
    ...overrides,
  };
}

// fetch mock 헬퍼
function mockFetchWithPosts(posts: unknown[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => posts,
  });
}

describe('netlify/functions/rss.mts', () => {
  describe('HTTP 메서드 검증', () => {
    it('GET 이외 메서드에 405 반환', async () => {
      const res = await handler({ httpMethod: 'POST' });
      expect(res.statusCode).toBe(405);
    });
  });

  describe('환경변수 검증', () => {
    it('GIT_RAW_URL 미설정 시 500 반환', async () => {
      delete process.env.GIT_RAW_URL;
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(500);
      expect(res.body).toBe('GIT_RAW_URL is not configured');
    });

    it('에러 응답 body에 환경변수명 이외의 내부 정보 미노출', async () => {
      delete process.env.GIT_RAW_URL;
      const res = await handler({ httpMethod: 'GET' });
      // err.message 형태의 스택 트레이스 등이 노출되지 않아야 함
      expect(res.body).not.toContain('Error');
      expect(res.body).not.toContain('at ');
    });
  });

  describe('외부 fetch 실패 케이스', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
    });

    it('fetch가 ok:false 응답 시 502 반환', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(502);
    });

    it('fetch throw 시 500 반환, err.message 미노출 (H-2)', async () => {
      global.fetch = vi.fn().mockRejectedValue(
        new Error('secret internal path: /var/task/netlify...')
      );
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(500);
      // H-2: 내부 에러 메시지가 클라이언트에 노출되면 안 됨
      expect(res.body).toBe('Internal server error');
      expect(res.body).not.toContain('secret');
    });
  });

  describe('Zod 스키마 검증 (H-1)', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
    });

    it('응답이 배열이 아닌 경우 502 반환', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ not: 'an array' }),
      });
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(502);
      expect(res.body).toBe('Invalid posts index format');
    });

    it('포스트 항목에 필수 필드 누락 시 502 반환', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        // title 누락, path가 배열이 아님
        json: async () => [{ published: true, createdAt: '2024-01-01' }],
      });
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(502);
    });

    it('빈 배열 응답 시 200과 빈 RSS XML 반환', async () => {
      mockFetchWithPosts([]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toContain('<?xml version="1.0"');
      expect(res.body).not.toContain('<item>');
    });
  });

  describe('포스트 필터링', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
    });

    it('published:false 포스트는 피드에 포함하지 않음', async () => {
      mockFetchWithPosts([makePost({ published: false, title: '비공개글' })]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(200);
      expect(res.body).not.toContain('비공개글');
    });

    it("'draft' 태그 포스트는 피드에 포함하지 않음", async () => {
      mockFetchWithPosts([makePost({ tags: ['draft'], title: '초안글' })]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.body).not.toContain('초안글');
    });

    it("'test' 태그 포스트는 피드에 포함하지 않음", async () => {
      mockFetchWithPosts([makePost({ tags: ['test'], title: '테스트글' })]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.body).not.toContain('테스트글');
    });

    it('published:true이고 dev-only 태그 없는 포스트는 포함', async () => {
      mockFetchWithPosts([makePost({ title: '정상 포스트' })]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.body).toContain('정상 포스트');
    });
  });

  describe('locale 처리', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
      mockFetchWithPosts([]);
    });

    it('locale 미입력 시 ko 기본값 사용', async () => {
      const res = await handler({ httpMethod: 'GET', queryStringParameters: {} });
      expect(res.body).toContain('<language>ko</language>');
    });

    it('locale=en 시 영문 피드 제목 반환', async () => {
      const res = await handler({
        httpMethod: 'GET',
        queryStringParameters: { locale: 'en' },
      });
      expect(res.body).toContain('Chanho.dev Blog');
      expect(res.body).toContain('<language>en</language>');
    });

    it('locale=ja 시 일본어 피드 제목 반환', async () => {
      const res = await handler({
        httpMethod: 'GET',
        queryStringParameters: { locale: 'ja' },
      });
      expect(res.body).toContain('Chanho.dev');
      expect(res.body).toContain('<language>ja</language>');
    });

    it('지원하지 않는 locale 입력 시 ko 기본값 사용', async () => {
      const res = await handler({
        httpMethod: 'GET',
        queryStringParameters: { locale: 'fr' },
      });
      expect(res.body).toContain('<language>ko</language>');
    });
  });

  describe('M-1: post.path XML Injection 방어', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
    });

    it('path 세그먼트에 XML 특수문자가 있어도 XML이 깨지지 않음', async () => {
      mockFetchWithPosts([
        makePost({ path: ['2024', 'post&title<test>'] }),
      ]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(200);
      // XML 파싱 가능한 구조여야 함 (raw <, > 가 그대로 들어가지 않음)
      expect(res.body).not.toMatch(/<link>[^<]*<[^/]/);
    });

    it('path 세그먼트가 URL 인코딩됨', async () => {
      mockFetchWithPosts([
        makePost({ path: ['2024', 'post with spaces'] }),
      ]);
      const res = await handler({ httpMethod: 'GET' });
      // 공백이 %20으로 인코딩되어야 함
      expect(res.body).toContain('post%20with%20spaces');
    });
  });

  describe('L-1: 유효하지 않은 날짜 처리', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
    });

    it('createdAt이 유효하지 않은 날짜인 포스트는 피드에서 제외', async () => {
      mockFetchWithPosts([
        makePost({ title: '날짜오류글', createdAt: 'invalid-date' }),
        makePost({ title: '정상글', createdAt: '2024-01-01T00:00:00Z' }),
      ]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.body).not.toContain('날짜오류글');
      expect(res.body).toContain('정상글');
    });
  });

  describe('정상 응답', () => {
    beforeEach(() => {
      process.env.GIT_RAW_URL = 'https://raw.example.com';
    });

    it('200 상태코드와 RSS XML Content-Type 헤더 반환', async () => {
      mockFetchWithPosts([makePost()]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.statusCode).toBe(200);
      expect(res.headers?.['Content-Type']).toContain('application/rss+xml');
    });

    it('응답 body가 유효한 RSS XML 구조를 가짐', async () => {
      mockFetchWithPosts([makePost({ title: '포스트 제목' })]);
      const res = await handler({ httpMethod: 'GET' });
      expect(res.body).toContain('<?xml version="1.0"');
      expect(res.body).toContain('<rss version="2.0"');
      expect(res.body).toContain('<channel>');
      expect(res.body).toContain('<item>');
      expect(res.body).toContain('포스트 제목');
    });

    it('createdAt 내림차순으로 정렬됨', async () => {
      mockFetchWithPosts([
        makePost({ title: '오래된글', createdAt: '2023-01-01T00:00:00Z' }),
        makePost({ title: '최신글', createdAt: '2024-06-01T00:00:00Z' }),
      ]);
      const res = await handler({ httpMethod: 'GET' });
      const newIdx = res.body.indexOf('최신글');
      const oldIdx = res.body.indexOf('오래된글');
      expect(newIdx).toBeLessThan(oldIdx);
    });
  });
});
