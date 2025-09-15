# 태그 엔티티 가이드

이 폴더는 태그 관련 도메인 모델과 비즈니스 로직을 담당합니다.

## 🎯 태그 엔티티 개요

### 비즈니스 규칙
- **분류 체계**: 블로그글을 주제별로 분류
- **다중 태그**: 하나의 글에 여러 태그 할당 가능
- **태그 통계**: 태그별 글 개수 추적
- **태그 관리**: 관리자가 태그 병합/삭제 가능
- **자동 완성**: 기존 태그 기반 입력 도움

### 주요 시나리오
1. 새 태그 생성 (글 작성시 자동)
2. 태그별 글 목록 조회
3. 인기 태그 목록 표시
4. 태그 검색 및 자동완성
5. 태그 병합 (중복 제거)
6. 사용되지 않는 태그 정리

## 📊 데이터 모델

### 핵심 타입
```typescript
// model/types.ts
export interface 태그 {
  아이디: string;                    // UUID
  이름: string;                      // 태그명 (유니크)
  슬러그: string;                    // URL용 슬러그
  설명?: string;                     // 태그 설명
  색상?: string;                     // 표시용 색상 (hex)
  생성일자: Date;                    // 최초 생성 시간
  사용횟수: number;                  // 연결된 글 개수
  최종사용일자?: Date;               // 마지막 사용 시간
}

export interface 태그통계 {
  태그명: string;
  슬러그: string;
  글개수: number;
  색상?: string;
}

export interface 태그생성입력 {
  이름: string;
  설명?: string;
  색상?: string;
}

export interface 태그수정입력 {
  이름?: string;
  설명?: string;
  색상?: string;
}

export interface 태그목록조건 {
  검색키워드?: string;
  최소사용횟수?: number;
  정렬방식?: '이름순' | '사용횟수순' | '최신순';
  페이지번호?: number;
  페이지크기?: number;
}

export interface 태그목록응답 {
  태그목록: 태그[];
  전체개수: number;
  현재페이지: number;
  총페이지수: number;
}

export interface 인기태그 {
  이름: string;
  슬러그: string;
  글개수: number;
  색상?: string;
}
```

## 🔧 구현 예시

### 1. 유효성 검증 및 유틸리티 (model/validation.ts)
```typescript
export interface 검증결과 {
  유효함: boolean;
  에러메시지?: string;
}

export function 태그이름검증(이름: string): 검증결과 {
  if (!이름.trim()) {
    return { 유효함: false, 에러메시지: '태그명을 입력해주세요' };
  }

  if (이름.length > 30) {
    return { 유효함: false, 에러메시지: '태그명은 30자 이하로 입력해주세요' };
  }

  // 특수문자 제한
  const 허용되지않는문자 = /[<>'"&\\/]/;
  if (허용되지않는문자.test(이름)) {
    return { 유효함: false, 에러메시지: '태그명에 특수문자를 사용할 수 없습니다' };
  }

  return { 유효함: true };
}

export function 색상코드검증(색상: string): 검증결과 {
  if (!색상) {
    return { 유효함: true }; // 색상은 선택사항
  }

  const 색상정규식 = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!색상정규식.test(색상)) {
    return { 유효함: false, 에러메시지: '올바른 색상 코드 형식이 아닙니다 (예: #FF0000)' };
  }

  return { 유효함: true };
}

export function 태그이름에서슬러그생성(이름: string): string {
  return 이름
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                  // 공백을 하이픈으로
    .replace(/[^a-z0-9가-힣-]/g, '')       // 허용된 문자만 유지
    .replace(/-+/g, '-')                   // 연속 하이픈 정리
    .replace(/^-+|-+$/g, '');              // 앞뒤 하이픈 제거
}

export function 랜덤색상생성(): string {
  // 미리 정의된 아름다운 색상 팔레트에서 선택
  const 색상팔레트 = [
    '#3B82F6', // 파랑
    '#10B981', // 초록
    '#F59E0B', // 노랑
    '#EF4444', // 빨강
    '#8B5CF6', // 보라
    '#F97316', // 주황
    '#06B6D4', // 청록
    '#84CC16', // 라임
    '#EC4899', // 분홍
    '#6B7280', // 회색
  ];

  return 색상팔레트[Math.floor(Math.random() * 색상팔레트.length)];
}

export function 태그데이터검증(데이터: 태그생성입력): Record<string, string> {
  const 에러들: Record<string, string> = {};

  const 이름검증결과 = 태그이름검증(데이터.이름);
  if (!이름검증결과.유효함) {
    에러들.이름 = 이름검증결과.에러메시지!;
  }

  if (데이터.색상) {
    const 색상검증결과 = 색상코드검증(데이터.색상);
    if (!색상검증결과.유효함) {
      에러들.색상 = 색상검증결과.에러메시지!;
    }
  }

  return 에러들;
}

export function 태그목록정렬(태그목록: 태그[], 정렬방식: string = '이름순'): 태그[] {
  const 복사본 = [...태그목록];

  switch (정렬방식) {
    case '사용횟수순':
      return 복사본.sort((a, b) => b.사용횟수 - a.사용횟수);
    case '최신순':
      return 복사본.sort((a, b) =>
        new Date(b.생성일자).getTime() - new Date(a.생성일자).getTime()
      );
    default: // 이름순
      return 복사본.sort((a, b) => a.이름.localeCompare(b.이름, 'ko'));
  }
}
```

