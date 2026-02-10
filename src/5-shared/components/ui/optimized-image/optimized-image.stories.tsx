/**
 * OptimizedImage 컴포넌트 Storybook 스토리
 *
 * ## 기능
 * - 외부 이미지: HTTP/HTTPS URL 직접 로드
 * - 로컬 이미지: Vite Plugin으로 압축된 PNG 사용
 * - Lazy loading 지원 (priority로 제어)
 * - Responsive 이미지 지원
 */

import type { Meta, StoryObj } from '@storybook/react-vite';

import OptimizedImage from '.';

const meta = {
  title: 'Shared/UI/OptimizedImage',
  component: OptimizedImage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
OptimizedImage 컴포넌트는 로컬과 외부 이미지를 최적화하여 렌더링합니다.

**특징**:
- 📦 **로컬 이미지**: Vite Plugin이 자동 압축 (PNG 압축률 70%)
- 🌐 **외부 이미지**: 직접 로드 + lazy loading
- ⚡ **성능 최적화**: lazy loading + async decoding
- 🎨 **유연한 스타일링**: className으로 Tailwind 적용

**사용 예시**:
\`\`\`tsx
// 로컬 이미지 (자동 압축)
<OptimizedImage src="/image/git-profile.png" alt="Profile" />

// 외부 이미지 (lazy loading)
<OptimizedImage src="https://example.com/image.jpg" alt="External" />

// Priority 이미지 (즉시 로드)
<OptimizedImage src="/hero.png" alt="Hero" priority />
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: '이미지 경로 (로컬: /image/*, 외부: http(s)://)',
      table: {
        type: { summary: 'string' },
      },
    },
    alt: {
      control: 'text',
      description: '이미지 대체 텍스트 (접근성 필수)',
      table: {
        type: { summary: 'string' },
      },
    },
    width: {
      control: 'number',
      description: '이미지 너비 (픽셀)',
      table: {
        type: { summary: 'number' },
      },
    },
    height: {
      control: 'number',
      description: '이미지 높이 (픽셀)',
      table: {
        type: { summary: 'number' },
      },
    },
    priority: {
      control: 'boolean',
      description: 'true: eager loading, false: lazy loading',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: {
      control: 'text',
      description: 'Tailwind CSS 클래스명',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof OptimizedImage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 로컬 이미지
 *
 * Vite Plugin이 자동으로 압축한 PNG를 사용합니다.
 * lazy loading이 기본 적용됩니다.
 */
export const Default: Story = {
  args: {
    src: '/image/git-profile.png',
    alt: 'Git Profile',
  },
};

/**
 * 외부 이미지 (GitHub Raw URL)
 *
 * 외부 URL은 직접 로드하며 lazy loading이 적용됩니다.
 */
export const External: Story = {
  args: {
    src: 'https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png',
    alt: 'TypeScript Logo',
  },
};

/**
 * 크기 지정 이미지
 *
 * width와 height를 명시하여 CLS(Cumulative Layout Shift)를 방지합니다.
 */
export const WithDimensions: Story = {
  args: {
    src: '/image/git-profile.png',
    alt: 'Profile with dimensions',
    width: 400,
    height: 400,
  },
};

/**
 * Priority 이미지 (Eager Loading)
 *
 * 중요한 이미지(Hero, Logo 등)는 priority=true로 즉시 로드합니다.
 */
export const Priority: Story = {
  args: {
    src: '/image/context.png',
    alt: 'Context image',
    priority: true,
    width: 800,
    height: 600,
  },
};

/**
 * 커스텀 스타일 이미지
 *
 * className으로 Tailwind CSS 스타일을 적용합니다.
 */
export const CustomClassName: Story = {
  args: {
    src: '/image/git-profile.png',
    alt: 'Styled image',
    className:
      'rounded-full shadow-lg border-4 border-white dark:border-zinc-800',
    width: 200,
    height: 200,
  },
};

/**
 * 반응형 이미지
 *
 * Tailwind의 반응형 클래스로 화면 크기에 맞게 조정됩니다.
 */
export const Responsive: Story = {
  args: {
    src: '/image/context.png',
    alt: 'Responsive image',
    className: 'w-full max-w-md h-auto rounded-lg shadow-md',
  },
};

/**
 * 객체 맞춤 이미지 (Object Cover)
 *
 * object-cover로 컨테이너에 맞춰 이미지를 채웁니다.
 */
export const ObjectCover: Story = {
  args: {
    src: 'https://raw.githubusercontent.com/github/explore/main/topics/react/react.png',
    alt: 'React Logo',
    width: 400,
    height: 300,
    className: 'object-cover rounded-xl shadow-lg',
  },
};

/**
 * 장식용 이미지 (Empty Alt)
 *
 * 장식용 이미지는 alt=""로 스크린 리더에서 무시됩니다.
 */
export const DecorativeImage: Story = {
  args: {
    src: '/image/git-profile.png',
    alt: '',
    width: 150,
    height: 150,
    className: 'opacity-50 blur-sm',
  },
};

/**
 * 여러 케이스 조합
 *
 * 다양한 이미지 사용 사례를 한 번에 확인합니다.
 */
export const AllCombinations: Story = {
  args: {
    src: '/image/git-profile.png',
    alt: 'All combinations example',
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-gray-50 dark:bg-zinc-900">
      {/* 로컬 이미지 - 기본 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          로컬 이미지 (기본)
        </h3>
        <OptimizedImage
          src="/image/git-profile.png"
          alt="Local default"
          className="rounded-lg shadow-md"
        />
      </div>

      {/* 로컬 이미지 - Priority */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          로컬 이미지 (Priority)
        </h3>
        <OptimizedImage
          src="/image/context.png"
          alt="Local priority"
          priority
          width={300}
          height={200}
          className="rounded-lg shadow-md"
        />
      </div>

      {/* 외부 이미지 - 기본 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          외부 이미지 (기본)
        </h3>
        <OptimizedImage
          src="https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png"
          alt="External default"
          width={300}
          height={300}
          className="rounded-lg shadow-md bg-white p-4"
        />
      </div>

      {/* 외부 이미지 - 커스텀 스타일 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          외부 이미지 (커스텀)
        </h3>
        <OptimizedImage
          src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png"
          alt="External custom"
          width={200}
          height={200}
          className="rounded-full shadow-lg border-4 border-blue-500 bg-white p-4"
        />
      </div>

      {/* 반응형 이미지 */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          반응형 이미지
        </h3>
        <OptimizedImage
          src="/image/git-profile.png"
          alt="Responsive"
          className="w-full h-auto rounded-lg shadow-md"
        />
      </div>

      {/* Object Cover */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Object Cover
        </h3>
        <div className="w-full h-48 overflow-hidden rounded-lg shadow-md">
          <OptimizedImage
            src="https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png"
            alt="Object cover"
            width={300}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * 다크 모드 지원
 *
 * 다크 모드에서도 이미지가 올바르게 표시됩니다.
 */
export const DarkMode: Story = {
  args: {
    src: '/image/git-profile.png',
    alt: 'Dark mode image',
    width: 300,
    height: 300,
    className:
      'rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

/**
 * 로딩 상태 시뮬레이션
 *
 * 외부 이미지의 lazy loading 동작을 확인합니다.
 */
export const LazyLoading: Story = {
  args: {
    src: 'https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png',
    alt: 'Lazy loading example',
  },
  render: () => (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          스크롤하여 Lazy Loading 확인
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          아래로 스크롤하면 이미지가 뷰포트에 들어올 때 로드됩니다.
        </p>
      </div>

      {/* Spacer */}
      <div className="h-[100vh] flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          ⬇️ 아래로 스크롤하세요
        </p>
      </div>

      {/* Lazy loaded images */}
      <div className="grid grid-cols-2 gap-4">
        <OptimizedImage
          src="https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png"
          alt="Lazy 1"
          width={300}
          height={300}
          className="rounded-lg shadow-md bg-white p-4"
        />
        <OptimizedImage
          src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png"
          alt="Lazy 2"
          width={300}
          height={300}
          className="rounded-lg shadow-md bg-white p-4"
        />
        <OptimizedImage
          src="https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png"
          alt="Lazy 3"
          width={300}
          height={300}
          className="rounded-lg shadow-md bg-white p-4"
        />
        <OptimizedImage
          src="https://raw.githubusercontent.com/github/explore/main/topics/nodejs/nodejs.png"
          alt="Lazy 4"
          width={300}
          height={300}
          className="rounded-lg shadow-md bg-white p-4"
        />
      </div>
    </div>
  ),
};
