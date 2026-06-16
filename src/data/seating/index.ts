import { SeatingTable } from '../types';

export const sampleSeatingTables: SeatingTable[] = [
  {
    id: 'table_1',
    eventId: 'evt_1',
    name: 'שולחן משפחה',
    capacity: 10,
    zone: 'קרוב לבמה',
    guestIds: ['guest_1'],
  },
  {
    id: 'table_2',
    eventId: 'evt_1',
    name: 'חברים',
    capacity: 12,
    zone: 'מרכז האולם',
    guestIds: [],
  },
];