### 2. API 함수 (api/태그API.ts)
```typescript
import { supabase } from '@/shared/config/supabase';
import type {
  태그,
  태그통계,
  태그생성입력,
  태그수정입력,
  태그목록조건,
  태그목록응답,
  인기태그,
} from '../model/types';
import { 태그이름에서슬러그생성, 랜덤색상생성 } from '../model/validation';

export async function 태그생성하기(입력데이터: 태그생성입력): Promise<태그> {
  const 슬러그 = 태그이름에서슬러그생성(입력데이터.이름);
  const 색상 = 입력데이터.색상 || 랜덤색상생성();

  const { data, error } = await supabase
    .from('태그')
    .insert({
      이름: 입력데이터.이름,
      슬러그,
      설명: 입력데이터.설명,
      색상,
      사용횟수: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 태그수정하기(아이디: string, 수정데이터: 태그수정입력): Promise<태그> {
  const 업데이트데이터: any = { ...수정데이터 };

  // 이름이 변경되면 슬러그도 업데이트
  if (수정데이터.이름) {
    업데이트데이터.슬러그 = 태그이름에서슬러그생성(수정데이터.이름);
  }

  const { data, error } = await supabase
    .from('태그')
    .update(업데이트데이터)
    .eq('아이디', 아이디)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 태그삭제하기(아이디: string): Promise<void> {
  const { error } = await supabase
    .from('태그')
    .delete()
    .eq('아이디', 아이디);

  if (error) throw error;
}

export async function 태그목록가져오기(조건: 태그목록조건 = {}): Promise<태그목록응답> {
  let 쿼리 = supabase
    .from('태그')
    .select('*', { count: 'exact' });

  // 검색 키워드
  if (조건.검색키워드) {
    쿼리 = 쿼리.ilike('이름', `%${조건.검색키워드}%`);
  }

  // 최소 사용 횟수
  if (조건.최소사용횟수) {
    쿼리 = 쿼리.gte('사용횟수', 조건.최소사용횟수);
  }

  // 정렬
  switch (조건.정렬방식) {
    case '사용횟수순':
      쿼리 = 쿼리.order('사용횟수', { ascending: false });
      break;
    case '최신순':
      쿼리 = 쿼리.order('생성일자', { ascending: false });
      break;
    default:
      쿼리 = 쿼리.order('이름', { ascending: true });
  }

  // 페이지네이션
  if (조건.페이지번호 && 조건.페이지크기) {
    const 시작인덱스 = (조건.페이지번호 - 1) * 조건.페이지크기;
    쿼리 = 쿼리.range(시작인덱스, 시작인덱스 + 조건.페이지크기 - 1);
  }

  const { data: 태그목록, error, count } = await 쿼리;

  if (error) throw error;

  return {
    태그목록: 태그목록 || [],
    전체개수: count || 0,
    현재페이지: 조건.페이지번호 || 1,
    총페이지수: 조건.페이지크기 ? Math.ceil((count || 0) / 조건.페이지크기) : 1,
  };
}

export async function 태그상세가져오기(아이디또는슬러그: string): Promise<태그 | null> {
  // UUID인지 슬러그인지 판단
  const UUID정규식 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const 조건필드 = UUID정규식.test(아이디또는슬러그) ? '아이디' : '슬러그';

  const { data, error } = await supabase
    .from('태그')
    .select('*')
    .eq(조건필드, 아이디또는슬러그)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // 데이터 없음
    throw error;
  }

  return data;
}

export async function 인기태그가져오기(개수: number = 10): Promise<인기태그[]> {
  const { data, error } = await supabase
    .from('태그')
    .select('이름, 슬러그, 사용횟수, 색상')
    .gt('사용횟수', 0)
    .order('사용횟수', { ascending: false })
    .limit(개수);

  if (error) throw error;

  return (data || []).map(태그 => ({
    이름: 태그.이름,
    슬러그: 태그.슬러그,
    글개수: 태그.사용횟수,
    색상: 태그.색상,
  }));
}

export async function 태그자동완성(검색어: string, 최대개수: number = 10): Promise<string[]> {
  const { data, error } = await supabase
    .from('태그')
    .select('이름')
    .ilike('이름', `${검색어}%`)
    .order('사용횟수', { ascending: false })
    .limit(최대개수);

  if (error) throw error;
  return (data || []).map(태그 => 태그.이름);
}

export async function 태그이름중복확인(이름: string, 제외할아이디?: string): Promise<boolean> {
  let 쿼리 = supabase
    .from('태그')
    .select('아이디')
    .eq('이름', 이름);

  if (제외할아이디) {
    쿼리 = 쿼리.neq('아이디', 제외할아이디);
  }

  const { data, error } = await 쿼리.limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

export async function 태그병합하기(원본태그아이디: string, 대상태그아이디: string): Promise<void> {
  // 트랜잭션으로 처리해야 하는 복잡한 작업
  // 1. 대상 태그를 사용하는 모든 블로그글을 원본 태그로 변경
  // 2. 원본 태그의 사용횟수 업데이트
  // 3. 대상 태그 삭제

  const { error } = await supabase.rpc('태그병합처리', {
    원본태그아이디,
    대상태그아이디,
  });

  if (error) throw error;
}

export async function 미사용태그정리하기(): Promise<number> {
  const { data, error } = await supabase
    .from('태그')
    .delete()
    .eq('사용횟수', 0)
    .select('아이디');

  if (error) throw error;
  return data?.length || 0;
}

export async function 태그통계가져오기(): Promise<태그통계[]> {
  const { data, error } = await supabase
    .from('태그')
    .select('이름, 슬러그, 사용횟수, 색상')
    .gt('사용횟수', 0)
    .order('사용횟수', { ascending: false });

  if (error) throw error;

  return (data || []).map(태그 => ({
    태그명: 태그.이름,
    슬러그: 태그.슬러그,
    글개수: 태그.사용횟수,
    색상: 태그.색상,
  }));
}
```

