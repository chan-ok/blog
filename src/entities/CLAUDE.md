# Entities Layer 가이드

이 폴더는 Feature Slice Design (FSD) 아키텍처의 **Entities Layer**입니다.

## 🎯 Entities Layer의 역할

### 책임
- **도메인 모델 정의**: 비즈니스 엔티티의 타입과 인터페이스
- **비즈니스 로직**: 엔티티별 핵심 비즈니스 규칙
- **데이터 변환**: API 응답을 도메인 모델로 변환
- **유효성 검증**: 엔티티 수준의 데이터 검증

### 금지사항
- ❌ UI 컴포넌트 정의
- ❌ Features layer에 의존
- ❌ Pages layer에 의존
- ❌ App layer에 의존

## 📁 폴더 구조

```
src/entities/
├── CLAUDE.md                  # 이 파일
├── user/                      # 사용자 엔티티
│   ├── CLAUDE.md              # 사용자 엔티티 가이드
│   ├── model/                 # 타입 정의 및 비즈니스 로직
│   │   ├── types.ts           # 사용자 타입 정의
│   │   └── validation.ts      # 사용자 데이터 검증
│   ├── api/                   # API 호출 로직
│   │   └── userAPI.ts         # 사용자 관련 API 함수
│   └── hooks/                 # 사용자 관련 리액트 훅
│       └── useUser.ts         # 사용자 데이터 훅
├── post/                      # 블로그글 엔티티
│   ├── CLAUDE.md
│   ├── model/
│   ├── api/
│   └── hooks/
└── tag/                       # 태그 엔티티
    ├── CLAUDE.md
    ├── model/
    ├── api/
    └── hooks/
```

## 🔨 구현 패턴

### 1. 타입 정의 (model/types.ts)
```typescript
// entities/사용자/model/types.ts
export interface 사용자 {
  아이디: string;
  이메일: string;
  이름: string;
  권한: 사용자권한;
  가입일자: Date;
  최종로그인일자?: Date;
}

export type 사용자권한 = '관리자' | '일반사용자';

export interface 사용자생성입력 {
  이메일: string;
  이름: string;
  비밀번호: string;
}

export interface 사용자수정입력 {
  이름?: string;
  현재비밀번호?: string;
  새비밀번호?: string;
}
```

### 2. 유효성 검증 (model/validation.ts)
```typescript
// entities/사용자/model/validation.ts
export function 이메일유효성검사(이메일: string): boolean {
  const 이메일정규식 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return 이메일정규식.test(이메일);
}

export function 비밀번호유효성검사(비밀번호: string): {
  유효함: boolean;
  에러메시지?: string;
} {
  if (비밀번호.length < 8) {
    return { 유효함: false, 에러메시지: '비밀번호는 8자 이상이어야 합니다' };
  }

  const 특수문자포함 = /[!@#$%^&*(),.?":{}|<>]/.test(비밀번호);
  if (!특수문자포함) {
    return { 유효함: false, 에러메시지: '비밀번호는 특수문자를 포함해야 합니다' };
  }

  return { 유효함: true };
}
```

### 3. API 로직 (api/)
```typescript
// entities/사용자/api/사용자API.ts
import { supabase } from '@/shared/config/supabase';
import type { 사용자, 사용자생성입력 } from '../model/types';

export async function 사용자정보가져오기(아이디: string): Promise<사용자> {
  const { data, error } = await supabase
    .from('사용자')
    .select('*')
    .eq('아이디', 아이디)
    .single();

  if (error) throw error;
  return data;
}

export async function 사용자생성하기(입력데이터: 사용자생성입력): Promise<사용자> {
  const { data, error } = await supabase
    .from('사용자')
    .insert(입력데이터)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 4. 리액트 훅 (hooks/)
```typescript
// entities/사용자/hooks/use사용자.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 사용자정보가져오기, 사용자생성하기 } from '../api/사용자API';

export function use사용자정보(아이디: string) {
  return useQuery({
    queryKey: ['사용자', 아이디],
    queryFn: () => 사용자정보가져오기(아이디),
    enabled: !!아이디,
  });
}

