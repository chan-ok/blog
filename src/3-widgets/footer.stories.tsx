import type { Meta, StoryObj } from '@storybook/react-vite';

import Footer from './footer';

/**
 * Footer 위젯 스토리
 *
 * 페이지 하단에 표시되는 저작권 정보를 포함한 Footer 컴포넌트입니다.
 * 라이트 모드와 다크 모드를 모두 지원합니다.
 */
const meta = {
  title: 'Widgets/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Footer 렌더링
 *
 * 저작권 텍스트가 중앙 정렬되어 표시됩니다.
 */
export const Default: Story = {};

/**
 * 다크 모드 Footer
 *
 * 다크 배경에서 Footer가 어떻게 보이는지 확인합니다.
 * dark:text-gray-400 클래스가 적용되어 텍스트가 밝게 표시됩니다.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