### 3. 리액트 훅 (hooks/use태그.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  태그목록가져오기,
  태그상세가져오기,
  태그생성하기,
  태그수정하기,
  태그삭제하기,
  인기태그가져오기,
  태그자동완성,
  태그이름중복확인,
  태그병합하기,
  미사용태그정리하기,
  태그통계가져오기,
} from '../api/태그API';
import type { 태그목록조건 } from '../model/types';

export function use태그목록(조건: 태그목록조건 = {}) {
  return useQuery({
    queryKey: ['태그목록', 조건],
    queryFn: () => 태그목록가져오기(조건),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

export function use태그상세(아이디또는슬러그: string) {
  return useQuery({
    queryKey: ['태그상세', 아이디또는슬러그],
    queryFn: () => 태그상세가져오기(아이디또는슬러그),
    staleTime: 15 * 60 * 1000, // 15분
    enabled: !!아이디또는슬러그,
  });
}

export function use태그생성() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 태그생성하기,
    onSuccess: () => {
      queryClient.invalidateQueries(['태그목록']);
      queryClient.invalidateQueries(['인기태그']);
      queryClient.invalidateQueries(['태그통계']);
    },
  });
}

export function use태그수정() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 아이디, 수정데이터 }: { 아이디: string; 수정데이터: any }) =>
      태그수정하기(아이디, 수정데이터),
    onSuccess: (수정된태그, { 아이디 }) => {
      queryClient.invalidateQueries(['태그목록']);
      queryClient.setQueryData(['태그상세', 아이디], 수정된태그);
      queryClient.setQueryData(['태그상세', 수정된태그.슬러그], 수정된태그);
    },
  });
}

export function use태그삭제() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 태그삭제하기,
    onSuccess: () => {
      queryClient.invalidateQueries(['태그목록']);
      queryClient.invalidateQueries(['인기태그']);
      queryClient.invalidateQueries(['태그통계']);
    },
  });
}

