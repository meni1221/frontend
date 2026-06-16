import { Button, Modal, Select, SimpleGrid, Stack, Switch, TextInput } from '@mantine/core';
import { useState } from 'react';
import { IconCalendar, IconMapPin, IconPlus, IconUsers } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { EventCard, EventTheme, eventThemes } from '../../data';
import { useFeedback } from '../feedback';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { sanitizePhoneInput, sanitizePositiveIntegerInput, sanitizeShortTextInput } from '../../utils/input-sanitize';
import { validateDate, validatePhone, validatePositiveNumber, validateRequiredText } from '../../utils/validation';

type CreateEventModalProps = {
  labels: Record<string, string>;
  opened: boolean;
  onClose: () => void;
  onCreate: (event: EventCard) => Promise<void> | void;
};

const defaultTheme: EventTheme = 'brit';

export const CreateEventModal = ({ labels, opened, onClose, onCreate }: CreateEventModalProps) => {
  useComponentLogger('CreateEventModal', { opened });
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [adminPhoneNumber, setAdminPhoneNumber] = useState('');
  const [maxGuests, setMaxGuests] = useState('120');
  const [theme, setTheme] = useState<EventTheme>(defaultTheme);
  const [isSeparateSeating, setIsSeparateSeating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showFeedback } = useFeedback();

  const eventNameValidation = validateRequiredText(eventName, labels.invalidEventName);
  const eventDateValidation = validateDate(eventDate, labels.invalidDate);
  const venueNameValidation = validateRequiredText(venueName, labels.invalidVenue);
  const phoneValidation = adminPhoneNumber.trim()
    ? validatePhone(adminPhoneNumber, labels.invalidPhone)
    : { isValid: true, message: null };
  const maxGuestsValidation = validatePositiveNumber(maxGuests, labels.invalidGuestCount);

  const reset = () => {
    setEventName('');
    setEventDate('');
    setVenueName('');
    setAddress('');
    setAdminPhoneNumber('');
    setMaxGuests('120');
    setTheme(defaultTheme);
    setIsSeparateSeating(false);
  };

  const submit = async () => {
    const nextEvent: EventCard = {
      id: `evt_${Date.now()}`,
      eventName,
      eventDate,
      venueName,
      address,
      wazeLink: address ? `https://waze.com/ul?q=${encodeURIComponent(address)}` : '',
      guests: Number(maxGuests) || 0,
      confirmed: 0,
      pending: Number(maxGuests) || 0,
      theme,
      seatingMode: isSeparateSeating ? 'separate' : 'mixed',
      bitLink: '',
      adminPhoneNumber,
      isActive: true,
      invitationDesignKey: 'soft',
    };

    setLoading(true);
    try {
      await onCreate(nextEvent);
      reset();
      onClose();
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = [
    eventNameValidation,
    eventDateValidation,
    venueNameValidation,
    phoneValidation,
    maxGuestsValidation,
  ].some((validation) => !validation.isValid);

  return (
    <Modal opened={opened} onClose={onClose} title={labels.createEventFlow} centered size={uiConfig.modal.eventSize}>
      <Stack gap="md">
        <TextInput
          label={labels.eventName}
          value={eventName}
          onChange={(event) => setEventName(sanitizeShortTextInput(event.currentTarget.value))}
          placeholder={labels.eventNamePlaceholder}
          leftSection={<IconPlus size={uiConfig.icons.input} />}
          error={eventNameValidation.message}
          required
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label={labels.eventDate}
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.currentTarget.value)}
            leftSection={<IconCalendar size={uiConfig.icons.input} />}
            error={eventDateValidation.message}
            required
          />
          <Select
            label={labels.eventTheme}
            value={theme}
            onChange={(value) => value && setTheme(value as EventTheme)}
            data={eventThemes.map((eventTheme) => ({ value: eventTheme, label: labels[eventTheme] }))}
            required
          />
        </SimpleGrid>

        <Switch
          checked={isSeparateSeating}
          label={labels.separateSeatingEvent}
          description={labels.separateSeatingEventDescription}
          onChange={(event) => setIsSeparateSeating(event.currentTarget.checked)}
        />

        <TextInput
          label={labels.venue}
          value={venueName}
          onChange={(event) => setVenueName(sanitizeShortTextInput(event.currentTarget.value))}
          placeholder={labels.venuePlaceholder}
          error={venueNameValidation.message}
          required
        />

        <TextInput
          label={labels.address}
          value={address}
          onChange={(event) => setAddress(event.currentTarget.value)}
          placeholder={labels.addressPlaceholder}
          leftSection={<IconMapPin size={uiConfig.icons.input} />}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label={labels.eventPhone}
            value={adminPhoneNumber}
            inputMode="tel"
            onChange={(event) => setAdminPhoneNumber(sanitizePhoneInput(event.currentTarget.value))}
            placeholder="050-000-0000"
            error={phoneValidation.message}
          />
          <TextInput
            label={labels.expectedGuests}
            value={maxGuests}
            inputMode="numeric"
            onChange={(event) => setMaxGuests(sanitizePositiveIntegerInput(event.currentTarget.value))}
            leftSection={<IconUsers size={uiConfig.icons.input} />}
            error={maxGuestsValidation.message}
            required
          />
        </SimpleGrid>

        <Button loading={loading} disabled={isDisabled} onClick={submit} leftSection={<IconPlus size={uiConfig.icons.button} />}>
          {labels.createEvent}
        </Button>
      </Stack>
    </Modal>
  );
};
