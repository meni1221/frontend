import { Badge, Box, Button, Card, Group, Image, Stack, Text, Title, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconBrandWhatsapp, IconRefresh, IconWifiOff } from '@tabler/icons-react';
import { connectWhatsapp, disconnectWhatsapp, getWhatsappQr, getWhatsappStatus, sendInvitationEmailBatch, sendWhatsappBatch, WhatsappRecipient, WhatsappSnapshot, WhatsappStatus } from '../../api';
import { uiConfig } from '../../config';
import { useFeedback } from '../../components/feedback';
import { GoogleContactPicker } from '../../components/google-contact-picker';
import { EventCard, GuestRecord } from '../../data';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { buildGuestInviteLink } from '../../utils/invite-link';
import { appLogger } from '../../utils/logger';
import { ConfirmWhatsappSendModal } from './components/confirm-whatsapp-send-modal';
import { PersonalInviteLinks } from './components/personal-invite-links';
import { normalizePhone, personalizeMessage } from './helpers';

const statusColor: Record<WhatsappStatus, string> = {
  DISCONNECTED: 'red',
  QR_READY: 'yellow',
  CONNECTED: 'green',
};

type WhatsappPanelProps = {
  labels: Record<string, string>;
  guests: GuestRecord[];
  isDemoMode?: boolean;
  selectedEvent: EventCard | undefined;
};

