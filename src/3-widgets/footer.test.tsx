import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Footer from "./footer";

describe("Footer 위젯", () => {
  it("footer 요소가 렌더링되어야 한다", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("저작권 텍스트가 포함되어야 한다", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    const currentYear = new Date().getFullYear();
    expect(footer).toHaveTextContent(
      `© ${currentYear} Chanho Kim's dev Blog. All rights reserved.`,
    );
  });
});
