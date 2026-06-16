import { Button, Textarea } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { uiConfig } from '../../../config';

type SendActionsProps = {
  emailDisabled: boolean;
  emailLoading: boolean;
  labels: Record<string, string>;
  message: string;
  sendDisabled: boolean;
  sendLoading: boolean;
  onEmailSend: () => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
};

export const SendActions = ({
  emailDisabled,
  emailLoading,
  labels,
  message,
  sendDisabled,
  sendLoading,
  onEmailSend,
  onMessageChange,
  onSend,
}: SendActionsProps) => (
  <>
    <Textarea
      label={labels.messageToSend}
      value={message}
      onChange={(event) => onMessageChange(event.currentTarget.value)}
      minRows={5}
    />

    <Button
      disabled={sendDisabled}
      leftSection={<IconSend size={uiConfig.icons.button} />}
      loading={sendLoading}
      onClick={onSend}
    >
      {labels.queueMessages}
    </Button>

    <Button
      disabled={emailDisabled}
      variant="light"
      leftSection={<IconSend size={uiConfig.icons.button} />}
      loading={emailLoading}
      onClick={onEmailSend}
    >
      {labels.sendInvitationsByEmail}
    </Button>
  </>
);
