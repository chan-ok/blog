# 인증 시스템 가이드

## 🔐 인증 시스템 개요

### 요구사항
1. **관리자 전용 로그인**: 일반 사용자 회원가입 없이 관리자만 로그인
2. **보호된 라우트**: `/admin/*` 경로는 인증된 관리자만 접근 가능
3. **자동 리다이렉션**: 미인증 시 로그인 페이지로 자동 이동
4. **세션 유지**: 브라우저 새로고침 시에도 로그인 상태 유지
5. **안전한 로그아웃**: 명시적 로그아웃 기능

### 기술 스택
- **인증 백엔드**: Supabase Auth
- **상태 관리**: TanStack Query + React Context
- **라우팅**: TanStack Router의 beforeLoad 훅
- **보안**: JWT 토큰 기반 인증

## 🏗️ 아키텍처 설계

### 컴포넌트 구조

```
src/
├── features/auth/                    # 인증 기능
│   ├── components/
│   │   ├── LoginForm.tsx            # 로그인 폼
│   │   ├── LogoutButton.tsx         # 로그아웃 버튼
│   │   └── AuthGuard.tsx            # 인증 가드 컴포넌트
│   ├── hooks/
│   │   ├── useAuth.ts               # 인증 상태 관리
│   │   └── useAuthGuard.ts          # 인증 가드 훅
│   └── utils/
│       └── authHelpers.ts           # 인증 관련 유틸리티
├── pages/
│   ├── login.tsx                    # 로그인 페이지
│   └── admin/                       # 보호된 관리자 페이지들
│       ├── index.tsx                # 관리자 대시보드
│       ├── write.tsx                # 글 작성
│       ├── manage.tsx               # 글 관리
│       └── settings.tsx             # 설정
└── shared/components/
    └── Header.tsx                   # 조건부 관리자 메뉴 표시
```

### 데이터 플로우

```
1. 사용자가 /admin/* 접근 시도
   ↓
2. AuthGuard에서 인증 상태 확인
   ↓
3-a. 인증됨: 페이지 렌더링
3-b. 미인증: /login으로 리다이렉트 (원래 URL 저장)
   ↓
4. 로그인 성공 시 원래 URL로 리다이렉트
```

## 🔧 구현 상세

### 1. 인증 상태 관리 (useAuth Hook)

```typescript
// src/features/auth/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { 로그인하기, 로그아웃하기, 현재사용자가져오기 } from '@/entities/user/api/userAPI';
import type { 로그인요청 } from '@/entities/user/model/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 현재 인증 상태 조회
  const {
    data: 현재사용자,
    isLoading: 로딩중,
    error: 에러
  } = useQuery({
    queryKey: ['현재사용자'],
    queryFn: 현재사용자가져오기,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 로그인 뮤테이션
  const 로그인뮤테이션 = useMutation({
    mutationFn: 로그인하기,
    onSuccess: (사용자) => {
      queryClient.setQueryData(['현재사용자'], 사용자);

      // 관리자가 아닌 경우 에러
      if (사용자.권한 !== '관리자') {
        throw new Error('관리자만 로그인할 수 있습니다.');
      }

      // 원래 가려던 페이지로 리다이렉트
      const 리다이렉트URL = sessionStorage.getItem('인증후리다이렉트URL');
      sessionStorage.removeItem('인증후리다이렉트URL');

      navigate({ to: 리다이렉트URL || '/admin' });
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
    },
  });

  // 로그아웃 뮤테이션
  const 로그아웃뮤테이션 = useMutation({
    mutationFn: 로그아웃하기,
    onSuccess: () => {
      queryClient.setQueryData(['현재사용자'], null);
      queryClient.removeQueries(); // 모든 캐시 정리
      navigate({ to: '/' });
    },
  });

  return {
    // 상태
    현재사용자,
    로딩중,
    에러,
    인증됨: !!현재사용자 && 현재사용자.권한 === '관리자',

    // 액션
    로그인: 로그인뮤테이션.mutate,
    로그아웃: 로그아웃뮤테이션.mutate,
    로그인로딩중: 로그인뮤테이션.isPending,
    로그아웃로딩중: 로그아웃뮤테이션.isPending,
  };
}
```

### 2. 로그인 폼 컴포넌트

