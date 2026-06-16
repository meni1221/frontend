import { Alert, Card, List, Stack, Text, Title } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { termsSections } from '../../data';

type TermsPanelProps = {
  labels: Record<string, string>;
};

export const TermsPanel = ({ labels }: TermsPanelProps) => (
  <Card className="studioCard" withBorder radius="sm" p="xl" maw={920}>
    <Stack gap="md">
      <Alert icon={<IconShieldCheck size={uiConfig.icons.alert} />} color="ishruGreen" variant="light">
        {labels.termsLegalNotice}
      </Alert>

      <Title order={2}>{labels.termsTitle}</Title>
      <Text c="dimmed">{labels.termsIntro}</Text>
      <Text fw={600}>{labels.termsEffectiveDate}</Text>

      {termsSections.map((section) => (
        <Stack gap="xs" key={section.titleKey}>
          <Title order={3}>{labels[section.titleKey]}</Title>
          <List spacing="xs">
            {section.bodyKeys.map((bodyKey) => (
              <List.Item key={bodyKey}>{labels[bodyKey]}</List.Item>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  </Card>
);
