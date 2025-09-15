import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner 컴포넌트', () => {
  it('기본 상태로 올바르게 렌더링되어야 한다', () => {
    render(<LoadingSpinner />);

    // 기본 텍스트 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();

    // 스피너 요소 확인
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '로딩 중');

    // 기본 크기 확인 (md)
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('커스텀 텍스트가 올바르게 표시되어야 한다', () => {
    const customText = '데이터를 불러오는 중...';
    render(<LoadingSpinner text={customText} />);

    expect(screen.getByText(customText)).toBeInTheDocument();
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });

  it('텍스트를 숨길 수 있어야 한다', () => {
    render(<LoadingSpinner text="" />);

    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();

    // 스피너는 여전히 보여야 함
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('다양한 크기 옵션이 올바르게 적용되어야 한다', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('커스텀 클래스명이 올바르게 적용되어야 한다', () => {
    const customClassName = 'my-custom-class';
    const { container } = render(<LoadingSpinner className={customClassName} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(customClassName);
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'py-8');
  });

  it('애니메이션 클래스가 올바르게 적용되어야 한다', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('rounded-full');
    expect(spinner).toHaveClass('border-2');
    expect(spinner).toHaveClass('border-gray-300');
    expect(spinner).toHaveClass('border-t-blue-500');
  });

  it('텍스트 스타일링이 올바르게 적용되어야 한다', () => {
    render(<LoadingSpinner text="테스트 텍스트" />);

    const text = screen.getByText('테스트 텍스트');
    expect(text).toHaveClass('mt-2', 'text-sm', 'text-gray-600');
  });

  it('접근성 속성들이 올바르게 설정되어야 한다', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', '로딩 중');
    expect(spinner).toHaveAttribute('role', 'status');
  });

  it('모든 프롭을 함께 사용했을 때 올바르게 동작해야 한다', () => {
    const { container } = render(
      <LoadingSpinner
        size="lg"
        text="큰 스피너로 로딩 중..."
        className="custom-spinner-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-spinner-class');

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12', 'h-12');

    const text = screen.getByText('큰 스피너로 로딩 중...');
    expect(text).toBeInTheDocument();
  });
});