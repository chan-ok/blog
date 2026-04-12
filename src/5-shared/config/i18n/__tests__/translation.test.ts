import { describe, it, expect } from "vitest";

import { TranslationResourceSchema } from "../schema";
import ko from "../locales/ko.json";
import en from "../locales/en.json";
import ja from "../locales/ja.json";

const locales = { ko, en, ja };

describe("번역 키 완전성 검증", () => {
  it("ko 번역이 스키마를 통과해야 한다", () => {
    expect(TranslationResourceSchema.safeParse(locales.ko).success).toBe(true);
  });

  it("en 번역이 스키마를 통과해야 한다", () => {
    expect(TranslationResourceSchema.safeParse(locales.en).success).toBe(true);
  });

  it("ja 번역이 스키마를 통과해야 한다", () => {
    expect(TranslationResourceSchema.safeParse(locales.ja).success).toBe(true);
  });
});
