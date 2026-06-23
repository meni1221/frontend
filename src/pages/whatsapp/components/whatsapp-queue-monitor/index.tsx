import { Badge, Box, Button, Card, Group, Progress, Stack, Table, Text, Title } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop, IconRepeat } from '@tabler/icons-react';
import { WhatsappBatchHistoryEntry, WhatsappQueueSnapshot } from '../../../../api';
import { uiConfig } from '../../../../config';

const queueStatusColor: Record<WhatsappQueueSnapshot['status'], string> = {
  IDLE: 'gray',
  RUNNING: 'blue',
  PAUSED: 'yellow',
  STOPPING: 'yellow',
  DONE: 'green',
  FAILED: 'red',
  CANCELLED: 'orange',
};

const queueItemStatusColor: Record<WhatsappQueueSnapshot['items'][number]['status'], string> = {
  QUEUED: 'gray',
  SENDING: 'blue',
  SENT: 'green',
  FAILED: 'red',
  SKIPPED: 'orange',
};

type WhatsappQueueMonitorProps = {
  estimatedSecondsLeft: number;
  history: WhatsappBatchHistoryEntry[];
  labels: Record<string, string>;
  loading: boolean;
  progressValue: number;
  queueSnapshot: WhatsappQueueSnapshot;
  t: (key: string, fallback: string) => string;
  onPause: () => void;
  onResume: () => void;
  onRetryFailed: () => void;
  onStop: () => void;
};

const queueStatusLabelKey: Record<WhatsappQueueSnapshot['status'], string> = {
  IDLE: 'queueStatusIdle',
  RUNNING: 'queueStatusRunning',
  PAUSED: 'queueStatusPaused',
  STOPPING: 'queueStatusStopping',
  DONE: 'queueStatusDone',
  FAILED: 'queueStatusFailed',
  CANCELLED: 'queueStatusCancelled',
};

const queueItemStatusLabelKey: Record<WhatsappQueueSnapshot['items'][number]['status'], string> = {
  QUEUED: 'queueItemQueued',
  SENDING: 'queueItemSending',
  SENT: 'queueItemSent',
  FAILED: 'queueItemFailed',
  SKIPPED: 'queueItemSkipped',
};

export const WhatsappQueueMonitor = ({
  estimatedSecondsLeft,
  history,
  labels,
  loading,
  onPause,
  onResume,
  onRetryFailed,
  onStop,
  progressValue,
  queueSnapshot,
  t,
}: WhatsappQueueMonitorProps) => (
  <Card className="studioCard" withBorder radius="sm" p="xl">
    <Stack gap="md">
      <Group justify="space-between">
        <Box>
          <Title order={3}>{t('whatsappQueueMonitor', 'Send monitor')}</Title>
          <Text size="sm" c="dimmed">{t('whatsappQueueMonitorDescription', 'Live status for every recipient, including failed sends and retries.')}</Text>
        </Box>
        <Badge color={queueStatusColor[queueSnapshot.status]}>{t(queueStatusLabelKey[queueSnapshot.status], queueSnapshot.status)}</Badge>
      </Group>

      <Progress value={progressValue} color={queueStatusColor[queueSnapshot.status]} />
      <Group gap="xs">
        <Badge variant="light" color="green">{t('sent', 'Sent')}: {queueSnapshot.progress.sent}</Badge>
        <Badge variant="light" color="red">{t('failed', 'Failed')}: {queueSnapshot.progress.failed}</Badge>
        <Badge variant="light" color="gray">{t('queued', 'Queued')}: {queueSnapshot.progress.queued}</Badge>
        <Badge variant="light" color="orange">{t('skipped', 'Skipped')}: {queueSnapshot.progress.skipped}</Badge>
      </Group>
      {(queueSnapshot.nextRecipient || estimatedSecondsLeft > 0) && (
        <Text size="sm" c="dimmed">
          {queueSnapshot.nextRecipient ? `${t('nextRecipient', 'Next')}: ${queueSnapshot.nextRecipient}. ` : ''}
          {estimatedSecondsLeft > 0 ? `${t('estimatedTimeLeft', 'Estimated time left')}: ${Math.ceil(estimatedSecondsLeft / 60)} ${t('minutes', 'min')}` : ''}
        </Text>
      )}

      <Group>
        <Button
          variant="light"
          disabled={queueSnapshot.status !== 'RUNNING'}
          loading={loading}
          leftSection={<IconPlayerPause size={uiConfig.icons.button} />}
          onClick={onPause}
        >
          {t('pauseSending', 'Pause sending')}
        </Button>
        <Button
          variant="light"
          disabled={queueSnapshot.status !== 'PAUSED'}
          loading={loading}
          leftSection={<IconPlayerPlay size={uiConfig.icons.button} />}
          onClick={onResume}
        >
          {t('resumeSending', 'Resume sending')}
        </Button>
        <Button
          color="red"
          variant="light"
          disabled={queueSnapshot.status !== 'RUNNING' && queueSnapshot.status !== 'PAUSED'}
          loading={loading}
          leftSection={<IconPlayerStop size={uiConfig.icons.button} />}
          onClick={onStop}
        >
          {t('stopSending', 'Stop sending')}
        </Button>
        <Button
          variant="light"
          disabled={!queueSnapshot.progress.failed}
          loading={loading}
          leftSection={<IconRepeat size={uiConfig.icons.button} />}
          onClick={onRetryFailed}
        >
          {t('retryFailedOnly', 'Retry failed only')}
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={700}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{labels.guest}</Table.Th>
              <Table.Th>{labels.status}</Table.Th>
              <Table.Th>{labels.phoneNumber}</Table.Th>
              <Table.Th>{t('reason', 'Reason')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {queueSnapshot.items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.fullName ?? '-'}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color={queueItemStatusColor[item.status]}>
                    {t(queueItemStatusLabelKey[item.status], item.status)}
                  </Badge>
                </Table.Td>
                <Table.Td dir="ltr">{item.phoneNumber}</Table.Td>
                <Table.Td>{item.reason ?? '-'}</Table.Td>
              </Table.Tr>
            ))}
            {queueSnapshot.items.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed" size="sm">{t('noQueueYet', 'There is no active send queue.')}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {history.length > 0 && (
        <Stack gap="xs">
          <Text fw={900}>{t('sendHistory', 'Send history')}</Text>
          {history.slice(0, 5).map((entry) => (
            <Group key={entry.batchId} justify="space-between">
              <Text size="sm" c="dimmed">{new Date(entry.createdAt).toLocaleString()}</Text>
              <Group gap="xs">
                <Badge variant="light" color="green">{entry.sent}</Badge>
                <Badge variant="light" color="red">{entry.failed}</Badge>
                <Badge variant="light" color="gray">{entry.total}</Badge>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  </Card>
);
