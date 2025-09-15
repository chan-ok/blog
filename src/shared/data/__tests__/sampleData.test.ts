import { describe, it, expect } from 'vitest';
import {
  getAllPosts,
  getLatestPosts,
  getPopularTags,
  getPostsByTag,
  getPostBySlug,
  getTags,
} from '../sampleData';

describe('sampleData 유틸리티 함수들', () => {
  describe('getAllPosts', () => {
    it('모든 포스트를 반환해야 한다', () => {
      const posts = getAllPosts();

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThan(0);

      // 첫 번째 포스트의 구조 확인
      const firstPost = posts[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('slug');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('summary');
      expect(firstPost).toHaveProperty('publishedAt');
      expect(firstPost).toHaveProperty('status');
      expect(firstPost).toHaveProperty('tags');
      expect(Array.isArray(firstPost.tags)).toBe(true);
    });

    it('발행된 포스트만 반환해야 한다', () => {
      const posts = getAllPosts();

      posts.forEach(post => {
        expect(post.status).toBe('published');
      });
    });

    it('포스트들이 최신순으로 정렬되어야 한다', () => {
      const posts = getAllPosts();

      for (let i = 0; i < posts.length - 1; i++) {
        const currentDate = new Date(posts[i].publishedAt);
        const nextDate = new Date(posts[i + 1].publishedAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('getLatestPosts', () => {
    it('지정된 개수만큼 최신 포스트를 반환해야 한다', () => {
      const posts = getLatestPosts(3);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(3);
    });

    it('전체 포스트 수보다 많은 개수를 요청하면 전체 포스트를 반환해야 한다', () => {
      const allPosts = getAllPosts();
      const requestedPosts = getLatestPosts(1000);

      expect(requestedPosts.length).toBe(allPosts.length);
    });

    it('0개를 요청하면 빈 배열을 반환해야 한다', () => {
      const posts = getLatestPosts(0);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });

    it('음수를 요청하면 빈 배열을 반환해야 한다', () => {
      const posts = getLatestPosts(-1);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });
  });

  describe('getPopularTags', () => {
    it('인기 태그들을 반환해야 한다', () => {
      const tags = getPopularTags(5);

      expect(tags).toBeDefined();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.length).toBeLessThanOrEqual(5);

      // 태그 구조 확인
      tags.forEach(tag => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('postCount');
        expect(typeof tag.name).toBe('string');
        expect(typeof tag.postCount).toBe('number');
        expect(tag.postCount).toBeGreaterThan(0);
      });
    });

    it('포스트 수가 많은 순으로 정렬되어야 한다', () => {
      const tags = getPopularTags(10);

      for (let i = 0; i < tags.length - 1; i++) {
        expect(tags[i].postCount).toBeGreaterThanOrEqual(tags[i + 1].postCount);
      }
    });

    it('0개를 요청하면 빈 배열을 반환해야 한다', () => {
      const tags = getPopularTags(0);

      expect(tags).toBeDefined();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBe(0);
    });
  });

  describe('getPostsByTag', () => {
    it('특정 태그가 포함된 포스트들을 반환해야 한다', () => {
      // 먼저 존재하는 태그를 찾음
      const allTags = getTags();
      const testTag = allTags[0];

      const posts = getPostsByTag(testTag);

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);

      // 모든 포스트에 해당 태그가 포함되어야 함
      posts.forEach(post => {
        expect(post.tags).toContain(testTag);
      });
    });

    it('존재하지 않는 태그로 검색하면 빈 배열을 반환해야 한다', () => {
      const posts = getPostsByTag('NonExistentTag');

      expect(posts).toBeDefined();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });

    it('대소문자를 구분하지 않아야 한다', () => {
      const allTags = getTags();
      if (allTags.length > 0) {
        const testTag = allTags[0];
        const upperCasePosts = getPostsByTag(testTag.toUpperCase());
        const lowerCasePosts = getPostsByTag(testTag.toLowerCase());
        const originalPosts = getPostsByTag(testTag);

        expect(upperCasePosts.length).toBe(originalPosts.length);
        expect(lowerCasePosts.length).toBe(originalPosts.length);
      }
    });
  });

  describe('getPostBySlug', () => {
    it('올바른 slug로 포스트를 찾을 수 있어야 한다', () => {
      const allPosts = getAllPosts();
      const testPost = allPosts[0];

      const foundPost = getPostBySlug(testPost.slug);

      expect(foundPost).toBeDefined();
      expect(foundPost).toEqual(testPost);
    });

    it('존재하지 않는 slug로 검색하면 undefined를 반환해야 한다', () => {
      const post = getPostBySlug('non-existent-slug');

      expect(post).toBeUndefined();
    });

    it('빈 문자열로 검색하면 undefined를 반환해야 한다', () => {
      const post = getPostBySlug('');

      expect(post).toBeUndefined();
    });
  });

  describe('getTags', () => {
    it('모든 고유한 태그들을 반환해야 한다', () => {
      const tags = getTags();

      expect(tags).toBeDefined();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);

      // 중복이 없어야 함
      const uniqueTags = [...new Set(tags)];
      expect(tags.length).toBe(uniqueTags.length);

      // 모든 요소가 문자열이어야 함
      tags.forEach(tag => {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      });
    });

    it('알파벳순으로 정렬되어야 한다', () => {
      const tags = getTags();

      for (let i = 0; i < tags.length - 1; i++) {
        expect(tags[i].localeCompare(tags[i + 1])).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('데이터 일관성', () => {
    it('모든 포스트가 유효한 날짜를 가져야 한다', () => {
      const posts = getAllPosts();

      posts.forEach(post => {
        const date = new Date(post.publishedAt);
        expect(date.getTime()).not.toBeNaN();
        expect(date.getFullYear()).toBeGreaterThan(2000);
      });
    });

    it('모든 포스트가 고유한 ID를 가져야 한다', () => {
      const posts = getAllPosts();
      const ids = posts.map(post => post.id);
      const uniqueIds = [...new Set(ids)];

      expect(ids.length).toBe(uniqueIds.length);
    });

    it('모든 포스트가 고유한 slug를 가져야 한다', () => {
      const posts = getAllPosts();
      const slugs = posts.map(post => post.slug);
      const uniqueSlugs = [...new Set(slugs)];

      expect(slugs.length).toBe(uniqueSlugs.length);
    });

    it('모든 포스트가 필수 필드를 가져야 한다', () => {
      const posts = getAllPosts();

      posts.forEach(post => {
        expect(post.id).toBeDefined();
        expect(post.slug).toBeDefined();
        expect(post.title).toBeDefined();
        expect(post.summary).toBeDefined();
        expect(post.publishedAt).toBeDefined();
        expect(post.status).toBeDefined();
        expect(post.tags).toBeDefined();

        expect(typeof post.id).toBe('number');
        expect(typeof post.slug).toBe('string');
        expect(typeof post.title).toBe('string');
        expect(typeof post.summary).toBe('string');
        expect(typeof post.publishedAt).toBe('string');
        expect(typeof post.status).toBe('string');
        expect(Array.isArray(post.tags)).toBe(true);

        expect(post.slug.length).toBeGreaterThan(0);
        expect(post.title.length).toBeGreaterThan(0);
        expect(post.summary.length).toBeGreaterThan(0);
      });
    });
  });
});