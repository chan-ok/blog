# 코드 스타일

현재 자동 도구는 `src`의 TypeScript·JavaScript를 oxfmt와 oxlint로 처리합니다. Import 순서나 Tailwind class 정렬이 자동으로 강제된다고 가정하지 말고 기존 파일의 패턴을 따르세요.

## TypeScript

- `strict` 설정을 유지합니다.
- 외부 입력은 `unknown`에서 검증해 좁힙니다.
- `any`와 광범위한 type assertion을 피합니다.
- 데이터 모양은 `interface` 또는 `type`, 런타임 경계는 Zod 스키마로 표현합니다.
- 가능한 경우 `import type`으로 타입 import를 분리합니다.

```typescript
interface PostVisibilityOptions {
  isProduction: boolean;
  surface: 'list' | 'detail';
}

function parseLocale(value: unknown): Locale {
  return LocaleSchema.parse(value);
}
```

## 이름과 파일

| 대상                | 규칙             | 예시                          |
| ------------------- | ---------------- | ----------------------------- |
| React 컴포넌트·타입 | PascalCase       | `PostCard`, `MarkdownElement` |
| 함수·변수           | camelCase        | `getMarkdown`, `isProduction` |
| 상수                | UPPER_SNAKE_CASE | `MAX_FRONTMATTER_LENGTH`      |
| 소스 파일           | kebab-case       | `post-visibility.ts`          |
| 테스트              | `*.test.ts(x)`   | `about-block.test.tsx`        |
| 스키마              | `*.schema.ts`    | `model.schema.ts`             |

TanStack Router의 파일명(`$locale`, `$`, `__root`)은 라우터 규칙을 따릅니다.

## React 컴포넌트

- props 타입을 컴포넌트 가까이에 둡니다.
- 파생 가능한 값은 중복 state로 저장하지 않습니다.
- effect는 외부 시스템 동기화에만 사용하고 의존성을 빠뜨리지 않습니다.
- 비동기 loader 화면에는 loading, error, empty 상태를 고려합니다.
- semantic element와 접근 가능한 이름을 우선합니다.
- 반복 UI에는 안정적인 데이터 key를 사용합니다.

컴포넌트 내부는 대체로 훅과 state, 파생값, handler/effect, early return, JSX 순서로 읽히게 구성하되 형식적인 단계 수를 강제하지 않습니다.

## Import

- 레이어를 넘는 import는 `@/` 별칭을 사용합니다.
- 같은 slice 내부의 가까운 파일은 상대 import를 사용할 수 있습니다.
- side-effect import에는 이유가 드러나게 주석이나 lint 예외를 좁게 둡니다.
- 사용하지 않는 import와 재-export 전용 barrel의 과도한 확장을 피합니다.

## 스타일

- 기존 Tailwind token(`bg-bg`, `text-ink`, `border-rule` 등)과 반응형 breakpoint를 재사용합니다.
- 임의 색상과 중복 CSS보다 전역 token과 기존 UI 패턴을 우선합니다.
- 모바일에서 시작해 `md`, `lg` 순으로 필요한 차이만 추가합니다.
- 이미지에는 의미에 맞는 `alt`, 고유 크기 또는 레이아웃 제약, lazy loading 여부를 검토합니다.

## 테스트 스타일

- 테스트 이름은 관찰 가능한 동작을 설명합니다.
- assertion은 Vitest 또는 Playwright의 `expect`를 사용합니다.
- mock은 네트워크·라우터 같은 경계에 제한하고 핵심 정책 함수는 실제 구현을 호출합니다.
- 회귀 테스트는 실패 원인을 드러내는 최소 입력과 경계값을 포함합니다.

## 자동화

```bash
pnpm fmt
pnpm lint
pnpm typecheck
pnpm test:once
```

`pnpm fmt`와 `pnpm lint:fix`는 파일을 수정합니다. 실행 후 diff에서 요청 범위 밖 변경이 없는지 확인하세요.
