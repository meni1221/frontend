import { Badge, Box, Button, Card, Group, Image, Stack, Text, Title, rem } from '@mantine/core';
import { IconBrandWhatsapp, IconRefresh, IconWifiOff } from '@tabler/icons-react';
import { WhatsappSnapshot, WhatsappStatus } from '../../../../api';
import { uiConfig } from '../../../../config';

const statusColor: Record<WhatsappStatus, string> = {
  DISCONNECTED: 'red',
  QR_READY: 'yellow',
  CONNECTED: 'green',
};

type WhatsappConnectionCardProps = {
  error: string | null;
  labels: Record<string, string>;
  loading: boolean;
  snapshot: WhatsappSnapshot | null;
  status: WhatsappStatus;
  onAction: (action: 'connect' | 'refresh' | 'disconnect') => void;
};

export const WhatsappConnectionCard = ({
  error,
  labels,
  loading,
  onAction,
  snapshot,
  status,
}: WhatsappConnectionCardProps) => (
  <Card className="studioCard" withBorder radius="sm" p="xl">
    <Stack gap="lg">
      <Group justify="space-between">
        <Box>
          <Title order={2}>{labels.connectWhatsapp}</Title>
          <Text size="sm" c="dimmed">{labels.apiHint}</Text>
        </Box>
        <Badge
          size="lg"
          color={statusColor[status]}
          leftSection={status === 'CONNECTED' ? <IconBrandWhatsapp size={uiConfig.icons.badge} /> : <IconWifiOff size={uiConfig.icons.badge} />}
        >
          {status === 'CONNECTED' ? labels.connected : status === 'QR_READY' ? labels.qrReady : labels.disconnected}
        </Badge>
      </Group>

      <Group>
        <Button loading={loading} onClick={() => onAction('connect')} leftSection={<IconBrandWhatsapp size={uiConfig.icons.button} />}>
          {labels.connect}
        </Button>
        <Button loading={loading} variant="light" onClick={() => onAction('refresh')} leftSection={<IconRefresh size={uiConfig.icons.button} />}>
          {labels.refreshQr}
        </Button>
        <Button loading={loading} color="red" variant="subtle" onClick={() => onAction('disconnect')} leftSection={<IconWifiOff size={uiConfig.icons.button} />}>
          {labels.disconnect}
        </Button>
      </Group>

      {snapshot?.qrCode && (
        <Box className="qrBox">
          <Image src={snapshot.qrCode} alt="WhatsApp QR" w={rem(240)} h={rem(240)} fit="contain" />
          <Text size="sm" fw={600}>{labels.scanQr}</Text>
        </Box>
      )}

      {error && <Text c="red" size="sm">{error}</Text>}
    </Stack>
  </Card>
);
