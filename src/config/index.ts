export const uiConfig = {
  modal: {
    eventSize: 'lg',
  },
  form: {
    authWidth: 'min(100%, 460px)',
    searchWidth: 420,
    guestTableMinWidth: 760,
    ownerTableMinWidth: 860,
  },
  layout: {
    maxSettingsWidth: 760,
    maxWhatsappWidth: 820,
  },
  icons: {
    alert: 18,
    badge: 12,
    button: 16,
    compactStat: 15,
    cookie: 20,
    emptyState: 28,
    input: 16,
    nav: 18,
    smallButton: 14,
    stat: 16,
    thankYou: 30,
    theme: 18,
  },
} as const;

export const validationConfig = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneIL: /^(?:0\d{8,9}|\+972\d{8,9}|972\d{8,9})$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  inviteText: /^[\p{L}\p{N}\s'"!?.,:;()\-/+₪״׳]+$/u,
  name: /^[\p{L}\s'"-]{2,80}$/u,
  number: /^\d+$/,
  text: /^[\p{L}\p{N}\s'"!?.,:;()\-/+₪״׳]{2,160}$/u,
} as const;
