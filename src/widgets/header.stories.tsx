import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import Header from './header';

/**
 * ============================================================================
 * Header 위젯 스토리
 * ============================================================================
 *
 * ## 스토리 목록
 * - Default: 기본 헤더 (scrolled=false, pathname=/)
 * - Scrolled: 스크롤된 헤더 (shadow, blur 효과)
 * - AboutActive: About 링크 활성화
 * - PostsActive: Posts 링크 활성화
 * - ContactActive: Contact 링크 활성화
 *
 * ## 참고사항
 * - TanStack Router의 pathname과 useDetectScrolled 훅은 실제 동작으로 테스트됩니다.
 * - 다크 모드는 Storybook의 테마 토글로 확인할 수 있습니다.
 * - locale 변경은 LocaleToggle 버튼으로 확인할 수 있습니다.
 */

const meta = {
  title: 'Widgets/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '애플리케이션의 상단 헤더 위젯입니다. 로고, 네비게이션 링크, ThemeToggle, LocaleToggle을 포함합니다. 스크롤 상태에 따라 스타일이 변경됩니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 헤더 상태
 * - pathname=/ (라우터 초기 상태)
 * - scrolled=false
 */
export const Default: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // 로고 렌더링 확인
    const logo = await canvas.findByLabelText('Home');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveTextContent('Chanho.dev');

    // 네비게이션 링크 확인
    const aboutLink = await canvas.findByLabelText(/about/i);
    const postsLink = await canvas.findByLabelText(/posts/i);
    const contactLink = await canvas.findByLabelText(/contact/i);

    expect(aboutLink).toBeInTheDocument();
    expect(postsLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();

    // ThemeToggle, LocaleToggle 확인
    const themeToggle = await canvas.findByLabelText(/theme/i);
    const localeToggle = await canvas.findByLabelText(/locale|language/i);

    expect(themeToggle).toBeInTheDocument();
    expect(localeToggle).toBeInTheDocument();
  },
};

/**
 * 스크롤된 헤더 상태
 * - shadow-xl, backdrop-blur-sm 적용
 * - 로고 크기 감소
 *
 * 참고: 실제 스크롤 동작은 useDetectScrolled 훅에 의해 제어됩니다.
 */
export const Scrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '스크롤 시 헤더가 작아지고 그림자 효과가 추가됩니다. 실제 동작은 페이지 스크롤 시 확인할 수 있습니다.',
      },
    },
  },
};

/**
 * About 링크 활성화 상태
 * - pathname=/about
 * - About 링크 하이라이트 (text-blue-600, bg-blue-50)
 *
 * 참고: 실제 pathname 변경은 라우터 네비게이션으로 확인됩니다.
 */
export const AboutActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '/about 경로에서 About 링크가 파란색으로 하이라이트됩니다. 실제 동작은 About 페이지 방문 시 확인할 수 있습니다.',
      },
    },
  },
};

/**
 * Posts 링크 활성화 상태
 * - pathname=/posts
 * - Posts 링크 하이라이트 (text-blue-600, bg-blue-50)
 *
 * 참고: 실제 pathname 변경은 라우터 네비게이션으로 확인됩니다.
 */
export const PostsActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '/posts 경로에서 Posts 링크가 파란색으로 하이라이트됩니다. 실제 동작은 Posts 페이지 방문 시 확인할 수 있습니다.',
      },
    },
  },
};

/**
 * Contact 링크 활성화 상태
 * - pathname=/contact
 * - Contact 링크 하이라이트 (text-blue-600, bg-blue-50)
 *
 * 참고: 실제 pathname 변경은 라우터 네비게이션으로 확인됩니다.
 */
export const ContactActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '/contact 경로에서 Contact 링크가 파란색으로 하이라이트됩니다. 실제 동작은 Contact 페이지 방문 시 확인할 수 있습니다.',
      },
    },
  },
};

/**
 * 다크 모드
 * - ThemeToggle 버튼으로 전환
 * - dark: 클래스 적용
 *
 * 참고: Storybook의 테마 토글 버튼으로 다크 모드를 확인할 수 있습니다.
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story:
          '다크 모드에서는 배경이 어두워지고 텍스트 색상이 밝아집니다. Storybook의 테마 토글 버튼으로 확인할 수 있습니다.',
      },
    },
  },
};
