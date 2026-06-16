import { Card, Text } from '@mantine/core';

type GuestSummaryProps = {
  label: string;
  value: number;
};

export const GuestSummary = ({ label, value }: GuestSummaryProps) => (
  <Card className="studioCard" withBorder radius="sm" p="md">
    <Text size="sm" c="dimmed">{label}</Text>
    <Text fw={900} size="xl">{value}</Text>
  </Card>
);
