import React from 'react';
import { Info, AlertTriangle, AlertOctagon, CheckCircle, type LucideIcon } from 'lucide-react';

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
    bgColor: 'bg-bg2',
    iconColor: 'text-ink3',
    borderColor: 'border-rule',
  },
  WARNING: {
    icon: AlertTriangle,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink2',
    borderColor: 'border-rule',
  },
  DANGER: {
    icon: AlertOctagon,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink',
    borderColor: 'border-ink',
  },
  SUCCESS: {
    icon: CheckCircle,
    bgColor: 'bg-bg2',
    iconColor: 'text-ink3',
    borderColor: 'border-rule',
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
  const calloutMatch = /^\s*\[!(INFO|WARNING|DANGER|SUCCESS)\]\s*(.*)$/m.exec(textContent);
  if (!calloutMatch) return null;

  const type = calloutMatch[1] as CalloutType;
  const titleText = calloutMatch[2].trim() || type;

  // [!TYPE] Title 이후의 텍스트 추출 (같은 줄 또는 다음 줄)
  const matchEndIndex = (calloutMatch.index || 0) + calloutMatch[0].length;
  const remainingText = textContent.slice(matchEndIndex).trim();

  // Content 구성
  const contentChildren: React.ReactNode[] = [];

  if (remainingText) {
    // [!TYPE] 이후에 본문이 있으면, 첫 번째 p 태그를 본문으로 교체
    if (React.isValidElement(firstChild)) {
      contentChildren.push(React.cloneElement(firstChild, {}, remainingText));
    } else {
      contentChildren.push(remainingText);
    }
  }

  // 나머지 children 추가
  contentChildren.push(...childArray.slice(firstChildIndex + 1));

  return {
    type,
    title: titleText,
    content: contentChildren.length > 0 ? <>{contentChildren}</> : null,
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
          <p className="font-semibold text-ink">{callout.title}</p>
        </div>
        <div className="text-ink2">{callout.content}</div>
      </div>
    );
  }

  // 일반 blockquote 렌더링
  return (
    <blockquote className="my-8 border-l-[3px] border-ink bg-bg2 pl-7 pr-6 py-5 italic text-ink2 text-[15px] leading-[1.9]">
      {children}
    </blockquote>
  );
}
