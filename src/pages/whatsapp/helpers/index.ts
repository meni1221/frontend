import { WhatsappRecipient } from '../../../api';

export const normalizePhone = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.startsWith('00972')) {
    const localDigits = digits.slice(5);
    return localDigits.startsWith('0') ? localDigits : `0${localDigits}`;
  }

  if (digits.startsWith('972')) {
    const localDigits = digits.slice(3);
    return localDigits.startsWith('0') ? localDigits : `0${localDigits}`;
  }

  if (digits.length === 9 && digits.startsWith('5')) {
    return `0${digits}`;
  }

  return digits;
};

export const personalizeMessage = (message: string, recipient: WhatsappRecipient) =>
  message
    .replaceAll('{fullName}', recipient.fullName || '')
    .replaceAll('{inviteLink}', recipient.inviteLink || '');
