# Tag Entity Guide

This folder handles tag-related domain models and business logic.

## 🎯 Tag Entity Overview

### Business Rules
- **Classification System**: Categorize blog posts by topic
- **Multiple Tags**: A single post can have multiple tags
- **Tag Statistics**: Track post count per tag
- **Tag Management**: Admins can merge/delete tags
- **Auto-completion**: Input assistance based on existing tags

### Main Scenarios
1. Create new tag (automatically when writing posts)
2. Retrieve post list by tag
3. Display popular tags list
4. Tag search and auto-completion
5. Tag merging (duplicate removal)
6. Clean up unused tags

## 📊 Data Model

### Core Types
```typescript
// model/types.ts
export interface Tag {
  id: string;                    // UUID
  name: string;                  // Tag name (unique)
  slug: string;                  // URL slug
  description?: string;          // Tag description
  color?: string;                // Display color (hex)
  createdAt: Date;               // Creation time
  usageCount: number;            // Number of connected posts
  lastUsedAt?: Date;             // Last usage time
}

export interface TagStats {
  tagName: string;
  slug: string;
  postCount: number;
  color?: string;
}

export interface TagCreateInput {
  name: string;
  description?: string;
  color?: string;
}

export interface TagUpdateInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface TagListCondition {
  searchKeyword?: string;
  minUsageCount?: number;
  sortBy?: 'name' | 'usageCount' | 'recent';
  page?: number;
  pageSize?: number;
}

export interface TagListResponse {
  tagList: Tag[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface PopularTag {
  name: string;
  slug: string;
  postCount: number;
  color?: string;
}
```

## 🔧 Implementation Examples

### 1. Validation and Utils (model/validation.ts)
```typescript
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateTagName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, errorMessage: 'Please enter tag name' };
  }

  if (name.length > 30) {
    return { isValid: false, errorMessage: 'Tag name must be 30 characters or less' };
  }

  // Restrict special characters
  const invalidCharacters = /[<>'"&\\/]/;
  if (invalidCharacters.test(name)) {
    return { isValid: false, errorMessage: 'Tag name cannot contain special characters' };
  }

  return { isValid: true };
}

export function validateColorCode(color: string): ValidationResult {
  if (!color) {
    return { isValid: true }; // Color is optional
  }

  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(color)) {
    return { isValid: false, errorMessage: 'Invalid color code format (e.g., #FF0000)' };
  }

  return { isValid: true };
}

export function generateSlugFromTagName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                  // Replace spaces with hyphens
    .replace(/[^a-z0-9가-힣-]/g, '')       // Keep only allowed characters
    .replace(/-+/g, '-')                   // Clean up consecutive hyphens
    .replace(/^-+|-+$/g, '');              // Remove leading/trailing hyphens
}

export function generateRandomColor(): string {
  // Select from predefined beautiful color palette
  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

export function validateTagData(data: TagCreateInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameValidation = validateTagName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.errorMessage!;
  }

  if (data.color) {
    const colorValidation = validateColorCode(data.color);
    if (!colorValidation.isValid) {
      errors.color = colorValidation.errorMessage!;
    }
  }

  return errors;
}

export function sortTagList(tagList: Tag[], sortBy: string = 'name'): Tag[] {
  const copy = [...tagList];

  switch (sortBy) {
    case 'usageCount':
      return copy.sort((a, b) => b.usageCount - a.usageCount);
    case 'recent':
      return copy.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default: // name
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}
```

