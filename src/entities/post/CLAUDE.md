# 블로그글 엔티티 가이드

이 폴더는 블로그글 관련 도메인 모델과 비즈니스 로직을 담당합니다.

## 🎯 블로그글 엔티티 개요

### 비즈니스 규칙
- **작성 권한**: 관리자만 블로그글 작성/수정/삭제 가능
- **발행 상태**: 임시저장, 발행, 비공개 상태 관리
- **마크다운**: 마크다운 형식으로 글 내용 작성
- **태그 시스템**: 복수 태그로 글 분류
- **SEO**: URL 슬러그, 메타데이터 관리

### 주요 시나리오
1. 새 글 작성 (임시저장)
2. 글 내용 편집
3. 글 발행/비공개 전환
4. 글 삭제
5. 글 목록 조회 (페이지네이션)
6. 태그별 글 필터링
7. 글 검색

## 📊 데이터 모델

### 핵심 타입
```typescript
// model/types.ts
export interface 블로그글 {
  아이디: string;                    // UUID
  제목: string;                      // 글 제목
  슬러그: string;                    // URL용 슬러그 (예: "my-first-post")
  내용: string;                      // 마크다운 형식 내용
  요약: string;                      // 글 요약 (목록에서 표시)
  작성자아이디: string;              // 작성자 UUID
  작성일자: Date;                    // 최초 작성 시간
  수정일자: Date;                    // 최종 수정 시간
  발행일자?: Date;                   // 발행 시간 (발행 상태일 때만)
  발행상태: 블로그글상태;            // 현재 상태
  태그목록: string[];                // 연관 태그들
  조회수: number;                    // 조회 횟수
  추천이미지URL?: string;            // 대표 이미지
  메타제목?: string;                 // SEO용 제목
  메타설명?: string;                 // SEO용 설명
}

export type 블로그글상태 = '임시저장' | '발행' | '비공개';

export interface 블로그글목록항목 {
  아이디: string;
  제목: string;
  슬러그: string;
  요약: string;
  발행일자: Date;
  태그목록: string[];
  조회수: number;
  추천이미지URL?: string;
}

export interface 블로그글작성입력 {
  제목: string;
  슬러그?: string;                   // 자동 생성 가능
  내용: string;
  요약?: string;                     // 자동 생성 가능
  태그목록: string[];
  발행상태: 블로그글상태;
  추천이미지URL?: string;
  메타제목?: string;
  메타설명?: string;
}

export interface 블로그글수정입력 {
  제목?: string;
  슬러그?: string;
  내용?: string;
  요약?: string;
  태그목록?: string[];
  발행상태?: 블로그글상태;
  추천이미지URL?: string;
  메타제목?: string;
  메타설명?: string;
}

export interface 블로그글목록조건 {
  페이지번호: number;
  페이지크기: number;
  태그필터?: string;
  검색키워드?: string;
  발행상태필터?: 블로그글상태;
  정렬방식?: '최신순' | '조회순' | '제목순';
}

export interface 블로그글목록응답 {
  글목록: 블로그글목록항목[];
  전체개수: number;
  현재페이지: number;
  총페이지수: number;
  태그통계: Array<{ 태그명: string; 개수: number }>;
}
```

## 🔧 구현 예시

