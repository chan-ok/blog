import type ko from './locales/ko.json';

// 중첩 키를 평탄화하는 유틸리티 타입
type FlattenKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? FlattenKeys<T[K], `${Prefix}${K & string}.`>
        : `${Prefix}${K & string}`;
    }[keyof T]
  : never;

export type TranslationResource = typeof ko;
export type TranslationKeys = keyof typeof ko;
export type NestedTranslationKeys = FlattenKeys<typeof ko>;
