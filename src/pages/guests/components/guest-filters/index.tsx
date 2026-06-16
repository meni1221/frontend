import { Card, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { uiConfig } from '../../../../config';

type GuestFiltersProps = {
  labels: Record<string, string>;
  query: string;
  resultCount: number;
  status: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export const GuestFilters = ({
  labels,
  query,
  resultCount,
  status,
  onQueryChange,
  onStatusChange,
}: GuestFiltersProps) => (
  <Stack gap="md">
    <Group align="end">
      <TextInput
        label={labels.searchGuest}
        placeholder={labels.searchGuestPlaceholder}
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        leftSection={<IconSearch size={uiConfig.icons.input} />}
      />
      <Select
        label={labels.status}
        value={status}
        onChange={(value) => onStatusChange(value ?? 'all')}
        data={[
          { value: 'all', label: labels.allStatuses },
          { value: 'pending', label: labels.pending },
          { value: 'confirmed', label: labels.confirmed },
          { value: 'maybe', label: labels.maybe },
          { value: 'declined', label: labels.declined },
          { value: 'reminded', label: labels.reminded },
          { value: 'thanked', label: labels.thanked },
        ]}
      />
    </Group>

    {query.trim() && (
      <Card withBorder radius="sm" p="md">
        <Text size="sm" fw={800}>
          {resultCount
            ? labels.guestSearchFound.replace('{count}', String(resultCount))
            : labels.guestSearchNotFound}
        </Text>
        <Text size="xs" c="dimmed">{labels.guestSearchHint}</Text>
      </Card>
    )}
  </Stack>
);
