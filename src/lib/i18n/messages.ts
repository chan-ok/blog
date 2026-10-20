import ko from './locales/ko.json';
import ja from './locales/ja.json';
import type { Locale } from '../presentation/types';

const additions = {
  ko: {
    framework: '프레임워크 선택',
    copy: '코드 복사',
    copied: '복사됨',
    copyError: '복사하지 못했습니다',
    imageError: '이미지를 불러올 수 없습니다',
  },
  ja: {
    framework: 'フレームワーク選択',
    copy: 'コードをコピー',
    copied: 'コピー済み',
    copyError: 'コピーできませんでした',
    imageError: '画像を読み込めませんでした',
  },
};
export type Messages = typeof ko & { ui: (typeof additions)['ko'] };
export function getMessages(locale: Locale): Messages {
  return { ...(locale === 'ko' ? ko : ja), ui: additions[locale] };
}