```typescript
// src/features/auth/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { InputField } from '@/shared/components/ui/input';

export function LoginForm() {
  const [폼데이터, set폼데이터] = useState({
    이메일: '',
    비밀번호: '',
  });
  const [에러메시지, set에러메시지] = useState('');

  const { 로그인, 로그인로딩중 } = useAuth();

  const 제출처리 = async (e: React.FormEvent) => {
    e.preventDefault();
    set에러메시지('');

    if (!폼데이터.이메일 || !폼데이터.비밀번호) {
      set에러메시지('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await 로그인(폼데이터);
    } catch (error: any) {
      set에러메시지(error.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">관리자 로그인</h2>

      <form onSubmit={제출처리} className="space-y-4">
        <InputField
          label="이메일"
          type="email"
          value={폼데이터.이메일}
          onChange={(e) => set폼데이터(prev => ({ ...prev, 이메일: e.target.value }))}
          required
          autoComplete="email"
        />

        <InputField
          label="비밀번호"
          type="password"
          value={폼데이터.비밀번호}
          onChange={(e) => set폼데이터(prev => ({ ...prev, 비밀번호: e.target.value }))}
          required
          autoComplete="current-password"
        />

        {에러메시지 && (
          <div className="text-red-600 text-sm text-center">
            {에러메시지}
          </div>
        )}

        <Button
          type="submit"
          disabled={로그인로딩중}
          className="w-full"
        >
          {로그인로딩중 ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        관리자 계정으로만 로그인 가능합니다.
      </div>
    </div>
  );
}
```

### 3. 인증 가드 컴포넌트

```typescript
// src/features/auth/components/AuthGuard.tsx
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { 인증됨, 로딩중 } = useAuth();

  if (로딩중) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!인증됨) {
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

### 4. TanStack Router 인증 가드

```typescript
// src/pages/admin/_layout.tsx (관리자 페이지 레이아웃)
import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { 현재사용자가져오기 } from '@/entities/user/api/userAPI';

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: async ({ location }) => {
    try {
      const 사용자 = await 현재사용자가져오기();

      if (!사용자 || 사용자.권한 !== '관리자') {
        // 원래 URL을 세션 스토리지에 저장
        sessionStorage.setItem('인증후리다이렉트URL', location.pathname);
        throw redirect({ to: '/login' });
      }
    } catch (error) {
      sessionStorage.setItem('인증후리다이렉트URL', location.pathname);
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

### 5. 로그인 페이지

```typescript
// src/pages/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { 현재사용자가져오기 } from '@/entities/user/api/userAPI';

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try {
      const 사용자 = await 현재사용자가져오기();

      // 이미 로그인된 관리자는 관리자 페이지로 리다이렉트
      if (사용자 && 사용자.권한 === '관리자') {
        throw redirect({ to: '/admin' });
      }
    } catch (error) {
      // 인증되지 않은 경우 로그인 페이지 표시
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

### 6. 헤더 컴포넌트 업데이트

```typescript
// src/shared/components/Header.tsx
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function Header() {
  const { 인증됨, 현재사용자 } = useAuth();

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
            {/* 인증된 관리자에게만 관리자 메뉴 표시 */}
            {인증됨 && (
              <>
                <Link
                  to="/admin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  관리자
                </Link>
                <span className="text-sm text-gray-600">
                  {현재사용자?.이름}님
                </span>
                <LogoutButton />
              </>
            )}

            {/* 미인증시에는 로그인 버튼 */}
            {!인증됨 && (
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

## 🔒 보안 고려사항

### 1. 클라이언트 사이드 보안
- JWT 토큰은 Supabase가 자동으로 httpOnly 쿠키에 저장
- 민감한 정보는 클라이언트에 저장하지 않음
- 세션 타임아웃 관리

### 2. 서버 사이드 보안 (Supabase RLS)
```sql
-- 관리자만 블로그글 작성/수정 가능
CREATE POLICY "관리자만_글_작성_가능"
  ON public.블로그글 FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.사용자
      WHERE 아이디 = auth.uid()
      AND 권한 = '관리자'
    )
  );

CREATE POLICY "관리자만_글_수정_가능"
  ON public.블로그글 FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.사용자
      WHERE 아이디 = auth.uid()
      AND 권한 = '관리자'
    )
  );
```

### 3. 라우트 보안
- 클라이언트 사이드 가드 (UX용)
- 서버 사이드 검증 (실제 보안)
- API 엔드포인트 권한 검사

## 📋 구현 체크리스트

### 기본 인증 기능
- [ ] Supabase 인증 설정
- [ ] 관리자 계정 생성
- [ ] useAuth 훅 구현
- [ ] 로그인 폼 컴포넌트
- [ ] 로그아웃 기능

### 라우트 보호
- [ ] AuthGuard 컴포넌트
- [ ] TanStack Router beforeLoad 가드
- [ ] 리다이렉션 로직
- [ ] 로그인 페이지

### UI/UX 개선
- [ ] 헤더 메뉴 조건부 표시
- [ ] 로딩 상태 표시
- [ ] 에러 처리 및 사용자 피드백
- [ ] 반응형 로그인 폼

### 보안 강화
- [ ] Supabase RLS 정책 설정
- [ ] API 권한 검증
- [ ] 세션 관리
- [ ] CSRF 방지

이 인증 시스템을 통해 안전하고 사용자 친화적인 관리자 인증을 구현할 수 있습니다.