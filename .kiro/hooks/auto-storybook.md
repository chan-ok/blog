# Auto Storybook Story Generator

새로운 React 컴포넌트가 생성되면 자동으로 Storybook 스토리 파일을 생성하는 훅입니다.

## 트리거 조건

- **이벤트**: 새 파일 생성 시
- **파일 패턴**: `src/**/*.tsx` (컴포넌트 파일)
- **제외**: `*.test.tsx`, `*.stories.tsx`, `page.tsx`, `layout.tsx`

## 실행 프롬프트

새로운 React 컴포넌트 파일 `{파일경로}`가 생성되었습니다.

다음 작업을 수행해주세요:

1. **컴포넌트 분석**
   - 컴포넌트의 Props 인터페이스 확인
   - Export 방식 확인 (default vs named)
   - 컴포넌트 타입 파악 (UI 컴포넌트, Feature 컴포넌트 등)

2. **Storybook 스토리 생성**
   - 같은 디렉토리에 `{파일명}.stories.tsx` 파일 생성
   - 다음 템플릿 기반으로 작성:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { {컴포넌트명} } from './{파일명}';

const meta = {
  title: '{레이어}/{컴포넌트명}',
  component: {컴포넌트명},
  tags: ['autodocs'],
  argTypes: {
    // Props 기반 argTypes 자동 생성
  },
} satisfies Meta<typeof {컴포넌트명}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // 기본 props 값
  },
};

// 추가 스토리 (필요시)
```

3. **title 경로 규칙**
   - `src/shared/ui/` → `UI/{컴포넌트명}`
   - `src/features/*/ui/` → `Features/{Feature명}/{컴포넌트명}`
   - `src/widgets/` → `Widgets/{컴포넌트명}`
   - `src/entities/` → `Entities/{컴포넌트명}`

4. **확인 사항**
   - Props가 없는 경우 기본 스토리만 생성
   - Boolean props는 control: 'boolean' 추가
   - Enum/Union props는 control: 'select', options: [...] 추가
   - 함수 props는 action 추가

5. **생성 완료 후**
   - 생성된 스토리 파일 경로 출력
   - Storybook 실행 명령어 안내: `pnpm storybook`

**중요**:

- 기존 스토리 파일이 있으면 생성하지 않음
- `page.tsx`, `layout.tsx` 같은 Next.js 파일은 제외
- 테스트 파일은 제외

---

## 예시

### Input: `src/shared/ui/button.tsx`

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', disabled, onClick }: ButtonProps) {
  return <button>{children}</button>;
}
```

### Output: `src/shared/ui/button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: {
      action: 'clicked',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
```
