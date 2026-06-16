import { Stack, Text, ThemeIcon } from '@mantine/core';
import { ReactNode } from 'react';

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: number;
  variant?: 'compact' | 'regular';
};

export const StatCard = ({ icon, label, value, variant = 'regular' }: StatCardProps) => (
  <Stack className={variant === 'compact' ? 'statCard compact' : 'statCard'} gap={4} align="center">
    <ThemeIcon variant="light" color="ishruGreen" size={variant === 'compact' ? 'md' : 'lg'}>
      {icon}
    </ThemeIcon>
    <Text fw={800}>{value}</Text>
    <Text size="xs" c="dimmed">{label}</Text>
  </Stack>
);
