import { Badge, Button, Card, Group, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';
import { SystemLogEntry, SystemLogQuery } from '../../api';
import { uiConfig } from '../../config';
import { useComponentLogger } from '../../utils/component-logger';
import { useSystemLogs } from './hooks/use-system-logs';

type LogsPanelProps = {
  labels: Record<string, string>;
};

const levelColors: Record<SystemLogEntry['level'], string> = {
  debug: 'gray',
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  fatal: 'dark',
};

const getLogRequestStatus = (log: SystemLogEntry) => {
  if (log.statusCode) {
    return String(log.statusCode);
  }

  if (log.level === 'error' || log.level === 'fatal') {
    return 'failed';
  }

  if (log.level === 'warn') {
    return 'warning';
  }

  return 'success';
};

const LogRequestDetails = ({ labels, log }: { labels: Record<string, string>; log: SystemLogEntry }) => {
  if (!log.path && !log.method && !log.statusCode) {
    return null;
  }

  return (
    <Stack gap={2} mt={4}>
      <Text size="xs" c="dimmed">{labels.requestType}: {log.method ?? '-'}</Text>
      <Text size="xs" c="dimmed">{labels.requestPath}: {log.path ?? '-'}</Text>
      <Text size="xs" c="dimmed">{labels.requestStatus}: {getLogRequestStatus(log)}</Text>
    </Stack>
  );
};

export const LogsPanel = ({ labels }: LogsPanelProps) => {
  useComponentLogger('LogsPanel');
  const { loading, logs, query, loadLogs, updateQuery } = useSystemLogs(labels);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Stack gap={2}>
          <Title order={2}>{labels.systemLogs}</Title>
          <Text size="sm" c="dimmed">{labels.systemLogsDescription}</Text>
        </Stack>
        <Button loading={loading} leftSection={<IconRefresh size={uiConfig.icons.button} />} onClick={loadLogs}>
          {labels.refreshLogs}
        </Button>
      </Group>

      <Card className="studioCard" withBorder radius="sm" p="lg">
        <Stack gap="md">
          <Group align="end">
            <Select
              clearable
              label={labels.logLevel}
              leftSection={<IconFilter size={uiConfig.icons.input} />}
              value={query.level ?? null}
              onChange={(value) => updateQuery('level', value as SystemLogQuery['level'] | null)}
              data={['debug', 'info', 'warn', 'error', 'fatal']}
            />
            <Select
              clearable
              label={labels.logSource}
              value={query.source ?? null}
              onChange={(value) => updateQuery('source', value as SystemLogQuery['source'] | null)}
              data={['backend', 'frontend']}
            />
            <TextInput
              label={labels.logCategory}
              value={query.category ?? ''}
              onChange={(event) => updateQuery('category', event.currentTarget.value)}
            />
            <TextInput
              label={labels.requestId}
              value={query.requestId ?? ''}
              onChange={(event) => updateQuery('requestId', event.currentTarget.value)}
            />
            <TextInput
              label={labels.search}
              leftSection={<IconSearch size={uiConfig.icons.input} />}
              value={query.search ?? ''}
              onChange={(event) => updateQuery('search', event.currentTarget.value)}
            />
            <Button variant="light" onClick={loadLogs}>
              {labels.applyFilters}
            </Button>
          </Group>

          <Table.ScrollContainer minWidth={1040}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{labels.status}</Table.Th>
                  <Table.Th>{labels.logSource}</Table.Th>
                  <Table.Th>{labels.logCategory}</Table.Th>
                  <Table.Th>{labels.message}</Table.Th>
                  <Table.Th>{labels.requestId}</Table.Th>
                  <Table.Th>{labels.lastSeen}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log) => (
                  <Table.Tr key={log._id}>
                    <Table.Td>
                      <Badge color={levelColors[log.level]} variant="light">{log.level}</Badge>
                    </Table.Td>
                    <Table.Td>{log.source}</Table.Td>
                    <Table.Td>{log.category}</Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2}>{log.message}</Text>
                      <LogRequestDetails labels={labels} log={log} />
                    </Table.Td>
                    <Table.Td>{log.requestId ?? '-'}</Table.Td>
                    <Table.Td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Stack>
      </Card>
    </Stack>
  );
};
