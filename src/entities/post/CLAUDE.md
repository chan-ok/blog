# Post Entity Guide

This folder is responsible for post-related domain models and business logic.

## 🎯 Post Entity Overview

### Business Rules
- **Write Permission**: Only administrators can create/edit/delete blog posts
- **Publication Status**: Manage draft, published, private states
- **Markdown**: Write post content in markdown format
- **Tag System**: Classify posts with multiple tags
- **SEO**: URL slug and metadata management

### Main Scenarios
1. Create new post (draft)
2. Edit post content
3. Switch post publish/private status
4. Delete post
5. Retrieve post list (pagination)
6. Filter posts by tags
7. Search posts

## 📊 Data Model

### Core Types
```typescript
// model/types.ts
export interface Post {
  id: string;                    // UUID
  title: string;                 // Post title
  slug: string;                  // URL slug (e.g., "my-first-post")
  content: string;               // Markdown format content
  summary: string;               // Post summary (displayed in list)
  authorId: string;              // Author UUID
  createdAt: Date;               // Initial creation time
  updatedAt: Date;               // Last modification time
  publishedAt?: Date;            // Publication time (only when published)
  status: PostStatus;            // Current status
  tagList: string[];             // Associated tags
  viewCount: number;             // View count
  featuredImageUrl?: string;     // Representative image
  metaTitle?: string;            // SEO title
  metaDescription?: string;      // SEO description
}

export type PostStatus = 'draft' | 'published' | 'private';

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishedAt: Date;
  tagList: string[];
  viewCount: number;
  featuredImageUrl?: string;
}

export interface PostCreateInput {
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  tagList?: string[];
  status?: PostStatus;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PostUpdateInput {
  title?: string;
  content?: string;
  summary?: string;
  slug?: string;
  tagList?: string[];
  status?: PostStatus;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PostListCondition {
  searchKeyword?: string;
  tagFilter?: string;
  statusFilter?: PostStatus;
  sortBy?: 'recent' | 'popular' | 'title';
  page?: number;
  pageSize?: number;
}

export interface PostListResponse {
  postList: PostListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
```

## 🔧 Implementation Examples

### 1. Validation and Utils (model/validation.ts)
```typescript
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateTitle(title: string): ValidationResult {
  if (!title.trim()) {
    return { isValid: false, errorMessage: '제목을 입력해주세요' };
  }

  if (title.length > 100) {
    return { isValid: false, errorMessage: '제목은 100자 이하로 입력해주세요' };
  }

  return { isValid: true };
}

export function validateSlug(slug: string): ValidationResult {
  if (!slug.trim()) {
    return { isValid: false, errorMessage: '슬러그를 입력해주세요' };
  }

  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { isValid: false, errorMessage: '슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다' };
  }

  if (slug.length > 50) {
    return { isValid: false, errorMessage: '슬러그는 50자 이하로 입력해주세요' };
  }

  return { isValid: true };
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function validateContent(content: string): ValidationResult {
  if (!content.trim()) {
    return { isValid: false, errorMessage: '내용을 입력해주세요' };
  }

  if (content.length < 10) {
    return { isValid: false, errorMessage: '내용은 최소 10자 이상 입력해주세요' };
  }

  return { isValid: true };
}

export function extractSummaryFromContent(content: string, maxLength: number = 150): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, '')        // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.*?)\*/g, '$1')      // Remove italic
    .replace(/`(.*?)`/g, '$1')        // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images
    .trim();

  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
}

export function validatePostData(data: PostCreateInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const titleValidation = validateTitle(data.title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.errorMessage!;
  }

  const contentValidation = validateContent(data.content);
  if (!contentValidation.isValid) {
    errors.content = contentValidation.errorMessage!;
  }

  if (data.slug) {
    const slugValidation = validateSlug(data.slug);
    if (!slugValidation.isValid) {
      errors.slug = slugValidation.errorMessage!;
    }
  }

  return errors;
}
```