### 2. API Functions (api/tagAPI.ts)
```typescript
import { supabase } from '@/shared/config/supabase';
import type {
  Tag,
  TagStats,
  TagCreateInput,
  TagUpdateInput,
  TagListCondition,
  TagListResponse,
  PopularTag,
} from '../model/types';
import { generateSlugFromTagName, generateRandomColor } from '../model/validation';

export async function createTag(inputData: TagCreateInput): Promise<Tag> {
  const slug = generateSlugFromTagName(inputData.name);
  const color = inputData.color || generateRandomColor();

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: inputData.name,
      slug,
      description: inputData.description,
      color,
      usageCount: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTag(id: string, updateData: TagUpdateInput): Promise<Tag> {
  const updatePayload: any = { ...updateData };

  // Update slug if name is changed
  if (updateData.name) {
    updatePayload.slug = generateSlugFromTagName(updateData.name);
  }

  const { data, error } = await supabase
    .from('tags')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getTagList(condition: TagListCondition = {}): Promise<TagListResponse> {
  let query = supabase
    .from('tags')
    .select('*', { count: 'exact' });

  // Search keyword
  if (condition.searchKeyword) {
    query = query.ilike('name', `%${condition.searchKeyword}%`);
  }

  // Minimum usage count
  if (condition.minUsageCount) {
    query = query.gte('usageCount', condition.minUsageCount);
  }

  // Sorting
  switch (condition.sortBy) {
    case 'usageCount':
      query = query.order('usageCount', { ascending: false });
      break;
    case 'recent':
      query = query.order('createdAt', { ascending: false });
      break;
    default:
      query = query.order('name', { ascending: true });
  }

  // Pagination
  if (condition.page && condition.pageSize) {
    const startIndex = (condition.page - 1) * condition.pageSize;
    query = query.range(startIndex, startIndex + condition.pageSize - 1);
  }

  const { data: tagList, error, count } = await query;

  if (error) throw error;

  return {
    tagList: tagList || [],
    totalCount: count || 0,
    currentPage: condition.page || 1,
    totalPages: condition.pageSize ? Math.ceil((count || 0) / condition.pageSize) : 1,
  };
}

export async function getTagDetail(idOrSlug: string): Promise<Tag | null> {
  // Determine if it's UUID or slug
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const conditionField = uuidRegex.test(idOrSlug) ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq(conditionField, idOrSlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No data
    throw error;
  }

  return data;
}

export async function getPopularTags(count: number = 10): Promise<PopularTag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('name, slug, usageCount, color')
    .gt('usageCount', 0)
    .order('usageCount', { ascending: false })
    .limit(count);

  if (error) throw error;

  return (data || []).map(tag => ({
    name: tag.name,
    slug: tag.slug,
    postCount: tag.usageCount,
    color: tag.color,
  }));
}

export async function getTagAutocomplete(searchTerm: string, maxCount: number = 10): Promise<string[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .ilike('name', `${searchTerm}%`)
    .order('usageCount', { ascending: false })
    .limit(maxCount);

  if (error) throw error;
  return (data || []).map(tag => tag.name);
}

export async function checkTagNameDuplicate(name: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('tags')
    .select('id')
    .eq('name', name);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

export async function mergeTags(sourceTagId: string, targetTagId: string): Promise<void> {
  // Complex operation that should be handled as transaction
  // 1. Change all posts using target tag to use source tag
  // 2. Update usage count of source tag
  // 3. Delete target tag

  const { error } = await supabase.rpc('merge_tags', {
    source_tag_id: sourceTagId,
    target_tag_id: targetTagId,
  });

  if (error) throw error;
}

export async function cleanupUnusedTags(): Promise<number> {
  const { data, error } = await supabase
    .from('tags')
    .delete()
    .eq('usageCount', 0)
    .select('id');

  if (error) throw error;
  return data?.length || 0;
}

export async function getTagStats(): Promise<TagStats[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('name, slug, usageCount, color')
    .gt('usageCount', 0)
    .order('usageCount', { ascending: false });

  if (error) throw error;

  return (data || []).map(tag => ({
    tagName: tag.name,
    slug: tag.slug,
    postCount: tag.usageCount,
    color: tag.color,
  }));
}
```

### 3. React Hooks (hooks/useTag.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTagList,
  getTagDetail,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  getTagAutocomplete,
  checkTagNameDuplicate,
  mergeTags,
  cleanupUnusedTags,
  getTagStats,
} from '../api/tagAPI';
import type { TagListCondition } from '../model/types';

