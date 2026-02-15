import React from 'react';
import {
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';

interface BlockquoteProps {
  children?: React.ReactNode;
}

type CalloutType = 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';

interface CalloutConfig {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const CALLOUT_CONFIGS: Record<CalloutType, CalloutConfig> = {
  INFO: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  WARNING: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  DANGER: {
    icon: AlertOctagon,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  SUCCESS: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
  },
};

/**
 * 콜아웃 감지 헬퍼 함수
 * `> [!TYPE]` 또는 `> [!TYPE] Title` 패턴 감지
 */
function parseCallout(children: React.ReactNode): {
  type: CalloutType;
  title: string;
  content: React.ReactNode;
} | null {
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return null;

  // 첫 번째 유효한 child의 인덱스 찾기 (공백 제외)
  const firstChildIndex = childArray.findIndex((child) => {
    if (typeof child === 'string') return child.trim() !== '';
    return true;
  });

  if (firstChildIndex === -1) return null;
  const firstChild = childArray[firstChildIndex];

  // children이 React Element인 경우 (p 태그)
  let textContent = '';
  if (React.isValidElement(firstChild)) {
    const props = firstChild.props as { children?: React.ReactNode };
    const pChildren = props.children;
    
    // p 태그 children이 문자열인 경우
    if (typeof pChildren === 'string') {
      textContent = pChildren;
    } else if (Array.isArray(pChildren)) {
      // p 태그 children이 배열인 경우 첫 번째 문자열 찾기
      const firstText = pChildren.find((c) => typeof c === 'string');
      textContent = typeof firstText === 'string' ? firstText : '';
    }
  } else if (typeof firstChild === 'string') {
    // children이 직접 문자열인 경우
    textContent = firstChild;
  }

  // 패턴 매칭: [!TYPE] 또는 [!TYPE] Title
  const calloutMatch = /^\s*\[!(INFO|WARNING|DANGER|SUCCESS)\]\s*(.*)$/m.exec(
    textContent
  );
  if (!calloutMatch) return null;

  const type = calloutMatch[1] as CalloutType;
  const titleText = calloutMatch[2].trim() || type;

  // [!TYPE] 이후의 content 추출
  // 1. 첫 번째 child를 제거하거나 수정
  // 2. 나머지 children을 content로 사용
  const remainingAfterCallout = calloutMatch[2].trim();
  let contentChildren: React.ReactNode[];

  if (remainingAfterCallout) {
    // [!TYPE] 뒤에 텍스트가 있으면 첫 번째 child를 수정
    const modifiedFirstChild = React.isValidElement(firstChild)
      ? React.cloneElement(
          firstChild as React.ReactElement,
          {},
          remainingAfterCallout
        )
      : remainingAfterCallout;
    contentChildren = [
      modifiedFirstChild,
      ...childArray.slice(firstChildIndex + 1),
    ];
  } else {
    // [!TYPE]만 있으면 첫 번째 child 완전 제거
    contentChildren = childArray.slice(firstChildIndex + 1);
  }

  return {
    type,
    title: titleText,
    content: contentChildren.length > 0 ? contentChildren : null,
  };
}

/**
 * MDX용 blockquote/callout 컴포넌트
 *
 * - 기본 blockquote: 좌측 보더 + 배경색
 * - 콜아웃: `> [!INFO]`, `> [!WARNING]`, `> [!DANGER]`, `> [!SUCCESS]` 감지 시 Notion 스타일 렌더링
 */
export default function Blockquote({ children }: BlockquoteProps) {
  const callout = parseCallout(children);

  // 콜아웃 렌더링
  if (callout) {
    const config = CALLOUT_CONFIGS[callout.type];
    const Icon = config.icon;

    return (
      <div
        role="note"
        className={`my-6 rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <Icon size={20} className={config.iconColor} aria-hidden="true" />
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {callout.title}
          </p>
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          {callout.content}
        </div>
      </div>
    );
  }

  // 일반 blockquote 렌더링
  return (
    <blockquote className="my-6 border-l-4 border-gray-300 bg-gray-50 pl-4 pr-4 py-2 italic text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
      {children}
    </blockquote>
  );
}
