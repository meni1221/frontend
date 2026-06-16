import { WhatsappRecipient } from '../../../api';

export const normalizePhone = (phoneNumber: string) => phoneNumber.replace(/\D/g, '');

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