### 2. API Functions (api/postAPI.ts)
```typescript
import { supabase } from '@/shared/config/supabase';
import type {
  Post,
  PostCreateInput,
  PostUpdateInput,
  PostListCondition,
  PostListResponse,
  PostListItem,
} from '../model/types';
import { generateSlugFromTitle } from '../model/validation';

export async function createPost(inputData: PostCreateInput): Promise<Post> {
  const slug = inputData.slug || generateSlugFromTitle(inputData.title);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: inputData.title,
      slug,
      content: inputData.content,
      summary: inputData.summary || extractSummaryFromContent(inputData.content),
      tagList: inputData.tagList || [],
      status: inputData.status || 'draft',
      featuredImageUrl: inputData.featuredImageUrl,
      metaTitle: inputData.metaTitle,
      metaDescription: inputData.metaDescription,
      viewCount: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, updateData: PostUpdateInput): Promise<Post> {
  const updatePayload: any = { ...updateData };

  // Auto-generate slug if title changed
  if (updateData.title && !updateData.slug) {
    updatePayload.slug = generateSlugFromTitle(updateData.title);
  }

  // Set publishedAt if status changed to published
  if (updateData.status === 'published') {
    updatePayload.publishedAt = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getPostList(condition: PostListCondition = {}): Promise<PostListResponse> {
  let query = supabase
    .from('posts')
    .select('id, title, slug, summary, publishedAt, tagList, viewCount, featuredImageUrl', { count: 'exact' });

  // Search keyword
  if (condition.searchKeyword) {
    query = query.or(`title.ilike.%${condition.searchKeyword}%,content.ilike.%${condition.searchKeyword}%`);
  }

  // Tag filter
  if (condition.tagFilter) {
    query = query.contains('tagList', [condition.tagFilter]);
  }

  // Status filter
  if (condition.statusFilter) {
    query = query.eq('status', condition.statusFilter);
  } else {
    // Default: only show published posts
    query = query.eq('status', 'published');
  }

  // Sorting
  switch (condition.sortBy) {
    case 'popular':
      query = query.order('viewCount', { ascending: false });
      break;
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    default: // recent
      query = query.order('publishedAt', { ascending: false });
  }

  // Pagination
  if (condition.page && condition.pageSize) {
    const startIndex = (condition.page - 1) * condition.pageSize;
    query = query.range(startIndex, startIndex + condition.pageSize - 1);
  }

  const { data: postList, error, count } = await query;

  if (error) throw error;

  return {
    postList: postList || [],
    totalCount: count || 0,
    currentPage: condition.page || 1,
    totalPages: condition.pageSize ? Math.ceil((count || 0) / condition.pageSize) : 1,
  };
}

export async function getPostDetail(idOrSlug: string): Promise<Post | null> {
  // Check if it's UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const conditionField = isUUID ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq(conditionField, idOrSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No data
    throw error;
  }

  return data;
}

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_post_view_count', { post_id: id });
  if (error) throw error;
}

export async function checkSlugDuplicate(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('posts')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

export async function getRelatedPosts(postId: string, tagList: string[], limit: number = 5): Promise<PostListItem[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, summary, publishedAt, tagList, viewCount, featuredImageUrl')
    .neq('id', postId)
    .eq('status', 'published')
    .overlaps('tagList', tagList)
    .order('publishedAt', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
```

### 3. React Hooks (hooks/usePost.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPostList,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  incrementViewCount,
  checkSlugDuplicate,
  getRelatedPosts,
} from '../api/postAPI';
import type { PostListCondition } from '../model/types';

export function usePostList(condition: PostListCondition = {}) {
  return useQuery({
    queryKey: ['postList', condition],
    queryFn: () => getPostList(condition),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePostDetail(idOrSlug: string) {
  return useQuery({
    queryKey: ['postDetail', idOrSlug],
    queryFn: () => getPostDetail(idOrSlug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!idOrSlug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['postList']);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) =>
      updatePost(id, updateData),
    onSuccess: (updatedPost, { id }) => {
      queryClient.invalidateQueries(['postList']);
      queryClient.setQueryData(['postDetail', id], updatedPost);
      queryClient.setQueryData(['postDetail', updatedPost.slug], updatedPost);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['postList']);
    },
  });
}

export function useIncrementViewCount() {
  return useMutation({
    mutationFn: incrementViewCount,
  });
}

export function useCheckSlugDuplicate() {
  return useMutation({
    mutationFn: ({ slug, excludeId }: { slug: string; excludeId?: string }) =>
      checkSlugDuplicate(slug, excludeId),
  });
}

export function useRelatedPosts(postId: string, tagList: string[]) {
  return useQuery({
    queryKey: ['relatedPosts', postId, tagList],
    queryFn: () => getRelatedPosts(postId, tagList),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!postId && tagList.length > 0,
  });
}
```

## 🧪 Test Examples

### Validation Tests
```typescript
// model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateTitle,
  validateSlug,
  validateContent,
  generateSlugFromTitle,
  extractSummaryFromContent,
} from '../validation';

describe('Post Data Validation', () => {
  describe('Title validation', () => {
    it('should pass with valid title', () => {
      const result = validateTitle('Valid Post Title');
      expect(result.isValid).toBe(true);
    });

    it('should fail with empty title', () => {
      const result = validateTitle('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('제목을 입력해주세요');
    });

    it('should fail with title over 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = validateTitle(longTitle);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Slug generation', () => {
    it('should generate valid slug from Korean title', () => {
      const slug = generateSlugFromTitle('리액트 블로그 만들기');
      expect(slug).toBe('리액트-블로그-만들기');
    });

    it('should handle special characters', () => {
      const slug = generateSlugFromTitle('React.js & TypeScript!');
      expect(slug).toBe('reactjs-typescript');
    });
  });

  describe('Summary extraction', () => {
    it('should extract plain text from markdown', () => {
      const markdown = '# Title\n\nThis is **bold** text with [link](url).';
      const summary = extractSummaryFromContent(markdown, 50);
      expect(summary).toBe('This is bold text with link.');
    });
  });
});
```

## 📋 Development Checklist

When adding new post-related features:

- [ ] Are type definitions complete?
- [ ] Is validation logic included?
- [ ] Is API error handling appropriate?
- [ ] Is TanStack Query caching strategy correct?
- [ ] Is test coverage sufficient?
- [ ] Are security considerations reflected?
- [ ] Does it match Supabase RLS policies?
- [ ] Is SEO metadata properly handled?

## 🎨 UI/UX Considerations

- **Editor**: Real-time preview, auto-save functionality
- **List**: Infinite scroll or pagination
- **Search**: Real-time search with debounce
- **Tags**: Tag autocomplete and visual grouping
- **SEO**: Auto-generation of meta information
- **Performance**: Image lazy loading, content optimization

Follow this guide to build an efficient and scalable blog post management system.