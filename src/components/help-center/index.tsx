import { Accordion, Button, Stack, Text } from '@mantine/core';
import { IconHelpCircle, IconRoute } from '@tabler/icons-react';
import { uiConfig } from '../../config';
import { useComponentLogger } from '../../utils/component-logger';
import { AppModal } from '../app-modal';

type HelpCenterProps = {
  labels: Record<string, string>;
  onClose: () => void;
  onStartTour?: () => void;
  opened: boolean;
};

const faqItems = [
  {
    answerKey: 'faqCreateEventAnswer',
    questionKey: 'faqCreateEventQuestion',
  },
  {
    answerKey: 'faqGuestLoginAnswer',
    questionKey: 'faqGuestLoginQuestion',
  },
  {
    answerKey: 'faqInviteIdAnswer',
    questionKey: 'faqInviteIdQuestion',
  },
  {
    answerKey: 'faqWhatsappAnswer',
    questionKey: 'faqWhatsappQuestion',
  },
  {
    answerKey: 'faqGoogleAnswer',
    questionKey: 'faqGoogleQuestion',
  },
] as const;

export const HelpCenter = ({ labels, onClose, onStartTour, opened }: HelpCenterProps) => {
  useComponentLogger('HelpCenter', { opened });

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={labels.helpCenter}
      size="lg"
      description={labels.helpIntro}
      alertColor="teal"
      alertIcon={<IconHelpCircle size={uiConfig.icons.alert} />}
    >
      <Stack gap="md">
        {onStartTour && (
          <Button
            variant="light"
            leftSection={<IconRoute size={uiConfig.icons.button} />}
            onClick={() => {
              onClose();
              onStartTour();
            }}
          >
            {labels.startSystemTour}
          </Button>
        )}

        <Accordion variant="separated" radius="md" defaultValue={faqItems[0].questionKey}>
          {faqItems.map((item) => (
            <Accordion.Item key={item.questionKey} value={item.questionKey}>
              <Accordion.Control>
                <Text fw={800}>{labels[item.questionKey]}</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text className="helpAnswer" size="sm" c="dimmed">
                  {labels[item.answerKey]}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Stack>
    </AppModal>
  );
};
