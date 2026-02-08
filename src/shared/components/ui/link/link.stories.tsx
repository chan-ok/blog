import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import Link from '.';
import { useLocaleStore } from '@/shared/stores/locale-store';

/**
 * TanStack Router Provider 데코레이터
 * Storybook에서 Link 컴포넌트를 렌더링하기 위해 필요
 */
const withRouter = (Story: React.ComponentType) => {
  const rootRoute = createRootRoute({
    component: () => <Story />,
  });

  const history = createMemoryHistory({
    initialEntries: ['/'],
  });

  const router = createRouter({
    routeTree: rootRoute,
    history,
  });

  return <RouterProvider router={router} />;
};

const meta = {
  title: 'UI/Link',
  component: Link,
  decorators: [withRouter],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: '링크 경로 (내부 또는 외부)',
    },
    children: {
      control: 'text',
      description: '링크 텍스트',
    },
    className: {
      control: 'text',
      description: '커스텀 CSS 클래스',
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 내부 링크
 * locale이 자동으로 추가됩니다 (/about → /ko/about)
 */
export const Default: Story = {
  args: {
    href: '/about',
    children: 'About Page',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 이미 locale이 포함된 링크
 * 중복으로 locale이 추가되지 않습니다
 */
export const WithLocale: Story = {
  args: {
    href: '/ko/about',
    children: 'About Page (with locale)',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 외부 링크 (https)
 * locale이 추가되지 않습니다
 */
export const External: Story = {
  args: {
    href: 'https://github.com',
    children: 'GitHub',
  },
};

/**
 * 외부 링크 (http)
 */
export const ExternalHttp: Story = {
  args: {
    href: 'http://example.com',
    children: 'Example.com',
  },
};

/**
 * 루트 경로
 * / → /ko
 */
export const Root: Story = {
  args: {
    href: '/',
    children: 'Home',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 슬래시 없는 경로
 * about → /ko/about
 */
export const WithoutSlash: Story = {
  args: {
    href: 'about',
    children: 'About (no slash)',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 커스텀 스타일 적용
 */
export const WithClassName: Story = {
  args: {
    href: '/about',
    children: 'Styled Link',
    className: 'text-blue-600 hover:text-blue-800 underline font-semibold',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 한국어 locale (ko)
 */
export const Korean: Story = {
  args: {
    href: '/about',
    children: '소개 페이지',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 영어 locale (en)
 */
export const English: Story = {
  args: {
    href: '/about',
    children: 'About Page',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'en' });
  },
};

/**
 * 일본어 locale (ja)
 */
export const Japanese: Story = {
  args: {
    href: '/about',
    children: '概要ページ',
  },
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ja' });
  },
};

/**
 * 네비게이션 링크 리스트
 * 다양한 링크 조합 예시
 */
export const Navigation: Story = {
  args: {
    href: '/',
    children: 'Home',
  },
  render: () => (
    <nav className="flex flex-col gap-4">
      <Link href="/" className="text-gray-900 hover:text-blue-600">
        Home
      </Link>
      <Link href="/about" className="text-gray-900 hover:text-blue-600">
        About
      </Link>
      <Link href="/posts" className="text-gray-900 hover:text-blue-600">
        Posts
      </Link>
      <Link href="/contact" className="text-gray-900 hover:text-blue-600">
        Contact
      </Link>
      <Link
        href="https://github.com"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        GitHub (External)
      </Link>
    </nav>
  ),
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 다크 모드 네비게이션
 */
export const DarkModeNavigation: Story = {
  args: {
    href: '/',
    children: 'Home',
  },
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
    <nav className="flex flex-col gap-4">
      <Link
        href="/"
        className="text-gray-100 hover:text-blue-400 dark:text-gray-100 dark:hover:text-blue-400"
      >
        Home
      </Link>
      <Link
        href="/about"
        className="text-gray-100 hover:text-blue-400 dark:text-gray-100 dark:hover:text-blue-400"
      >
        About
      </Link>
      <Link
        href="/posts"
        className="text-gray-100 hover:text-blue-400 dark:text-gray-100 dark:hover:text-blue-400"
      >
        Posts
      </Link>
      <Link
        href="/contact"
        className="text-gray-100 hover:text-blue-400 dark:text-gray-100 dark:hover:text-blue-400"
      >
        Contact
      </Link>
      <Link
        href="https://github.com"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        GitHub (External)
      </Link>
    </nav>
  ),
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};

/**
 * 모든 locale 비교
 */
export const AllLocales: Story = {
  args: {
    href: '/about',
    children: 'About',
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Korean (ko)</h3>
        <div className="flex flex-col gap-2">
          <Link href="/about" className="text-blue-600 hover:underline">
            소개
          </Link>
          <Link href="/posts" className="text-blue-600 hover:underline">
            포스트
          </Link>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4">English (en)</h3>
        <div className="flex flex-col gap-2">
          <Link href="/about" className="text-blue-600 hover:underline">
            About
          </Link>
          <Link href="/posts" className="text-blue-600 hover:underline">
            Posts
          </Link>
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4">Japanese (ja)</h3>
        <div className="flex flex-col gap-2">
          <Link href="/about" className="text-blue-600 hover:underline">
            概要
          </Link>
          <Link href="/posts" className="text-blue-600 hover:underline">
            投稿
          </Link>
        </div>
      </section>
    </div>
  ),
  beforeEach: () => {
    useLocaleStore.setState({ locale: 'ko' });
  },
};
