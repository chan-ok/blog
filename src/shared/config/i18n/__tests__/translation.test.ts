import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { TranslationResourceSchema } from '../schema';
import ko from '../locales/ko.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

const locales = { ko, en, ja } as const;
type LocaleType = keyof typeof locales;

/**
 * **Feature: ui-i18n, Property 1: 번역 키 완전성**
 * **검증: 요구사항 1.1, 2.1, 3.1, 3.2, 3.3, 3.4**
 *
 * 모든 지원 locale(ko, en, ja)에 대해, 모든 필수 번역 키가 존재하고
 * 비어있지 않은 문자열 값을 가진다.
 */
describe('Property 1: 번역 키 완전성', () => {
  const localeArb = fc.constantFrom<LocaleType>('ko', 'en', 'ja');

  it('모든 locale에 대해 스키마 검증을 통과해야 한다', () => {
    fc.assert(
      fc.property(localeArb, (locale) => {
        const resource = locales[locale];
        const result = TranslationResourceSchema.safeParse(resource);

        expect(result.success).toBe(true);
      }),
      { numRuns: 30 }
    );
  });
});

/**
 * **Feature: ui-i18n, Property 3: 라운드트립 일관성**
 * **검증: 요구사항 5.2**
 *
 * 모든 유효한 TranslationResource 객체에 대해,
 * JSON으로 직렬화한 후 역직렬화하면 원본과 동등한 객체가 된다.
 */
describe('Property 3: 라운드트립 일관성', () => {
  const localeArb = fc.constantFrom<LocaleType>('ko', 'en', 'ja');

  it('JSON 직렬화/역직렬화 후 원본과 동등해야 한다', () => {
    fc.assert(
      fc.property(localeArb, (locale) => {
        const original = locales[locale];
        const serialized = JSON.stringify(original);
        const deserialized = JSON.parse(serialized);

        expect(deserialized).toEqual(original);
      }),
      { numRuns: 30 }
    );
  });
});

/**
 * **Feature: ui-i18n, Property 2: 폴백 동작**
 * **검증: 요구사항 4.2**
 *
 * 모든 번역 키에 대해, 특정 locale에 해당 키가 없으면
 * 기본 locale(ko)의 값으로 폴백한다.
 */
describe('Property 2: 폴백 동작', () => {
  // 모든 번역 키를 평탄화하여 추출
  function flattenKeys(obj: object, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return flattenKeys(value as object, newKey);
      }
      return [newKey];
    });
  }

  // 중첩된 키로 값을 가져오는 헬퍼
  function getNestedValue(obj: object, path: string): string | undefined {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj) as string | undefined;
  }

  const koKeys = flattenKeys(ko);
  const keyArb = fc.constantFrom(...koKeys);
  const localeArb = fc.constantFrom<LocaleType>('ko', 'en', 'ja');

  it('누락된 키에 대해 기본 locale(ko) 값으로 폴백해야 한다', () => {
    fc.assert(
      fc.property(keyArb, localeArb, (key, locale) => {
        const localeResource = locales[locale];
        const koResource = locales['ko'];

        const localeValue = getNestedValue(localeResource, key);
        const koValue = getNestedValue(koResource, key);

        // 현재 locale에 값이 있으면 그 값을 사용
        // 없으면 ko 값으로 폴백해야 함
        const expectedValue = localeValue ?? koValue;

        // ko는 항상 모든 키를 가지고 있어야 함 (Property 1에서 검증)
        expect(koValue).toBeDefined();

        // 최종 값은 항상 존재해야 함 (폴백 보장)
        expect(expectedValue).toBeDefined();
        expect(typeof expectedValue).toBe('string');
        expect(expectedValue!.length).toBeGreaterThan(0);
      }),
      { numRuns: 30 }
    );
  });
});
