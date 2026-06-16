import { Alert, Button, Card, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconAddressBook, IconAlertTriangle, IconBrandGoogle, IconDeviceFloppy, IconGift, IconMapPin, IconNavigation, IconPhone, IconSettings, IconTrash, IconUnlink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { deleteCurrentHostData, disconnectGoogle, getGoogleStatus, GoogleConnectionStatus, startGoogleConnection } from '../../api';
import { useFeedback } from '../../components/feedback';
import { uiConfig } from '../../config';
import { EventCard } from '../../data';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { sanitizePhoneInput } from '../../utils/input-sanitize';

type SettingsPanelProps = {
  labels: Record<string, string>;
  hostId: string;
  isDemoMode?: boolean;
  events: EventCard[];
  selectedEvent: EventCard | undefined;
  selectedEventId: string;
  onHostIdChange: (value: string) => void;
  onSelectEvent: (eventId: string) => void;
  onDeleteAccount: () => void;
  onUpdateEvent: (eventId: string, patch: Partial<EventCard>) => void;
};

export const SettingsPanel = ({
  labels,
  hostId,
  isDemoMode = false,
  events,
  selectedEvent,
  selectedEventId,
  onHostIdChange,
  onSelectEvent,
  onDeleteAccount,
  onUpdateEvent,
}: SettingsPanelProps) => {
  useComponentLogger('SettingsPanel', { hostId, selectedEventId });
  const { showFeedback } = useFeedback();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<GoogleConnectionStatus>({ connected: false });
  const [googleLoading, setGoogleLoading] = useState(false);

  const showSaved = () => {
    showFeedback({
      type: 'success',
      title: labels.settingsSaved,
      message: labels.settingsSavedMessage,
    });
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteConfirmValue('');
    setDeleteLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteCurrentHostData();
      showFeedback({
        type: 'success',
        title: labels.accountDeleted,
        message: `${labels.deletedEvents}: ${result.deletedEvents}, ${labels.deletedGuests}: ${result.deletedGuests}`,
      });
      closeDeleteModal();
      onDeleteAccount();
    } catch (cause) {
      setDeleteLoading(false);
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    }
  };

  const connectGoogle = async () => {
    if (isDemoMode) {
      showFeedback({
        type: 'info',
        title: labels.demoGoogleDisabledTitle,
        message: labels.demoGoogleDisabledMessage,
      });
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await startGoogleConnection();
      window.location.href = result.authUrl;
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
      setGoogleLoading(false);
    }
  };

  const disconnectGoogleAccount = async () => {
    if (isDemoMode) {
      showFeedback({
        type: 'info',
        title: labels.demoGoogleDisabledTitle,
        message: labels.demoGoogleDisabledMessage,
      });
      return;
    }

    setGoogleLoading(true);
    try {
      await disconnectGoogle();
      setGoogleStatus({ connected: false });
      showFeedback({
        type: 'success',
        title: labels.googleDisconnected,
        message: labels.googleDisconnectedMessage,
      });
    } catch (cause) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    void getGoogleStatus()
      .then(setGoogleStatus)
      .catch(() => setGoogleStatus({ connected: false }));
  }, []);

  return (
    <Stack gap="md" maw={760}>
    <Card className="studioCard" withBorder radius="sm" p="xl">
      <Stack gap="md">
        <Title order={2}>{labels.settings}</Title>
        <TextInput
          label={labels.hostId}
          value={hostId}
          onChange={(event) => onHostIdChange(event.currentTarget.value)}
          placeholder={labels.hostIdPlaceholder}
          leftSection={<IconSettings size={uiConfig.icons.input} />}
        />
        <Text size="sm" c="dimmed">{labels.apiHint}</Text>
      </Stack>
    </Card>

    <Card className="studioCard" withBorder radius="sm" p="xl">
      <Stack gap="md">
        <Title order={3}>{labels.eventSettings}</Title>
        <Select
          label={labels.selectedEvent}
          value={selectedEventId}
          onChange={(value) => value && onSelectEvent(value)}
          data={events.map((event) => ({ value: event.id, label: event.eventName }))}
        />

        <TextInput
          label={labels.eventPhone}
          value={selectedEvent?.adminPhoneNumber ?? ''}
          inputMode="tel"
          onChange={(event) => onUpdateEvent(selectedEventId, { adminPhoneNumber: sanitizePhoneInput(event.currentTarget.value) })}
          leftSection={<IconPhone size={uiConfig.icons.input} />}
        />

        <TextInput
          label={labels.address}
          value={selectedEvent?.address ?? ''}
          onChange={(event) => onUpdateEvent(selectedEventId, { address: event.currentTarget.value })}
          leftSection={<IconMapPin size={uiConfig.icons.input} />}
        />

        <TextInput
          label={labels.wazeLink}
          value={selectedEvent?.wazeLink ?? ''}
          onChange={(event) => onUpdateEvent(selectedEventId, { wazeLink: event.currentTarget.value })}
          leftSection={<IconNavigation size={uiConfig.icons.input} />}
        />

        <TextInput
          label={labels.bitLink}
          value={selectedEvent?.bitLink ?? ''}
          onChange={(event) => onUpdateEvent(selectedEventId, { bitLink: event.currentTarget.value })}
          leftSection={<IconGift size={uiConfig.icons.input} />}
        />

        <Button leftSection={<IconDeviceFloppy size={uiConfig.icons.button} />} onClick={showSaved}>
          {labels.saveEventSettings}
        </Button>
      </Stack>
    </Card>

    <Card className="studioCard" withBorder radius="sm" p="xl">
      <Stack gap="md">
        <Title order={3}>{labels.googleConnection}</Title>
        <Text size="sm" c="dimmed">{labels.googleDescription}</Text>
        {googleStatus.connected && (
          <Text size="sm" fw={800}>
            {labels.connectedAs}: {googleStatus.googleAccountEmail ?? labels.googleConnected}
          </Text>
        )}
        <Group>
          <Button leftSection={<IconBrandGoogle size={uiConfig.icons.button} />} variant={googleStatus.connected ? 'filled' : 'light'} loading={googleLoading} onClick={connectGoogle}>
            {googleStatus.connected ? labels.reconnectGoogle : labels.connectGoogle}
          </Button>
          {googleStatus.connected && (
            <Button leftSection={<IconUnlink size={uiConfig.icons.button} />} variant="light" color="red" loading={googleLoading} onClick={disconnectGoogleAccount}>
              {labels.disconnectGoogle}
            </Button>
          )}
        </Group>
      </Stack>
    </Card>

    <Card className="studioCard" withBorder radius="sm" p="xl">
      <Stack gap="md">
        <Title order={3}>{labels.phoneContacts}</Title>
        <Text size="sm" c="dimmed">{labels.contactsDescription}</Text>
        <Button leftSection={<IconAddressBook size={uiConfig.icons.button} />} variant="light" onClick={connectGoogle}>
          {googleStatus.connected ? labels.openGoogleContacts : labels.requestContacts}
        </Button>
      </Stack>
    </Card>

    <Card className="studioCard dangerCard" withBorder radius="sm" p="xl">
      <Stack gap="md">
        <Title order={3}>{labels.dangerZone}</Title>
        <Alert icon={<IconAlertTriangle size={uiConfig.icons.alert} />} color="red" variant="light">
          {labels.deleteAccountDescription}
        </Alert>
        <Button color="red" variant="light" leftSection={<IconTrash size={uiConfig.icons.button} />} onClick={() => setIsDeleteModalOpen(true)}>
          {labels.deleteAccount}
        </Button>
      </Stack>
    </Card>

    <Modal
      opened={isDeleteModalOpen}
      onClose={closeDeleteModal}
      title={labels.deleteAccountModalTitle}
      centered
    >
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={uiConfig.icons.alert} />} color="red" variant="light">
          {labels.deleteAccountDescription}
        </Alert>
        <Text size="sm">{labels.deleteAccountConfirm}</Text>
        <TextInput
          label={labels.deleteAccountPrompt}
          value={deleteConfirmValue}
          onChange={(event) => setDeleteConfirmValue(event.currentTarget.value)}
          placeholder="DELETE"
          required
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDeleteModal}>
            {labels.cancel}
          </Button>
          <Button
            color="red"
            loading={deleteLoading}
            disabled={deleteConfirmValue !== 'DELETE'}
            leftSection={<IconTrash size={uiConfig.icons.button} />}
            onClick={handleDeleteAccount}
          >
            {labels.deleteAccount}
          </Button>
        </Group>
      </Stack>
    </Modal>
  </Stack>
  );
};
