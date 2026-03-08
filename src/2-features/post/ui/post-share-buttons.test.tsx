import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import fc from 'fast-check';

import PostShareButtons from './post-share-buttons';

// ============================================================================
// Mock 설정: react-i18next
// 기존 테스트 패턴과 동일하게 t(key) => key 방식으로 모킹
// ============================================================================

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// ============================================================================
// 테스트 전/후 처리
// ============================================================================

beforeEach(() => {
  // clipboard API 모킹 (jsdom에는 clipboard가 없으므로 직접 주입)
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });

  // fake timer 사용 (setTimeout 제어)
  vi.useFakeTimers();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

// ============================================================================
// 테스트 데이터
// ============================================================================

const defaultProps = {
  title: '테스트 포스트 제목',
  url: 'https://chan-ok.com/ko/posts/test-post',
};

// ============================================================================
// Unit 테스트: Twitter 공유 링크
// ============================================================================

describe('PostShareButtons - Twitter 공유 링크', () => {
  it('Twitter 공유 링크에 twitter.com/intent/tweet이 포함되어야 한다', () => {
    render(<PostShareButtons {...defaultProps} />);

    const twitterLink = screen.getByRole('link', { name: 'Twitter/X로 공유' });
    expect(twitterLink.getAttribute('href')).toContain('twitter.com/intent/tweet');
  });

  it('Twitter 링크 URL에 encodeURIComponent(title)이 포함되어야 한다', () => {
    render(<PostShareButtons {...defaultProps} />);

    const twitterLink = screen.getByRole('link', { name: 'Twitter/X로 공유' });
    const href = twitterLink.getAttribute('href') ?? '';

    expect(href).toContain(encodeURIComponent(defaultProps.title));
  });

  it('Twitter 링크 URL에 encodeURIComponent(url)이 포함되어야 한다', () => {
    render(<PostShareButtons {...defaultProps} />);

    const twitterLink = screen.getByRole('link', { name: 'Twitter/X로 공유' });
    const href = twitterLink.getAttribute('href') ?? '';

    expect(href).toContain(encodeURIComponent(defaultProps.url));
  });

  it('Twitter 링크가 새 탭에서 열려야 한다 (target=_blank)', () => {
    render(<PostShareButtons {...defaultProps} />);

    const twitterLink = screen.getByRole('link', { name: 'Twitter/X로 공유' });
    expect(twitterLink.getAttribute('target')).toBe('_blank');
    expect(twitterLink.getAttribute('rel')).toContain('noopener');
  });
});

// ============================================================================
// Unit 테스트: LinkedIn 공유 링크
// ============================================================================

describe('PostShareButtons - LinkedIn 공유 링크', () => {
  it('LinkedIn 링크에 linkedin.com/sharing/share-offsite가 포함되어야 한다', () => {
    render(<PostShareButtons {...defaultProps} />);

    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn으로 공유' });
    expect(linkedinLink.getAttribute('href')).toContain('linkedin.com/sharing/share-offsite');
  });

  it('LinkedIn 링크 URL에 encodeURIComponent(url)이 포함되어야 한다', () => {
    render(<PostShareButtons {...defaultProps} />);

    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn으로 공유' });
    const href = linkedinLink.getAttribute('href') ?? '';

    expect(href).toContain(encodeURIComponent(defaultProps.url));
  });

  it('LinkedIn 링크가 새 탭에서 열려야 한다 (target=_blank)', () => {
    render(<PostShareButtons {...defaultProps} />);

    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn으로 공유' });
    expect(linkedinLink.getAttribute('target')).toBe('_blank');
  });
});

// ============================================================================
// Unit 테스트: URL 복사 버튼
// ============================================================================

describe('PostShareButtons - URL 복사 버튼', () => {
  it('URL 복사 버튼 클릭 시 navigator.clipboard.writeText가 호출되어야 한다', async () => {
    render(<PostShareButtons {...defaultProps} />);

    // 초기 상태: post.copyLink 키를 aria-label로 사용 (t(key) => key 이므로)
    const copyButton = screen.getByRole('button', { name: 'post.copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  it('복사 후 버튼 aria-label이 post.copied로 변경되어야 한다', async () => {
    render(<PostShareButtons {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: 'post.copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // 복사 후 aria-label이 'post.copied'로 변경됨
    expect(screen.getByRole('button', { name: 'post.copied' })).toBeInTheDocument();
  });

  it('fake timer로 2초 후 버튼 상태가 초기화되어야 한다', async () => {
    render(<PostShareButtons {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: 'post.copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // 복사 직후: post.copied 상태
    expect(screen.getByRole('button', { name: 'post.copied' })).toBeInTheDocument();

    // 2초 경과 후: 원래 상태로 복구
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: 'post.copyLink' })).toBeInTheDocument();
  });

  it('2초가 지나기 전에는 copied 상태가 유지되어야 한다', async () => {
    render(<PostShareButtons {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: 'post.copyLink' });

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // 1.9초 경과 후: 아직 copied 상태여야 함
    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(screen.getByRole('button', { name: 'post.copied' })).toBeInTheDocument();
  });

  it('초기 상태에서 버튼 텍스트가 post.copyLink이어야 한다', () => {
    render(<PostShareButtons {...defaultProps} />);

    // t(key) => key 이므로 번역 키 그대로 표시됨
    expect(screen.getByText('post.copyLink')).toBeInTheDocument();
  });
});

// ============================================================================
// Property-Based 테스트: 임의의 title/url에서 Twitter URL 인코딩 검증
// ============================================================================

describe('PostShareButtons - Property-Based 테스트', () => {
  /**
   * 임의의 title/url 조합에서 Twitter 공유 URL에 항상
   * encodeURIComponent(title)이 포함되는지 검증한다.
   */
  it('임의의 title/url 조합에서 Twitter URL에 인코딩된 title이 포함되어야 한다', { timeout: 15000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        // 특수문자가 포함될 수 있는 임의의 문자열
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        fc.webUrl(),
        async (title, url) => {
          const { unmount } = render(<PostShareButtons title={title} url={url} />);

          const twitterLink = screen.getByRole('link', { name: 'Twitter/X로 공유' });
          const href = twitterLink.getAttribute('href') ?? '';

          // Twitter URL에 인코딩된 title이 포함되어야 함
          expect(href).toContain(encodeURIComponent(title));

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('임의의 url 조합에서 LinkedIn URL에 인코딩된 url이 포함되어야 한다', { timeout: 15000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        async (url) => {
          const { unmount } = render(
            <PostShareButtons title="테스트" url={url} />
          );

          const linkedinLink = screen.getByRole('link', { name: 'LinkedIn으로 공유' });
          const href = linkedinLink.getAttribute('href') ?? '';

          // LinkedIn URL에 인코딩된 url이 포함되어야 함
          expect(href).toContain(encodeURIComponent(url));

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
