import { en } from './en';
import { he } from './he';

export const texts = {
  he,
  en,
} as const;

export type TextKey = keyof typeof he;
