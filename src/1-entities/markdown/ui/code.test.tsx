import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Code from "./code";

describe("Unit 테스트 - 인라인 코드 렌더링", () => {
  it("className이 없으면 인라인 코드로 렌더링해야 한다", () => {
    const { unmount } = render(<Code>const test = 'hello';</Code>);
    const code = screen.getByText("const test = 'hello';");

    expect(code.tagName).toBe("CODE");

    unmount();
  });

  it("children을 올바르게 렌더링해야 한다", () => {
    const testText = 'const hello = "world";';
    const { unmount } = render(<Code>{testText}</Code>);

    expect(screen.getByText(testText)).toBeInTheDocument();

    unmount();
  });
});

describe("Unit 테스트 - 코드 블록 렌더링", () => {
  it("className이 있으면 코드 블록으로 렌더링해야 한다", () => {
    const { unmount } = render(
      <Code className="language-typescript">const test = 'block';</Code>,
    );
    const code = screen.getByText("const test = 'block';");

    expect(code.className).toContain("language-typescript");

    unmount();
  });

  it("className을 올바르게 전달해야 한다", () => {
    const testClassName = "language-javascript hljs";
    const { unmount } = render(
      <Code className={testClassName}>const x = 1;</Code>,
    );
    const code = screen.getByText("const x = 1;");

    expect(code).toHaveTextContent("const x = 1;");

    unmount();
  });

  it("멀티라인 코드를 올바르게 렌더링해야 한다", () => {
    const multilineCode = `function hello() {\n  console.log("world");\n}`;
    const { unmount, container } = render(
      <Code className="language-javascript">{multilineCode}</Code>,
    );

    const code = container.querySelector("code");
    expect(code?.textContent).toBe(multilineCode);

    unmount();
  });
});
