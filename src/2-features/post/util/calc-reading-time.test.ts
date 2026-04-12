import { describe, it, expect } from "vitest";
import { calcReadingTime } from "./calc-reading-time";

describe("calcReadingTime", () => {
  it('빈 텍스트는 "1분 미만"을 반환한다', () => {
    expect(calcReadingTime("", "ko")).toBe("1분 미만");
  });

  it('공백만 있는 텍스트는 "1분 미만"을 반환한다', () => {
    expect(calcReadingTime("   ", "ko")).toBe("1분 미만");
  });

  it('한국어: 500자 미만이면 "1분 미만"을 반환한다', () => {
    // 한국어 읽기 속도: 500자/분
    const text = "a".repeat(499);
    expect(calcReadingTime(text, "ko")).toBe("1분 미만");
  });

  it('한국어: 정확히 500자이면 "약 1분"을 반환한다', () => {
    const text = "a".repeat(500);
    expect(calcReadingTime(text, "ko")).toBe("약 1분");
  });

  it('한국어: 1001자이면 "약 3분"을 반환한다', () => {
    // 1001 / 500 = 2.002 → ceil → 3분
    const text = "a".repeat(1001);
    expect(calcReadingTime(text, "ko")).toBe("약 3분");
  });

  it("일본어: 한국어와 동일한 설정을 사용한다", () => {
    const text = "a".repeat(500);
    expect(calcReadingTime(text, "ja")).toBe("約1分");
  });

  it('일본어: 500자 미만이면 "1分未満"을 반환한다', () => {
    const text = "a".repeat(499);
    expect(calcReadingTime(text, "ja")).toBe("1分未満");
  });
});
