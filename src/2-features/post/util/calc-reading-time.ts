import type { LocaleType } from '@/5-shared/types/common.schema';

interface ReadingTimeConfig {
  /** 분당 읽는 단위 수 (한국어/일본어: 글자 수, 영어: 단어 수) */
  rate: number;
  /** 1분 미만일 때 표시할 문자열 */
  lessThanMin: string;
  /** N분으로 포맷하는 함수 */
  format: (minutes: number) => string;
  /** 텍스트에서 단위 수를 계산하는 함수 */
  countUnits: (text: string) => number;
}

const CONFIG: Record<LocaleType, ReadingTimeConfig> = {
  ko: {
    rate: 500,
    lessThanMin: '1분 미만',
    format: (m: number) => `약 ${m}분`,
    countUnits: (text: string) => text.length,
  },
  ja: {
    rate: 500,
    lessThanMin: '1分未満',
    format: (m: number) => `約${m}分`,
    countUnits: (text: string) => text.length,
  },
};

/**
 * 텍스트 길이를 기반으로 읽기 예상 시간을 계산한다.
 * 한국어/일본어: 500자/분, 영어: 200단어/분
 */
export function calcReadingTime(text: string, locale: LocaleType): string {
  const config = CONFIG[locale];
  const count = config.countUnits(text.trim());

  if (count === 0) return config.lessThanMin;

  const exactMinutes = count / config.rate;

  if (exactMinutes < 1) return config.lessThanMin;

  return config.format(Math.ceil(exactMinutes));
}
