import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { uiConfig } from '../../../config';

type GoogleConnectionStatusProps = {
  connected: boolean;
  labels: Record<string, string>;
  loading: boolean;
  selectedCount: number;
  onConnect: () => void;
};

export const GoogleConnectionStatus = ({
  connected,
  labels,
  loading,
  selectedCount,
  onConnect,
}: GoogleConnectionStatusProps) => (
  <Stack gap="md">
    <Stack gap={4}>
      <Title order={3}>{labels.sendInvitations}</Title>
      <Text size="sm" c="dimmed">{labels.googleContactsDescription}</Text>
    </Stack>

    <Group>
      <Button
        variant={connected ? 'filled' : 'light'}
        loading={loading}
        leftSection={<IconBrandGoogle size={uiConfig.icons.button} />}
        onClick={onConnect}
      >
        {connected ? labels.googleConnected : labels.connectGoogle}
      </Button>
      <Badge variant="light">{selectedCount} {labels.selectedContacts}</Badge>
    </Group>
  </Stack>
);
