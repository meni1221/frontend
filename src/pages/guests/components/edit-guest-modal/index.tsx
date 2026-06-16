import { Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { GuestStatus } from '../../../../data';
import { sanitizeEmailInput, sanitizeNameInput, sanitizePhoneInput } from '../../../../utils/input-sanitize';

type EditGuestModalProps = {
  adults: number | string;
  children: number | string;
  email: string;
  fullName: string;
  isGenderSplitInvalid: boolean;
  isOpen: boolean;
  isSeparateSeating: boolean;
  labels: Record<string, string>;
  loading: boolean;
  maxAllowed: number | string;
  menCount: number | string;
  notes: string;
  phoneNumber: string;
  status: GuestStatus;
  womenCount: number | string;
  onAdultsChange: (value: number | string) => void;
  onChildrenChange: (value: number | string) => void;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onMaxAllowedChange: (value: number | string) => void;
  onMenCountChange: (value: number | string) => void;
  onNotesChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onSave: () => void;
  onStatusChange: (value: GuestStatus) => void;
  onWomenCountChange: (value: number | string) => void;
};

export const EditGuestModal = ({
  adults,
  children,
  email,
  fullName,
  isGenderSplitInvalid,
  isOpen,
  isSeparateSeating,
  labels,
  loading,
  maxAllowed,
  menCount,
  notes,
  phoneNumber,
  status,
  womenCount,
  onAdultsChange,
  onChildrenChange,
  onClose,
  onEmailChange,
  onFullNameChange,
  onMaxAllowedChange,
  onMenCountChange,
  onNotesChange,
  onPhoneNumberChange,
  onSave,
  onStatusChange,
  onWomenCountChange,
}: EditGuestModalProps) => (
  <Modal opened={isOpen} onClose={onClose} title={labels.editGuest} centered>
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
      <Group grow>
        <NumberInput label={labels.maxAllowed} min={1} max={20} value={maxAllowed} onChange={onMaxAllowedChange} required />
        <Select
          label={labels.status}
          value={status}
          onChange={(value) => onStatusChange((value as GuestStatus | null) ?? 'pending')}
          data={[
            { value: 'pending', label: labels.pending },
            { value: 'confirmed', label: labels.confirmed },
            { value: 'maybe', label: labels.maybe },
            { value: 'declined', label: labels.declined },
            { value: 'reminded', label: labels.reminded },
            { value: 'thanked', label: labels.thanked },
          ]}
        />
      </Group>
      {isSeparateSeating && (
        <Group grow>
          <NumberInput label={labels.men} min={0} max={20} value={menCount} onChange={onMenCountChange} />
          <NumberInput label={labels.women} min={0} max={20} value={womenCount} onChange={onWomenCountChange} />
        </Group>
      )}
      <Group grow>
        <NumberInput label={labels.adults} min={0} max={20} value={adults} onChange={onAdultsChange} />
        <NumberInput label={labels.children} min={0} max={20} value={children} onChange={onChildrenChange} />
      </Group>
      <Textarea label={labels.notes} value={notes} onChange={(event) => onNotesChange(event.currentTarget.value)} minRows={3} />
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>{labels.cancel}</Button>
        <Button loading={loading} disabled={isGenderSplitInvalid} onClick={onSave}>
          {labels.save}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
