import { GuestRecord } from '../../data';

export const buildGuestInvitePath = (guest: Pick<GuestRecord, 'eventId' | 'inviteId'>) =>
  `/invite/${guest.eventId}/${guest.inviteId}`;

export const buildGuestInviteLink = (guest: Pick<GuestRecord, 'eventId' | 'inviteId'>) =>
  `${window.location.origin}${buildGuestInvitePath(guest)}`;