### 1. 유효성 검증 및 유틸리티 (model/validation.ts)
```typescript
export interface 검증결과 {
  유효함: boolean;
  에러메시지?: string;
}

export function 제목검증(제목: string): 검증결과 {
  if (!제목.trim()) {
    return { 유효함: false, 에러메시지: '제목을 입력해주세요' };
  }

  if (제목.length > 100) {
    return { 유효함: false, 에러메시지: '제목은 100자 이하로 입력해주세요' };
  }

  return { 유효함: true };
}

export function 내용검증(내용: string): 검증결과 {
  if (!내용.trim()) {
    return { 유효함: false, 에러메시지: '내용을 입력해주세요' };
  }

  if (내용.length < 10) {
    return { 유효함: false, 에러메시지: '내용은 10자 이상 입력해주세요' };
  }

  return { 유효함: true };
}

export function 슬러그검증(슬러그: string): 검증결과 {
  if (!슬러그.trim()) {
    return { 유효함: false, 에러메시지: '슬러그를 입력해주세요' };
  }

  // URL 안전한 문자만 허용
  const 슬러그정규식 = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!슬러그정규식.test(슬러그)) {
    return {
      유효함: false,
      에러메시지: '슬러그는 영소문자, 숫자, 하이픈만 사용할 수 있습니다'
    };
  }

  if (슬러그.length > 50) {
    return { 유효함: false, 에러메시지: '슬러그는 50자 이하로 입력해주세요' };
  }

  return { 유효함: true };
}

export function 제목에서슬러그생성(제목: string): string {
  return 제목
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-')              // 공백을 하이픈으로
    .replace(/^-+|-+$/g, '')           // 앞뒤 하이픈 제거
    .substring(0, 50);                 // 50자 제한
}

export function 내용에서요약생성(내용: string, 최대길이: number = 200): string {
  // 마크다운 문법 제거
  const 텍스트전용 = 내용
    .replace(/#{1,6}\s/g, '')          // 헤딩 제거
    .replace(/\*\*(.*?)\*\*/g, '$1')   // 볼드 제거
    .replace(/\*(.*?)\*/g, '$1')       // 이탤릭 제거
    .replace(/`(.*?)`/g, '$1')         // 인라인 코드 제거
    .replace(/```[\s\S]*?```/g, '')    // 코드 블록 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 제거
    .replace(/\n+/g, ' ')              // 개행을 공백으로
    .trim();

  return 텍스트전용.length > 최대길이
    ? 텍스트전용.substring(0, 최대길이) + '...'
    : 텍스트전용;
}

export function 블로그글데이터검증(데이터: 블로그글작성입력): Record<string, string> {
  const 에러들: Record<string, string> = {};

  const 제목검증결과 = 제목검증(데이터.제목);
  if (!제목검증결과.유효함) {
    에러들.제목 = 제목검증결과.에러메시지!;
  }

  const 내용검증결과 = 내용검증(데이터.내용);
  if (!내용검증결과.유효함) {
    에러들.내용 = 내용검증결과.에러메시지!;
  }

  if (데이터.슬러그) {
    const 슬러그검증결과 = 슬러그검증(데이터.슬러그);
    if (!슬러그검증결과.유효함) {
      에러들.슬러그 = 슬러그검증결과.에러메시지!;
    }
  }

  return 에러들;
}

export function 읽기시간계산(내용: string): number {
  const 단어수 = 내용.split(/\s+/).length;
  const 분당읽기단어수 = 200; // 평균 읽기 속도
  return Math.ceil(단어수 / 분당읽기단어수);
}
```

