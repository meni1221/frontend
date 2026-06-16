import { EventCard } from '../types';

export const sampleEvents: EventCard[] = [
  {
    id: 'evt_1',
    eventName: 'ברית לאריאל',
    eventDate: '2026-07-12',
    venueName: 'אולם האורנים',
    address: 'אולם האורנים, הרצליה',
    wazeLink: 'https://waze.com/ul?q=%D7%90%D7%95%D7%9C%D7%9D%20%D7%94%D7%90%D7%95%D7%A8%D7%A0%D7%99%D7%9D%20%D7%94%D7%A8%D7%A6%D7%9C%D7%99%D7%94',
    guests: 2,
    confirmed: 1,
    pending: 1,
    theme: 'brit',
    seatingMode: 'mixed',
    bitLink: 'https://www.bitpay.co.il/app/share-info?i=example-brit',
    adminPhoneNumber: '050-000-0001',
    isActive: true,
    invitationDesignKey: 'soft',
  },
];