export function useTagList(condition: TagListCondition = {}) {
  return useQuery({
    queryKey: ['tagList', condition],
    queryFn: () => getTagList(condition),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTagDetail(idOrSlug: string) {
  return useQuery({
    queryKey: ['tagDetail', idOrSlug],
    queryFn: () => getTagDetail(idOrSlug),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!idOrSlug,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tagList']);
      queryClient.invalidateQueries(['popularTags']);
      queryClient.invalidateQueries(['tagStats']);
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) =>
      updateTag(id, updateData),
    onSuccess: (updatedTag, { id }) => {
      queryClient.invalidateQueries(['tagList']);
      queryClient.setQueryData(['tagDetail', id], updatedTag);
      queryClient.setQueryData(['tagDetail', updatedTag.slug], updatedTag);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tagList']);
      queryClient.invalidateQueries(['popularTags']);
      queryClient.invalidateQueries(['tagStats']);
    },
  });
}

export function usePopularTags(count?: number) {
  return useQuery({
    queryKey: ['popularTags', count],
    queryFn: () => getPopularTags(count),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useTagAutocomplete() {
  return useMutation({
    mutationFn: ({ searchTerm, maxCount }: { searchTerm: string; maxCount?: number }) =>
      getTagAutocomplete(searchTerm, maxCount),
  });
}

export function useCheckTagNameDuplicate() {
  return useMutation({
    mutationFn: ({ name, excludeId }: { name: string; excludeId?: string }) =>
      checkTagNameDuplicate(name, excludeId),
  });
}

export function useMergeTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceTagId, targetTagId }: {
      sourceTagId: string;
      targetTagId: string;
    }) => mergeTags(sourceTagId, targetTagId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tagList']);
      queryClient.invalidateQueries(['postList']);
      queryClient.invalidateQueries(['tagStats']);
    },
  });
}

export function useCleanupUnusedTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupUnusedTags,
    onSuccess: () => {
      queryClient.invalidateQueries(['tagList']);
    },
  });
}

export function useTagStats() {
  return useQuery({
    queryKey: ['tagStats'],
    queryFn: getTagStats,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

## 🧪 Test Examples

### Validation Tests
```typescript
// model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateTagName,
  validateColorCode,
  generateSlugFromTagName,
  generateRandomColor,
  sortTagList,
} from '../validation';

describe('Tag Validation', () => {
  describe('Tag name validation', () => {
    it('should pass with valid tag name', () => {
      const result = validateTagName('React');
      expect(result.isValid).toBe(true);
    });

    it('should fail with empty tag name', () => {
      const result = validateTagName('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please enter tag name');
    });

    it('should fail with special characters in tag name', () => {
      const result = validateTagName('React<>');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Color code validation', () => {
    it('should pass with valid hex colors', () => {
      expect(validateColorCode('#FF0000').isValid).toBe(true);
      expect(validateColorCode('#f00').isValid).toBe(true);
    });

    it('should fail with invalid color format', () => {
      const result = validateColorCode('red');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Slug generation', () => {
    it('should generate slug from Korean tag name', () => {
      const slug = generateSlugFromTagName('리액트 개발');
      expect(slug).toBe('리액트-개발');
    });

    it('should remove special characters', () => {
      const slug = generateSlugFromTagName('React.js!');
      expect(slug).toBe('reactjs');
    });
  });

  describe('Random color generation', () => {
    it('should generate valid hex color', () => {
      const color = generateRandomColor();
      expect(color).toMatch(/^#[A-Fa-f0-9]{6}$/);
    });
  });
});
```

## 📋 Development Checklist

When adding new tag-related features:

- [ ] Check tag name uniqueness constraints
- [ ] Maintain color palette consistency
- [ ] Verify tag usage count accuracy
- [ ] Optimize autocomplete performance
- [ ] Confirm tag merge functionality stability
- [ ] Set unused tag cleanup cycle
- [ ] Verify tag statistics caching strategy appropriateness
- [ ] Utilize search indexes

## 🎨 UI/UX Considerations

- **Color System**: Visual distinction through unique colors per tag
- **Auto-completion**: Real-time suggestions during input
- **Tag Cloud**: Size adjustment based on popularity
- **Filtering**: Immediate related post retrieval by clicking tags
- **Management Tools**: Admin interface for tag merging/cleanup

Follow this guide to build an efficient tag system.