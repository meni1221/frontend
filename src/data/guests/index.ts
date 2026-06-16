import { GuestRecord } from '../types';

export const sampleGuests: GuestRecord[] = [
  {
    id: 'guest_1',
    eventId: 'evt_1',
    inviteId: 'inv_dana_001',
    fullName: 'דנה כהן',
    phoneNumber: '050-111-2222',
    language: 'he',
    status: 'confirmed',
    maxAllowed: 4,
    menCount: 1,
    womenCount: 1,
    adults: 2,
    children: 1,
    notes: 'צריכים כיסא תינוק',
  },
  {
    id: 'guest_2',
    eventId: 'evt_1',
    inviteId: 'inv_ori_002',
    fullName: 'אורי לוי',
    phoneNumber: '052-333-4444',
    language: 'he',
    status: 'pending',
    maxAllowed: 2,
    menCount: 0,
    womenCount: 0,
    adults: 0,
    children: 0,
  },
];
