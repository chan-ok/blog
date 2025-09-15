# 데이터 플로우 가이드

이 문서는 Supabase와 TanStack Query를 활용한 데이터 관리 패턴을 설명합니다.

## 🏗️ 데이터 아키텍처 개요

```
Frontend (React) ←→ TanStack Query ←→ Supabase Client ←→ Supabase (PostgreSQL + Auth)
     ↓                    ↓                   ↓              ↓
   UI 상태            캐싱/동기화         API 호출        데이터베이스/인증
```

## 🔧 Supabase 클라이언트 설정

### 환경 변수 설정
```typescript
// .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 클라이언트 생성
```typescript
// src/shared/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseURL, supabaseAnonKey);

// 타입 안전성을 위한 Database 타입 정의
export type Database = {
  public: {
    Tables: {
      블로그글: {
        Row: {
          아이디: string;
          제목: string;
          내용: string;
          작성일자: string;
          수정일자: string;
          작성자아이디: string;
          태그목록: string[];
          발행상태: '임시저장' | '발행' | '비공개';
        };
        Insert: Omit<Database['public']['Tables']['블로그글']['Row'], '아이디' | '작성일자' | '수정일자'>;
        Update: Partial<Database['public']['Tables']['블로그글']['Insert']>;
      };
      사용자: {
        Row: {
          아이디: string;
          이메일: string;
          이름: string;
          권한: '관리자' | '일반사용자';
          가입일자: string;
        };
        Insert: Omit<Database['public']['Tables']['사용자']['Row'], '아이디' | '가입일자'>;
        Update: Partial<Database['public']['Tables']['사용자']['Insert']>;
      };
    };
  };
};
```

## 🔐 인증 시스템

### 회원가입 및 로그인
```typescript
// src/features/인증/api/인증API.ts
import { supabase } from '@/shared/config/supabase';

export async function 회원가입하기(이메일: string, 비밀번호: string) {
  const { data, error } = await supabase.auth.signUp({
    email: 이메일,
    password: 비밀번호,
    options: {
      emailRedirectTo: 'https://yourdomain.com/welcome',
    },
  });

  if (error) throw error;
  return data;
}

export async function 로그인하기(이메일: string, 비밀번호: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 이메일,
    password: 비밀번호,
  });

  if (error) throw error;
  return data;
}

export async function 로그아웃하기() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function 현재사용자가져오기() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
```

### 인증 상태 관리 Hook
```typescript
// src/features/인증/hooks/use인증상태.ts
import { useQuery } from '@tanstack/react-query';
import { 현재사용자가져오기 } from '../api/인증API';

