import { Button, Card, Group, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { IconCopy, IconExternalLink, IconSearch } from '@tabler/icons-react';
import { uiConfig } from '../../../../config';
import { GuestRecord } from '../../../../data';
import { buildGuestInviteLink } from '../../../../utils/invite-link';

type PersonalInviteLinksProps = {
  guests: GuestRecord[];
  labels: Record<string, string>;
  query: string;
  onCopyInviteLink: (inviteLink: string) => void;
  onQueryChange: (value: string) => void;
};

export const PersonalInviteLinks = ({
  guests,
  labels,
  query,
  onCopyInviteLink,
  onQueryChange,
}: PersonalInviteLinksProps) => (
  <Card className="studioCard" withBorder radius="sm" p="xl">
    <Stack gap="md">
      <Title order={3}>{labels.personalInviteLinks}</Title>
      <Text size="sm" c="dimmed">{labels.personalInviteLinksDescription}</Text>
      <TextInput
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        placeholder={labels.searchGuestPlaceholder}
        leftSection={<IconSearch size={uiConfig.icons.input} />}
      />
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{labels.guest}</Table.Th>
              <Table.Th>{labels.actions}</Table.Th>
              <Table.Th>{labels.phoneNumber}</Table.Th>
              <Table.Th>{labels.inviteId}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {guests.map((guest) => {
              const inviteLink = buildGuestInviteLink(guest);

              return (
                <Table.Tr key={guest.id}>
                  <Table.Td>{guest.fullName}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" leftSection={<IconCopy size={uiConfig.icons.button} />} onClick={() => onCopyInviteLink(inviteLink)}>
                        {labels.copyLink}
                      </Button>
                      <Button size="xs" component="a" href={inviteLink} target="_blank" variant="subtle" leftSection={<IconExternalLink size={uiConfig.icons.button} />}>
                        {labels.openInvite}
                      </Button>
                    </Group>
                  </Table.Td>
                  <Table.Td dir="ltr">{guest.phoneNumber}</Table.Td>
                  <Table.Td dir="ltr">{guest.inviteId}</Table.Td>
                </Table.Tr>
              );
            })}
            {guests.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed" size="sm">{labels.noGuestInviteLink}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  </Card>
);
