import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '.';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'default', 'danger', 'link'],
      description: '버튼의 시각적 스타일',
    },
    shape: {
      control: 'select',
      options: ['fill', 'outline'],
      description: '버튼의 형태 (link variant에서는 무시됨)',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    children: {
      control: 'text',
      description: '버튼 내용',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variant Stories (Requirements 1.1, 1.2, 1.3, 1.4)
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// Shape Stories (Requirements 2.1, 2.2)
export const Fill: Story = {
  args: {
    variant: 'primary',
    shape: 'fill',
    children: 'Fill Shape',
  },
};

export const Outline: Story = {
  args: {
    variant: 'primary',
    shape: 'outline',
    children: 'Outline Shape',
  },
};

// Disabled State Story (Requirements 5.3)
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

// All Variants with Fill Shape
export const AllVariantsFill: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary" shape="fill">
        Primary Fill
      </Button>
      <Button variant="default" shape="fill">
        Default Fill
      </Button>
      <Button variant="danger" shape="fill">
        Danger Fill
      </Button>
      <Button variant="link" shape="fill">
        Link
      </Button>
    </div>
  ),
};

// All Variants with Outline Shape
export const AllVariantsOutline: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary" shape="outline">
        Primary Outline
      </Button>
      <Button variant="default" shape="outline">
        Default Outline
      </Button>
      <Button variant="danger" shape="outline">
        Danger Outline
      </Button>
      <Button variant="link" shape="outline">
        Link (shape ignored)
      </Button>
    </div>
  ),
};

// Dark Mode Story (Requirements 4.1)
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" shape="fill">
          Primary Fill
        </Button>
        <Button variant="default" shape="fill">
          Default Fill
        </Button>
        <Button variant="danger" shape="fill">
          Danger Fill
        </Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" shape="outline">
          Primary Outline
        </Button>
        <Button variant="default" shape="outline">
          Default Outline
        </Button>
        <Button variant="danger" shape="outline">
          Danger Outline
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" disabled>
          Disabled Primary
        </Button>
        <Button variant="default" disabled>
          Disabled Default
        </Button>
      </div>
    </div>
  ),
};

// All States Overview
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Fill Shape</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" shape="fill">
            Primary
          </Button>
          <Button variant="default" shape="fill">
            Default
          </Button>
          <Button variant="danger" shape="fill">
            Danger
          </Button>
          <Button variant="link">Link</Button>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4">Outline Shape</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" shape="outline">
            Primary
          </Button>
          <Button variant="default" shape="outline">
            Default
          </Button>
          <Button variant="danger" shape="outline">
            Danger
          </Button>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4">Disabled States</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" disabled>
            Primary
          </Button>
          <Button variant="default" disabled>
            Default
          </Button>
          <Button variant="danger" disabled>
            Danger
          </Button>
          <Button variant="link" disabled>
            Link
          </Button>
        </div>
      </section>
    </div>
  ),
};
