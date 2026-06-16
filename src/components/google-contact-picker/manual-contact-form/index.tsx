import { Button, SimpleGrid, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { uiConfig } from '../../../config';
import { sanitizeEmailInput, sanitizeNameInput, sanitizePhoneInput } from '../../../utils/input-sanitize';

type ManualContactFormProps = {
  email: string;
  labels: Record<string, string>;
  name: string;
  phone: string;
  onAdd: () => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export const ManualContactForm = ({
  email,
  labels,
  name,
  phone,
  onAdd,
  onEmailChange,
  onNameChange,
  onPhoneChange,
}: ManualContactFormProps) => (
  <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md" verticalSpacing="md">
    <TextInput
      label={labels.fullName}
      value={name}
      onChange={(event) => onNameChange(sanitizeNameInput(event.currentTarget.value))}
    />
    <TextInput
      inputMode="tel"
      label={labels.phoneNumber}
      value={phone}
      onChange={(event) => onPhoneChange(sanitizePhoneInput(event.currentTarget.value))}
    />
    <TextInput
      inputMode="email"
      label={labels.email}
      value={email}
      onChange={(event) => onEmailChange(sanitizeEmailInput(event.currentTarget.value))}
    />
    <Button fullWidth style={{ alignSelf: 'end' }} leftSection={<IconPlus size={uiConfig.icons.button} />} onClick={onAdd}>
      {labels.addContact}
    </Button>
  </SimpleGrid>
);
