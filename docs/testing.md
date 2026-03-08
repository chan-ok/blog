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
- **numRuns**: 같은 케이스 내 property-based는 **최대 20회** (`numRuns: 20` 상한)
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
    { numRuns: 20 }
  );
});
```

### 비동기 컴포넌트 (Router 의존) 패턴

TanStack Router가 필요한 컴포넌트는 `fc.asyncProperty` + `await` 사용:

```typescript
it('다양한 태그에서 올바른 href 생성', async () => {
  await fc.assert(
    fc.asyncProperty(tagArb, async (tag) => {
      const { unmount } = await renderWithRouter(
        <TagChip tag={tag} locale="ko" />
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', expect.stringContaining('/posts?tags='));
      unmount();
    }),
    { numRuns: 20 }
  );
});
```

### unmount 및 비동기 주의사항

- ⚠️ Property-Based 테스트에서는 **각 반복 후 unmount() 필수**
- ⚠️ Unit 테스트에서도 **unmount() 명시 호출 권장** (자동 cleanup 의존 지양, 일관성 유지)
- ⚠️ Router 의존 컴포넌트는 `fc.asyncProperty` + `await fc.assert(...)` 사용

> 이전 규칙 "일반 Unit 테스트에서는 unmount() 불필요"는 폐기됨. 모든 테스트에서 명시적 unmount() 사용.

## 테스트 프로젝트

```bash
# 유닛 테스트
pnpm test --project=unit

# Storybook 인터랙션 테스트
pnpm test --project=storybook

# E2E 테스트
pnpm e2e
```

## 테스트 환경 설정 (Storybook/Vitest Browser)

Storybook addon-vitest는 Playwright 브라우저를 사용합니다. 최초 실행 또는 클론 후 다음을 실행하세요:

```bash
pnpm test:prepare
```

`PLAYWRIGHT_BROWSERS_PATH`가 `./node_modules/.cache/playwright`로 설정되어 프로젝트 내부에 브라우저가 설치됩니다.

## getByRole과 접근성 이름(accessible name)

`getByRole('heading', { name: title })` 사용 시, WAI-ARIA spec에 따라 **접근성 이름은 공백이 정규화**됩니다. 연속 공백(`"!  !"`)은 단일 공백(`"! !"`)으로 처리됩니다.

Property-Based 테스트에서 제목에 연속 공백이 포함될 수 있다면, 쿼리 시 정규화된 값을 사용하세요:

```typescript
const normalizedTitle = title.replace(/\s+/g, ' ');
screen.getByRole('heading', { name: normalizedTitle });
```

## 테스트 작성 규칙

1. **실행 시간**: 유닛/기능 테스트는 각 `it` **5초 이내** 종료 목표. Property-based는 동일 `it` 내 **최대 20회** (`numRuns: 20`).
2. **검증 범위**: 기능 위주(요소 존재, role, 텍스트, 이벤트, 반환값). 스타일(`className`/`toHaveClass`)은 파일당 1~2개로 제한.
3. **병렬·대기**: 병렬 실행 전제. 고정 `setTimeout` 대신 `waitFor` 사용. `waitFor` 조건은 최소 필요만.
4. **보안**: 검증/인증 우회 목 금지. 보안 테스트는 실패 경로(400, 미노출 필드 등) 반드시 검증.
5. **사양 일치**: 테스트는 현재 구현과 일치 유지. `.skip` 시 주석으로 사유, 스킵과 실행 상태 일치.
6. **불필요한 케이스**: 동작 무관 상수만 검사하는 케이스 제거·대체. 중복 시나리오 통합·제거.
7. **커밋·푸시**: **커밋** 시 `pnpm test --project=unit run` 통과 후에만 커밋. **푸시** 시 unit + `pnpm e2e` 통과 후에만 푸시.

## 테스트 커버리지 목표

- **전체**: 80% 이상
- **유틸리티 함수**: 90% 이상
- **비즈니스 로직**: 85% 이상
- **UI 컴포넌트**: 70% 이상
