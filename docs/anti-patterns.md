> 이 문서의 상위 문서: [agents.md](./agents.md)

# 자주 하는 실수 / 안티패턴

## 코드 안티패턴

```typescript
// ❌ Bad - any 타입 사용
function processData(data: any) { ... }

// ❌ Bad - useEffect 의존성 배열 누락
useEffect(() => {
  fetchData(userId);
}, []); // userId 누락!

// ❌ Bad - 중첩된 삼항 연산자
const result = a ? b ? c : d : e;

// ❌ Bad - features/ 간 import
// src/2-features/contact/ui/form.tsx
import { PostCard } from '@/2-features/post/ui/card'; // 금지!

// ❌ Bad - 하드코딩된 문자열 (i18n 사용해야 함)
<button>Submit</button> // 다국어 지원 불가

// ✅ Good
<button>{t('common.submit')}</button>
```

## FSD 레이어 위반

```typescript
// ❌ Bad - shared에서 features import
// src/5-shared/util/post-utils.ts
import { PostCard } from '@/2-features/post'; // 금지!

// ❌ Bad - entities에서 features import
// src/1-entities/markdown/util.ts
import { formatPost } from '@/2-features/post'; // 금지!

// ✅ Good - 올바른 방향
// src/2-features/post/ui/card.tsx
import { renderMDX } from '@/1-entities/markdown'; // OK
import { Button } from '@/5-shared/components/ui/button'; // OK
```

## 테스트 안티패턴

```typescript
// ❌ Bad - 하드코딩으로 테스트 통과
it('should return user name', () => {
  const result = getUserName();
  expect(result).toBe('John'); // 하드코딩된 값!
});

// ❌ Bad - Property-Based 테스트에서 unmount 누락
it('should apply styles', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      render(<Button variant={variant}>Test</Button>);
      // unmount() 누락 - DOM 정리 안 됨!
    })
  );
});

// ✅ Good
it('should apply styles', () => {
  fc.assert(
    fc.property(variantArb, (variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      unmount(); // 필수!
    })
  );
});
```
