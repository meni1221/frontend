import { ActionIcon, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCookie, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { uiConfig } from '../../config';
import { useComponentLogger } from '../../utils/component-logger';

type CookieConsentProps = {
  labels: Record<string, string>;
};

const cookieConsentKey = 'ishru-cookie-consent-v1';

export const CookieConsent = ({ labels }: CookieConsentProps) => {
  const [visible, setVisible] = useState(false);
  useComponentLogger('CookieConsent', { visible });

  useEffect(() => {
    setVisible(window.localStorage.getItem(cookieConsentKey) !== 'accepted');
  }, []);

  const acceptCookies = () => {
    window.localStorage.setItem(cookieConsentKey, 'accepted');
    setVisible(false);
  };

  const hideForNow = () => {
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Paper className="cookieConsent" withBorder radius="sm" p="md" shadow="lg">
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <ThemeIcon color="ishruGreen" size="lg" radius="xl" variant="light">
          <IconCookie size={uiConfig.icons.cookie} />
        </ThemeIcon>

        <Stack gap={4} className="cookieConsentText">
          <Text fw={900}>{labels.cookieConsentTitle}</Text>
          <Text size="sm" c="dimmed">{labels.cookieConsentDescription}</Text>
        </Stack>

        <Group gap="xs" wrap="nowrap">
          <Button size="xs" onClick={acceptCookies}>
            {labels.cookieConsentAccept}
          </Button>
          <ActionIcon variant="subtle" color="gray" onClick={hideForNow} aria-label={labels.cancel}>
            <IconX size={uiConfig.icons.button} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
};
