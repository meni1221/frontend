import { Badge, Card, Group, Progress, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { ReactNode } from 'react';
import { IconBrandWhatsapp, IconCalendarStats, IconClockCheck, IconUsers } from '@tabler/icons-react';
import { getOwnerOverview, OwnerEvent, OwnerUser } from '../../api';
import { useFeedback } from '../../components/feedback';
import { uiConfig } from '../../config';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { appLogger } from '../../utils/logger';

type SystemOverviewPanelProps = {
  labels: Record<string, string>;
};

export const SystemOverviewPanel = ({ labels }: SystemOverviewPanelProps) => {
  useComponentLogger('SystemOverviewPanel');
  const [users, setUsers] = useState<OwnerUser[]>([]);
  const [events, setEvents] = useState<OwnerEvent[]>([]);
  const { showFeedback } = useFeedback();

  const loadOverview = async () => {
    try {
      const overview = await getOwnerOverview();
      setUsers(overview.users);
      setEvents(overview.events);
      appLogger.info('system_overview.loaded', 'Owner system overview loaded', {
        events: overview.events.length,
        users: overview.users.length,
      });
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const metrics = useMemo(() => {
    const approvedUsers = users.filter((user) => user.accountStatus === 'APPROVED').length;
    const pendingUsers = users.filter((user) => user.accountStatus === 'PENDING_APPROVAL').length;
    const connectedWhatsapp = users.filter((user) => user.whatsappStatus === 'CONNECTED').length;
    const totalGuests = events.reduce((sum, event) => sum + event.totalGuests, 0);
    const approvalRate = users.length ? Math.round((approvedUsers / users.length) * 100) : 0;
    const whatsappRate = users.length ? Math.round((connectedWhatsapp / users.length) * 100) : 0;

    return {
      approvalRate,
      approvedUsers,
      connectedWhatsapp,
      pendingUsers,
      totalEvents: events.length,
      totalGuests,
      totalUsers: users.length,
      whatsappRate,
    };
  }, [events, users]);

  const recentEvents = events.slice(0, 8);

  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Title order={2}>{labels.systemOverview}</Title>
        <Text size="sm" c="dimmed">{labels.systemOverviewDescription}</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <OverviewMetric icon={<IconUsers size={uiConfig.icons.stat} />} label={labels.systemUsers} value={metrics.totalUsers} />
        <OverviewMetric icon={<IconClockCheck size={uiConfig.icons.stat} />} label={labels.pendingApproval} value={metrics.pendingUsers} tone="yellow" />
        <OverviewMetric icon={<IconCalendarStats size={uiConfig.icons.stat} />} label={labels.activeEvents} value={metrics.totalEvents} />
        <OverviewMetric icon={<IconBrandWhatsapp size={uiConfig.icons.stat} />} label={labels.connectedWhatsapp} value={metrics.connectedWhatsapp} tone="green" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card className="studioCard" withBorder radius="sm" p="lg">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={900}>{labels.approvedUsersRate}</Text>
              <Badge variant="light">{metrics.approvalRate}%</Badge>
            </Group>
            <Progress value={metrics.approvalRate} color="ishruGreen" radius="xl" />
            <Text size="sm" c="dimmed">
              {metrics.approvedUsers}/{metrics.totalUsers} {labels.approvedUsers}
            </Text>
          </Stack>
        </Card>

        <Card className="studioCard" withBorder radius="sm" p="lg">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={900}>{labels.whatsappConnectionRate}</Text>
              <Badge variant="light">{metrics.whatsappRate}%</Badge>
            </Group>
            <Progress value={metrics.whatsappRate} color="green" radius="xl" />
            <Text size="sm" c="dimmed">
              {metrics.connectedWhatsapp}/{metrics.totalUsers} {labels.connectedWhatsapp}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card className="studioCard" withBorder radius="sm" p="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>{labels.recentEvents}</Title>
            <Badge variant="light">{metrics.totalGuests} {labels.totalGuests}</Badge>
          </Group>

          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{labels.eventName}</Table.Th>
                  <Table.Th>{labels.eventDate}</Table.Th>
                  <Table.Th>{labels.venue}</Table.Th>
                  <Table.Th>{labels.totalGuests}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentEvents.map((event) => (
                  <Table.Tr key={event.id}>
                    <Table.Td>{event.eventName}</Table.Td>
                    <Table.Td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '-'}</Table.Td>
                    <Table.Td>{event.venueName || '-'}</Table.Td>
                    <Table.Td>{event.totalGuests}</Table.Td>
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

const OverviewMetric = ({
  icon,
  label,
  tone = 'ishruGreen',
  value,
}: {
  icon: ReactNode;
  label: string;
  tone?: string;
  value: number;
}) => (
  <Card className="studioCard" withBorder radius="sm" p="md">
    <Group justify="space-between" align="flex-start">
      <Stack gap={2}>
        <Text size="sm" c="dimmed">{label}</Text>
        <Text fw={900} size="xl">{value}</Text>
      </Stack>
      <Badge color={tone} variant="light">{icon}</Badge>
    </Group>
  </Card>
);
