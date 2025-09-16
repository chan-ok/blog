# Authentication System Guide

## 🔐 Authentication System Overview

### Requirements
1. **Admin-only Login**: Only administrator login without general user registration
2. **Protected Routes**: `/admin/*` paths accessible only to authenticated administrators
3. **Automatic Redirection**: Automatic redirect to login page when unauthenticated
4. **Session Persistence**: Maintain login state even after browser refresh
5. **Secure Logout**: Explicit logout functionality

### Technology Stack
- **Authentication Backend**: Supabase Auth
- **State Management**: TanStack Query + React Context
- **Routing**: TanStack Router's beforeLoad hook
- **Security**: JWT token-based authentication

## 🏗️ Architecture Design

### Component Structure

```
src/
├── features/auth/                    # Authentication feature
│   ├── components/
│   │   ├── LoginForm.tsx            # Login form
│   │   ├── LogoutButton.tsx         # Logout button
│   │   └── AuthGuard.tsx            # Authentication guard component
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication state management
│   │   └── useAuthGuard.ts          # Authentication guard hook
│   └── utils/
│       └── authHelpers.ts           # Authentication-related utilities
├── pages/
│   ├── login.tsx                    # Login page
│   └── admin/                       # Protected admin pages
│       ├── index.tsx                # Admin dashboard
│       ├── write.tsx                # Post creation
│       ├── manage.tsx               # Post management
│       └── settings.tsx             # Settings
└── shared/components/
    └── Header.tsx                   # Conditional admin menu display
```

### Data Flow

```
1. User attempts to access /admin/*
   ↓
2. AuthGuard checks authentication status
   ↓
3-a. Authenticated: Render page
3-b. Unauthenticated: Redirect to /login (save original URL)
   ↓
4. After successful login, redirect to original URL
```

## 🔧 Implementation Details

### 1. Authentication State Management (useAuth Hook)

```typescript
// src/features/auth/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { login, logout, getCurrentUser } from '@/entities/user/api/userAPI';
import type { LoginRequest } from '@/entities/user/model/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query current authentication status
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: authError
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);

      // Error if user is not admin
      if (user.role !== 'admin') {
        throw new Error('Only administrators can log in.');
      }

      // Redirect to original intended page
      const redirectUrl = sessionStorage.getItem('authRedirectUrl');
      sessionStorage.removeItem('authRedirectUrl');

      navigate({ to: redirectUrl || '/admin' });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.removeQueries(); // Clear all cache
      navigate({ to: '/' });
    },
  });

  return {
    // State
    currentUser,
    isLoadingUser,
    authError,
    isAuthenticated: !!currentUser && currentUser.role === 'admin',

    // Actions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
```

### 2. Login Form Component

```typescript
// src/features/auth/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email || !formData.password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(formData);
    } catch (error: any) {
      setErrorMessage(error.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">관리자 로그인</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
            autoComplete="current-password"
          />
        </div>

        {errorMessage && (
          <div className="text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoggingIn}
          className="w-full"
        >
          {isLoggingIn ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        관리자 계정으로만 로그인 가능합니다.
      </div>
    </div>
  );
}
```

### 3. Authentication Guard Component

```typescript
// src/features/auth/components/AuthGuard.tsx
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { Button } from '@/shared/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h2>
        <p className="text-gray-600 mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
        <Button onClick={() => window.location.href = '/login'}>
          로그인하기
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 4. TanStack Router Authentication Guard

```typescript
// src/pages/admin/_layout.tsx (Admin page layout)
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { getCurrentUser } from '@/entities/user/api/userAPI';

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async ({ location }) => {
    try {
      const user = await getCurrentUser();

      if (!user || user.role !== 'admin') {
        // Save original URL to session storage
        sessionStorage.setItem('authRedirectUrl', location.pathname);
        throw redirect({ to: '/login' });
      }
    } catch (error) {
      sessionStorage.setItem('authRedirectUrl', location.pathname);
      throw redirect({ to: '/login' });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    </AuthGuard>
  );
}
```

### 5. Login Page

```typescript
// src/pages/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getCurrentUser } from '@/entities/user/api/userAPI';

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try {
      const user = await getCurrentUser();

      // Redirect already logged-in admin to admin page
      if (user && user.role === 'admin') {
        throw redirect({ to: '/admin' });
      }
    } catch (error) {
      // Show login page if not authenticated
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">관리자 로그인</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            블로그 관리를 위해 로그인해주세요
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

### 6. Header Component Update

```typescript
// src/shared/components/Header.tsx
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { isAuthenticated, currentUser } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              내 블로그
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link to="/about">소개</Link>
              <Link to="/posts">블로그</Link>
              <Link to="/contact">연락처</Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Show admin menu only to authenticated administrators */}
            {isAuthenticated && (
              <>
                <Link
                  to="/admin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  관리자
                </Link>
                <span className="text-sm text-gray-600">
                  {currentUser?.name}님
                </span>
                <LogoutButton />
              </>
            )}

            {/* Show login button when unauthenticated */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                로그인
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 7. Logout Button Component

```typescript
// src/features/auth/components/LogoutButton.tsx
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/shared/components/ui/button';

export function LogoutButton() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logout()}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
    </Button>
  );
}
```

## 🔒 Security Considerations

### 1. Client-side Security
- JWT tokens automatically stored in httpOnly cookies by Supabase
- No sensitive information stored on client
- Session timeout management

### 2. Server-side Security (Supabase RLS)
```sql
-- Only administrators can create/edit blog posts
CREATE POLICY "admin_only_post_insert"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "admin_only_post_update"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

### 3. Route Security
- Client-side guards (for UX)
- Server-side validation (actual security)
- API endpoint permission checks

## 📋 Implementation Checklist

### Basic Authentication Features
- [ ] Supabase authentication setup
- [ ] Admin account creation
- [ ] useAuth hook implementation
- [ ] Login form component
- [ ] Logout functionality

### Route Protection
- [ ] AuthGuard component
- [ ] TanStack Router beforeLoad guard
- [ ] Redirection logic
- [ ] Login page

### UI/UX Improvements
- [ ] Conditional header menu display
- [ ] Loading state indication
- [ ] Error handling and user feedback
- [ ] Responsive login form

### Security Enhancement
- [ ] Supabase RLS policy setup
- [ ] API permission validation
- [ ] Session management
- [ ] CSRF prevention

This authentication system provides secure and user-friendly administrator authentication.