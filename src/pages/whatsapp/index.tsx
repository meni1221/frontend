import { Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  connectWhatsapp,
  disconnectWhatsapp,
  getApiOrigin,
  getStoredSession,
  getWhatsappQr,
  getWhatsappQueueState,
  getWhatsappSendHistory,
  getWhatsappStatus,
  pauseWhatsappBatch,
  resumeWhatsappBatch,
  retryFailedWhatsappBatch,
  sendInvitationEmailBatch,
  sendWhatsappBatch,
  sendWhatsappTest,
  stopWhatsappBatch,
  WhatsappBatchHistoryEntry,
  WhatsappQueueSnapshot,
  WhatsappRecipient,
  WhatsappSnapshot,
  WhatsappStatus,
} from '../../api';
import { useFeedback } from '../../components/feedback';
import { GoogleContactPicker } from '../../components/google-contact-picker';
import { EventCard, GuestRecord } from '../../data';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { buildGuestInviteLink } from '../../utils/invite-link';
import { appLogger } from '../../utils/logger';
import { ConfirmWhatsappSendModal } from './components/confirm-whatsapp-send-modal';
import { EventWhatsappSender } from './components/event-whatsapp-sender';
import { PersonalInviteLinks } from './components/personal-invite-links';
import { WhatsappConnectionCard } from './components/whatsapp-connection-card';
import { WhatsappQueueMonitor } from './components/whatsapp-queue-monitor';
import { normalizePhone, personalizeMessage } from './helpers';

type GuestFilter = 'all' | 'pending' | 'maybe' | 'confirmed';

const emptyQueueSnapshot: WhatsappQueueSnapshot = {
  batchId: null,
  items: [],
  progress: { failed: 0, queued: 0, sent: 0, skipped: 0, total: 0 },
  status: 'IDLE',
};

const messageTemplates = [
  {
    key: 'invite',
    label: 'הזמנה ראשונה',
    message: 'היי {fullName}, זו ההזמנה שלך. נשמח לאישור הגעה דרך הקישור: {inviteLink}',
  },
  {
    key: 'reminder',
    label: 'תזכורת',
    message: 'היי {fullName}, תזכורת קטנה לאשר הגעה לאירוע בקישור האישי שלך: {inviteLink}',
  },
  {
    key: 'thanks',
    label: 'תודה',
    message: 'היי {fullName}, תודה שחגגת איתנו. שמחנו לראות אותך!',
  },
  {
    key: 'update',
    label: 'עדכון פרטים',
    message: 'היי {fullName}, עדכון חשוב לגבי האירוע נמצא בקישור האישי שלך: {inviteLink}',
  },
];

const mergeWhatsappSnapshot = (
  currentSnapshot: WhatsappSnapshot | null,
  nextSnapshot: WhatsappSnapshot,
): WhatsappSnapshot => {
  if (
    currentSnapshot?.connectionId === nextSnapshot.connectionId
    && currentSnapshot.qrCode
    && nextSnapshot.status === 'QR_READY'
    && !nextSnapshot.qrCode
  ) {
    return {
      ...nextSnapshot,
      qrCode: currentSnapshot.qrCode,
    };
  }

  return nextSnapshot;
};

type WhatsappPanelProps = {
  labels: Record<string, string>;
  guests: GuestRecord[];
  isDemoMode?: boolean;
  selectedEvent: EventCard | undefined;
  statusSnapshot?: WhatsappSnapshot | null;
};

