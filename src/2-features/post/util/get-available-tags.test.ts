import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableTags } from './get-available-tags';
import { api } from '@/5-shared/config/api';

vi.mock('@/5-shared/config/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

function mockApiGet(data: unknown[]) {
  vi.mocked(api.get).mockResolvedValue({
    data,
    axios: { status: 200 } as import('axios').AxiosResponse,
  } as Awaited<ReturnType<typeof api.get>>);
}

describe('getAvailableTags', () => {
  const baseURL = 'https://raw.githubusercontent.com/owner/blog-content/main';

  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_GIT_RAW_URL = baseURL;
  });

  it('published 포스트의 태그만 모아 중복 제거 후 정렬된 배열을 반환해야 한다', async () => {
    mockApiGet([
      { published: true, tags: ['react', 'typescript'] },
      { published: true, tags: ['react', 'nextjs'] },
      { published: false, tags: ['draft'] },
    ]);

    const result = await getAvailableTags({ locale: 'ko' });

    expect(result).toEqual(['nextjs', 'react', 'typescript']);
  });

  it('포스트가 없으면 빈 배열을 반환해야 한다', async () => {
    mockApiGet([]);

    const result = await getAvailableTags({ locale: 'ko' });

    expect(result).toEqual([]);
  });

  it('VITE_GIT_RAW_URL이 없거나 "undefined" 문자열이면 빈 배열을 반환해야 한다', async () => {
    const orig = import.meta.env.VITE_GIT_RAW_URL;
    // Vite 빌드 시 미설정 env는 "undefined" 문자열로 치환될 수 있음
    import.meta.env.VITE_GIT_RAW_URL = 'undefined';

    const result = await getAvailableTags({ locale: 'ko' });

    expect(result).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
    import.meta.env.VITE_GIT_RAW_URL = orig;
  });

  it('fetch 실패 시 빈 배열을 반환해야 한다', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

    const result = await getAvailableTags({ locale: 'ko' });

    expect(result).toEqual([]);
  });

  it('locale에 해당하는 index.json을 요청해야 한다', async () => {
    mockApiGet([{ published: true, tags: ['a'] }]);

    await getAvailableTags({ locale: 'en' });

    expect(api.get).toHaveBeenCalledWith('/en/index.json', { baseURL });
  });

  it('개발 환경에서는 test/draft 태그가 목록에 포함될 수 있다', async () => {
    const origDev = import.meta.env.DEV;
    import.meta.env.DEV = true;

    mockApiGet([
      { published: true, tags: ['react', 'draft'] },
      { published: true, tags: ['test'] },
    ]);

    const result = await getAvailableTags({ locale: 'ko' });

    expect(result).toContain('draft');
    expect(result).toContain('test');
    expect(result).toContain('react');
    import.meta.env.DEV = origDev;
  });

  it('프로덕션 환경에서는 test/draft 태그가 있은 포스트를 제외한 태그만 반환해야 한다', async () => {
    const origDev = import.meta.env.DEV;
    import.meta.env.DEV = false;

    mockApiGet([
      { published: true, tags: ['react', 'nextjs'] },
      { published: true, tags: ['react', 'draft'] },
      { published: true, tags: ['test'] },
    ]);

    const result = await getAvailableTags({ locale: 'ko' });

    expect(result).toEqual(['nextjs', 'react']);
    expect(result).not.toContain('draft');
    expect(result).not.toContain('test');
    import.meta.env.DEV = origDev;
  });
});
