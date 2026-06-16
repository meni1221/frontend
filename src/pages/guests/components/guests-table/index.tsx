import { Badge, Button, Group, Table, Text } from '@mantine/core';
import { IconCopy, IconEdit, IconExternalLink, IconSend, IconTrash } from '@tabler/icons-react';
import { uiConfig } from '../../../../config';
import { GuestRecord, GuestStatus } from '../../../../data';
import { buildGuestInviteLink } from '../../../../utils/invite-link';

type GuestsTableProps = {
  guests: GuestRecord[];
  isSeparateSeating: boolean;
  labels: Record<string, string>;
  onCopyInvite: (guest: GuestRecord) => void;
  onDelete: (guest: GuestRecord) => void;
  onEdit: (guest: GuestRecord) => void;
  onSendReminder: (guest: GuestRecord) => void;
};

const statusColor: Record<GuestStatus, string> = {
  pending: 'yellow',
  confirmed: 'ishruGreen',
  maybe: 'orange',
  declined: 'red',
  reminded: 'blue',
  thanked: 'grape',
};

export const GuestsTable = ({
  guests,
  isSeparateSeating,
  labels,
  onCopyInvite,
  onDelete,
  onEdit,
  onSendReminder,
}: GuestsTableProps) => (
  <Table.ScrollContainer minWidth={760}>
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{labels.fullName}</Table.Th>
          <Table.Th>{labels.inviteId}</Table.Th>
          <Table.Th>{labels.phoneNumber}</Table.Th>
          <Table.Th>{labels.email}</Table.Th>
          <Table.Th>{labels.status}</Table.Th>
          <Table.Th>{labels.maxAllowed}</Table.Th>
          {isSeparateSeating && <Table.Th>{labels.genderSplit}</Table.Th>}
          <Table.Th>{labels.arriving}</Table.Th>
          <Table.Th>{labels.notes}</Table.Th>
          <Table.Th>{labels.actions}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {guests.map((guest) => (
          <Table.Tr key={guest.id}>
            <Table.Td>{guest.fullName}</Table.Td>
            <Table.Td>{guest.inviteId}</Table.Td>
            <Table.Td>{guest.phoneNumber}</Table.Td>
            <Table.Td>{guest.email || '-'}</Table.Td>
            <Table.Td>
              <Badge color={statusColor[guest.status]} variant="light">{labels[guest.status]}</Badge>
            </Table.Td>
            <Table.Td>{guest.maxAllowed}</Table.Td>
            {isSeparateSeating && (
              <Table.Td>{labels.men}: {guest.menCount} / {labels.women}: {guest.womenCount}</Table.Td>
            )}
            <Table.Td>{guest.adults + guest.children}</Table.Td>
            <Table.Td>{guest.notes || '-'}</Table.Td>
            <Table.Td>
              <Group gap={4} wrap="nowrap">
                <Button size="xs" variant="subtle" leftSection={<IconCopy size={uiConfig.icons.smallButton} />} onClick={() => onCopyInvite(guest)}>
                  {labels.copyLink}
                </Button>
                <Button size="xs" variant="subtle" component="a" href={buildGuestInviteLink(guest)} target="_blank" leftSection={<IconExternalLink size={uiConfig.icons.smallButton} />}>
                  {labels.openInvite}
                </Button>
                <Button size="xs" variant="subtle" leftSection={<IconSend size={uiConfig.icons.smallButton} />} onClick={() => onSendReminder(guest)}>
                  {labels.sendReminder}
                </Button>
                <Button size="xs" variant="subtle" leftSection={<IconEdit size={uiConfig.icons.smallButton} />} onClick={() => onEdit(guest)}>
                  {labels.edit}
                </Button>
                <Button size="xs" color="red" variant="subtle" leftSection={<IconTrash size={uiConfig.icons.smallButton} />} onClick={() => onDelete(guest)}>
                  {labels.remove}
                </Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
        {!guests.length && (
          <Table.Tr>
            <Table.Td colSpan={isSeparateSeating ? 10 : 9}>
              <Text ta="center" c="dimmed" py="md">{labels.guestSearchNotFound}</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  </Table.ScrollContainer>
);
