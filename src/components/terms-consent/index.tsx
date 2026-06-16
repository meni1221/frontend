import { Button, Checkbox, Group, List, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconShieldCheck } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { AppModal } from '../app-modal';
import { getCookie, setCookie } from '../../utils/cookies';
import { useComponentLogger } from '../../utils/component-logger';
import { termsSections } from '../../data';

type TermsConsentProps = {
  hostId: string;
  labels: Record<string, string>;
  onAccepted: () => void;
};

const cookieMaxAgeSeconds = 60 * 60 * 24 * 365;
const termsVersion = '2026-06-16';

const getTermsCookieName = (hostId: string) => `ishru-terms-${termsVersion}-accepted-${hostId}`;

export const TermsConsent = ({ hostId, labels, onAccepted }: TermsConsentProps) => {
  useComponentLogger('TermsConsent', { hostId });
  const [accepted, setAccepted] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const isAccepted = getCookie(getTermsCookieName(hostId)) === 'true';
    setOpened(!isAccepted);
    if (isAccepted) {
      onAccepted();
    }
  }, [hostId, onAccepted]);

  const approveTerms = () => {
    setCookie(getTermsCookieName(hostId), 'true', cookieMaxAgeSeconds);
    onAccepted();
    setOpened(false);
  };

  return (
    <AppModal
      opened={opened}
      onClose={() => undefined}
      title={labels.termsConsentTitle}
      size="lg"
      description={labels.termsConsentIntro}
      alertIcon={<IconShieldCheck size={uiConfig.icons.alert} />}
      blocking
      footer={(
        <Group justify="flex-end">
          <Button disabled={!accepted} leftSection={<IconShieldCheck size={uiConfig.icons.button} />} onClick={approveTerms}>
            {labels.confirmApproval}
          </Button>
        </Group>
      )}
    >
      <ScrollArea
        className="termsConsentScroll"
        h={300}
        offsetScrollbars
        onScrollPositionChange={({ y }) => {
          if (y > 180) {
            setHasReadTerms(true);
          }
        }}
      >
        <Stack gap="md" pe="sm">
          <Title order={3}>{labels.termsTitle}</Title>
          <Text c="dimmed">{labels.termsIntro}</Text>
          <Text fw={600}>{labels.termsEffectiveDate}</Text>

          {termsSections.map((section) => (
            <Stack gap="xs" key={section.titleKey}>
              <Title order={4}>{labels[section.titleKey]}</Title>
              <List spacing="xs">
                {section.bodyKeys.map((bodyKey) => (
                  <List.Item key={bodyKey}>{labels[bodyKey]}</List.Item>
                ))}
              </List>
            </Stack>
          ))}
        </Stack>
      </ScrollArea>

      <Checkbox
        checked={accepted}
        disabled={!hasReadTerms}
        label={hasReadTerms ? labels.termsReadAndAccepted : labels.termsScrollToApprove}
        onChange={(event) => setAccepted(event.currentTarget.checked)}
      />
    </AppModal>
  );
};
