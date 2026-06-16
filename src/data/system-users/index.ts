import { SystemUser } from '../types';

export const sampleSystemUsers: SystemUser[] = [
  {
    id: 'host_1',
    email: 'demo@ishru.local',
    plan: 'pro',
    activeEvents: 2,
    totalGuests: 602,
    whatsappStatus: 'CONNECTED',
    lastSeenAt: '2026-06-14T03:40:00.000Z',
  },
  {
    id: 'host_2',
    email: 'events@example.com',
    plan: 'trial',
    activeEvents: 1,
    totalGuests: 120,
    whatsappStatus: 'DISCONNECTED',
    lastSeenAt: '2026-06-13T19:12:00.000Z',
  },
];
