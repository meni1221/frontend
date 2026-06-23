import { Badge, Box, Button, Card, Checkbox, Group, Select, Stack, Table, Text, Textarea, Title } from '@mantine/core';
import { IconBrandWhatsapp, IconSend } from '@tabler/icons-react';
import { uiConfig } from '../../../../config';
import { GuestRecord, GuestStatus } from '../../../../data';

type GuestFilter = 'all' | 'pending' | 'maybe' | 'confirmed';

type MessageTemplate = {
  key: string;
  label: string;
  message: string;
};

type EventWhatsappSenderProps = {
  allowResend: boolean;
  guestFilter: GuestFilter;
  guestMessage: string;
  guests: GuestRecord[];
  labels: Record<string, string>;
  queueActionLoading: boolean;
  selectedGuestIds: string[];
  templates: MessageTemplate[];
  t: (key: string, fallback: string) => string;
  onAllowResendChange: (value: boolean) => void;
  onGuestFilterChange: (value: GuestFilter) => void;
  onGuestMessageChange: (value: string) => void;
  onQueueSelectedGuests: () => void;
  onSendTestMessage: () => void;
  onTemplateSelect: (message: string) => void;
  onToggleGuest: (guestId: string, checked: boolean) => void;
};

export const EventWhatsappSender = ({
  allowResend,
  guestFilter,
  guestMessage,
  guests,
  labels,
  onAllowResendChange,
  onGuestFilterChange,
  onGuestMessageChange,
  onQueueSelectedGuests,
  onSendTestMessage,
  onTemplateSelect,
  onToggleGuest,
  queueActionLoading,
  selectedGuestIds,
  t,
  templates,
}: EventWhatsappSenderProps) => (
  <Card className="studioCard" withBorder radius="sm" p="xl">
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={3}>{t('eventWhatsappSender', 'Send to event guests')}</Title>
          <Text size="sm" c="dimmed">{t('eventWhatsappSenderDescription', 'Choose guests, send yourself a test, then queue the messages.')}</Text>
        </Box>
      </Group>

      <Group align="end">
        <Select
          label={t('recipientFilter', 'Recipient filter')}
          value={guestFilter}
          data={[
            { value: 'pending', label: t('pendingGuests', 'Pending') },
            { value: 'maybe', label: t('maybeGuests', 'Maybe') },
            { value: 'confirmed', label: labels.confirmed },
            { value: 'all', label: t('allGuests', 'All') },
          ]}
          onChange={(value) => onGuestFilterChange((value as GuestFilter) ?? 'pending')}
        />
        <Checkbox
          checked={allowResend}
          label={t('allowResend', 'Allow resend to guests who already received a message')}
          onChange={(event) => onAllowResendChange(event.currentTarget.checked)}
        />
      </Group>

      <Group>
        {templates.map((template) => (
          <Button key={template.key} size="xs" variant="light" onClick={() => onTemplateSelect(template.message)}>
            {template.label}
          </Button>
        ))}
      </Group>

      <Textarea
        label={labels.messageToSend}
        minRows={4}
        value={guestMessage}
        onChange={(event) => onGuestMessageChange(event.currentTarget.value)}
      />

      <Table.ScrollContainer minWidth={640}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{labels.choose}</Table.Th>
              <Table.Th>{labels.guest}</Table.Th>
              <Table.Th>{labels.status}</Table.Th>
              <Table.Th>{labels.phoneNumber}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {guests.map((guest) => (
              <Table.Tr key={guest.id}>
                <Table.Td>
                  <Checkbox
                    checked={selectedGuestIds.includes(guest.id)}
                    onChange={(event) => onToggleGuest(guest.id, event.currentTarget.checked)}
                  />
                </Table.Td>
                <Table.Td>{guest.fullName}</Table.Td>
                <Table.Td><Badge variant="light">{labels[guest.status as GuestStatus] ?? guest.status}</Badge></Table.Td>
                <Table.Td dir="ltr">{guest.phoneNumber}</Table.Td>
              </Table.Tr>
            ))}
            {guests.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed" size="sm">{t('noRecipientsForFilter', 'No guests match this filter.')}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group>
        <Button
          disabled={!selectedGuestIds.length || !guestMessage.trim()}
          leftSection={<IconSend size={uiConfig.icons.button} />}
          onClick={onQueueSelectedGuests}
        >
          {t('queueSelectedGuests', 'Queue selected')} ({selectedGuestIds.length})
        </Button>
        <Button
          variant="light"
          loading={queueActionLoading}
          leftSection={<IconBrandWhatsapp size={uiConfig.icons.button} />}
          onClick={onSendTestMessage}
        >
          {t('sendTestToMyself', 'Send test to myself')}
        </Button>
      </Group>
    </Stack>
  </Card>
);
