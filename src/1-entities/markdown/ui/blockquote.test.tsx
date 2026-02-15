import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Blockquote from './blockquote';

describe('Blockquote', () => {
  describe('일반 blockquote', () => {
    it('children을 정상적으로 렌더링한다', () => {
      render(
        <Blockquote>
          <p>일반 인용문입니다.</p>
        </Blockquote>
      );

      expect(screen.getByText('일반 인용문입니다.')).toBeInTheDocument();
      const blockquote = screen
        .getByText('일반 인용문입니다.')
        .closest('blockquote');
      expect(blockquote).toBeInTheDocument();
    });

    it('여러 줄의 텍스트를 렌더링한다', () => {
      render(
        <Blockquote>
          <p>첫 번째 줄</p>
          <p>두 번째 줄</p>
        </Blockquote>
      );

      expect(screen.getByText('첫 번째 줄')).toBeInTheDocument();
      expect(screen.getByText('두 번째 줄')).toBeInTheDocument();
    });
  });

  describe('콜아웃', () => {
    it('[!INFO]만 있는 경우 본문에 노출되지 않는다', () => {
      render(
        <Blockquote>
          <p>[!INFO]</p>
          <p>본문 내용입니다.</p>
        </Blockquote>
      );

      // [!INFO]는 표시되지 않아야 함
      expect(screen.queryByText(/\[!INFO\]/)).not.toBeInTheDocument();

      // 타이틀은 기본값(INFO)으로 표시
      expect(screen.getByText('INFO')).toBeInTheDocument();

      // 본문은 정상 표시
      expect(screen.getByText('본문 내용입니다.')).toBeInTheDocument();

      // role="note"가 있어야 함
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('[!INFO] Title 형식에서 [!INFO]는 본문에 노출되지 않는다', () => {
      render(
        <Blockquote>
          <p>[!INFO] 중요한 정보</p>
          <p>본문 내용입니다.</p>
        </Blockquote>
      );

      // [!INFO]는 표시되지 않아야 함
      expect(screen.queryByText(/\[!INFO\]/)).not.toBeInTheDocument();

      // 타이틀만 표시
      expect(screen.getByText('중요한 정보')).toBeInTheDocument();

      // 본문은 정상 표시
      expect(screen.getByText('본문 내용입니다.')).toBeInTheDocument();
    });

    it('[!WARNING] 콜아웃을 렌더링한다', () => {
      render(
        <Blockquote>
          <p>[!WARNING] 경고 메시지</p>
          <p>주의하세요.</p>
        </Blockquote>
      );

      expect(screen.queryByText(/\[!WARNING\]/)).not.toBeInTheDocument();
      expect(screen.getByText('경고 메시지')).toBeInTheDocument();
      expect(screen.getByText('주의하세요.')).toBeInTheDocument();
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('[!DANGER] 콜아웃을 렌더링한다', () => {
      render(
        <Blockquote>
          <p>[!DANGER] 위험</p>
          <p>위험한 작업입니다.</p>
        </Blockquote>
      );

      expect(screen.queryByText(/\[!DANGER\]/)).not.toBeInTheDocument();
      expect(screen.getByText('위험')).toBeInTheDocument();
      expect(screen.getByText('위험한 작업입니다.')).toBeInTheDocument();
    });

    it('[!SUCCESS] 콜아웃을 렌더링한다', () => {
      render(
        <Blockquote>
          <p>[!SUCCESS] 성공</p>
          <p>작업이 완료되었습니다.</p>
        </Blockquote>
      );

      expect(screen.queryByText(/\[!SUCCESS\]/)).not.toBeInTheDocument();
      expect(screen.getByText('성공')).toBeInTheDocument();
      expect(screen.getByText('작업이 완료되었습니다.')).toBeInTheDocument();
    });

    it('콜아웃 타입만 있고 본문이 없는 경우', () => {
      render(
        <Blockquote>
          <p>[!INFO]</p>
        </Blockquote>
      );

      expect(screen.queryByText(/\[!INFO\]/)).not.toBeInTheDocument();
      expect(screen.getByText('INFO')).toBeInTheDocument();
      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('여러 줄의 본문을 가진 콜아웃을 렌더링한다', () => {
      render(
        <Blockquote>
          <p>[!INFO] 정보</p>
          <p>첫 번째 줄</p>
          <p>두 번째 줄</p>
          <p>세 번째 줄</p>
        </Blockquote>
      );

      expect(screen.queryByText(/\[!INFO\]/)).not.toBeInTheDocument();
      expect(screen.getByText('정보')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 줄')).toBeInTheDocument();
      expect(screen.getByText('두 번째 줄')).toBeInTheDocument();
      expect(screen.getByText('세 번째 줄')).toBeInTheDocument();
    });

    it('콜아웃이 아닌 [!TYPE] 형식은 일반 blockquote로 렌더링한다', () => {
      render(
        <Blockquote>
          <p>[!UNKNOWN] 알 수 없는 타입</p>
        </Blockquote>
      );

      // 일반 blockquote로 렌더링되어야 함
      expect(screen.getByText(/\[!UNKNOWN\]/)).toBeInTheDocument();
      const blockquote = screen.getByText(/\[!UNKNOWN\]/).closest('blockquote');
      expect(blockquote).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('콜아웃에 role="note"가 있다', () => {
      render(
        <Blockquote>
          <p>[!INFO] 정보</p>
          <p>내용</p>
        </Blockquote>
      );

      expect(screen.getByRole('note')).toBeInTheDocument();
    });

    it('아이콘에 aria-hidden이 설정되어 있다', () => {
      const { container } = render(
        <Blockquote>
          <p>[!INFO] 정보</p>
          <p>내용</p>
        </Blockquote>
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });
});
