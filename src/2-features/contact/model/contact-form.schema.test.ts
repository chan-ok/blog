import { describe, it, expect } from "vitest";

import { ContactFormInputsSchema } from "./contact-form.schema";

describe("ContactFormInputsSchema sanitization 통합", () => {
  const validEmail = "test@example.com";

  describe("message 필드 소독", () => {
    it("HTML 태그가 제거되어야 한다", () => {
      const input = {
        from: validEmail,
        message: '<div onclick="evil()">Click me</div>',
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe("Click me");
      expect(result.message).not.toContain("<div");
    });

    it("중첩된 악성 태그가 모두 제거되어야 한다", () => {
      const input = {
        from: validEmail,
        message: "<p><script>alert(1)</script>Safe text</p>",
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe("Safe text");
    });
  });

  describe("정상 입력 처리", () => {
    it("HTML이 없는 정상 입력은 그대로 유지되어야 한다", () => {
      const input = {
        from: validEmail,
        message: "This is a normal message.",
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe("This is a normal message.");
    });

    it("유니코드 문자는 보존되어야 한다", () => {
      const input = {
        from: validEmail,
        message: "こんにちは 🎉",
      };

      const result = ContactFormInputsSchema.parse(input);
      expect(result.message).toBe("こんにちは 🎉");
    });
  });

  describe("검증 실패 케이스", () => {
    it("빈 message는 검증에 실패해야 한다", () => {
      const input = {
        from: validEmail,
        message: "",
      };

      expect(() => ContactFormInputsSchema.parse(input)).toThrow();
    });

    it("유효하지 않은 이메일은 검증에 실패해야 한다", () => {
      const input = {
        from: "not-an-email",
        message: "Normal message",
      };

      expect(() => ContactFormInputsSchema.parse(input)).toThrow();
    });
  });
});
