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

export const getContactKey = (contact: WhatsappRecipient) =>
  contact.phoneNumber ? `phone:${normalizePhone(contact.phoneNumber)}` : `email:${contact.email ?? ''}`;

export const filterContacts = (
  contacts: WhatsappRecipient[],
  queryValue: string,
  fallbackName: string,
) => {
  const query = queryValue.trim().toLowerCase();
  const phoneQuery = normalizePhone(queryValue);

  if (!query) {
    return contacts;
  }

  return contacts.filter((contact) =>
    (contact.fullName ?? fallbackName).toLowerCase().includes(query) ||
    contact.phoneNumber.toLowerCase().includes(query) ||
    (contact.email ?? '').toLowerCase().includes(query) ||
    Boolean(phoneQuery && normalizePhone(contact.phoneNumber).includes(phoneQuery)),
  );
};