### 2. API 함수 (api/블로그글API.ts)
```typescript
import { supabase } from '@/shared/config/supabase';
import type {
  블로그글,
  블로그글목록항목,
  블로그글작성입력,
  블로그글수정입력,
  블로그글목록조건,
  블로그글목록응답,
} from '../model/types';
import { 제목에서슬러그생성, 내용에서요약생성 } from '../model/validation';

export async function 블로그글작성하기(입력데이터: 블로그글작성입력): Promise<블로그글> {
  // 슬러그 자동 생성 (제공되지 않은 경우)
  const 슬러그 = 입력데이터.슬러그 || 제목에서슬러그생성(입력데이터.제목);

  // 요약 자동 생성 (제공되지 않은 경우)
  const 요약 = 입력데이터.요약 || 내용에서요약생성(입력데이터.내용);

  const 현재시간 = new Date().toISOString();
  const 삽입데이터 = {
    제목: 입력데이터.제목,
    슬러그,
    내용: 입력데이터.내용,
    요약,
    태그목록: 입력데이터.태그목록,
    발행상태: 입력데이터.발행상태,
    추천이미지URL: 입력데이터.추천이미지URL,
    메타제목: 입력데이터.메타제목,
    메타설명: 입력데이터.메타설명,
    발행일자: 입력데이터.발행상태 === '발행' ? 현재시간 : null,
  };

  const { data, error } = await supabase
    .from('블로그글')
    .insert(삽입데이터)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 블로그글수정하기(
  아이디: string,
  수정데이터: 블로그글수정입력
): Promise<블로그글> {
  // 발행 상태가 변경되면 발행일자 업데이트
  const 업데이트데이터: any = { ...수정데이터 };

  if (수정데이터.발행상태 === '발행') {
    // 기존 글이 발행 상태가 아니었다면 발행일자 설정
    const { data: 기존글 } = await supabase
      .from('블로그글')
      .select('발행상태')
      .eq('아이디', 아이디)
      .single();

    if (기존글?.발행상태 !== '발행') {
      업데이트데이터.발행일자 = new Date().toISOString();
    }
  } else if (수정데이터.발행상태 && 수정데이터.발행상태 !== '발행') {
    // 발행 해제시 발행일자 제거
    업데이트데이터.발행일자 = null;
  }

  const { data, error } = await supabase
    .from('블로그글')
    .update(업데이트데이터)
    .eq('아이디', 아이디)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function 블로그글삭제하기(아이디: string): Promise<void> {
  const { error } = await supabase
    .from('블로그글')
    .delete()
    .eq('아이디', 아이디);

  if (error) throw error;
}

export async function 블로그글상세가져오기(
  아이디또는슬러그: string,
  조회수증가: boolean = true
): Promise<블로그글 | null> {
  // 아이디인지 슬러그인지 판단
  const UUID정규식 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const 조건필드 = UUID정규식.test(아이디또는슬러그) ? '아이디' : '슬러그';

  const { data, error } = await supabase
    .from('블로그글')
    .select('*')
    .eq(조건필드, 아이디또는슬러그)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // 데이터 없음
    throw error;
  }

  // 조회수 증가 (발행된 글만)
  if (조회수증가 && data.발행상태 === '발행') {
    await supabase
      .from('블로그글')
      .update({ 조회수: data.조회수 + 1 })
      .eq('아이디', data.아이디);

    data.조회수 += 1;
  }

  return data;
}

export async function 블로그글목록가져오기(
  조건: 블로그글목록조건
): Promise<블로그글목록응답> {
  let 쿼리 = supabase
    .from('블로그글')
    .select(`
      아이디,
      제목,
      슬러그,
      요약,
      발행일자,
      태그목록,
      조회수,
      추천이미지URL
    `, { count: 'exact' });

  // 발행 상태 필터
  if (조건.발행상태필터) {
    쿼리 = 쿼리.eq('발행상태', 조건.발행상태필터);
  } else {
    쿼리 = 쿼리.eq('발행상태', '발행'); // 기본적으로 발행된 글만
  }

  // 태그 필터
  if (조건.태그필터) {
    쿼리 = 쿼리.contains('태그목록', [조건.태그필터]);
  }

  // 검색 키워드
  if (조건.검색키워드) {
    쿼리 = 쿼리.or(`제목.ilike.%${조건.검색키워드}%,내용.ilike.%${조건.검색키워드}%`);
  }

  // 정렬
  switch (조건.정렬방식) {
    case '조회순':
      쿼리 = 쿼리.order('조회수', { ascending: false });
      break;
    case '제목순':
      쿼리 = 쿼리.order('제목', { ascending: true });
      break;
    default:
      쿼리 = 쿼리.order('발행일자', { ascending: false });
  }

  // 페이지네이션
  const 시작인덱스 = (조건.페이지번호 - 1) * 조건.페이지크기;
  쿼리 = 쿼리.range(시작인덱스, 시작인덱스 + 조건.페이지크기 - 1);

  const { data: 글목록, error, count } = await 쿼리;

  if (error) throw error;

  // 태그 통계 가져오기
  const { data: 태그통계데이터 } = await supabase.rpc('태그별글개수가져오기');

  return {
    글목록: 글목록 || [],
    전체개수: count || 0,
    현재페이지: 조건.페이지번호,
    총페이지수: Math.ceil((count || 0) / 조건.페이지크기),
    태그통계: 태그통계데이터 || [],
  };
}

export async function 슬러그중복확인(슬러그: string, 제외할아이디?: string): Promise<boolean> {
  let 쿼리 = supabase
    .from('블로그글')
    .select('아이디')
    .eq('슬러그', 슬러그);

  if (제외할아이디) {
    쿼리 = 쿼리.neq('아이디', 제외할아이디);
  }

  const { data, error } = await 쿼리.limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}

export async function 인기글가져오기(개수: number = 5): Promise<블로그글목록항목[]> {
  const { data, error } = await supabase
    .from('블로그글')
    .select(`
      아이디,
      제목,
      슬러그,
      요약,
      발행일자,
      태그목록,
      조회수,
      추천이미지URL
    `)
    .eq('발행상태', '발행')
    .order('조회수', { ascending: false })
    .limit(개수);

  if (error) throw error;
  return data || [];
}
```

