# 의존성 규칙 가이드

## 🔗 Layer 간 의존성 방향

### 의존성 계층 구조

```
┌─────────────────────────────────────────┐
│                App Layer                │  ← 최상위 계층
│     (애플리케이션 초기화, 프로바이더)        │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│               Pages Layer               │
│        (라우팅, 페이지 컴포넌트)           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              Features Layer             │
│       (비즈니스 로직, 사용자 기능)          │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│             Entities Layer              │
│         (도메인 모델, 데이터 관리)          │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              Shared Layer               │  ← 최하위 계층
│         (공통 리소스, 유틸리티)            │
└─────────────────────────────────────────┘
```

### 핵심 원칙

1. **상위 → 하위**: 상위 계층은 하위 계층에 의존할 수 있음
2. **하위 ↛ 상위**: 하위 계층은 상위 계층에 의존하면 안됨
3. **동일 계층**: 신중한 의존성 관리 필요

## ✅ 허용된 의존성 패턴

### App Layer 의존성
```typescript
// ✅ 모든 하위 계층 사용 가능
import { router } from '@/shared/config/routeTree.gen';    // Shared
import { queryClient } from '@/shared/config/queryClient'; // Shared
import { 사용자인증 } from '@/entities/user/hooks/useAuth'; // Entities
import { 글목록페이지 } from '@/pages/posts';               // Pages
```

### Pages Layer 의존성
```typescript
// ✅ Features, Entities, Shared 사용 가능
import { 글목록 } from '@/features/post-list/components/글목록';      // Features
import { use블로그글목록 } from '@/entities/post/hooks/use블로그글';   // Entities
import { 페이지헤더 } from '@/shared/components/PageHeader';         // Shared

// ❌ App Layer 의존 금지
// import { App } from '@/app/App'; // 금지!
```

### Features Layer 의존성
```typescript
// ✅ Entities, Shared 사용 가능
import { use사용자정보 } from '@/entities/user/hooks/use사용자';  // Entities
import { 버튼 } from '@/shared/components/ui/button';             // Shared
import { 날짜포맷팅 } from '@/shared/utils/date';                 // Shared

// ❌ Pages, App Layer 의존 금지
// import { 홈페이지 } from '@/pages/index'; // 금지!
// import { App } from '@/app/App';          // 금지!
```

### Entities Layer 의존성
```typescript
// ✅ Shared Layer만 사용 가능
import { supabase } from '@/shared/config/supabase';      // Shared
import { 날짜유틸 } from '@/shared/utils/date';           // Shared

// ❌ Features, Pages, App Layer 의존 금지
// import { 글작성폼 } from '@/features/post-editor/components/글작성폼'; // 금지!
// import { 글목록페이지 } from '@/pages/posts';                        // 금지!
```

### Shared Layer 의존성
```typescript
// ✅ 외부 라이브러리만 사용 가능
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// ❌ 모든 내부 계층 의존 금지
// import { 사용자 } from '@/entities/user/model/types'; // 금지!
// import { 글작성폼 } from '@/features/post-editor';     // 금지!
```

## 🚫 금지된 의존성 패턴

### 역방향 의존성 (가장 중요!)
```typescript
// ❌ Shared → Entities (금지)
// shared/utils/blogUtils.ts
import { 블로그글 } from '@/entities/post/model/types'; // 금지!

// ❌ Entities → Features (금지)
// entities/user/hooks/useAuth.ts
import { 로그인폼 } from '@/features/auth/components/LoginForm'; // 금지!

// ❌ Features → Pages (금지)
// features/post-list/components/글목록.tsx
import { 글목록페이지 } from '@/pages/posts'; // 금지!
```

### 순환 의존성
```typescript
// ❌ 순환 의존성 금지
// features/auth/hooks/useLogin.ts
import { 사용자검증 } from '@/features/user-validation/utils/validation';

// features/user-validation/utils/validation.ts
import { 로그인상태 } from '@/features/auth/hooks/useLogin'; // 순환 의존성!
```

## 🔄 동일 계층 내 의존성 관리

