# Entities Layer Guide

This folder represents the **Entities Layer** of the Feature Slice Design (FSD) architecture.

## 🎯 Entities Layer Responsibilities

### Responsibilities
- **Domain Model Definition**: Types and interfaces for business entities
- **Business Logic**: Core business rules for each entity
- **Data Transformation**: Converting API responses to domain models
- **Validation**: Entity-level data validation

### Restrictions
- ❌ No UI component definitions
- ❌ No dependencies on Features layer
- ❌ No dependencies on Pages layer
- ❌ No dependencies on App layer

## 📁 Folder Structure

```
src/entities/
├── CLAUDE.md                  # This file
├── user/                      # User entity
│   ├── CLAUDE.md              # User entity guide
│   ├── model/                 # Type definitions and business logic
│   │   ├── types.ts           # User type definitions
│   │   └── validation.ts      # User data validation
│   ├── api/                   # API call logic
│   │   └── userAPI.ts         # User-related API functions
│   └── hooks/                 # User-related React hooks
│       └── useUser.ts         # User data hooks
├── post/                      # Blog post entity
│   ├── CLAUDE.md
│   ├── model/
│   ├── api/
│   └── hooks/
└── tag/                       # Tag entity
    ├── CLAUDE.md
    ├── model/
    ├── api/
    └── hooks/
```

## 🔨 Implementation Patterns

### 1. Type Definitions (model/types.ts)
```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'admin' | 'user';

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}
```

### 2. Validation Logic (model/validation.ts)
```typescript
// entities/user/model/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  if (password.length < 8) {
    return { isValid: false, errorMessage: 'Password must be at least 8 characters' };
  }

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    return { isValid: false, errorMessage: 'Password must contain special characters' };
  }

  return { isValid: true };
}
```

### 3. API Logic (api/)
```typescript
// entities/user/api/userAPI.ts
import { supabase } from '@/shared/config/supabase';
import type { User, UserCreateInput } from '../model/types';

export async function getUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createUser(inputData: UserCreateInput): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert(inputData)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 4. React Hooks (hooks/)
```typescript
// entities/user/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, createUser } from '../api/userAPI';

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      queryClient.setQueryData(['user', newUser.id], newUser);
    },
  });
}
```

## 🔄 Dependency Rules

### Allowed Dependencies
```typescript
// ✅ Shared layer usage allowed
import { supabase } from '@/shared/config/supabase';
import { formatDate } from '@/shared/utils/dateUtils';

// ✅ Other modules within same Entity allowed
import { User } from './model/types';
import { validateEmail } from './model/validation';

// ✅ Other Entities allowed (use carefully)
import type { Post } from '@/entities/post/model/types';
```

### Forbidden Dependencies
```typescript
// ❌ Features layer dependencies forbidden
import { PostEditor } from '@/features/post-editor/components/PostEditor';

// ❌ Pages layer dependencies forbidden
import { HomePage } from '@/pages/index';

// ❌ App layer dependencies forbidden
import { App } from '@/app/App';
```

## 📝 Naming Conventions

### Files and Folders
- Entity folders: English (e.g., `user/`, `post/`)
- File names: camelCase (e.g., `userAPI.ts`, `useUser.ts`)

### Types and Interfaces
- Entity types: English PascalCase (e.g., `User`, `Post`)
- Input types: `[EntityName][Action]Input` (e.g., `UserCreateInput`)
- Response types: `[EntityName][Action]Response` (e.g., `UserListResponse`)

### Function Names
- API functions: `[action][Entity]` (e.g., `getUser`)
- Hooks: `use[Entity][Action]` (e.g., `useUser`)
- Validation functions: `validate[Target]` (e.g., `validateEmail`)

## 🧪 Testing Guide

### Test File Locations
```
src/entities/user/
├── model/
│   ├── types.ts
│   ├── validation.ts
│   └── __tests__/
│       ├── validation.test.ts
│       └── types.test.ts
├── api/
│   ├── userAPI.ts
│   └── __tests__/
│       └── userAPI.test.ts
└── hooks/
    ├── useUser.ts
    └── __tests__/
        └── useUser.test.ts
```

### Test Examples
```typescript
// entities/user/model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../validation';

describe('User Validation', () => {
  describe('Email validation', () => {
    it('should pass with valid email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should fail with invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should pass with 8+ characters and special characters', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(true);
    });

    it('should fail with less than 8 characters', () => {
      const result = validatePassword('pass!');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('at least 8 characters');
    });
  });
});
```

## 📋 Checklist

When adding a new entity, verify:

- [ ] Does folder structure follow standards?
- [ ] Are type definitions clear and complete?
- [ ] Is validation logic included?
- [ ] Do API functions include error handling?
- [ ] Do React hooks use appropriate caching strategies?
- [ ] Is test coverage sufficient?
- [ ] Do naming conventions comply?
- [ ] Are dependency rules not violated?

Refer to the CLAUDE.md file in each folder for detailed guides for each entity.