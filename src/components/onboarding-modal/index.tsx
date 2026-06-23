import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ReactNode, useState } from 'react';
import { IconArmchair, IconCalendarPlus, IconEdit, IconSend, IconUsers } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { AppTab } from '../../data';
import { AppModal } from '../app-modal';
import { useComponentLogger } from '../../utils/component-logger';

type OnboardingModalProps = {
  actionLoading?: boolean;
  labels: Record<string, string>;
  onComplete: () => Promise<void> | void;
  onNavigate: (tab: AppTab) => void;
  onSkip: () => Promise<void> | void;
  opened: boolean;
};

type OnboardingStep = {
  icon: ReactNode;
  labelKey: string;
  tab: AppTab;
  textKey: string;
};

const onboardingSteps: OnboardingStep[] = [
  {
    icon: <IconCalendarPlus size={uiConfig.icons.nav} />,
    labelKey: 'onboardingEventsTitle',
    tab: 'events',
    textKey: 'onboardingEventsText',
  },
  {
    icon: <IconUsers size={uiConfig.icons.nav} />,
    labelKey: 'onboardingGuestsTitle',
    tab: 'audience',
    textKey: 'onboardingGuestsText',
  },
  {
    icon: <IconEdit size={uiConfig.icons.nav} />,
    labelKey: 'onboardingInvitationsTitle',
    tab: 'invitations',
    textKey: 'onboardingInvitationsText',
  },
  {
    icon: <IconSend size={uiConfig.icons.nav} />,
    labelKey: 'onboardingWhatsappTitle',
    tab: 'audience',
    textKey: 'onboardingWhatsappText',
  },
  {
    icon: <IconArmchair size={uiConfig.icons.nav} />,
    labelKey: 'onboardingSeatingTitle',
    tab: 'seating',
    textKey: 'onboardingSeatingText',
  },
];

export const OnboardingModal = ({
  actionLoading = false,
  labels,
  onComplete,
  onNavigate,
  onSkip,
  opened,
}: OnboardingModalProps) => {
  useComponentLogger('OnboardingModal', { opened });
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = onboardingSteps[activeIndex];
  const isLastStep = activeIndex === onboardingSteps.length - 1;

  const navigateToStep = () => {
    onNavigate(activeStep.tab);
  };

  const moveNext = () => {
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, onboardingSteps.length - 1));
  };

  const moveBack = () => {
    setActiveIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  return (
    <AppModal
      opened={opened}
      onClose={onSkip}
      title={labels.onboardingTitle}
      description={labels.onboardingDescription}
      size="lg"
      alertIcon={activeStep.icon}
      footer={(
        <Group justify="space-between">
          <Button variant="subtle" loading={actionLoading} onClick={onSkip}>
            {labels.skipOnboarding}
          </Button>
          <Group gap="xs">
            <Button variant="default" disabled={activeIndex === 0 || actionLoading} onClick={moveBack}>
              {labels.back}
            </Button>
            <Button variant="light" disabled={actionLoading} onClick={navigateToStep}>
              {labels.openFeature}
            </Button>
            {isLastStep ? (
              <Button loading={actionLoading} onClick={onComplete}>{labels.finishOnboarding}</Button>
            ) : (
              <Button disabled={actionLoading} onClick={moveNext}>{labels.next}</Button>
            )}
          </Group>
        </Group>
      )}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Badge variant="light">
            {activeIndex + 1}/{onboardingSteps.length}
          </Badge>
          <Text size="sm" c="dimmed">{labels.onboardingSavedHint}</Text>
        </Group>

        <Card withBorder radius="sm" p="lg">
          <Group align="flex-start" gap="md">
            <ThemeIcon size="xl" radius="xl" color="ishruGreen" variant="light">
              {activeStep.icon}
            </ThemeIcon>
            <Stack gap={4}>
              <Title order={3}>{labels[activeStep.labelKey]}</Title>
              <Text c="dimmed">{labels[activeStep.textKey]}</Text>
            </Stack>
          </Group>
        </Card>

        <SimpleGrid cols={{ base: 1, sm: 5 }} spacing="xs">
          {onboardingSteps.map((step, index) => (
            <Button
              key={step.labelKey}
              variant={index === activeIndex ? 'filled' : 'light'}
              leftSection={step.icon}
              onClick={() => setActiveIndex(index)}
            >
              {labels[step.labelKey]}
            </Button>
          ))}
        </SimpleGrid>
      </Stack>
    </AppModal>
  );
};
