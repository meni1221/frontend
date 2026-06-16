import { texts } from '../texts';

export type Locale = keyof typeof texts;

export const dictionaries = texts;

export const directionByLocale: Record<Locale, 'rtl' | 'ltr'> = {
  he: 'rtl',
  en: 'ltr',
};
