# 사용자 엔티티 가이드

이 폴더는 사용자 관련 도메인 모델과 비즈니스 로직을 담당합니다.

## 🎯 사용자 엔티티 개요

### 비즈니스 규칙
- **인증**: Supabase Auth를 통한 이메일/비밀번호 로그인
- **권한**: 관리자와 일반사용자 구분
- **프로필**: 이름, 이메일 등 기본 정보 관리
- **보안**: 비밀번호 정책 및 세션 관리

### 주요 시나리오
1. 사용자 회원가입
2. 로그인/로그아웃
3. 프로필 정보 수정
4. 비밀번호 변경
5. 관리자 권한 확인

## 📊 데이터 모델

### 핵심 타입
```typescript
// model/types.ts
export interface 사용자 {
  아이디: string;                    // UUID (Supabase auth.users.id)
  이메일: string;                    // 로그인용 이메일
  이름: string;                      // 표시명
  권한: 사용자권한;                  // 시스템 권한
  가입일자: Date;                    // 계정 생성 시점
  최종로그인일자?: Date;             // 마지막 로그인 시간
  프로필이미지URL?: string;          // 프로필 사진 (선택사항)
}

export type 사용자권한 = '관리자' | '일반사용자';

export interface 사용자프로필 {
  아이디: string;
  이름: string;
  이메일: string;
  프로필이미지URL?: string;
}

export interface 로그인입력 {
  이메일: string;
  비밀번호: string;
}

export interface 회원가입입력 {
  이메일: string;
  비밀번호: string;
  이름: string;
}

export interface 프로필수정입력 {
  이름?: string;
  프로필이미지URL?: string;
}

export interface 비밀번호변경입력 {
  현재비밀번호: string;
  새비밀번호: string;
}
```

## 🔧 구현 예시

### 1. 유효성 검증 (model/validation.ts)
```typescript
export interface 검증결과 {
  유효함: boolean;
  에러메시지?: string;
}

export function 이메일검증(이메일: string): 검증결과 {
  if (!이메일.trim()) {
    return { 유효함: false, 에러메시지: '이메일을 입력해주세요' };
  }

  const 이메일정규식 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!이메일정규식.test(이메일)) {
    return { 유효함: false, 에러메시지: '올바른 이메일 형식이 아닙니다' };
  }

  return { 유효함: true };
}

export function 비밀번호검증(비밀번호: string): 검증결과 {
  if (!비밀번호) {
    return { 유효함: false, 에러메시지: '비밀번호를 입력해주세요' };
  }

  if (비밀번호.length < 8) {
    return { 유효함: false, 에러메시지: '비밀번호는 8자 이상이어야 합니다' };
  }

  const 숫자포함 = /\d/.test(비밀번호);
  const 특수문자포함 = /[!@#$%^&*(),.?":{}|<>]/.test(비밀번호);

  if (!숫자포함) {
    return { 유효함: false, 에러메시지: '비밀번호에 숫자를 포함해주세요' };
  }

  if (!특수문자포함) {
    return { 유효함: false, 에러메시지: '비밀번호에 특수문자를 포함해주세요' };
  }

  return { 유효함: true };
}

export function 이름검증(이름: string): 검증결과 {
  if (!이름.trim()) {
    return { 유효함: false, 에러메시지: '이름을 입력해주세요' };
  }

  if (이름.length < 2 || 이름.length > 50) {
    return { 유효함: false, 에러메시지: '이름은 2자 이상 50자 이하로 입력해주세요' };
  }

  return { 유효함: true };
}

export function 회원가입데이터검증(데이터: 회원가입입력): Record<string, string> {
  const 에러들: Record<string, string> = {};

  const 이메일검증결과 = 이메일검증(데이터.이메일);
  if (!이메일검증결과.유효함) {
    에러들.이메일 = 이메일검증결과.에러메시지!;
  }

  const 비밀번호검증결과 = 비밀번호검증(데이터.비밀번호);
  if (!비밀번호검증결과.유효함) {
    에러들.비밀번호 = 비밀번호검증결과.에러메시지!;
  }

  const 이름검증결과 = 이름검증(데이터.이름);
  if (!이름검증결과.유효함) {
    에러들.이름 = 이름검증결과.에러메시지!;
  }

  return 에러들;
}
```

