import { describe, it, expect } from 'vitest';
import type {
  BlogPost,
  PostStatus,
  PostCreateRequest,
  PostUpdateRequest,
  PostListOptions
} from '../types';

describe('블로그글 타입 정의', () => {
  it('블로그글 인터페이스가 올바른 속성을 가져야 한다', () => {
    const 테스트글: BlogPost = {
      id: 'test-post-id',
      title: '테스트 블로그 글',
      slug: 'test-blog-post',
      content: '# 테스트 제목\n\n테스트 내용입니다.',
      summary: '테스트 글의 요약입니다.',
      tags: ['TypeScript', 'React', 'Vitest'],
      status: 'draft',
      published: false,
      authorId: 'author-id',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      viewCount: 10,
      readingTime: 5,
    };

    expect(테스트글.id).toBe('test-post-id');
    expect(테스트글.title).toBe('테스트 블로그 글');
    expect(테스트글.slug).toBe('test-blog-post');
    expect(테스트글.content).toContain('테스트 제목');
    expect(테스트글.tags).toHaveLength(3);
    expect(테스트글.published).toBe(false);
    expect(테스트글.status).toBe('draft');
  });

  it('글상태 타입이 올바른 값만 허용해야 한다', () => {
    const 임시저장: PostStatus = 'draft';
    const 발행됨: PostStatus = 'published';
    const 보관됨: PostStatus = 'archived';

    expect(임시저장).toBe('draft');
    expect(발행됨).toBe('published');
    expect(보관됨).toBe('archived');
  });

  it('글작성요청 타입이 필수 속성을 가져야 한다', () => {
    const 글작성요청: PostCreateRequest = {
      title: '새 글 제목',
      content: '# 새 글\n\n새 글 내용입니다.',
      tags: ['TypeScript'],
      summary: '새 글 요약',
    };

    expect(글작성요청.title).toBe('새 글 제목');
    expect(글작성요청.content).toContain('새 글');
    expect(글작성요청.tags).toContain('TypeScript');
  });

  it('글수정요청의 모든 속성이 선택사항이어야 한다', () => {
    const 제목만수정: PostUpdateRequest = {
      title: '수정된 제목',
    };

    const 내용만수정: PostUpdateRequest = {
      content: '수정된 내용',
    };

    const 상태만수정: PostUpdateRequest = {
      status: 'published',
    };

    expect(제목만수정.title).toBe('수정된 제목');
    expect(제목만수정.content).toBeUndefined();

    expect(내용만수정.content).toBe('수정된 내용');
    expect(내용만수정.title).toBeUndefined();

    expect(상태만수정.status).toBe('published');
    expect(상태만수정.title).toBeUndefined();
  });

  it('글목록조회옵션의 기본값 동작을 확인해야 한다', () => {
    const 기본옵션: PostListOptions = {};

    expect(기본옵션.page).toBeUndefined();
    expect(기본옵션.size).toBeUndefined();
    expect(기본옵션.sort).toBeUndefined();
    expect(기본옵션.tag).toBeUndefined();

    const 커스텀옵션: PostListOptions = {
      page: 2,
      size: 10,
      sort: 'views',
      tag: 'React',
      searchTerm: 'TypeScript',
      publishedOnly: true,
    };

    expect(커스텀옵션.page).toBe(2);
    expect(커스텀옵션.size).toBe(10);
    expect(커스텀옵션.sort).toBe('viewCount');
  });

  it('발행됨 필드가 기본값 false를 가져야 한다', () => {
    const 새글: BlogPost = {
      id: 'new-post',
      title: '새 글',
      slug: 'new-post',
      content: '새 글 내용',
      summary: '새 글 요약',
      tags: [],
      status: 'draft',
      published: false, // 기본값은 false
      authorId: 'author-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      readingTime: 1,
    };

    expect(새글.published).toBe(false);
    expect(새글.status).toBe('draft');
    expect(새글.viewCount).toBe(0);
  });
});