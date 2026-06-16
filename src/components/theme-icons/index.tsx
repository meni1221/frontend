import { ReactNode } from 'react';
import { IconBriefcase, IconGift, IconHeart, IconStar, IconSun } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { EventTheme } from '../../data';

export const ThemeIconMap: Record<EventTheme, ReactNode> = {
  brit: <IconSun size={uiConfig.icons.theme} />,
  wedding: <IconHeart size={uiConfig.icons.theme} />,
  bar_mitzvah: <IconStar size={uiConfig.icons.theme} />,
  birthday: <IconGift size={uiConfig.icons.theme} />,
  corporate: <IconBriefcase size={uiConfig.icons.theme} />,
};
