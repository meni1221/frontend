import { Button, Card, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { uiConfig } from '../../../../config';
import { ReminderAudience } from '../../helpers';

type ReminderModalProps = {
  audience: ReminderAudience;
  isOpen: boolean;
  labels: Record<string, string>;
  loading: boolean;
  message: string;
  plan: string;
  recipientsCount: number;
  onAudienceChange: (value: ReminderAudience) => void;
  onClose: () => void;
  onSend: () => void;
};

export const ReminderModal = ({
  audience,
  isOpen,
  labels,
  loading,
  message,
  plan,
  recipientsCount,
  onAudienceChange,
  onClose,
  onSend,
}: ReminderModalProps) => (
  <Modal opened={isOpen} onClose={onClose} title={labels.sendReminder} centered>
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {labels.reminderDescription}
      </Text>
      <Select
        label={labels.reminderAudience}
        value={audience}
        onChange={(value) => onAudienceChange((value as ReminderAudience | null) ?? 'awaiting')}
        data={[
          { value: 'awaiting', label: labels.reminderAudienceAwaiting },
          { value: 'confirmed', label: labels.reminderAudienceConfirmed },
          { value: 'all', label: labels.reminderAudienceAll },
        ]}
      />
      <Card withBorder radius="sm" p="md">
        <Text fw={900}>{labels.recommendedReminderPlan}</Text>
        <Text size="sm" c="dimmed">{plan}</Text>
      </Card>
      <Card withBorder radius="sm" p="md">
        <Text fw={900}>{recipientsCount}</Text>
        <Text size="sm" c="dimmed">{labels.reminderRecipients}</Text>
      </Card>
      <Text size="sm">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>{labels.cancel}</Button>
        <Button
          leftSection={<IconSend size={uiConfig.icons.button} />}
          loading={loading}
          disabled={recipientsCount === 0}
          onClick={onSend}
        >
          {labels.queueMessages}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