### Features 간 의존성 (신중하게)
```typescript
// ✅ 명확한 관계가 있는 경우만 허용
// features/post-editor/components/에디터.tsx
import { 사용자권한확인 } from '@/features/auth/utils/permissions'; // OK

// ❌ 강한 결합 지양
// features/post-list/components/목록.tsx
import { 에디터상태 } from '@/features/post-editor/hooks/use에디터'; // 지양
```

### Entities 간 의존성 (최소화)
```typescript
// ✅ 명확한 관계가 있는 경우만
// entities/post/model/types.ts
import { 사용자 } from '@/entities/user/model/types'; // OK (작성자 관계)

// ❌ 불필요한 결합
// entities/tag/hooks/useTag.ts
import { 사용자설정 } from '@/entities/user/hooks/useSettings'; // 지양
```

## 🛠️ 의존성 관리 도구 및 패턴

### 1. 의존성 주입 패턴
```typescript
// ✅ 의존성을 매개변수로 받기
export function 글작성서비스(
  글API: typeof 블로그글API,
  사용자서비스: typeof 사용자서비스
) {
  return {
    새글작성하기: async (글데이터: 글작성입력) => {
      const 현재사용자 = await 사용자서비스.현재사용자가져오기();
      return 글API.글작성하기({ ...글데이터, 작성자아이디: 현재사용자.아이디 });
    }
  };
}
```

### 2. 이벤트 기반 통신
```typescript
// ✅ 이벤트로 계층 간 통신
// shared/events/blogEvents.ts
export const 블로그이벤트 = {
  글발행됨: 'post-published',
  글삭제됨: 'post-deleted',
} as const;

// features/post-editor에서 이벤트 발생
document.dispatchEvent(new CustomEvent(블로그이벤트.글발행됨, { detail: 글정보 }));

// features/post-list에서 이벤트 수신
useEffect(() => {
  const 핸들러 = () => 글목록갱신();
  document.addEventListener(블로그이벤트.글발행됨, 핸들러);
  return () => document.removeEventListener(블로그이벤트.글발행됨, 핸들러);
}, []);
```

### 3. 추상화를 통한 의존성 분리
```typescript
// shared/interfaces/blogAPI.ts
export interface 블로그API인터페이스 {
  글목록가져오기(조건: 글목록조건): Promise<글목록응답>;
  글작성하기(데이터: 글작성입력): Promise<블로그글>;
}

// entities/post/api/블로그글API.ts
export const 블로그글API: 블로그API인터페이스 = {
  글목록가져오기,
  글작성하기,
};

// features에서 인터페이스 의존
import type { 블로그API인터페이스 } from '@/shared/interfaces/blogAPI';
```

## 📊 의존성 검증 방법

### 1. ESLint 규칙 설정
```json
// .eslintrc.js
{
  "rules": {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["../../../*"],
            "message": "너무 깊은 상대 경로는 금지됩니다. @/ 절대 경로를 사용하세요."
          }
        ]
      }
    ]
  }
}
```

### 2. 의존성 분석 도구
```bash
# 의존성 시각화
npx madge --image deps.png --extensions ts,tsx src/

# 순환 의존성 검사
npx madge --circular --extensions ts,tsx src/
```

### 3. 코드 리뷰 체크리스트
- [ ] import 문이 올바른 계층에서 가져오는가?
- [ ] 역방향 의존성이 없는가?
- [ ] 순환 의존성이 없는가?
- [ ] 동일 계층 간 의존성이 최소화되어 있는가?
- [ ] 의존성이 명확한 책임을 가지는가?

## 🎯 실전 적용 가이드

### 새 기능 개발 시 확인사항
1. **시작점 확인**: 어느 계층에서 시작할지 결정
2. **의존성 계획**: 필요한 하위 계층 리소스 파악
3. **인터페이스 설계**: 추상화를 통한 느슨한 결합
4. **테스트 작성**: 의존성 주입으로 테스트 가능하게

### 리팩토링 시 고려사항
1. **계층 이동**: 기능이 적절한 계층에 있는지 검토
2. **의존성 정리**: 불필요한 의존성 제거
3. **추상화 도입**: 강한 결합 지점에 인터페이스 도입
4. **테스트 유지**: 리팩토링 후에도 테스트가 통과하는지 확인

이 의존성 규칙을 따라 유지보수가 용이하고 확장 가능한 아키텍처를 구축할 수 있습니다.