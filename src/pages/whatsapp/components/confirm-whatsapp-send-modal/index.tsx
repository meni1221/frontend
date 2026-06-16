import { Button, Card, Group, Modal, Stack, Text } from '@mantine/core';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { WhatsappRecipient } from '../../../../api';
import { uiConfig } from '../../../../config';

type PendingWhatsappBatch = {
  recipients: WhatsappRecipient[];
  message: string;
};

type ConfirmWhatsappSendModalProps = {
  isOpen: boolean;
  labels: Record<string, string>;
  loading: boolean;
  missingInviteLinksCount: number;
  pendingBatch: PendingWhatsappBatch | null;
  previewMessage: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmWhatsappSendModal = ({
  isOpen,
  labels,
  loading,
  missingInviteLinksCount,
  pendingBatch,
  previewMessage,
  onClose,
  onConfirm,
}: ConfirmWhatsappSendModalProps) => (
  <Modal
    opened={isOpen}
    onClose={onClose}
    title={labels.confirmWhatsappSendTitle}
    centered
  >
    <Stack gap="md">
      <Text size="sm">
        {labels.confirmWhatsappSendDescription.replace('{count}', String(pendingBatch?.recipients.length ?? 0))}
      </Text>
      {missingInviteLinksCount > 0 && (
        <Text size="sm" c="orange">
          {labels.missingInviteLinksWarning.replace('{count}', String(missingInviteLinksCount))}
        </Text>
      )}
      {previewMessage && (
        <Card withBorder radius="sm" p="md">
          <Text size="xs" c="dimmed" mb={6}>{labels.messagePreview}</Text>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{previewMessage}</Text>
        </Card>
      )}
      <Group justify="flex-end">
        <Button variant="subtle" onClick={onClose}>{labels.cancel}</Button>
        <Button loading={loading} leftSection={<IconBrandWhatsapp size={uiConfig.icons.button} />} onClick={onConfirm}>
          {labels.confirmWhatsappSend}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
