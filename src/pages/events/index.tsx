import { Badge, Box, Button, Card, Group, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { useState } from 'react';
import { IconCircleCheck, IconMapPin, IconPhone, IconPlus, IconRefresh, IconSearch, IconUsers } from '@tabler/icons-react';
import { BitLogo } from '../../components/bit-logo';
import { CreateEventModal } from '../../components/create-event-modal';
import { useFeedback } from '../../components/feedback';
import { StatCard } from '../../components/stat-card';
import { ThemeIconMap } from '../../components/theme-icons';
import { uiConfig } from '../../config';
import { EventCard } from '../../data';
import { Locale } from '../../i18n';
import { useComponentLogger } from '../../utils/component-logger';

type EventsPanelProps = {
  locale: Locale;
  labels: Record<string, string>;
  events: EventCard[];
  query: string;
  selectedEventId: string;
  onCreateEvent: (event: EventCard) => Promise<void> | void;
  onQueryChange: (value: string) => void;
  onSelectEvent: (eventId: string) => void;
};

export const EventsPanel = ({
  locale,
  labels,
  events,
  query,
  selectedEventId,
  onCreateEvent,
  onQueryChange,
  onSelectEvent,
}: EventsPanelProps) => {
  useComponentLogger('EventsPanel', { events: events.length, selectedEventId });
  const [opened, setOpened] = useState(false);
  const { showFeedback } = useFeedback();

  const createEvent = async (event: EventCard) => {
    await onCreateEvent(event);
    showFeedback({
      type: 'success',
      title: labels.eventCreated,
      message: labels.eventCreatedMessage,
    });
  };

  const selectEvent = (event: EventCard) => {
    onSelectEvent(event.id);
    showFeedback({
      type: 'info',
      title: labels.activeEvent,
      message: event.eventName,
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>{labels.events}</Title>
        <Button leftSection={<IconPlus size={uiConfig.icons.button} />} onClick={() => setOpened(true)}>
          {labels.createEvent}
        </Button>
      </Group>

      <TextInput
        leftSection={<IconSearch size={uiConfig.icons.input} />}
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        placeholder={labels.search}
        maw={420}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {events.map((event) => (
          <Card key={event.id} className={selectedEventId === event.id ? 'eventCard selected' : 'eventCard'} withBorder radius="sm" p="lg">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Group align="flex-start" gap="sm">
                  <ThemeIcon variant="light" color="ishruGreen" size="lg">
                    {ThemeIconMap[event.theme]}
                  </ThemeIcon>
                  <Box>
                    <Title order={4}>{event.eventName}</Title>
                    <Text size="sm" c="dimmed">{event.venueName}</Text>
                    <Text size="xs" c="dimmed">{event.address}</Text>
                  </Box>
                </Group>
                <Badge variant="light">{new Date(event.eventDate).toLocaleDateString(locale)}</Badge>
              </Group>
              {event.seatingMode === 'separate' && <Badge color="grape" variant="light">{labels.separateSeatingEvent}</Badge>}

              <SimpleGrid cols={3} spacing="xs">
                <StatCard icon={<IconUsers size={uiConfig.icons.stat} />} label={labels.guests} value={event.guests} />
                <StatCard icon={<IconCircleCheck size={uiConfig.icons.stat} />} label={labels.confirmed} value={event.confirmed} />
                <StatCard icon={<IconRefresh size={uiConfig.icons.stat} />} label={labels.pending} value={event.pending} />
              </SimpleGrid>

              <Group gap="xs">
                <Badge variant="outline" leftSection={<IconPhone size={uiConfig.icons.badge} />}>{event.adminPhoneNumber}</Badge>
                <Badge variant="outline" leftSection={<IconMapPin size={uiConfig.icons.badge} />}>{labels.address}</Badge>
                <Badge variant="outline" leftSection={<BitLogo />}>Bit</Badge>
              </Group>

              <Button variant={selectedEventId === event.id ? 'filled' : 'light'} onClick={() => selectEvent(event)}>
                {labels.chooseEvent}
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {events.length === 0 && <Text c="dimmed">{labels.noEvents}</Text>}

      <CreateEventModal
        labels={labels}
        opened={opened}
        onClose={() => setOpened(false)}
        onCreate={createEvent}
      />
    </Stack>
  );
};
