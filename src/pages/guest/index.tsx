import { Badge, Box, Button, Card, Group, Loader, NumberInput, SimpleGrid, Stack, Text, Textarea, ThemeIcon, Title } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { IconCheck, IconHelp, IconPhone, IconX } from '@tabler/icons-react';
import { BitLogo } from '../../components/bit-logo';
import { BrandActionLogo } from '../../components/brand-action-logo';
import { ThemeIconMap } from '../../components/theme-icons';
import { uiConfig } from '../../config';
import { submitPublicRsvp } from '../../api';
import { EventCard, GuestRecord } from '../../data';
import { Locale } from '../../i18n';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { appLogger } from '../../utils/logger';
import { getEventWazeLink } from '../../utils/waze';

type GuestPanelProps = {
  event: EventCard | undefined;
  guest?: GuestRecord;
  invitationText: string;
  invitationTitle: string;
  labels: Record<string, string>;
  loading?: boolean;
  loadError?: string | null;
  locale: Locale;
  publicEventId?: string;
};

type RsvpChoice = 'confirmed' | 'maybe' | 'declined';

export const GuestPanel = ({ event, guest, invitationText, invitationTitle, labels, loading = false, loadError, locale, publicEventId }: GuestPanelProps) => {
  useComponentLogger('GuestPanel', { eventId: event?.id, inviteId: guest?.inviteId, locale });
  const [choice, setChoice] = useState<RsvpChoice>('confirmed');
  const [adults, setAdults] = useState<number | string>(2);
  const [children, setChildren] = useState<number | string>(0);
  const [notes, setNotes] = useState('');
  const [submittedChoice, setSubmittedChoice] = useState<RsvpChoice | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const maxAllowed = guest?.maxAllowed ?? 20;
  const selectedGuestsCount = (Number(adults) || 0) + (Number(children) || 0);
  const isOverGuestLimit = choice !== 'declined' && selectedGuestsCount > maxAllowed;
  const calendarLink = getGoogleCalendarLink(event);
  const personalizedInvitationText = personalizeInvitationText(invitationText, guest?.fullName);

  const submitRsvp = async () => {
    setRsvpError(null);
    if (isOverGuestLimit) {
      setRsvpError(labels.rsvpTooManyGuests.replace('{maxAllowed}', String(maxAllowed)));
      return;
    }

    setRsvpLoading(true);

    try {
      if (guest?.inviteId) {
        await submitPublicRsvp(
          guest.inviteId,
          {
            status: choice,
            adults: choice === 'declined' ? 0 : Number(adults) || 0,
            children: choice === 'declined' ? 0 : Number(children) || 0,
            notes,
          },
          publicEventId ?? guest.eventId,
        );
      }

      setSubmittedChoice(choice);
      appLogger.info('guest.rsvp.submitted', 'Guest submitted RSVP', { choice, inviteId: guest?.inviteId });
    } catch (cause) {
      appLogger.warn('guest.rsvp.failed', 'Guest RSVP failed', { inviteId: guest?.inviteId, message: getFriendlyErrorMessage(cause, labels) });
      setRsvpError(getFriendlyErrorMessage(cause, labels));
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <Box className="guestSurface">
      <Card className="guestInvite" withBorder radius="sm" p="xl">
        {loading ? (
          <Stack align="center" gap="md" py="xl">
            <Loader color="ishruGreen" />
            <Text fw={800}>{labels.loadingInvitation}</Text>
          </Stack>
        ) : loadError ? (
          <Stack align="center" gap="md" py="xl" ta="center">
            <ThemeIcon size={58} radius="xl" color="red" variant="light">
              <IconX size={uiConfig.icons.emptyState} />
            </ThemeIcon>
            <Title order={2}>{labels.invitationNotFound}</Title>
            <Text c="dimmed">{loadError}</Text>
          </Stack>
        ) : (
        <Stack gap="xl">
          <Group justify="space-between" align="flex-start">
            <Group gap="sm">
              <ThemeIcon size={54} radius="xl" variant="light" color="ishruGreen">
                {event ? ThemeIconMap[event.theme] : null}
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">{labels.guestExperience}</Text>
                <Title order={1}>{invitationTitle}</Title>
                {guest && <Text fw={800}>{guest.fullName}</Text>}
              </Box>
            </Group>
            <Badge variant="light">{event ? new Date(event.eventDate).toLocaleDateString(locale) : ''}</Badge>
          </Group>

          <Text className="guestMessage">{personalizedInvitationText}</Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <GuestAction icon={<BrandActionLogo brand="waze" />} label={labels.openWaze} href={getEventWazeLink(event)} />
            <GuestAction icon={<BrandActionLogo brand="calendar" />} label={labels.addToGoogleCalendar} href={calendarLink} />
            <GuestAction icon={<BitLogo size="md" />} label={labels.sendGift} href={event?.bitLink} />
            <GuestAction icon={<IconPhone size={uiConfig.icons.alert} />} label={labels.contactHost} href={`tel:${event?.adminPhoneNumber ?? ''}`} />
          </SimpleGrid>

          {submittedChoice ? (
            <RsvpThankYou labels={labels} choice={submittedChoice} guestName={guest?.fullName} onEdit={() => setSubmittedChoice(null)} />
          ) : (
            <Card className="rsvpCard" withBorder radius="sm" p="lg">
              <Stack gap="md">
                <Title order={3}>{labels.rsvpQuestion}</Title>
                <Group grow>
                  <Button variant={choice === 'confirmed' ? 'filled' : 'light'} leftSection={<IconCheck size={uiConfig.icons.button} />} onClick={() => setChoice('confirmed')}>
                    {labels.approveArrival}
                  </Button>
                  <Button variant={choice === 'maybe' ? 'filled' : 'light'} color="yellow" leftSection={<IconHelp size={uiConfig.icons.button} />} onClick={() => setChoice('maybe')}>
                    {labels.maybeArrival}
                  </Button>
                  <Button variant={choice === 'declined' ? 'filled' : 'light'} color="red" leftSection={<IconX size={uiConfig.icons.button} />} onClick={() => setChoice('declined')}>
                    {labels.declineArrival}
                  </Button>
                </Group>
                {choice !== 'declined' && (
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <NumberInput label={labels.adults} min={0} max={maxAllowed} value={adults} onChange={setAdults} required />
                    <NumberInput label={labels.children} min={0} max={maxAllowed} value={children} onChange={setChildren} required />
                  </SimpleGrid>
                )}
                {choice !== 'declined' && (
                  <Text size="sm" c={isOverGuestLimit ? 'red' : 'dimmed'} fw={isOverGuestLimit ? 800 : 500}>
                    {isOverGuestLimit
                      ? labels.rsvpTooManyGuests.replace('{maxAllowed}', String(maxAllowed))
                      : labels.rsvpMaxAllowed.replace('{maxAllowed}', String(maxAllowed))}
                  </Text>
                )}
                <Textarea label={labels.notes} value={notes} onChange={(event) => setNotes(event.currentTarget.value)} minRows={3} />
                {rsvpError && <Text size="sm" c="red">{rsvpError}</Text>}
                <Button variant="filled" loading={rsvpLoading} disabled={isOverGuestLimit} onClick={submitRsvp}>{labels.sendRsvp}</Button>
              </Stack>
            </Card>
          )}
        </Stack>
        )}
      </Card>
    </Box>
  );
};

const getGoogleCalendarLink = (event: EventCard | undefined) => {
  if (!event?.eventDate) {
    return undefined;
  }

  const start = new Date(event.eventDate);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const formatDate = (date: Date) => date.toISOString().replaceAll('-', '').replaceAll(':', '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.eventName,
    dates: `${formatDate(start)}/${formatDate(end)}`,
    details: event.venueName,
    location: event.address || event.venueName,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const personalizeInvitationText = (text: string, fullName?: string) => {
  const trimmedName = fullName?.trim();

  if (!trimmedName) {
    return text.replaceAll('{fullName}', '');
  }

  if (text.includes('{fullName}')) {
    return text.replaceAll('{fullName}', trimmedName);
  }

  return `${trimmedName},\n\n${text}`;
};

const thankYouMessageKey: Record<RsvpChoice, string> = {
  confirmed: 'rsvpConfirmedThanks',
  maybe: 'rsvpMaybeThanks',
  declined: 'rsvpDeclinedThanks',
};

const RsvpThankYou = ({
  choice,
  labels,
  guestName,
  onEdit,
}: {
  choice: RsvpChoice;
  guestName?: string;
  labels: Record<string, string>;
  onEdit: () => void;
}) => (
  <Card className="rsvpCard rsvpThanksCard" withBorder radius="sm" p="xl">
    <Stack gap="md" align="center" ta="center">
      <ThemeIcon size={64} radius="xl" color={choice === 'declined' ? 'red' : choice === 'maybe' ? 'yellow' : 'ishruGreen'}>
        {choice === 'declined' ? <IconX size={uiConfig.icons.thankYou} /> : choice === 'maybe' ? <IconHelp size={uiConfig.icons.thankYou} /> : <IconCheck size={uiConfig.icons.thankYou} />}
      </ThemeIcon>
      <Title order={2}>{labels.rsvpThanksTitle}</Title>
      {guestName && <Text fw={900}>{guestName}</Text>}
      <Text c="dimmed" maw={520}>{labels[thankYouMessageKey[choice]]}</Text>
      <Button variant="light" onClick={onEdit}>{labels.editRsvp}</Button>
    </Stack>
  </Card>
);

const GuestAction = ({ icon, label, href }: { icon: ReactNode; label: string; href?: string }) => (
  <Button className="guestActionButton" component={href ? 'a' : 'button'} href={href} variant="light" justify="flex-start" leftSection={icon}>
    {label}
  </Button>
);
