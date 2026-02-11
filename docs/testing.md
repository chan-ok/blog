> 이 문서의 상위 문서: [agents.md](./agents.md)

# 테스팅

## TDD 원칙

### 지시사항

1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소 코드 작성
3. **Refactor**: 코드 리팩토링 후 테스트 재실행

### 예제

```typescript
// 1. 실패하는 테스트 작성
describe('Button', () => {
  it('클릭 시 onClick 호출', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

// 2. 최소 코드로 통과
export function Button({ onClick, children }: Props) {
  return <button onClick={onClick}>{children}</button>;
}

// 3. 리팩토링
export function Button({ onClick, children, variant = 'primary' }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn('btn', `btn-${variant}`)}
    >
      {children}
    </button>
  );
}
```

### 주의사항

- ❌ 테스트를 우회하는 방법 사용 금지
- ❌ 하드코딩으로 테스트 통과 금지
- ❌ 테스트 없이 코드 작성 금지

## Property-based 테스트

### 지시사항

다양한 입력 조합이 있는 컴포넌트나 엣지 케이스가 많은 함수에 사용:

- fast-check + Vitest 사용
- **Arbitrary**: 무작위 값 생성기 정의
- **Property**: 모든 입력에 대해 참이어야 하는 규칙 검증
- **numRuns**: 30-50회 권장
- **unmount 필수**: 각 반복 후 DOM 정리

### 예제

```typescript
import fc from 'fast-check';

// Arbitrary 정의
const variantArb = fc.constantFrom<ButtonVariant>('primary', 'default', 'danger', 'link');
const shapeArb = fc.constantFrom<ButtonShape>('fill', 'outline');

// Property 검증
it('모든 variant/shape 조합에서 다크 모드 클래스 포함', () => {
  fc.assert(
    fc.property(variantArb, shapeArb, (variant, shape) => {
      const { unmount } = render(
        <Button variant={variant} shape={shape}>Test</Button>
      );
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/dark:/);
      unmount(); // 각 반복 후 DOM 정리 필수
    }),
    { numRuns: 30 }
  );
});
```

### 주의사항

- ⚠️ Property-Based 테스트에서는 **각 반복 후 unmount() 필수**
- ⚠️ 일반 Unit 테스트에서는 unmount() 불필요 (자동 cleanup)

## 테스트 프로젝트

```bash
# 유닛 테스트
pnpm test --project=unit

# Storybook 인터랙션 테스트
pnpm test --project=storybook

# E2E 테스트
pnpm e2e
```

## 테스트 커버리지 목표

- **전체**: 80% 이상
- **유틸리티 함수**: 90% 이상
- **비즈니스 로직**: 85% 이상
- **UI 컴포넌트**: 70% 이상