export const WhatsappPanel = ({
  guests,
  labels,
  selectedEvent,
  isDemoMode = false,
  statusSnapshot,
}: WhatsappPanelProps) => {
  useComponentLogger('WhatsappPanel', { selectedEventId: selectedEvent?.id, guests: guests.length });

  const { showFeedback } = useFeedback();
  const [snapshot, setSnapshot] = useState<WhatsappSnapshot | null>(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteQuery, setInviteQuery] = useState('');
  const [pendingBatch, setPendingBatch] = useState<{ allowResend?: boolean; eventId?: string; recipients: WhatsappRecipient[]; message: string } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [guestFilter, setGuestFilter] = useState<GuestFilter>('pending');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [guestMessage, setGuestMessage] = useState(labels.defaultWhatsappMessage || messageTemplates[0].message);
  const [allowResend, setAllowResend] = useState(false);
  const [queueSnapshot, setQueueSnapshot] = useState<WhatsappQueueSnapshot>(emptyQueueSnapshot);
  const [history, setHistory] = useState<WhatsappBatchHistoryEntry[]>([]);
  const [queueActionLoading, setQueueActionLoading] = useState(false);

  const status = snapshot?.status ?? 'DISCONNECTED';
  const eventGuests = guests.filter((guest) => guest.eventId === selectedEvent?.id);
  const guestsForWhatsapp = eventGuests.filter((guest) => guestFilter === 'all' || guest.status === guestFilter);
  const guestsForWhatsappKey = guestsForWhatsapp.map((guest) => guest.id).join('|');
  const filteredInviteGuests = eventGuests.filter((guest) => {
    const query = inviteQuery.trim().toLowerCase();
    return !query || `${guest.fullName} ${guest.phoneNumber} ${guest.inviteId}`.toLowerCase().includes(query);
  });
  const missingInviteLinksCount = pendingBatch?.recipients.filter((recipient) => !recipient.inviteLink).length ?? 0;
  const previewRecipient = pendingBatch?.recipients[0];
  const previewMessage = pendingBatch && previewRecipient ? personalizeMessage(pendingBatch.message, previewRecipient) : '';
  const queueProgressValue = queueSnapshot.progress.total
    ? Math.round(((queueSnapshot.progress.sent + queueSnapshot.progress.failed + queueSnapshot.progress.skipped) / queueSnapshot.progress.total) * 100)
    : 0;
  const estimatedSecondsLeft = queueSnapshot.status === 'RUNNING' || queueSnapshot.status === 'PAUSED'
    ? queueSnapshot.progress.queued * 4
    : 0;

  const t = (key: string, fallback: string) => labels[key] ?? fallback;

  useEffect(() => {
    if (statusSnapshot) {
      setSnapshot((currentSnapshot) => mergeWhatsappSnapshot(currentSnapshot, statusSnapshot));
    }
  }, [statusSnapshot]);

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    void getWhatsappStatus()
      .then((nextSnapshot) => setSnapshot((currentSnapshot) => mergeWhatsappSnapshot(currentSnapshot, nextSnapshot)))
      .catch((cause) => {
        appLogger.warn('whatsapp.status.load_failed', 'Failed loading WhatsApp status', {
          message: getFriendlyErrorMessage(cause, labels),
        });
      });
  }, [isDemoMode, labels]);

  useEffect(() => {
    setSelectedGuestIds([]);
  }, [selectedEvent?.id, guestFilter, guestsForWhatsappKey]);

  useEffect(() => {
    if (isDemoMode) {
      return undefined;
    }

    let isActive = true;

    const refreshQueue = async () => {
      try {
        const [nextSnapshot, nextHistory] = await Promise.all([
          getWhatsappQueueState(),
          getWhatsappSendHistory(selectedEvent?.id),
        ]);

        if (isActive) {
          setQueueSnapshot(nextSnapshot);
          setHistory(nextHistory);
        }
      } catch (cause) {
        appLogger.warn('whatsapp.queue.refresh_failed', 'Failed refreshing WhatsApp queue state', {
          message: getFriendlyErrorMessage(cause, labels),
        });
      }
    };

    void refreshQueue();
    const interval = window.setInterval(refreshQueue, 2000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [isDemoMode, labels, selectedEvent?.id]);

  useEffect(() => {
    if (isDemoMode) {
      return undefined;
    }

    const session = getStoredSession();
    if (!session?.accessToken) {
      return undefined;
    }

    let isActive = true;
    const socket = io(`${getApiOrigin()}/whatsapp-ws`, {
      auth: { token: session.accessToken },
      transports: ['websocket'],
    });

    const applyQueueSnapshot = (nextSnapshot: WhatsappQueueSnapshot) => {
      if (isActive) {
        setQueueSnapshot(nextSnapshot);
      }
    };

    socket.on('connect', () => {
      socket.emit('watch-host');
    });
    socket.on('whatsapp-queue', applyQueueSnapshot);

    return () => {
      isActive = false;
      socket.off('whatsapp-queue', applyQueueSnapshot);
      socket.disconnect();
    };
  }, [isDemoMode]);

  const runWhatsappAction = async (action: 'connect' | 'refresh' | 'disconnect') => {
    setError(null);
    setLoadingWhatsapp(true);

    try {
      if (action === 'connect') {
        setSnapshot(await connectWhatsapp());
        showFeedback({ type: 'success', title: labels.whatsappStarted, message: labels.whatsappStartedMessage });
      }

      if (action === 'refresh') {
        setSnapshot(await getWhatsappQr());
        showFeedback({ type: 'info', title: labels.qrRefreshStarted, message: labels.qrRefreshStartedMessage });
      }

      if (action === 'disconnect') {
        await disconnectWhatsapp();
        setSnapshot({
          connectionId: 'default',
          displayName: snapshot?.displayName ?? 'Main WhatsApp',
          hostId: snapshot?.hostId ?? '',
          qrCode: null,
          status: 'DISCONNECTED' as WhatsappStatus,
        });
        showFeedback({ type: 'success', title: labels.whatsappDisconnected, message: labels.whatsappDisconnectedMessage });
      }
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      appLogger.warn('whatsapp.action.failed', 'WhatsApp action failed', { action, message });
      setError(message);
      showFeedback({ type: 'error', title: labels.actionFailed, message });
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const copyInviteLink = async (inviteLink: string) => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      showFeedback({ type: 'success', title: labels.linkCopied, message: labels.linkCopiedMessage });
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      appLogger.warn('whatsapp.invite_link.copy_failed', 'Failed copying invite link', { message });
      showFeedback({ type: 'error', title: labels.actionFailed, message });
    }
  };

  const buildPersonalizedRecipients = (recipients: WhatsappRecipient[]) =>
    recipients.map((recipient) => {
      const guest = eventGuests.find((currentGuest) => normalizePhone(currentGuest.phoneNumber) === normalizePhone(recipient.phoneNumber));
      const personalInviteLink = guest ? buildGuestInviteLink(guest) : undefined;

      return {
        ...recipient,
        fullName: recipient.fullName || guest?.fullName,
        guestId: recipient.guestId || guest?.id,
        inviteLink: personalInviteLink ?? recipient.inviteLink ?? '',
      };
    });

  const sendBatch = async (recipients: WhatsappRecipient[], message: string) => {
    setPendingBatch({
      eventId: selectedEvent?.id,
      message: `${message}\n\n{inviteLink}`,
      recipients: buildPersonalizedRecipients(recipients),
    });
  };

  const toggleGuest = (guestId: string, checked: boolean) => {
    setSelectedGuestIds((currentIds) =>
      checked ? [...new Set([...currentIds, guestId])] : currentIds.filter((currentId) => currentId !== guestId),
    );
  };

  const queueSelectedGuests = () => {
    const selectedVisibleGuestIds = new Set(selectedGuestIds);
    const recipients = guestsForWhatsapp
      .filter((guest) => selectedVisibleGuestIds.has(guest.id))
      .map((guest) => ({
        fullName: guest.fullName,
        guestId: guest.id,
        inviteLink: buildGuestInviteLink(guest),
        phoneNumber: guest.phoneNumber,
      }));

    if (!recipients.length || !selectedVisibleGuestIds.size) {
      return;
    }

    setPendingBatch({
      allowResend,
      eventId: selectedEvent?.id,
      message: guestMessage,
      recipients,
    });
  };

  const sendTestMessage = async () => {
    const phoneNumber = selectedEvent?.adminPhoneNumber?.trim();
    if (!phoneNumber) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: t('missingTestPhone', 'צריך להגדיר מספר טלפון באירוע כדי לשלוח בדיקה.'),
      });
      return;
    }

    setQueueActionLoading(true);
    try {
      await sendWhatsappTest(phoneNumber, personalizeMessage(guestMessage, {
        fullName: selectedEvent?.eventName ?? '',
        inviteLink: window.location.origin,
        phoneNumber,
      }));
      showFeedback({
        type: 'success',
        title: t('testMessageSent', 'הודעת בדיקה נשלחה'),
        message: t('testMessageSentMessage', 'בדוק את WhatsApp במכשיר לפני שליחה למוזמנים.'),
      });
    } catch (cause) {
      showFeedback({ type: 'error', title: labels.actionFailed, message: getFriendlyErrorMessage(cause, labels) });
    } finally {
      setQueueActionLoading(false);
    }
  };

  const updateQueue = async (action: () => Promise<WhatsappQueueSnapshot>) => {
    setQueueActionLoading(true);
    try {
      setQueueSnapshot(await action());
    } catch (cause) {
      showFeedback({ type: 'error', title: labels.actionFailed, message: getFriendlyErrorMessage(cause, labels) });
    } finally {
      setQueueActionLoading(false);
    }
  };

  const retryFailed = async () => {
    setQueueActionLoading(true);
    try {
      const result = await retryFailedWhatsappBatch();
      showFeedback({ type: 'success', title: labels.messagesQueued, message: `${result.queued} ${labels.messagesQueuedMessage}` });
    } catch (cause) {
      showFeedback({ type: 'error', title: labels.actionFailed, message: getFriendlyErrorMessage(cause, labels) });
    } finally {
      setQueueActionLoading(false);
    }
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
        { allowResend: pendingBatch.allowResend, eventId: pendingBatch.eventId },
      );
      showFeedback({
        type: result.missingWhatsapp.length ? 'warning' : 'success',
        title: labels.messagesQueued,
        message: result.missingWhatsapp.length
          ? labels.missingWhatsappMessage.replace('{count}', String(result.missingWhatsapp.length))
          : `${result.queued} ${labels.messagesQueuedMessage}`,
      });
      setPendingBatch(null);
      setSelectedGuestIds([]);
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      appLogger.warn('whatsapp.batch.failed', 'WhatsApp batch queue failed', { message });
      showFeedback({ type: 'error', title: labels.actionFailed, message });
    } finally {
      setSendLoading(false);
    }
  };

  const sendEmailBatch = async (recipients: WhatsappRecipient[], message: string) => {
    try {
      const result = await sendInvitationEmailBatch(
        buildPersonalizedRecipients(recipients),
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
      showFeedback({ type: 'error', title: labels.actionFailed, message });
    }
  };

  return (
    <Stack gap="md" maw={820}>
      <WhatsappConnectionCard
        error={error}
        labels={labels}
        loading={loadingWhatsapp}
        snapshot={snapshot}
        status={status}
        onAction={runWhatsappAction}
      />

      <PersonalInviteLinks
        guests={filteredInviteGuests}
        labels={labels}
        query={inviteQuery}
        onCopyInviteLink={copyInviteLink}
        onQueryChange={setInviteQuery}
      />

      <EventWhatsappSender
        allowResend={allowResend}
        guestFilter={guestFilter}
        guestMessage={guestMessage}
        guests={guestsForWhatsapp}
        labels={labels}
        queueActionLoading={queueActionLoading}
        selectedGuestIds={selectedGuestIds}
        templates={messageTemplates}
        t={t}
        onAllowResendChange={setAllowResend}
        onGuestFilterChange={setGuestFilter}
        onGuestMessageChange={setGuestMessage}
        onQueueSelectedGuests={queueSelectedGuests}
        onSendTestMessage={sendTestMessage}
        onTemplateSelect={setGuestMessage}
        onToggleGuest={toggleGuest}
      />

      <WhatsappQueueMonitor
        estimatedSecondsLeft={estimatedSecondsLeft}
        history={history}
        labels={labels}
        loading={queueActionLoading}
        progressValue={queueProgressValue}
        queueSnapshot={queueSnapshot}
        t={t}
        onPause={() => updateQueue(pauseWhatsappBatch)}
        onResume={() => updateQueue(resumeWhatsappBatch)}
        onRetryFailed={retryFailed}
        onStop={() => updateQueue(stopWhatsappBatch)}
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