export function use인증상태() {
  return useQuery({
    queryKey: ['인증상태'],
    queryFn: 현재사용자가져오기,
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
}
```

## 📊 데이터베이스 스키마 및 RLS 설정

### 블로그글 테이블 생성
```sql
-- 블로그글 테이블
CREATE TABLE public.블로그글 (
  아이디 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  제목 TEXT NOT NULL,
  내용 TEXT NOT NULL,
  작성일자 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  수정일자 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  작성자아이디 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  태그목록 TEXT[] DEFAULT '{}',
  발행상태 TEXT DEFAULT '임시저장' CHECK (발행상태 IN ('임시저장', '발행', '비공개'))
);

-- RLS 활성화
ALTER TABLE public.블로그글 ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 발행된 글을 읽을 수 있음
CREATE POLICY "발행된_글은_모두_볼_수_있음"
  ON public.블로그글 FOR SELECT
  TO anon, authenticated
  USING (발행상태 = '발행');

-- 작성자만 자신의 글을 관리할 수 있음
CREATE POLICY "작성자만_글_관리_가능"
  ON public.블로그글 FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = 작성자아이디);
```

### 사용자 정보 테이블
```sql
-- 사용자 정보 테이블
CREATE TABLE public.사용자 (
  아이디 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  이메일 TEXT NOT NULL,
  이름 TEXT,
  권한 TEXT DEFAULT '일반사용자' CHECK (권한 IN ('관리자', '일반사용자')),
  가입일자 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.사용자 ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 볼 수 있음
CREATE POLICY "사용자는_자신의_정보만_볼_수_있음"
  ON public.사용자 FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = 아이디);

-- 새 사용자 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.새사용자처리()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.사용자 (아이디, 이메일)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER 새사용자생성시
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.새사용자처리();
```

## 🔄 TanStack Query 패턴

### 블로그글 관련 쿼리
```typescript
// src/entities/블로그글/api/블로그글API.ts
import { supabase, type Database } from '@/shared/config/supabase';

type 블로그글 = Database['public']['Tables']['블로그글']['Row'];
type 블로그글입력 = Database['public']['Tables']['블로그글']['Insert'];
type 블로그글수정 = Database['public']['Tables']['블로그글']['Update'];

export async function 블로그글목록가져오기(
  페이지번호: number = 1,
  페이지크기: number = 10,
  태그필터?: string
) {
  let 쿼리 = supabase
    .from('블로그글')
    .select('*')
    .eq('발행상태', '발행')
    .order('작성일자', { ascending: false })
    .range((페이지번호 - 1) * 페이지크기, 페이지번호 * 페이지크기 - 1);

  if (태그필터) {
    쿼리 = 쿼리.contains('태그목록', [태그필터]);
  }

  const { data, error, count } = await 쿼리;
  if (error) throw error;

  return {
    블로그글목록: data,
    전체개수: count,
    현재페이지: 페이지번호,
    총페이지수: Math.ceil((count || 0) / 페이지크기),
  };
}

export async function 블로그글상세가져오기(아이디: string) {
  const { data, error } = await supabase
    .from('블로그글')
    .select('*')
    .eq('아이디', 아이디)
    .eq('발행상태', '발행')
    .single();

  if (error) throw error;
  return data;
}

export async function 블로그글작성하기(블로그글데이터: 블로그글입력) {
  const { data, error } = await supabase
    .from('블로그글')
    .insert(블로그글데이터)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 블로그글수정하기(아이디: string, 수정데이터: 블로그글수정) {
  const { data, error } = await supabase
    .from('블로그글')
    .update({
      ...수정데이터,
      수정일자: new Date().toISOString(),
    })
    .eq('아이디', 아이디)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 블로그글삭제하기(아이디: string) {
  const { error } = await supabase
    .from('블로그글')
    .delete()
    .eq('아이디', 아이디);

  if (error) throw error;
}
```

### 커스텀 훅 정의
```typescript
// src/entities/블로그글/hooks/use블로그글.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  블로그글목록가져오기,
  블로그글상세가져오기,
  블로그글작성하기,
  블로그글수정하기,
  블로그글삭제하기,
} from '../api/블로그글API';

// 블로그글 목록 조회
export function use블로그글목록(페이지번호: number, 태그필터?: string) {
  return useQuery({
    queryKey: ['블로그글목록', 페이지번호, 태그필터],
    queryFn: () => 블로그글목록가져오기(페이지번호, 10, 태그필터),
    staleTime: 5 * 60 * 1000, // 5분
    keepPreviousData: true,
  });
}

// 블로그글 상세 조회
export function use블로그글상세(아이디: string) {
  return useQuery({
    queryKey: ['블로그글상세', 아이디],
    queryFn: () => 블로그글상세가져오기(아이디),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !!아이디,
  });
}

// 블로그글 작성
export function use블로그글작성() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 블로그글작성하기,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries(['블로그글목록']);
    },
    onError: (error) => {
      console.error('블로그글 작성 실패:', error);
    },
  });
}

// 블로그글 수정
export function use블로그글수정() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 아이디, 수정데이터 }: { 아이디: string; 수정데이터: any }) =>
      블로그글수정하기(아이디, 수정데이터),
    onSuccess: (data) => {
      // 관련 캐시 업데이트
      queryClient.invalidateQueries(['블로그글목록']);
      queryClient.setQueryData(['블로그글상세', data.아이디], data);
    },
    onError: (error) => {
      console.error('블로그글 수정 실패:', error);
    },
  });
}

// 블로그글 삭제
export function use블로그글삭제() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 블로그글삭제하기,
    onSuccess: () => {
      queryClient.invalidateQueries(['블로그글목록']);
    },
    onError: (error) => {
      console.error('블로그글 삭제 실패:', error);
    },
  });
}
```

## 🔄 실시간 기능

### 실시간 구독 설정
```typescript
// src/shared/hooks/use실시간구독.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/config/supabase';

export function use블로그글실시간구독() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const 구독 = supabase
      .channel('블로그글변경사항')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: '블로그글',
        },
        (payload) => {
          console.log('블로그글 변경사항:', payload);

          // 캐시 무효화로 최신 데이터 반영
          queryClient.invalidateQueries(['블로그글목록']);

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            queryClient.setQueryData(
              ['블로그글상세', payload.new.아이디],
              payload.new
            );
          }
        }
      )
      .subscribe();

    return () => {
      구독.unsubscribe();
    };
  }, [queryClient]);
}
```

## 🛡️ 에러 처리

### 글로벌 에러 처리
```typescript
// src/shared/utils/에러처리.ts
import { PostgrestError } from '@supabase/supabase-js';