### 3. 리액트 훅 (hooks/use블로그글.ts)
```typescript
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  블로그글목록가져오기,
  블로그글상세가져오기,
  블로그글작성하기,
  블로그글수정하기,
  블로그글삭제하기,
  슬러그중복확인,
  인기글가져오기,
} from '../api/블로그글API';
import type { 블로그글목록조건 } from '../model/types';

export function use블로그글목록(조건: 블로그글목록조건) {
  return useQuery({
    queryKey: ['블로그글목록', 조건],
    queryFn: () => 블로그글목록가져오기(조건),
    staleTime: 5 * 60 * 1000, // 5분
    keepPreviousData: true,
  });
}

export function use블로그글무한목록(기본조건: Omit<블로그글목록조건, '페이지번호'>) {
  return useInfiniteQuery({
    queryKey: ['블로그글무한목록', 기본조건],
    queryFn: ({ pageParam = 1 }) =>
      블로그글목록가져오기({ ...기본조건, 페이지번호: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.현재페이지 < lastPage.총페이지수
        ? lastPage.현재페이지 + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function use블로그글상세(아이디또는슬러그: string, 조회수증가: boolean = true) {
  return useQuery({
    queryKey: ['블로그글상세', 아이디또는슬러그],
    queryFn: () => 블로그글상세가져오기(아이디또는슬러그, 조회수증가),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !!아이디또는슬러그,
  });
}

export function use블로그글작성() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 블로그글작성하기,
    onSuccess: () => {
      queryClient.invalidateQueries(['블로그글목록']);
    },
  });
}

export function use블로그글수정() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 아이디, 수정데이터 }: { 아이디: string; 수정데이터: any }) =>
      블로그글수정하기(아이디, 수정데이터),
    onSuccess: (수정된글, { 아이디 }) => {
      queryClient.invalidateQueries(['블로그글목록']);
      queryClient.setQueryData(['블로그글상세', 아이디], 수정된글);
      queryClient.setQueryData(['블로그글상세', 수정된글.슬러그], 수정된글);
    },
  });
}

export function use블로그글삭제() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 블로그글삭제하기,
    onSuccess: () => {
      queryClient.invalidateQueries(['블로그글목록']);
    },
  });
}

export function use슬러그중복확인() {
  return useMutation({
    mutationFn: ({ 슬러그, 제외할아이디 }: { 슬러그: string; 제외할아이디?: string }) =>
      슬러그중복확인(슬러그, 제외할아이디),
  });
}

export function use인기글() {
  return useQuery({
    queryKey: ['인기글'],
    queryFn: () => 인기글가져오기(),
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
  제목검증,
  내용검증,
  슬러그검증,
  제목에서슬러그생성,
  내용에서요약생성,
  읽기시간계산,
} from '../validation';

describe('블로그글 유효성 검증', () => {
  describe('제목 검증', () => {
    it('유효한 제목은 통과해야 한다', () => {
      const 결과 = 제목검증('테스트 제목');
      expect(결과.유효함).toBe(true);
    });

    it('빈 제목은 실패해야 한다', () => {
      const 결과 = 제목검증('');
      expect(결과.유효함).toBe(false);
      expect(결과.에러메시지).toBe('제목을 입력해주세요');
    });
  });

  describe('슬러그 생성', () => {
    it('한글 제목에서 영문 슬러그를 생성해야 한다', () => {
      const 슬러그 = 제목에서슬러그생성('React로 블로그 만들기!');
      expect(슬러그).toBe('react로-블로그-만들기');
    });

    it('특수문자를 제거해야 한다', () => {
      const 슬러그 = 제목에서슬러그생성('Hello @#$% World!');
      expect(슬러그).toBe('hello-world');
    });
  });

  describe('읽기 시간 계산', () => {
    it('정확한 읽기 시간을 계산해야 한다', () => {
      const 내용 = '단어 '.repeat(200); // 200개 단어
      const 읽기시간 = 읽기시간계산(내용);
      expect(읽기시간).toBe(1); // 1분
    });
  });
});
```

## 📋 개발 체크리스트

새로운 블로그글 관련 기능 추가 시:

- [ ] 슬러그 유니크 제약조건 확인
- [ ] 마크다운 렌더링 보안 검토
- [ ] SEO 메타데이터 완성도 확인
- [ ] 이미지 업로드 및 최적화 고려
- [ ] 태그 시스템 일관성 유지
- [ ] 페이지네이션 성능 최적화
- [ ] 검색 기능 인덱스 활용
- [ ] 캐시 무효화 전략 적절성

## 🔍 SEO 고려사항

- **URL 구조**: `/posts/[slug]` 형태
- **메타 태그**: 제목, 설명, 이미지
- **구조화 데이터**: JSON-LD 포맷
- **사이트맵**: 동적 생성
- **RSS 피드**: 최신 글 포함

이 가이드를 따라 효율적이고 검색 친화적인 블로그 시스템을 구축하세요.