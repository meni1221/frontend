import { Badge, Box, Button, Card, Group, Select, SimpleGrid, Stack, Text, Textarea, TextInput, ThemeIcon, Title } from '@mantine/core';
import { IconCalendar, IconDeviceFloppy, IconEdit, IconPhone } from '@tabler/icons-react';
import { BitLogo } from '../../components/bit-logo';
import { useFeedback } from '../../components/feedback';
import { ThemeIconMap } from '../../components/theme-icons';
import { uiConfig } from '../../config';
import { EventCard, eventThemes, EventTheme, TemplateKey } from '../../data';
import { Locale } from '../../i18n';
import { useComponentLogger } from '../../utils/component-logger';

type InvitationPanelProps = {
  events: EventCard[];
  locale: Locale;
  labels: Record<string, string>;
  selectedEvent: EventCard | undefined;
  selectedEventId: string;
  selectedTheme: EventTheme;
  selectedTemplate: TemplateKey;
  invitationTitle: string;
  invitationText: string;
  onSaveDraft: () => Promise<void> | void;
  onSelectEvent: (eventId: string) => void;
  onSelectTheme: (theme: EventTheme) => void;
  onSelectTemplate: (template: TemplateKey) => void;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
};

export const InvitationPanel = ({
  events,
  locale,
  labels,
  selectedEvent,
  selectedEventId,
  selectedTheme,
  selectedTemplate,
  invitationTitle,
  invitationText,
  onSaveDraft,
  onSelectEvent,
  onSelectTheme,
  onSelectTemplate,
  onTitleChange,
  onTextChange,
}: InvitationPanelProps) => {
  useComponentLogger('InvitationPanel', { selectedEventId, selectedTheme, selectedTemplate });
  const { showFeedback } = useFeedback();

  const saveDraft = async () => {
    try {
      await onSaveDraft();
      showFeedback({
        type: 'success',
        title: labels.draftSaved,
        message: labels.draftSavedMessage,
      });
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: cause instanceof Error ? cause.message : labels.genericError,
      });
    }
  };

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
    <Card className="studioCard" withBorder radius="sm" p="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Title order={2}>{labels.invitationStudio}</Title>
            <Text size="sm" c="dimmed">{selectedEvent?.eventName}</Text>
          </Box>
          <Badge variant="light" leftSection={ThemeIconMap[selectedTheme]}>{labels[selectedTheme]}</Badge>
        </Group>

        <Select
          label={labels.selectedEvent}
          value={selectedEventId}
          onChange={(value) => value && onSelectEvent(value)}
          data={events.map((event) => ({ value: event.id, label: event.eventName }))}
          disabled={!events.length}
        />

        <Box>
          <Text fw={600} mb="xs">{labels.eventTheme}</Text>
          <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="xs">
            {eventThemes.map((theme) => (
              <Button
                key={theme}
                variant={selectedTheme === theme ? 'filled' : 'light'}
                leftSection={ThemeIconMap[theme]}
                onClick={() => onSelectTheme(theme)}
              >
                {labels[theme]}
              </Button>
            ))}
          </SimpleGrid>
        </Box>

        <Select
          label={labels.template}
          value={selectedTemplate}
          onChange={(value) => value && onSelectTemplate(value as TemplateKey)}
          data={[
            { value: 'classic', label: labels.classic },
            { value: 'warm', label: labels.warm },
            { value: 'elegant', label: labels.elegant },
            { value: 'casual', label: labels.casual },
          ]}
        />

        <TextInput
          label={labels.invitationTitle}
          value={invitationTitle}
          onChange={(event) => onTitleChange(event.currentTarget.value)}
          leftSection={<IconEdit size={uiConfig.icons.input} />}
          required
        />

        <Textarea
          label={labels.invitationText}
          value={invitationText}
          onChange={(event) => onTextChange(event.currentTarget.value)}
          minRows={7}
          autosize
          required
        />

        <Button leftSection={<IconDeviceFloppy size={uiConfig.icons.button} />} onClick={saveDraft}>
          {labels.saveDraft}
        </Button>
      </Stack>
    </Card>

    <Card withBorder radius="sm" p="xl" className="invitationPreview">
      <Stack gap="lg">
        <Group gap="sm">
          <ThemeIcon size="xl" radius="xl" variant="light" color="ishruGreen">
            {ThemeIconMap[selectedTheme]}
          </ThemeIcon>
          <Box>
            <Text size="sm" c="dimmed">{labels.preview}</Text>
            <Title order={3}>{invitationTitle}</Title>
          </Box>
        </Group>

        <Text className="invitationMessage">{invitationText}</Text>
        <Group gap="xs">
          <Badge variant="outline" leftSection={<IconCalendar size={uiConfig.icons.badge} />}>
            {selectedEvent ? new Date(selectedEvent.eventDate).toLocaleDateString(locale) : ''}
          </Badge>
          <Badge variant="outline">{selectedEvent?.venueName}</Badge>
          <Badge variant="outline">{selectedEvent?.address}</Badge>
          <Badge variant="outline" leftSection={<IconPhone size={uiConfig.icons.badge} />}>{selectedEvent?.adminPhoneNumber}</Badge>
          <Badge variant="outline" leftSection={<BitLogo />}>{labels.bitLink}</Badge>
        </Group>
      </Stack>
    </Card>
    </SimpleGrid>
  );
};