export function use인기태그(개수?: number) {
  return useQuery({
    queryKey: ['인기태그', 개수],
    queryFn: () => 인기태그가져오기(개수),
    staleTime: 30 * 60 * 1000, // 30분
  });
}

export function use태그자동완성() {
  return useMutation({
    mutationFn: ({ 검색어, 최대개수 }: { 검색어: string; 최대개수?: number }) =>
      태그자동완성(검색어, 최대개수),
  });
}

export function use태그이름중복확인() {
  return useMutation({
    mutationFn: ({ 이름, 제외할아이디 }: { 이름: string; 제외할아이디?: string }) =>
      태그이름중복확인(이름, 제외할아이디),
  });
}

export function use태그병합() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 원본태그아이디, 대상태그아이디 }: {
      원본태그아이디: string;
      대상태그아이디: string;
    }) => 태그병합하기(원본태그아이디, 대상태그아이디),
    onSuccess: () => {
      queryClient.invalidateQueries(['태그목록']);
      queryClient.invalidateQueries(['블로그글목록']);
      queryClient.invalidateQueries(['태그통계']);
    },
  });
}

export function use미사용태그정리() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 미사용태그정리하기,
    onSuccess: () => {
      queryClient.invalidateQueries(['태그목록']);
    },
  });
}

export function use태그통계() {
  return useQuery({
    queryKey: ['태그통계'],
    queryFn: 태그통계가져오기,
    staleTime: 30 * 60 * 1000, // 30분
  });
}
```

## 🧪 테스트 예시

### 유효성 검증 테스트
```typescript
// model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  태그이름검증,
  색상코드검증,
  태그이름에서슬러그생성,
  랜덤색상생성,
  태그목록정렬,
} from '../validation';

describe('태그 유효성 검증', () => {
  describe('태그 이름 검증', () => {
    it('유효한 태그명은 통과해야 한다', () => {
      const 결과 = 태그이름검증('React');
      expect(결과.유효함).toBe(true);
    });

    it('빈 태그명은 실패해야 한다', () => {
      const 결과 = 태그이름검증('');
      expect(결과.유효함).toBe(false);
      expect(결과.에러메시지).toBe('태그명을 입력해주세요');
    });

    it('특수문자가 포함된 태그명은 실패해야 한다', () => {
      const 결과 = 태그이름검증('React<>');
      expect(결과.유효함).toBe(false);
    });
  });

  describe('색상 코드 검증', () => {
    it('유효한 hex 색상은 통과해야 한다', () => {
      expect(색상코드검증('#FF0000').유효함).toBe(true);
      expect(색상코드검증('#f00').유효함).toBe(true);
    });

    it('잘못된 색상 형식은 실패해야 한다', () => {
      const 결과 = 색상코드검증('red');
      expect(결과.유효함).toBe(false);
    });
  });

  describe('슬러그 생성', () => {
    it('한글 태그명에서 슬러그를 생성해야 한다', () => {
      const 슬러그 = 태그이름에서슬러그생성('리액트 개발');
      expect(슬러그).toBe('리액트-개발');
    });

    it('특수문자를 제거해야 한다', () => {
      const 슬러그 = 태그이름에서슬러그생성('React.js!');
      expect(슬러그).toBe('reactjs');
    });
  });

  describe('랜덤 색상 생성', () => {
    it('유효한 hex 색상을 생성해야 한다', () => {
      const 색상 = 랜덤색상생성();
      expect(색상).toMatch(/^#[A-Fa-f0-9]{6}$/);
    });
  });
});
```

## 📋 개발 체크리스트

새로운 태그 관련 기능 추가 시:

- [ ] 태그명 유니크 제약조건 확인
- [ ] 색상 팔레트 일관성 유지
- [ ] 태그 사용 횟수 정확성 검증
- [ ] 자동완성 성능 최적화
- [ ] 태그 병합 기능 안정성 확인
- [ ] 미사용 태그 정리 주기 설정
- [ ] 태그 통계 캐싱 전략 적절성
- [ ] 검색 인덱스 활용

## 🎨 UI/UX 고려사항

- **색상 시스템**: 태그별 고유 색상으로 시각적 구분
- **자동완성**: 입력시 실시간 제안
- **태그 클라우드**: 인기도에 따른 크기 조절
- **필터링**: 태그 클릭으로 관련 글 즉시 조회
- **관리 도구**: 관리자용 태그 병합/정리 인터페이스

이 가이드를 따라 효율적인 태그 시스템을 구축하세요.