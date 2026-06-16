import { Badge, Button, Card, Group, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconBrandWhatsapp, IconEdit, IconEye, IconMapPin, IconSettings, IconUsers } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { AppTab, EventCard } from '../../data';
import { useComponentLogger } from '../../utils/component-logger';
import { StatCard } from '../stat-card';

type ActiveEventBarProps = {
  event: EventCard | undefined;
  labels: Record<string, string>;
  onNavigate: (tab: AppTab) => void;
};

export const ActiveEventBar = ({ event, labels, onNavigate }: ActiveEventBarProps) => {
  useComponentLogger('ActiveEventBar', { eventId: event?.id });

  if (!event) {
    return null;
  }

  const rsvpPercent = Math.round((event.confirmed / Math.max(event.guests, 1)) * 100);

  return (
    <Card className="activeEventBar" withBorder radius="sm" p="lg">
      <Group justify="space-between" align="flex-start" gap="lg">
        <Stack gap={6} className="activeEventInfo">
          <Group gap="xs">
            <Badge variant="light">{labels.activeEvent}</Badge>
            <Badge variant="outline">{new Date(event.eventDate).toLocaleDateString()}</Badge>
          </Group>

          <Title order={2}>{event.eventName}</Title>

          <Group gap="xs" c="dimmed">
            <IconMapPin size={uiConfig.icons.input} />
            <Text size="sm">{event.venueName} · {event.address}</Text>
          </Group>
        </Stack>

        <SimpleGrid className="activeEventStats" cols={3} spacing="xs">
          <StatCard icon={<IconUsers size={uiConfig.icons.compactStat} />} label={labels.guests} value={event.guests} variant="compact" />
          <StatCard icon={<IconUsers size={uiConfig.icons.compactStat} />} label={labels.confirmed} value={event.confirmed} variant="compact" />
          <StatCard icon={<IconUsers size={uiConfig.icons.compactStat} />} label={labels.pending} value={event.pending} variant="compact" />
        </SimpleGrid>
      </Group>

      <Stack gap="xs" mt="md">
        <Group justify="space-between">
          <Text size="sm" fw={700}>{labels.rsvpProgress}</Text>
          <Text size="sm" fw={700}>{rsvpPercent}%</Text>
        </Group>
        <Progress value={rsvpPercent} size="md" radius="xl" color="ishruGreen" />
      </Stack>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" mt="md">
        <Button variant="light" leftSection={<IconEdit size={uiConfig.icons.button} />} onClick={() => onNavigate('invitations')}>
          {labels.editInvitation}
        </Button>
        <Button variant="light" leftSection={<IconEye size={uiConfig.icons.button} />} onClick={() => onNavigate('guest')}>
          {labels.previewGuest}
        </Button>
        <Button variant="light" leftSection={<IconSettings size={uiConfig.icons.button} />} onClick={() => onNavigate('settings')}>
          {labels.setupEvent}
        </Button>
        <Button variant="light" leftSection={<IconBrandWhatsapp size={uiConfig.icons.button} />} onClick={() => onNavigate('whatsapp')}>
          {labels.openWhatsapp}
        </Button>
      </SimpleGrid>
    </Card>
  );
};