export class 데이터베이스에러 extends Error {
  constructor(public postgrestError: PostgrestError) {
    super(postgrestError.message);
    this.name = 'DatabaseError';
  }
}

export function 에러메시지변환(error: any): string {
  if (error instanceof 데이터베이스에러) {
    const { code, message } = error.postgrestError;

    switch (code) {
      case '23505':
        return '이미 존재하는 데이터입니다.';
      case '23503':
        return '참조된 데이터가 존재하지 않습니다.';
      case '42501':
        return '권한이 없습니다.';
      default:
        return `데이터베이스 오류: ${message}`;
    }
  }

  return error.message || '알 수 없는 오류가 발생했습니다.';
}

// React Query 에러 처리
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 인증 에러는 재시도하지 않음
        if (error?.code === '42501') return false;
        return failureCount < 3;
      },
      onError: (error) => {
        console.error('쿼리 에러:', 에러메시지변환(error));
      },
    },
    mutations: {
      onError: (error) => {
        console.error('뮤테이션 에러:', 에러메시지변환(error));
      },
    },
  },
});
```

## 📱 컴포넌트 사용 예시

### 블로그글 목록 컴포넌트
```typescript
// src/features/글목록/components/블로그글목록.tsx
import { useState } from 'react';
import { use블로그글목록 } from '@/entities/블로그글/hooks/use블로그글';
import { use블로그글실시간구독 } from '@/shared/hooks/use실시간구독';

export function 블로그글목록() {
  const [현재페이지, set현재페이지] = useState(1);
  const [선택된태그, set선택된태그] = useState<string>();

  const { data, isLoading, error } = use블로그글목록(현재페이지, 선택된태그);

  // 실시간 업데이트 구독
  use블로그글실시간구독();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div className="블로그글-목록">
      {data.블로그글목록.map((글) => (
        <article key={글.아이디} className="블로그글-카드">
          <h2>{글.제목}</h2>
          <p>{글.내용.substring(0, 100)}...</p>
          <div className="태그목록">
            {글.태그목록.map((태그) => (
              <span key={태그} className="태그">
                {태그}
              </span>
            ))}
          </div>
          <time>{new Date(글.작성일자).toLocaleDateString()}</time>
        </article>
      ))}

      {/* 페이지네이션 */}
      <div className="페이지네이션">
        {Array.from({ length: data.총페이지수 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => set현재페이지(i + 1)}
            className={현재페이지 === i + 1 ? '활성화' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 🚀 성능 최적화

### 캐싱 전략
```typescript
// src/shared/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 기본 stale time
      cacheTime: 10 * 60 * 1000, // 10분 캐시 유지
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false; // 클라이언트 에러는 재시도 안함
        }
        return failureCount < 3;
      },
    },
  },
});

// 중요한 데이터는 프리패치
export async function 중요데이터프리패치() {
  await queryClient.prefetchQuery({
    queryKey: ['블로그글목록', 1],
    queryFn: () => 블로그글목록가져오기(1),
  });
}
```

## 📊 데이터 플로우 체크리스트

개발 시 확인해야 할 사항들:

- [ ] **Supabase 설정**
  - [ ] 환경 변수 올바르게 설정
  - [ ] 클라이언트 초기화 정상 작동
  - [ ] 타입 정의 최신 상태 유지

- [ ] **인증 시스템**
  - [ ] RLS 정책 올바르게 설정
  - [ ] 인증 상태 전역 관리
  - [ ] 로그인/로그아웃 플로우 테스트

- [ ] **데이터 쿼리**
  - [ ] TanStack Query 훅 올바르게 구현
  - [ ] 캐싱 전략 적절히 설정
  - [ ] 에러 처리 로직 포함

- [ ] **실시간 기능**
  - [ ] 필요한 테이블에 실시간 구독 설정
  - [ ] 캐시 무효화 로직 적절히 구현
  - [ ] 구독 해제 로직 포함

- [ ] **성능**
  - [ ] 불필요한 리렌더링 방지
  - [ ] 페이지네이션 적절히 구현
  - [ ] 인덱스 최적화 (데이터베이스)

이 가이드를 따라 일관성 있고 효율적인 데이터 관리 시스템을 구축하세요.