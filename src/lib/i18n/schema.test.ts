import { describe, expect, it } from 'vitest';

import ja from './locales/ja.json';
import ko from './locales/ko.json';
import { TranslationResourceSchema } from './schema';

describe('TranslationResourceSchema', () => {
  it.each([
    ['ko', ko],
    ['ja', ja],
  ])('matches every key in the %s resource exactly', (_locale, resource) => {
    expect(TranslationResourceSchema.parse(resource)).toEqual(resource);
  });
});
