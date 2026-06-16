import { EventCard, EventTheme, TemplateKey } from '../types';
import { invitationDefaults } from '../invitation-templates';

export const applyInvitationTokens = (template: string, event: EventCard) =>
  template
    .replaceAll('{eventName}', event.eventName)
    .replaceAll('{venueName}', event.venueName);

export const getDefaultInvitationText = (theme: EventTheme, template: TemplateKey, event: EventCard) =>
  applyInvitationTokens(invitationDefaults[theme][template], event);
