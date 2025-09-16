# User Entity Guide

This folder handles user-related domain models and business logic.

## 🎯 User Entity Overview

### Business Rules
- **Authentication**: Email/password login through Supabase Auth
- **Authorization**: Distinction between admin and regular users
- **Profile**: Basic information management like name, email
- **Security**: Password policy and session management

### Main Scenarios
1. User registration
2. Login/logout
3. Profile information updates
4. Password changes
5. Admin permission verification

## 📊 Data Model

### Core Types
```typescript
// model/types.ts
export interface User {
  id: string;                        // UUID (Supabase auth.users.id)
  email: string;                     // Login email
  name: string;                      // Display name
  role: UserRole;                    // System permissions
  createdAt: Date;                   // Account creation time
  lastLoginAt?: Date;                // Last login time
  profileImageUrl?: string;          // Profile picture (optional)
}

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

export interface ProfileUpdateInput {
  name?: string;
  profileImageUrl?: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}
```

## 🔧 Implementation Examples

### 1. Validation (model/validation.ts)
```typescript
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, errorMessage: 'Please enter email' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, errorMessage: 'Invalid email format' };
  }

  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, errorMessage: 'Please enter password' };
  }

  if (password.length < 8) {
    return { isValid: false, errorMessage: 'Password must be at least 8 characters' };
  }

  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasNumber) {
    return { isValid: false, errorMessage: 'Password must include numbers' };
  }

  if (!hasSpecialChar) {
    return { isValid: false, errorMessage: 'Password must include special characters' };
  }

  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, errorMessage: 'Please enter name' };
  }

  if (name.length < 2 || name.length > 50) {
    return { isValid: false, errorMessage: 'Name must be between 2 and 50 characters' };
  }

  return { isValid: true };
}

export function validateSignupData(data: SignupInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.errorMessage!;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.errorMessage!;
  }

  const nameResult = validateName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.errorMessage!;
  }

  return errors;
}
```

### 2. API Functions (api/userAPI.ts)
```typescript
import { supabase } from '@/shared/config/supabase';
import type {
  User,
  LoginInput,
  SignupInput,
  ProfileUpdateInput,
  PasswordChangeInput
} from '../model/types';

export async function signup(inputData: SignupInput): Promise<User> {
  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: inputData.email,
    password: inputData.password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // 2. Save profile information to public.users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: inputData.email,
      name: inputData.name,
      role: 'user',
    })
    .select()
    .single();

  if (userError) throw userError;
  return userData;
}

export async function login(inputData: LoginInput): Promise<User> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: inputData.email,
    password: inputData.password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Login failed');

  // Get user profile information
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (userError) throw userError;

  // Update last login time
  await supabase
    .from('users')
    .update({ lastLoginAt: new Date().toISOString() })
    .eq('id', authData.user.id);

  return userData;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError) {
    // User is authenticated but profile doesn't exist (data inconsistency)
    console.error('User profile not found:', userError);
    return null;
  }

  return userData;
}

export async function updateProfile(
  userId: string,
  updateData: ProfileUpdateInput
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function changePassword(changeData: PasswordChangeInput): Promise<void> {
  // Re-authenticate with current password
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  // Change password in Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: changeData.newPassword,
  });

  if (error) throw error;
}

export async function checkAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.role === 'admin';
}
```

### 3. React Hooks (hooks/useUser.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUser,
  login,
  logout,
  signup,
  updateProfile,
  changePassword,
  checkAdminRole,
} from '../api/userAPI';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.removeQueries(); // Clear all query cache
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updateData }: {
      userId: string;
      updateData: ProfileUpdateInput;
    }) => updateProfile(userId, updateData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useCheckAdminRole(userId?: string) {
  return useQuery({
    queryKey: ['adminRole', userId],
    queryFn: () => checkAdminRole(userId!),
    enabled: !!userId,
  });
}
```

## 🧪 Test Examples

### Validation Tests
```typescript
// model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateSignupData
} from '../validation';

describe('User data validation', () => {
  describe('Email validation', () => {
    it('should pass with valid email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should fail with empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please enter email');
    });

    it('should fail with invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid email format');
    });
  });

  describe('Password validation', () => {
    it('should pass with valid password', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(true);
    });

    it('should fail with less than 8 characters', () => {
      const result = validatePassword('pass1!');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('at least 8 characters');
    });
  });
});
```

## 📋 Development Checklist

When adding new user-related features:

- [ ] Are type definitions complete?
- [ ] Is validation logic included?
- [ ] Is API error handling appropriate?
- [ ] Is TanStack Query caching strategy correct?
- [ ] Is test coverage sufficient?
- [ ] Are security considerations reflected?
- [ ] Does it match Supabase RLS policies?

## 🔐 Security Considerations

- **Authentication Tokens**: Automatically managed by Supabase
- **Passwords**: Not stored on client-side
- **Session Management**: Use Supabase Auth sessions
- **Permission Verification**: Re-validation needed on server-side
- **Personal Information**: Collect only minimum necessary information

Follow this guide to build a secure and scalable user management system.