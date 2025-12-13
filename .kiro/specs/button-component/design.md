# 디자인 문서

## 개요

Base UI를 기반으로 한 재사용 가능한 Button 컴포넌트를 구현합니다. 이 컴포넌트는 Tailwind CSS v4를 사용하여 스타일링하며, 4가지 variant(primary, default, danger, link)와 2가지 shape(fill, outline)을 지원합니다. 다크 모드와 접근성을 완벽하게 지원합니다.

## 아키텍처

```plaintext
┌─────────────────────────────────────────────────────────┐
│                    Button Component                     │
├─────────────────────────────────────────────────────────┤
│  Props                                                  │
│  ├── variant: 'primary' | 'default' | 'danger' | 'link' │
│  ├── shape: 'fill' | 'outline'                          │
│  ├── asChild: boolean                                   │
│  ├── className: string                                  │
│  └── ...HTMLButtonAttributes                            │
├─────────────────────────────────────────────────────────┤
│  Base UI Button                                         │
│  └── 접근성, 키보드 네비게이션, 시맨틱 HTML 제공                 │
├─────────────────────────────────────────────────────────┤
│  Tailwind CSS v4 Styles                                 │
│  └── variant × shape 조합별 스타일 클래스                    │
└─────────────────────────────────────────────────────────┘
```

## 컴포넌트 및 인터페이스

### ButtonProps 인터페이스

```typescript
import { Button as BaseButton } from '@base-ui/react';

type ButtonVariant = 'primary' | 'default' | 'danger' | 'link';
type ButtonShape = 'fill' | 'outline';

interface ButtonProps extends React.ComponentProps<typeof BaseButton> {
  variant?: ButtonVariant;
  shape?: ButtonShape;
  className?: string;
  children?: React.ReactNode;
}
```

### 스타일 구조

variant와 shape 조합에 따른 스타일 매핑:

| Variant | Shape   | 배경색      | 텍스트색 | 테두리   |
| ------- | ------- | ----------- | -------- | -------- |
| primary | fill    | gray-900    | white    | none     |
| primary | outline | transparent | gray-900 | gray-900 |
| default | fill    | gray-100    | gray-900 | none     |
| default | outline | transparent | gray-600 | gray-300 |
| danger  | fill    | red-600     | white    | none     |
| danger  | outline | transparent | red-600  | red-600  |
| link    | -       | transparent | gray-600 | none     |

## 데이터 모델

### 스타일 상수

```typescript
const baseStyles = [
  'inline-flex items-center justify-center',
  'gap-2',
  'px-4 py-2',
  'font-medium',
  'transition-colors duration-200',
  'outline-none select-none cursor-pointer',
  'focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
];

const variantStyles = {
  primary: {
    fill: [
      'bg-gray-900 text-white',
      'hover:bg-gray-800',
      'dark:bg-white dark:text-gray-900',
      'dark:hover:bg-gray-100',
      'focus-visible:ring-gray-900 dark:focus-visible:ring-white',
    ],
    outline: [
      'bg-transparent text-gray-900 border border-gray-900',
      'hover:bg-gray-900 hover:text-white',
      'dark:text-white dark:border-white',
      'dark:hover:bg-white dark:hover:text-gray-900',
      'focus-visible:ring-gray-900 dark:focus-visible:ring-white',
    ],
  },
  default: {
    fill: [
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200',
      'dark:bg-gray-800 dark:text-gray-100',
      'dark:hover:bg-gray-700',
      'focus-visible:ring-gray-500',
    ],
    outline: [
      'bg-transparent text-gray-600 border border-gray-300',
      'hover:bg-gray-100 hover:text-gray-900',
      'dark:text-gray-400 dark:border-gray-600',
      'dark:hover:bg-gray-800 dark:hover:text-gray-100',
      'focus-visible:ring-gray-500',
    ],
  },
  danger: {
    fill: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'dark:bg-red-600 dark:text-white',
      'dark:hover:bg-red-700',
      'focus-visible:ring-red-600',
    ],
    outline: [
      'bg-transparent text-red-600 border border-red-600',
      'hover:bg-red-600 hover:text-white',
      'dark:text-red-500 dark:border-red-500',
      'dark:hover:bg-red-600 dark:hover:text-white',
      'focus-visible:ring-red-600',
    ],
  },
  link: {
    fill: [
      'bg-transparent text-gray-600 underline-offset-4',
      'hover:underline hover:text-gray-900',
      'dark:text-gray-400',
      'dark:hover:text-gray-100',
      'focus-visible:ring-gray-500',
      'px-0 py-0', // link는 패딩 제거
    ],
    outline: [], // link는 outline 무시, fill과 동일하게 처리
  },
};

const shapeStyles = {
  fill: '',
  outline: '',
  link: '', // link variant는 rounded 제거
};

const roundedStyles = 'rounded-lg'; // link 제외 모든 variant에 적용
```

## 정확성 속성

_속성(property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다._

### Property 1: Link variant는 shape을 무시함

_모든_ link variant Button에 대해, shape prop 값에 관계없이 동일한 스타일(배경/테두리 없음)이 적용되어야 합니다.
**Validates: Requirements 2.4**

### Property 2: 일관된 기본 스타일 적용

_모든_ variant와 shape 조합에 대해, link를 제외하고 rounded-lg, px-4, py-2, font-medium 클래스가 적용되어야 합니다.
**Validates: Requirements 3.1, 3.2, 3.4**

### Property 3: 다크 모드 클래스 포함

_모든_ variant와 shape 조합에 대해, dark: 접두사가 붙은 스타일 클래스가 포함되어야 합니다.
**Validates: Requirements 4.1**

### Property 4: Props 전달

_모든_ 전달된 props(aria 속성, className, HTML button 속성)에 대해, 해당 props가 렌더링된 button 요소에 올바르게 전달되어야 합니다.
**Validates: Requirements 5.2, 6.2, 6.3**

## 에러 처리

- 잘못된 variant 값: TypeScript 타입 체크로 컴파일 타임에 방지
- 잘못된 shape 값: TypeScript 타입 체크로 컴파일 타임에 방지
- className 충돌: clsx를 사용하여 클래스 병합, 사용자 className이 우선

## 테스팅 전략

### 유닛 테스트

Vitest와 Testing Library를 사용하여 다음을 테스트:

1. 각 variant별 올바른 스타일 클래스 적용
2. 각 shape별 올바른 스타일 클래스 적용
3. 기본값 적용 (variant: default, shape: fill)
4. disabled 상태 스타일 및 동작
5. asChild 패턴 동작
6. children 렌더링
7. className 병합

### Property-Based 테스트

fast-check 라이브러리를 사용하여 정확성 속성을 검증:

- 각 property-based 테스트는 최소 100회 반복 실행
- 테스트에 정확성 속성 참조 주석 포함
- 형식: `**Feature: button-component, Property {number}: {property_text}**`

### 테스트 파일 구조

```
blog/src/shared/components/ui/
├── button.tsx
└── button.test.tsx
```
