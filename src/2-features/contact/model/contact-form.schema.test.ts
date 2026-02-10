import { describe, it, expect } from 'vitest';

import { ContactFormInputsSchema } from './contact-form.schema';

/**
 * ContactFormInputsSchema 통합 테스트
 * XSS 패턴이 포함된 입력이 소독되는지 검증
 * **검증: 요구사항 1.1, 1.2, 3.2**
 */
describe('ContactFormInputsSchema sanitization 통합', () => {
  const validEmail = 'test@example.com';

  describe('subject 필드 소독', () => {
    it('script 태그가 제거되어야 한다', () => {
      const input = {
        from: validEmail,
        subject: '<script>alert("xss")</script>Hello',
        message: 'Normal message',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.subject).toBe('Hello');
      expect(result.subject).not.toContain('<script>');
    });

    it('이벤트 핸들러가 포함된 태그가 제거되어야 한다', () => {
      const input = {
        from: validEmail,
        subject: 'Test<img src="x" onerror="alert(1)">Subject',
        message: 'Normal message',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.subject).toBe('TestSubject');
      expect(result.subject).not.toContain('<img');
    });
  });

  describe('message 필드 소독', () => {
    it('HTML 태그가 제거되어야 한다', () => {
      const input = {
        from: validEmail,
        subject: 'Normal subject',
        message: '<div onclick="evil()">Click me</div>',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe('Click me');
      expect(result.message).not.toContain('<div');
    });

    it('중첩된 악성 태그가 모두 제거되어야 한다', () => {
      const input = {
        from: validEmail,
        subject: 'Normal subject',
        message: '<p><script>alert(1)</script>Safe text</p>',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe('Safe text');
    });
  });

  describe('정상 입력 처리', () => {
    it('HTML이 없는 정상 입력은 그대로 유지되어야 한다', () => {
      const input = {
        from: validEmail,
        subject: 'Hello World',
        message: 'This is a normal message.',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.subject).toBe('Hello World');
      expect(result.message).toBe('This is a normal message.');
    });

    it('유니코드 문자는 보존되어야 한다', () => {
      const input = {
        from: validEmail,
        subject: '안녕하세요',
        message: 'こんにちは 🎉',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.subject).toBe('안녕하세요');
      expect(result.message).toBe('こんにちは 🎉');
    });
  });

  describe('검증 실패 케이스', () => {
    it('빈 subject는 검증에 실패해야 한다', () => {
      const input = {
        from: validEmail,
        subject: '',
        message: 'Normal message',
      };

      expect(() => ContactFormInputsSchema.parse(input)).toThrow();
    });

    it('빈 message는 검증에 실패해야 한다', () => {
      const input = {
        from: validEmail,
        subject: 'Normal subject',
        message: '',
      };

      expect(() => ContactFormInputsSchema.parse(input)).toThrow();
    });
  });
});
