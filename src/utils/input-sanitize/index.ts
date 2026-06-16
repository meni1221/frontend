export const sanitizeEmailInput = (value: string) =>
  value.replace(/\s/g, '').toLowerCase();

export const sanitizeNameInput = (value: string) =>
  value.replace(/[^\p{L}\s'"-]/gu, '');

export const sanitizePhoneInput = (value: string) =>
  value.replace(/[^\d+\-\s()]/g, '');

export const sanitizePositiveIntegerInput = (value: string) =>
  value.replace(/\D/g, '');

export const sanitizeShortTextInput = (value: string) =>
  value.replace(/[^\p{L}\p{N}\s'"!?.,:;()\-/+₪״׳]/gu, '');