export function use사용자생성() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: 사용자생성하기,
    onSuccess: (새사용자) => {
      queryClient.setQueryData(['사용자', 새사용자.아이디], 새사용자);
    },
  });
}
```

## 🔄 의존성 규칙

### 허용되는 의존성
```typescript
// ✅ Shared layer 사용 가능
import { supabase } from '@/shared/config/supabase';
import { 날짜포맷팅 } from '@/shared/utils/dateUtils';

// ✅ 같은 Entity 내 다른 모듈 사용 가능
import { 사용자 } from './model/types';
import { 이메일유효성검사 } from './model/validation';

// ✅ 다른 Entity 사용 가능 (신중하게)
import type { 블로그글 } from '@/entities/post/model/types';
```

### 금지되는 의존성
```typescript
// ❌ Features layer 의존 금지
import { 글작성폼 } from '@/features/글작성/components/글작성폼';

// ❌ Pages layer 의존 금지
import { 홈페이지 } from '@/pages/index';

// ❌ App layer 의존 금지
import { App } from '@/app/App';
```

## 📝 네이밍 컨벤션

### 파일 및 폴더명
- 엔티티 폴더: 한국어 (예: `사용자/`, `블로그글/`)
- 파일명: 카멜케이스 (예: `사용자API.ts`, `use사용자.ts`)

### 타입 및 인터페이스
- 엔티티 타입: 한국어 파스칼케이스 (예: `사용자`, `블로그글`)
- 입력 타입: `[엔티티명][동작]입력` (예: `사용자생성입력`)
- 응답 타입: `[엔티티명][동작]응답` (예: `사용자목록응답`)

### 함수명
- API 함수: `[엔티티명][동작]하기` (예: `사용자정보가져오기`)
- 훅: `use[엔티티명][동작]` (예: `use사용자정보`)
- 검증 함수: `[대상][검증내용]검사` (예: `이메일유효성검사`)

## 🧪 테스트 가이드

### 테스트 파일 위치
```
src/entities/사용자/
├── model/
│   ├── types.ts
│   ├── validation.ts
│   └── __tests__/
│       ├── validation.test.ts
│       └── types.test.ts
├── api/
│   ├── 사용자API.ts
│   └── __tests__/
│       └── 사용자API.test.ts
└── hooks/
    ├── use사용자.ts
    └── __tests__/
        └── use사용자.test.ts
```

### 테스트 예시
```typescript
// entities/사용자/model/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { 이메일유효성검사, 비밀번호유효성검사 } from '../validation';

describe('사용자 유효성 검사', () => {
  describe('이메일 유효성 검사', () => {
    it('올바른 이메일 형식은 통과해야 한다', () => {
      expect(이메일유효성검사('test@example.com')).toBe(true);
    });

    it('잘못된 이메일 형식은 실패해야 한다', () => {
      expect(이메일유효성검사('invalid-email')).toBe(false);
    });
  });

  describe('비밀번호 유효성 검사', () => {
    it('8자 이상이고 특수문자를 포함하면 통과해야 한다', () => {
      const 결과 = 비밀번호유효성검사('password123!');
      expect(결과.유효함).toBe(true);
    });

    it('8자 미만이면 실패해야 한다', () => {
      const 결과 = 비밀번호유효성검사('pass!');
      expect(결과.유효함).toBe(false);
      expect(결과.에러메시지).toContain('8자 이상');
    });
  });
});
```

## 📋 체크리스트

새로운 엔티티 추가 시 확인사항:

- [ ] 폴더 구조가 표준을 따르는가?
- [ ] 타입 정의가 명확하고 완전한가?
- [ ] 유효성 검증 로직이 포함되어 있는가?
- [ ] API 함수가 에러 처리를 포함하는가?
- [ ] 리액트 훅이 적절한 캐싱 전략을 사용하는가?
- [ ] 테스트 커버리지가 충분한가?
- [ ] 네이밍 컨벤션을 준수하는가?
- [ ] 의존성 규칙을 위반하지 않는가?

각 엔티티별 상세 가이드는 해당 폴더의 CLAUDE.md를 참조하세요.