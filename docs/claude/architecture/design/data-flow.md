# Data Flow Guide

This document explains data management patterns using Supabase and TanStack Query.

## 🏗️ Data Architecture Overview

```
Frontend (React) ←→ TanStack Query ←→ Supabase Client ←→ Supabase (PostgreSQL + Auth)
     ↓                    ↓                   ↓              ↓
   UI State           Caching/Sync         API Calls      Database/Auth
```

## 🔧 Supabase Client Setup

### Environment Variables
```typescript
// .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Client Creation
```typescript
// src/shared/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseURL, supabaseAnonKey);

// Database type definitions for type safety
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          createdAt: string;
          updatedAt: string;
          authorId: string;
          tagList: string[];
          status: 'draft' | 'published' | 'private';
        };
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user';
          createdAt: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
};
```

## 🔐 Authentication System

### Signup and Login
```typescript
// src/entities/user/api/userAPI.ts
import { supabase } from '@/shared/config/supabase';

export async function signup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'https://yourdomain.com/welcome',
    },
  });

  if (error) throw error;
  return data;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
```

### Authentication State Management
```typescript
// src/entities/user/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, login, logout } from '../api/userAPI';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries(['auth']);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
    },
  });
}
```

## 📝 CRUD Operations

### Post Management
```typescript
// src/entities/post/api/postAPI.ts
import { supabase } from '@/shared/config/supabase';
import type { Post, PostCreateInput, PostUpdateInput } from '../model/types';

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  return data;
}

export async function createPost(input: PostCreateInput): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, input: PostUpdateInput): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(input)
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
```

### TanStack Query Integration
```typescript
// src/entities/post/hooks/usePost.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, getPost, createPost, updatePost, deletePost } from '../api/postAPI';

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => getPost(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostUpdateInput }) =>
      updatePost(id, input),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries(['posts']);
      queryClient.setQueryData(['posts', updatedPost.id], updatedPost);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });
}
```

## 🔄 Real-time Data Synchronization

### Real-time Subscriptions
```typescript
// src/entities/post/hooks/useRealtimePosts.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/config/supabase';

export function useRealtimePosts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Real-time change received!', payload);

          // Invalidate posts queries to refetch data
          queryClient.invalidateQueries(['posts']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
```

## 🚦 Error Handling Patterns

### Global Error Handler
```typescript
// src/shared/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleSupabaseError(error: any): never {
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        throw new ApiError('Resource not found', error.code, 404);
      case '23505':
        throw new ApiError('Duplicate entry', error.code, 409);
      case '42501':
        throw new ApiError('Insufficient permissions', error.code, 403);
      default:
        throw new ApiError(error.message || 'Unknown error', error.code, 500);
    }
  }

  throw new ApiError('Network error', 'NETWORK_ERROR', 500);
}
```

### Query Error Handling
```typescript
// src/entities/post/hooks/usePostsWithError.ts
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../api/postAPI';
import { handleSupabaseError } from '@/shared/utils/errorHandler';

export function usePostsWithError() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        return await getPosts();
      } catch (error) {
        return handleSupabaseError(error);
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof ApiError && error.statusCode && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
```

## 📊 Performance Optimization

### Query Optimization
```typescript
// src/entities/post/hooks/useOptimizedPosts.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/config/supabase';

export function useInfinitePosts(pageSize = 10) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('createdAt', { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (error) throw error;
      return {
        data,
        nextPage: data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Optimistic Updates
```typescript
// src/entities/post/hooks/useOptimisticPost.ts
export function useOptimisticUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostUpdateInput }) =>
      updatePost(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['posts', id]);

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['posts', id]);

      // Optimistically update cache
      queryClient.setQueryData(['posts', id], (old: Post) => ({
        ...old,
        ...input,
      }));

      return { previousPost, id };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', context.id], context.previousPost);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['posts', id]);
    },
  });
}
```

## 🔒 Security Best Practices

### Row Level Security (RLS)
```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view published posts
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

-- Only post authors and admins can update posts
CREATE POLICY "Posts are editable by author" ON posts
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Client-side Permission Checks
```typescript
// src/shared/utils/permissions.ts
import { User } from '@/entities/user/model/types';

export function canEditPost(user: User | null, postAuthorId: string): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.id === postAuthorId;
}

export function canDeletePost(user: User | null, postAuthorId: string): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.id === postAuthorId;
}
```

## 📝 Best Practices Summary

1. **Type Safety**: Always define TypeScript types for database schemas
2. **Error Handling**: Implement comprehensive error handling for all API calls
3. **Caching Strategy**: Use appropriate staleTime and cacheTime for different data types
4. **Real-time Updates**: Implement real-time subscriptions for collaborative features
5. **Security**: Always use RLS and validate permissions on both client and server
6. **Performance**: Use infinite queries for large datasets and optimistic updates for better UX
7. **Testing**: Mock Supabase client for unit tests and use MSW for integration tests

This data flow architecture ensures scalable, secure, and performant data management for the blog application.