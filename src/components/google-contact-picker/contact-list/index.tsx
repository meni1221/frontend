import { Checkbox, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { WhatsappRecipient } from '../../../api';
import { uiConfig } from '../../../config';
import { filterContacts, getContactKey } from '../helpers';

type ContactListProps = {
  contacts: WhatsappRecipient[];
  labels: Record<string, string>;
  query: string;
  selectedContactKeys: string[];
  onQueryChange: (value: string) => void;
  onToggleContact: (contact: WhatsappRecipient, checked: boolean) => void;
};

export const ContactList = ({
  contacts,
  labels,
  query,
  selectedContactKeys,
  onQueryChange,
  onToggleContact,
}: ContactListProps) => {
  const filteredContacts = filterContacts(contacts, query, labels.guest);

  return (
    <Stack gap="xs">
      <TextInput
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        placeholder={labels.searchGoogleContactsPlaceholder}
        leftSection={<IconSearch size={uiConfig.icons.input} />}
      />

      <Table.ScrollContainer minWidth={640}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{labels.choose}</Table.Th>
              <Table.Th>{labels.fullName}</Table.Th>
              <Table.Th>{labels.phoneNumber}</Table.Th>
              <Table.Th>{labels.email}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredContacts.map((contact) => {
              const contactKey = getContactKey(contact);

              return (
                <Table.Tr key={contactKey}>
                  <Table.Td>
                    <Checkbox
                      checked={selectedContactKeys.includes(contactKey)}
                      aria-label={`${labels.choose} ${contact.fullName || labels.guest}`}
                      onChange={(event) => onToggleContact(contact, event.currentTarget.checked)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text fw={800}>{contact.fullName || labels.guest}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text dir="ltr">{contact.phoneNumber || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text dir="ltr">{contact.email || '-'}</Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
            {!filteredContacts.length && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed" size="sm">{labels.noGoogleContactsFound}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
};
