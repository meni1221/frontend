import { Button, Card, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { uiConfig } from '../../../../config';
import { GuestRecord } from '../../../../data';
import { sanitizeEmailInput, sanitizeNameInput, sanitizePhoneInput } from '../../../../utils/input-sanitize';

type CreateGuestModalProps = {
  duplicateGuest: GuestRecord | null;
  email: string;
  fullName: string;
  isGenderSplitInvalid: boolean;
  isOpen: boolean;
  isSeparateSeating: boolean;
  labels: Record<string, string>;
  loading: boolean;
  maxAllowed: number | string;
  menCount: number | string;
  phoneNumber: string;
  womenCount: number | string;
  onClose: () => void;
  onCreate: () => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onMaxAllowedChange: (value: number | string) => void;
  onMenCountChange: (value: number | string) => void;
  onPhoneNumberChange: (value: string) => void;
  onWomenCountChange: (value: number | string) => void;
};

export const CreateGuestModal = ({
  duplicateGuest,
  email,
  fullName,
  isGenderSplitInvalid,
  isOpen,
  isSeparateSeating,
  labels,
  loading,
  maxAllowed,
  menCount,
  phoneNumber,
  womenCount,
  onClose,
  onCreate,
  onEmailChange,
  onFullNameChange,
  onMaxAllowedChange,
  onMenCountChange,
  onPhoneNumberChange,
  onWomenCountChange,
}: CreateGuestModalProps) => (
  <Modal opened={isOpen} onClose={onClose} title={labels.addGuest} centered>
    <Stack gap="md">
      <TextInput
        label={labels.fullName}
        value={fullName}
        onChange={(event) => onFullNameChange(sanitizeNameInput(event.currentTarget.value))}
        required
      />
      <TextInput
        inputMode="tel"
        label={labels.phoneNumber}
        value={phoneNumber}
        onChange={(event) => onPhoneNumberChange(sanitizePhoneInput(event.currentTarget.value))}
        required
      />
      <TextInput
        inputMode="email"
        label={labels.email}
        value={email}
        onChange={(event) => onEmailChange(sanitizeEmailInput(event.currentTarget.value))}
      />
      {duplicateGuest && (
        <Card withBorder radius="sm" p="md">
          <Text fw={900}>{labels.guestAlreadyInvitedTitle}</Text>
          <Text size="sm" c="dimmed">
            {labels.guestAlreadyInvitedMessage
              .replace('{fullName}', duplicateGuest.fullName)
              .replace('{status}', labels[duplicateGuest.status])}
          </Text>
        </Card>
      )}
      <NumberInput label={labels.maxAllowed} min={1} max={20} value={maxAllowed} onChange={onMaxAllowedChange} required />
      {isSeparateSeating && (
        <Group grow>
          <NumberInput label={labels.men} min={0} max={20} value={menCount} onChange={onMenCountChange} />
          <NumberInput label={labels.women} min={0} max={20} value={womenCount} onChange={onWomenCountChange} />
        </Group>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>{labels.cancel}</Button>
        <Button
          leftSection={<IconPlus size={uiConfig.icons.button} />}
          loading={loading}
          disabled={!fullName.trim() || !phoneNumber.trim() || isGenderSplitInvalid}
          onClick={onCreate}
        >
          {labels.addGuest}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
