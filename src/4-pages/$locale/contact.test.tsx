import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route } from './contact';

// ContactForm 모킹
vi.mock('@/2-features/contact/ui/contact-form', () => ({
  default: () => <form data-testid="contact-form">Contact Form</form>,
}));

describe('$locale/contact 라우트 (Contact 페이지)', () => {
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
});
