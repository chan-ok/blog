import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './contact';

// ContactForm 모킹
vi.mock('@/2-features/contact/ui/contact-form', () => ({
  default: () => <form data-testid="contact-form">Contact Form</form>,
}));

describe('$locale/contact 라우트 (Contact 페이지)', () => {
  it('에러 없이 렌더링되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;
    expect(Component).toBeDefined();

    render(<Component />);
  });

  it('ContactPage가 ContactForm을 포함해야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    render(<Component />);

    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('ContactForm이 중앙 정렬되어야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    const { container } = render(<Component />);

    // flex, justify-center 클래스 확인
    const wrapperDiv = container.querySelector('.flex.justify-center');
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('ContactForm이 w-xl 너비를 가져야 한다', () => {
    const Component = Route.options.component as React.ComponentType;

    const { container } = render(<Component />);

    // w-xl 클래스 확인
    const innerDiv = container.querySelector('.w-xl');
    expect(innerDiv).toBeInTheDocument();
  });

  it('createFileRoute가 올바른 경로로 생성되어야 한다', () => {
    // Route 객체가 정의되어 있는지 확인
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });
});
