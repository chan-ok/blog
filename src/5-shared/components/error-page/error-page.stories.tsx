import type { Meta, StoryObj } from '@storybook/react-vite';
import type React from 'react';
import { ErrorPage } from '.';

const meta = {
  title: 'Components/ErrorPage',
  component: ErrorPage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    statusCode: {
      control: 'select',
      options: [403, 404, 500],
      description: 'HTTP 에러 상태 코드',
    },
    title: {
      control: 'text',
      description: '커스텀 에러 제목 (선택사항)',
    },
    description: {
      control: 'text',
      description: '커스텀 에러 설명 (선택사항)',
    },
    onRetry: {
      description: '"다시 시도" 버튼 클릭 핸들러',
    },
    onGoHome: {
      description: '"홈으로 돌아가기" 버튼 클릭 핸들러',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen w-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 404 Not Found: 페이지를 찾을 수 없을 때 표시되는 기본 에러 페이지
 */
export const NotFound: Story = {
  args: {
    statusCode: 404,
    onGoHome: () => console.log('Go Home clicked'),
  },
};

/**
 * 403 Forbidden: 접근 권한이 없을 때 표시되는 기본 에러 페이지
 */
export const Forbidden: Story = {
  args: {
    statusCode: 403,
    onGoHome: () => console.log('Go Home clicked'),
  },
};

/**
 * 500 Server Error: 서버 에러 발생 시 표시되는 기본 에러 페이지
 * onRetry 콜백이 있으면 "다시 시도" 버튼이 표시됩니다.
 */
export const ServerError: Story = {
  args: {
    statusCode: 500,
    onRetry: () => console.log('Retry clicked'),
    onGoHome: () => console.log('Go Home clicked'),
  },
};

/**
 * Custom Message: 커스텀 제목과 설명이 있는 에러 페이지
 * title과 description props를 전달하여 기본 메시지를 재정의할 수 있습니다.
 */
export const CustomMessage: Story = {
  args: {
    statusCode: 404,
    title: 'Oops! Something went wrong',
    description:
      'We could not find what you were looking for. Please check the URL or contact support.',
    onGoHome: () => console.log('Go Home clicked'),
  },
};

/**
 * With Retry Button: onRetry 콜백이 있는 500 에러
 * 서버 에러 발생 시 사용자가 다시 시도할 수 있도록 버튼을 제공합니다.
 */
export const WithRetryButton: Story = {
  args: {
    statusCode: 500,
    onRetry: () => console.log('Retry clicked'),
  },
};

/**
 * Without Buttons: 버튼이 없는 에러 페이지
 * onGoHome과 onRetry를 전달하지 않으면 버튼이 표시되지 않습니다.
 */
export const WithoutButtons: Story = {
  args: {
    statusCode: 404,
  },
};

/**
 * Dark Mode: 다크 모드에서의 에러 페이지
 * 모든 상태 코드의 에러 페이지를 다크 모드에서 표시합니다.
 */
export const DarkMode: Story = {
  args: {
    statusCode: 404,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    () => (
      <div className="min-h-screen w-screen flex items-center justify-center dark bg-gray-900">
        <div className="flex flex-col gap-12">
          <div>
            <h2 className="text-white text-xl font-bold mb-4">404 Error</h2>
            <ErrorPage
              statusCode={404}
              onGoHome={() => console.log('Go Home clicked')}
            />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold mb-4">403 Error</h2>
            <ErrorPage
              statusCode={403}
              onGoHome={() => console.log('Go Home clicked')}
            />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold mb-4">500 Error</h2>
            <ErrorPage
              statusCode={500}
              onRetry={() => console.log('Retry clicked')}
              onGoHome={() => console.log('Go Home clicked')}
            />
          </div>
        </div>
      </div>
    ),
  ],
  render: () => <></>,
};

/**
 * All States: 모든 에러 상태의 개요
 * 404, 403, 500 에러를 한 번에 확인할 수 있습니다.
 */
export const AllStates: Story = {
  args: {
    statusCode: 404,
  },
  render: () => (
    <div className="flex flex-col gap-12 p-8">
      <section>
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          404 - Page Not Found
        </h3>
        <ErrorPage
          statusCode={404}
          onGoHome={() => console.log('Go Home clicked')}
        />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          403 - Access Denied
        </h3>
        <ErrorPage
          statusCode={403}
          onGoHome={() => console.log('Go Home clicked')}
        />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          500 - Server Error
        </h3>
        <ErrorPage
          statusCode={500}
          onRetry={() => console.log('Retry clicked')}
          onGoHome={() => console.log('Go Home clicked')}
        />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Custom Message
        </h3>
        <ErrorPage
          statusCode={404}
          title="Custom Error"
          description="This is a custom error message."
          onGoHome={() => console.log('Go Home clicked')}
        />
      </section>
    </div>
  ),
};
