import { Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import { IconPlus, IconSend } from '@tabler/icons-react';
import { sendWhatsappBatch, WhatsappRecipient } from '../../api';
import { useFeedback } from '../../components/feedback';
import { uiConfig } from '../../config';
import { EventCard, GuestRecord, GuestStatus } from '../../data';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { sanitizeEmailInput } from '../../utils/input-sanitize';
import { buildGuestInviteLink } from '../../utils/invite-link';
import { appLogger } from '../../utils/logger';
import { validateEmail, validatePhone } from '../../utils/validation';
import { CreateGuestModal } from './components/create-guest-modal';
import { EditGuestModal } from './components/edit-guest-modal';
import { GuestFilters } from './components/guest-filters';
import { GuestSummary } from './components/guest-summary';
import { GuestsTable } from './components/guests-table';
import { ReminderModal } from './components/reminder-modal';
import { getReminderPlan, normalizePhone, ReminderAudience } from './helpers';

type GuestsPanelProps = {
  guests: GuestRecord[];
  labels: Record<string, string>;
  selectedEvent: EventCard | undefined;
  onCreateGuest: (guest: GuestRecord) => Promise<void> | void;
  onDeleteGuest: (guestId: string) => Promise<void> | void;
  onUpdateGuest: (guestId: string, patch: Partial<GuestRecord>) => Promise<void> | void;
};

export const GuestsPanel = ({ guests, labels, selectedEvent, onCreateGuest, onDeleteGuest, onUpdateGuest }: GuestsPanelProps) => {
  useComponentLogger('GuestsPanel', { guests: guests.length, selectedEventId: selectedEvent?.id });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [maxAllowed, setMaxAllowed] = useState<number | string>(2);
  const [menCount, setMenCount] = useState<number | string>(0);
  const [womenCount, setWomenCount] = useState<number | string>(0);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderAudience, setReminderAudience] = useState<ReminderAudience>('awaiting');
  const [createLoading, setCreateLoading] = useState(false);
  const [duplicateGuest, setDuplicateGuest] = useState<GuestRecord | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestRecord | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMaxAllowed, setEditMaxAllowed] = useState<number | string>(2);
  const [editMenCount, setEditMenCount] = useState<number | string>(0);
  const [editWomenCount, setEditWomenCount] = useState<number | string>(0);
  const [editStatus, setEditStatus] = useState<GuestStatus>('pending');
  const [editAdults, setEditAdults] = useState<number | string>(0);
  const [editChildren, setEditChildren] = useState<number | string>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const { showFeedback } = useFeedback();

  const eventGuests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedPhoneQuery = normalizePhone(query);
    return guests
      .filter((guest) => guest.eventId === selectedEvent?.id)
      .filter((guest) => status === 'all' || guest.status === status)
      .filter((guest) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          guest.fullName.toLowerCase(),
          guest.phoneNumber.toLowerCase(),
          guest.email?.toLowerCase() ?? '',
          guest.inviteId.toLowerCase(),
        ].some((value) => value.includes(normalizedQuery)) ||
          Boolean(normalizedPhoneQuery && normalizePhone(guest.phoneNumber).includes(normalizedPhoneQuery));
      });
  }, [guests, query, selectedEvent?.id, status]);

  const totals = {
    confirmed: eventGuests.filter((guest) => guest.status === 'confirmed').length,
    maybe: eventGuests.filter((guest) => guest.status === 'maybe').length,
    pending: eventGuests.filter((guest) => guest.status === 'pending').length,
    declined: eventGuests.filter((guest) => guest.status === 'declined').length,
  };
  const selectedEventGuests = guests.filter((guest) => guest.eventId === selectedEvent?.id);
  const isSeparateSeating = selectedEvent?.seatingMode === 'separate';
  const reminderGuests = selectedEventGuests.filter((guest) => {
    if (reminderAudience === 'confirmed') {
      return guest.status === 'confirmed';
    }

    if (reminderAudience === 'all') {
      return ['pending', 'maybe', 'confirmed'].includes(guest.status);
    }

    return ['pending', 'maybe'].includes(guest.status);
  });
  const reminderMessage = reminderAudience === 'confirmed'
    ? labels.defaultConfirmedReminderMessage
    : labels.defaultReminderMessage;
  const reminderPlan = getReminderPlan(selectedEvent?.eventDate, labels);
  const isCreateGenderSplitInvalid = isSeparateSeating && Number(menCount) + Number(womenCount) > Number(maxAllowed);
  const isEditGenderSplitInvalid = isSeparateSeating && Number(editMenCount) + Number(editWomenCount) > Number(editMaxAllowed);

  const resetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setMaxAllowed(2);
    setMenCount(0);
    setWomenCount(0);
    setDuplicateGuest(null);
  };

  const createGuest = async () => {
    if (!selectedEvent || !fullName.trim() || !phoneNumber.trim()) {
      return;
    }

    if (isCreateGenderSplitInvalid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: labels.genderSplitTooHigh,
      });
      return;
    }

    const phoneValidation = validatePhone(phoneNumber, labels.invalidPhone);
    if (!phoneValidation.isValid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: phoneValidation.message ?? labels.invalidPhone,
      });
      return;
    }

    const emailValidation = email.trim() ? validateEmail(email, labels.invalidEmail) : { isValid: true, message: null };
    if (!emailValidation.isValid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: emailValidation.message ?? labels.invalidEmail,
      });
      return;
    }

    const normalizedPhone = normalizePhone(phoneNumber);
    const existingGuest = selectedEventGuests.find((guest) => normalizePhone(guest.phoneNumber) === normalizedPhone);
    if (existingGuest) {
      setDuplicateGuest(existingGuest);
      showFeedback({
        type: existingGuest.status === 'confirmed' ? 'warning' : 'info',
        title: labels.guestAlreadyInvitedTitle,
        message: labels.guestAlreadyInvitedMessage
          .replace('{fullName}', existingGuest.fullName)
          .replace('{status}', labels[existingGuest.status]),
      });
      return;
    }

    setCreateLoading(true);
    try {
      await onCreateGuest({
        id: `guest_${Date.now()}`,
        eventId: selectedEvent.id,
        inviteId: `inv_${Date.now().toString(36)}`,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: sanitizeEmailInput(email),
        language: 'he',
        status: 'pending',
        maxAllowed: Number(maxAllowed) || 2,
        menCount: isSeparateSeating ? Number(menCount) || 0 : 0,
        womenCount: isSeparateSeating ? Number(womenCount) || 0 : 0,
        adults: 0,
        children: 0,
      });

      appLogger.info('guests.created', 'Guest created', { eventId: selectedEvent.id });
      showFeedback({
        type: 'success',
        title: labels.addGuest,
        message: fullName.trim(),
      });
      resetForm();
      setIsCreateOpen(false);
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const sendReminder = async () => {
    if (!selectedEvent || !reminderGuests.length) {
      return;
    }

    setReminderLoading(true);

    try {
      const recipients: WhatsappRecipient[] = reminderGuests.map((guest) => ({
        fullName: guest.fullName,
        phoneNumber: guest.phoneNumber,
        inviteLink: buildGuestInviteLink(guest),
      }));

      const result = await sendWhatsappBatch(recipients, reminderMessage);
      appLogger.info('guests.reminder.queued', 'Guest reminder batch queued', { eventId: selectedEvent.id, queued: result.queued });
      showFeedback({
        type: 'success',
        title: labels.messagesQueued,
        message: `${result.queued} ${labels.messagesQueuedMessage}`,
      });
      setIsReminderOpen(false);
    } catch (cause) {
      appLogger.warn('guests.reminder.failed', 'Guest reminder batch failed', { message: getFriendlyErrorMessage(cause, labels) });
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    } finally {
      setReminderLoading(false);
    }
  };

  const copyGuestInviteLink = async (guest: GuestRecord) => {
    try {
      await navigator.clipboard.writeText(buildGuestInviteLink(guest));
      showFeedback({
        type: 'success',
        title: labels.linkCopied,
        message: guest.fullName,
      });
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    }
  };

  const sendSingleGuestReminder = async (guest: GuestRecord) => {
    try {
      const message = guest.status === 'confirmed' ? labels.defaultConfirmedReminderMessage : labels.defaultReminderMessage;
      const result = await sendWhatsappBatch(
        [{
          fullName: guest.fullName,
          phoneNumber: guest.phoneNumber,
          inviteLink: buildGuestInviteLink(guest),
        }],
        message,
      );
      showFeedback({
        type: 'success',
        title: labels.messagesQueued,
        message: `${result.queued} ${labels.messagesQueuedMessage}`,
      });
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    }
  };

  const deleteSelectedGuest = async (guest: GuestRecord) => {
    try {
      await onDeleteGuest(guest.id);
      showFeedback({
        type: 'success',
        title: labels.guestDeleted,
        message: guest.fullName,
      });
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    }
  };

  const openEditGuest = (guest: GuestRecord) => {
    setEditingGuest(guest);
    setEditFullName(guest.fullName);
    setEditPhoneNumber(guest.phoneNumber);
    setEditEmail(guest.email ?? '');
    setEditMaxAllowed(guest.maxAllowed);
    setEditMenCount(guest.menCount);
    setEditWomenCount(guest.womenCount);
    setEditStatus(guest.status);
    setEditAdults(guest.adults);
    setEditChildren(guest.children);
    setEditNotes(guest.notes ?? '');
  };

  const updateSelectedGuest = async () => {
    if (!editingGuest || !editFullName.trim() || !editPhoneNumber.trim()) {
      return;
    }

    if (isEditGenderSplitInvalid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: labels.genderSplitTooHigh,
      });
      return;
    }

    const phoneValidation = validatePhone(editPhoneNumber, labels.invalidPhone);
    if (!phoneValidation.isValid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: phoneValidation.message ?? labels.invalidPhone,
      });
      return;
    }

    const emailValidation = editEmail.trim() ? validateEmail(editEmail, labels.invalidEmail) : { isValid: true, message: null };
    if (!emailValidation.isValid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: emailValidation.message ?? labels.invalidEmail,
      });
      return;
    }

    const normalizedPhone = normalizePhone(editPhoneNumber);
    const existingGuest = selectedEventGuests.find((guest) =>
      guest.id !== editingGuest.id && normalizePhone(guest.phoneNumber) === normalizedPhone,
    );

    if (existingGuest) {
      showFeedback({
        type: 'warning',
        title: labels.guestAlreadyInvitedTitle,
        message: labels.guestAlreadyInvitedMessage
          .replace('{fullName}', existingGuest.fullName)
          .replace('{status}', labels[existingGuest.status]),
      });
      return;
    }

    setEditLoading(true);

    try {
      await onUpdateGuest(editingGuest.id, {
        adults: Number(editAdults) || 0,
        children: Number(editChildren) || 0,
        fullName: editFullName.trim(),
        maxAllowed: Number(editMaxAllowed) || 1,
        menCount: isSeparateSeating ? Number(editMenCount) || 0 : 0,
        notes: editNotes.trim(),
        phoneNumber: editPhoneNumber.trim(),
        email: sanitizeEmailInput(editEmail),
        status: editStatus,
        womenCount: isSeparateSeating ? Number(editWomenCount) || 0 : 0,
      });
      showFeedback({
        type: 'success',
        title: labels.guestUpdated,
        message: editFullName.trim(),
      });
      setEditingGuest(null);
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Stack gap={2}>
          <Title order={2}>{labels.guestsManagement}</Title>
          <Text size="sm" c="dimmed">{selectedEvent?.eventName}</Text>
        </Stack>
        <Group>
          <Button variant="light" leftSection={<IconSend size={uiConfig.icons.button} />} onClick={() => setIsReminderOpen(true)}>
            {labels.sendReminder}
          </Button>
          <Button leftSection={<IconPlus size={uiConfig.icons.button} />} onClick={() => setIsCreateOpen(true)}>{labels.addGuest}</Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <GuestSummary label={labels.confirmed} value={totals.confirmed} />
        <GuestSummary label={labels.maybe} value={totals.maybe} />
        <GuestSummary label={labels.pending} value={totals.pending} />
      </SimpleGrid>

      <Card className="studioCard" withBorder radius="sm" p="lg">
        <Stack gap="md">
          <GuestFilters
            labels={labels}
            query={query}
            resultCount={eventGuests.length}
            status={status}
            onQueryChange={setQuery}
            onStatusChange={setStatus}
          />

          <GuestsTable
            guests={eventGuests}
            isSeparateSeating={isSeparateSeating}
            labels={labels}
            onCopyInvite={copyGuestInviteLink}
            onDelete={deleteSelectedGuest}
            onEdit={openEditGuest}
            onSendReminder={sendSingleGuestReminder}
          />
        </Stack>
      </Card>

      <CreateGuestModal
        duplicateGuest={duplicateGuest}
        email={email}
        fullName={fullName}
        isGenderSplitInvalid={isCreateGenderSplitInvalid}
        isOpen={isCreateOpen}
        isSeparateSeating={isSeparateSeating}
        labels={labels}
        loading={createLoading}
        maxAllowed={maxAllowed}
        menCount={menCount}
        phoneNumber={phoneNumber}
        womenCount={womenCount}
        onClose={() => setIsCreateOpen(false)}
        onCreate={createGuest}
        onEmailChange={setEmail}
        onFullNameChange={setFullName}
        onMaxAllowedChange={setMaxAllowed}
        onMenCountChange={setMenCount}
        onPhoneNumberChange={setPhoneNumber}
        onWomenCountChange={setWomenCount}
      />

      <ReminderModal
        audience={reminderAudience}
        isOpen={isReminderOpen}
        labels={labels}
        loading={reminderLoading}
        message={reminderMessage}
        plan={reminderPlan}
        recipientsCount={reminderGuests.length}
        onAudienceChange={setReminderAudience}
        onClose={() => setIsReminderOpen(false)}
        onSend={sendReminder}
      />

      <EditGuestModal
        adults={editAdults}
        children={editChildren}
        email={editEmail}
        fullName={editFullName}
        isGenderSplitInvalid={isEditGenderSplitInvalid}
        isOpen={Boolean(editingGuest)}
        isSeparateSeating={isSeparateSeating}
        labels={labels}
        loading={editLoading}
        maxAllowed={editMaxAllowed}
        menCount={editMenCount}
        notes={editNotes}
        phoneNumber={editPhoneNumber}
        status={editStatus}
        womenCount={editWomenCount}
        onAdultsChange={setEditAdults}
        onChildrenChange={setEditChildren}
        onClose={() => setEditingGuest(null)}
        onEmailChange={setEditEmail}
        onFullNameChange={setEditFullName}
        onMaxAllowedChange={setEditMaxAllowed}
        onMenCountChange={setEditMenCount}
        onNotesChange={setEditNotes}
        onPhoneNumberChange={setEditPhoneNumber}
        onSave={updateSelectedGuest}
        onStatusChange={setEditStatus}
        onWomenCountChange={setEditWomenCount}
      />
    </Stack>
  );
};
