export type EventTheme = 'brit' | 'wedding' | 'bar_mitzvah' | 'birthday' | 'corporate';
export type EventSeatingMode = 'mixed' | 'separate';
export type TemplateKey = 'classic' | 'warm' | 'elegant' | 'casual';
export type InvitationDesignKey = 'soft' | 'royal' | 'garden' | 'minimal';
export type AppTab = 'events' | 'guests' | 'seating' | 'invitations' | 'guest' | 'whatsapp' | 'system_overview' | 'owner' | 'logs' | 'terms' | 'settings';
export type GuestLanguage = 'he' | 'en' | 'es';
export type GuestStatus = 'pending' | 'confirmed' | 'maybe' | 'declined' | 'reminded' | 'thanked';

export type EventCard = {
  id: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  address: string;
  wazeLink: string;
  guests: number;
  confirmed: number;
  pending: number;
  theme: EventTheme;
  seatingMode: EventSeatingMode;
  bitLink: string;
  adminPhoneNumber: string;
  isActive: boolean;
  invitationDesignKey: InvitationDesignKey;
};

export type SystemUser = {
  id: string;
  email: string;
  plan: 'trial' | 'pro' | 'agency';
  activeEvents: number;
  totalGuests: number;
  whatsappStatus: 'DISCONNECTED' | 'QR_READY' | 'CONNECTED';
  lastSeenAt: string;
};

export type GuestRecord = {
  id: string;
  eventId: string;
  inviteId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  language: GuestLanguage;
  status: GuestStatus;
  maxAllowed: number;
  menCount: number;
  womenCount: number;
  adults: number;
  children: number;
  notes?: string;
};

export type SeatingTable = {
  id: string;
  eventId: string;
  name: string;
  capacity: number;
  zone: string;
  guestIds: string[];
};