export const WhatsappPanel = ({ guests, labels, selectedEvent, isDemoMode = false }: WhatsappPanelProps) => {
  useComponentLogger('WhatsappPanel', { selectedEventId: selectedEvent?.id, guests: guests.length });
  const [snapshot, setSnapshot] = useState<WhatsappSnapshot | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteQuery, setInviteQuery] = useState('');
  const [pendingBatch, setPendingBatch] = useState<{ recipients: WhatsappRecipient[]; message: string } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const { showFeedback } = useFeedback();

  const status = snapshot?.status ?? 'DISCONNECTED';
  const eventGuests = guests.filter((guest) => guest.eventId === selectedEvent?.id);
  const filteredInviteGuests = eventGuests.filter((guest) => {
    const query = inviteQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return `${guest.fullName} ${guest.phoneNumber} ${guest.inviteId}`.toLowerCase().includes(query);
  });
  const missingInviteLinksCount = pendingBatch?.recipients.filter((recipient) => !recipient.inviteLink).length ?? 0;
  const previewRecipient = pendingBatch?.recipients[0];
  const previewMessage = pendingBatch && previewRecipient
    ? personalizeMessage(pendingBatch.message, previewRecipient)
    : '';

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    void getWhatsappStatus()
      .then((nextSnapshot) => setSnapshot(nextSnapshot))
      .catch((cause) => {
        appLogger.warn('whatsapp.status.load_failed', 'Failed loading WhatsApp status', {
          message: getFriendlyErrorMessage(cause, labels),
        });
      });
  }, [isDemoMode, labels]);

  const runWhatsappAction = async (action: 'connect' | 'refresh' | 'disconnect') => {
    setError(null);
    setLoadingWhatsapp(true);

    try {
      if (action === 'connect') {
        setSnapshot(await connectWhatsapp());
        appLogger.info('whatsapp.connect.started', 'WhatsApp connection started');
        showFeedback({
          type: 'success',
          title: labels.whatsappStarted,
          message: labels.whatsappStartedMessage,
        });
      }
      if (action === 'refresh') {
        setSnapshot(await getWhatsappQr());
        appLogger.info('whatsapp.qr.refreshed', 'WhatsApp QR refreshed');
        showFeedback({
          type: 'info',
          title: labels.qrRefreshStarted,
          message: labels.qrRefreshStartedMessage,
        });
      }
      if (action === 'disconnect') {
        await disconnectWhatsapp();
        setSnapshot({ hostId: '', status: 'DISCONNECTED', qrCode: null });
        appLogger.warn('whatsapp.disconnected', 'WhatsApp disconnected by user');
        showFeedback({
          type: 'success',
          title: labels.whatsappDisconnected,
          message: labels.whatsappDisconnectedMessage,
        });
      }
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      appLogger.warn('whatsapp.action.failed', 'WhatsApp action failed', { action, message });
      setError(message);
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message,
      });
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const copyInviteLink = async (inviteLink: string) => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showFeedback({
        type: 'success',
        title: labels.linkCopied,
        message: labels.linkCopiedMessage,
      });
    } catch (cause) {
      appLogger.warn('whatsapp.invite_link.copy_failed', 'Failed copying invite link', {
        message: getFriendlyErrorMessage(cause, labels),
      });
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: getFriendlyErrorMessage(cause, labels),
      });
    }
  };

  const sendBatch = async (recipients: WhatsappRecipient[], message: string) => {
    const personalizedRecipients = recipients.map((recipient) => {
      const guest = eventGuests.find((currentGuest) => normalizePhone(currentGuest.phoneNumber) === normalizePhone(recipient.phoneNumber));
      const personalInviteLink = guest ? buildGuestInviteLink(guest) : undefined;

      return {
        ...recipient,
        fullName: recipient.fullName || guest?.fullName,
        inviteLink: personalInviteLink ?? '',
      };
    });

    setPendingBatch({
      recipients: personalizedRecipients,
      message: `${message}\n\n{inviteLink}`,
    });
  };

  const confirmSendBatch = async () => {
    if (!pendingBatch) {
      return;
    }

    setSendLoading(true);

    try {
      const result = await sendWhatsappBatch(
        pendingBatch.recipients,
        pendingBatch.message,
      );
      appLogger.info('whatsapp.batch.queued', 'WhatsApp batch queued', {
        missingWhatsapp: result.missingWhatsapp.length,
        queued: result.queued,
        recipients: pendingBatch.recipients.length,
      });
      showFeedback({
        type: result.missingWhatsapp.length ? 'warning' : 'success',
        title: labels.messagesQueued,
        message: result.missingWhatsapp.length
          ? labels.missingWhatsappMessage.replace('{count}', String(result.missingWhatsapp.length))
          : `${result.queued} ${labels.messagesQueuedMessage}`,
      });
      setPendingBatch(null);
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      appLogger.warn('whatsapp.batch.failed', 'WhatsApp batch queue failed', { message });
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message,
      });
    } finally {
      setSendLoading(false);
    }
  };

  const sendEmailBatch = async (recipients: WhatsappRecipient[], message: string) => {
    try {
      const personalizedRecipients = recipients.map((recipient) => {
        const guest = eventGuests.find((currentGuest) => normalizePhone(currentGuest.phoneNumber) === normalizePhone(recipient.phoneNumber));
        const personalInviteLink = guest ? buildGuestInviteLink(guest) : undefined;

        return {
          ...recipient,
          fullName: recipient.fullName || guest?.fullName,
          inviteLink: personalInviteLink ?? recipient.inviteLink ?? '',
        };
      });
      const result = await sendInvitationEmailBatch(
        personalizedRecipients,
        `${message}\n\n{inviteLink}`,
      );
      showFeedback({
        type: result.failed.length ? 'warning' : 'success',
        title: labels.emailInvitationsSent,
        message: result.failed.length
          ? labels.emailInvitationsPartial.replace('{sent}', String(result.sent)).replace('{failed}', String(result.failed.length))
          : labels.emailInvitationsSentMessage.replace('{sent}', String(result.sent)),
      });
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      appLogger.warn('email.invitations.failed', 'Email invitation batch failed', { message });
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message,
      });
    }
  };

  return (
    <Stack gap="md" maw={820}>
      <Card className="studioCard" withBorder radius="sm" p="xl">
        <Stack gap="lg">
          <Group justify="space-between">
            <Box>
              <Title order={2}>{labels.connectWhatsapp}</Title>
              <Text size="sm" c="dimmed">{labels.apiHint}</Text>
            </Box>
            <Badge size="lg" color={statusColor[status]} leftSection={status === 'CONNECTED' ? <IconBrandWhatsapp size={uiConfig.icons.badge} /> : <IconWifiOff size={uiConfig.icons.badge} />}>
              {status === 'CONNECTED' ? labels.connected : status === 'QR_READY' ? labels.qrReady : labels.disconnected}
            </Badge>
          </Group>

          <Group>
            <Button loading={loadingWhatsapp} onClick={() => runWhatsappAction('connect')} leftSection={<IconBrandWhatsapp size={uiConfig.icons.button} />}>
              {labels.connect}
            </Button>
            <Button loading={loadingWhatsapp} variant="light" onClick={() => runWhatsappAction('refresh')} leftSection={<IconRefresh size={uiConfig.icons.button} />}>
              {labels.refreshQr}
            </Button>
            <Button loading={loadingWhatsapp} color="red" variant="subtle" onClick={() => runWhatsappAction('disconnect')} leftSection={<IconWifiOff size={uiConfig.icons.button} />}>
              {labels.disconnect}
            </Button>
          </Group>

          {snapshot?.qrCode && (
            <Box className="qrBox">
              <Image src={snapshot.qrCode} alt="WhatsApp QR" w={rem(240)} h={rem(240)} fit="contain" />
              <Text size="sm" fw={600}>{labels.scanQr}</Text>
            </Box>
          )}

          {error && <Text c="red" size="sm">{error}</Text>}
        </Stack>
      </Card>

      <PersonalInviteLinks
        guests={filteredInviteGuests}
        labels={labels}
        query={inviteQuery}
        onCopyInviteLink={copyInviteLink}
        onQueryChange={setInviteQuery}
      />

      <GoogleContactPicker labels={labels} isDemoMode={isDemoMode} onSend={sendBatch} onSendEmail={sendEmailBatch} />

      <ConfirmWhatsappSendModal
        isOpen={Boolean(pendingBatch)}
        labels={labels}
        loading={sendLoading}
        missingInviteLinksCount={missingInviteLinksCount}
        pendingBatch={pendingBatch}
        previewMessage={previewMessage}
        onClose={() => setPendingBatch(null)}
        onConfirm={confirmSendBatch}
      />
    </Stack>
  );
};