### 2. API 함수 (api/사용자API.ts)
```typescript
import { supabase } from '@/shared/config/supabase';
import type {
  사용자,
  로그인입력,
  회원가입입력,
  프로필수정입력,
  비밀번호변경입력
} from '../model/types';

export async function 회원가입하기(입력데이터: 회원가입입력): Promise<사용자> {
  // 1. Supabase Auth에 사용자 생성
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 입력데이터.이메일,
    password: 입력데이터.비밀번호,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('사용자 생성에 실패했습니다');

  // 2. 프로필 정보를 public.사용자 테이블에 저장
  const { data: userData, error: userError } = await supabase
    .from('사용자')
    .insert({
      아이디: authData.user.id,
      이메일: 입력데이터.이메일,
      이름: 입력데이터.이름,
      권한: '일반사용자',
    })
    .select()
    .single();

  if (userError) throw userError;
  return userData;
}

export async function 로그인하기(입력데이터: 로그인입력): Promise<사용자> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 입력데이터.이메일,
    password: 입력데이터.비밀번호,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('로그인에 실패했습니다');

  // 사용자 프로필 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from('사용자')
    .select('*')
    .eq('아이디', authData.user.id)
    .single();

  if (userError) throw userError;

  // 최종 로그인 시간 업데이트
  await supabase
    .from('사용자')
    .update({ 최종로그인일자: new Date().toISOString() })
    .eq('아이디', authData.user.id);

  return userData;
}

export async function 로그아웃하기(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function 현재사용자가져오기(): Promise<사용자 | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) return null;

  const { data: userData, error: userError } = await supabase
    .from('사용자')
    .select('*')
    .eq('아이디', user.id)
    .single();

  if (userError) {
    // 인증은 되어있지만 프로필이 없는 경우 (데이터 불일치)
    console.error('사용자 프로필을 찾을 수 없습니다:', userError);
    return null;
  }

  return userData;
}

export async function 프로필수정하기(
  사용자아이디: string,
  수정데이터: 프로필수정입력
): Promise<사용자> {
  const { data, error } = await supabase
    .from('사용자')
    .update(수정데이터)
    .eq('아이디', 사용자아이디)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 비밀번호변경하기(변경데이터: 비밀번호변경입력): Promise<void> {
  // 현재 비밀번호로 재인증
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다');

  // Supabase Auth에서 비밀번호 변경
  const { error } = await supabase.auth.updateUser({
    password: 변경데이터.새비밀번호,
  });

  if (error) throw error;
}

export async function 사용자권한확인(사용자아이디: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('사용자')
    .select('권한')
    .eq('아이디', 사용자아이디)
    .single();

  if (error) throw error;
  return data.권한 === '관리자';
}
```

### 3. 리액트 훅 (hooks/use사용자.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  현재사용자가져오기,
  로그인하기,
  로그아웃하기,
  회원가입하기,
  프로필수정하기,
  비밀번호변경하기,
  사용자권한확인,
} from '../api/사용자API';

export function use현재사용자() {
  return useQuery({
    queryKey: ['현재사용자'],
    queryFn: 현재사용자가져오기,
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
}

export function use로그인() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 로그인하기,
    onSuccess: (사용자) => {
      queryClient.setQueryData(['현재사용자'], 사용자);
    },
  });
}

export function use로그아웃() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 로그아웃하기,
    onSuccess: () => {
      queryClient.setQueryData(['현재사용자'], null);
      queryClient.removeQueries(); // 모든 쿼리 캐시 정리
    },
  });
}

export function use회원가입() {
  return useMutation({
    mutationFn: 회원가입하기,
  });
}

export function use프로필수정() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 사용자아이디, 수정데이터 }: {
      사용자아이디: string;
      수정데이터: 프로필수정입력;
    }) => 프로필수정하기(사용자아이디, 수정데이터),
    onSuccess: (수정된사용자) => {
      queryClient.setQueryData(['현재사용자'], 수정된사용자);
    },
  });
}

export function use비밀번호변경() {
  return useMutation({
    mutationFn: 비밀번호변경하기,
  });
}

export function use관리자권한확인(사용자아이디?: string) {
  return useQuery({
    queryKey: ['관리자권한', 사용자아이디],
    queryFn: () => 사용자권한확인(사용자아이디!),
    enabled: !!사용자아이디,
  });
}
```

## 🧪 테스트 예시

### 유효성 검증 테스트
```typescript
// model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  이메일검증,
  비밀번호검증,
  이름검증,
  회원가입데이터검증
} from '../validation';

describe('사용자 데이터 유효성 검증', () => {
  describe('이메일 검증', () => {
    it('유효한 이메일은 통과해야 한다', () => {
      const 결과 = 이메일검증('test@example.com');
      expect(결과.유효함).toBe(true);
    });

    it('빈 이메일은 실패해야 한다', () => {
      const 결과 = 이메일검증('');
      expect(결과.유효함).toBe(false);
      expect(결과.에러메시지).toBe('이메일을 입력해주세요');
    });

    it('잘못된 형식의 이메일은 실패해야 한다', () => {
      const 결과 = 이메일검증('invalid-email');
      expect(결과.유효함).toBe(false);
      expect(결과.에러메시지).toBe('올바른 이메일 형식이 아닙니다');
    });
  });

  describe('비밀번호 검증', () => {
    it('유효한 비밀번호는 통과해야 한다', () => {
      const 결과 = 비밀번호검증('password123!');
      expect(결과.유효함).toBe(true);
    });

    it('8자 미만은 실패해야 한다', () => {
      const 결과 = 비밀번호검증('pass1!');
      expect(결과.유효함).toBe(false);
      expect(결과.에러메시지).toContain('8자 이상');
    });
  });
});
```

## 📋 개발 체크리스트

새로운 사용자 관련 기능 추가 시:

- [ ] 타입 정의가 완전한가?
- [ ] 유효성 검증 로직이 포함되어 있는가?
- [ ] API 에러 처리가 적절한가?
- [ ] TanStack Query 캐싱 전략이 올바른가?
- [ ] 테스트 커버리지가 충분한가?
- [ ] 보안 고려사항이 반영되어 있는가?
- [ ] Supabase RLS 정책과 일치하는가?

## 🔐 보안 고려사항

- **인증 토큰**: Supabase가 자동 관리
- **비밀번호**: 클라이언트에 저장하지 않음
- **세션 관리**: Supabase Auth 세션 사용
- **권한 확인**: 서버 사이드에서 재검증 필요
- **개인정보**: 최소한의 정보만 수집

이 가이드를 따라 안전하고 확장 가능한 사용자 관리 시스템을 구축하세요.