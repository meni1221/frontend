import { WhatsappRecipient } from '../../../api';

export const normalizePhone = (phoneNumber: string) => phoneNumber.replace(/\D/g, '');

export const personalizeMessage = (message: string, recipient: WhatsappRecipient) =>
  message
    .replaceAll('{fullName}', recipient.fullName || '')
    .replaceAll('{inviteLink}', recipient.inviteLink || '');
