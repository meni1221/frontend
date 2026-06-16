import { EventTheme, InvitationDesignKey } from '../types';

export type InvitationDesign = {
  key: InvitationDesignKey;
  labelKey: string;
};

export const invitationDesigns: Record<EventTheme, InvitationDesign[]> = {
  brit: [
    { key: 'soft', labelKey: 'designSoft' },
    { key: 'minimal', labelKey: 'designMinimal' },
    { key: 'garden', labelKey: 'designGarden' },
  ],
  wedding: [
    { key: 'royal', labelKey: 'designRoyal' },
    { key: 'garden', labelKey: 'designGarden' },
    { key: 'minimal', labelKey: 'designMinimal' },
  ],
  bar_mitzvah: [
    { key: 'royal', labelKey: 'designRoyal' },
    { key: 'soft', labelKey: 'designSoft' },
    { key: 'minimal', labelKey: 'designMinimal' },
  ],
  birthday: [
    { key: 'garden', labelKey: 'designGarden' },
    { key: 'soft', labelKey: 'designSoft' },
    { key: 'minimal', labelKey: 'designMinimal' },
  ],
  corporate: [
    { key: 'minimal', labelKey: 'designMinimal' },
    { key: 'royal', labelKey: 'designRoyal' },
    { key: 'soft', labelKey: 'designSoft' },
  ],
};
