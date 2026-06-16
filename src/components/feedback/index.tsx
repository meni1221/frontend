import { Box, Notification, Stack } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { uiConfig } from '../../config';
import { useComponentLogger } from '../../utils/component-logger';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

type FeedbackMessage = {
  id: number;
  message: string;
  title: string;
  type: FeedbackType;
};

type FeedbackContextValue = {
  showFeedback: (message: Omit<FeedbackMessage, 'id'>) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const feedbackColor: Record<FeedbackType, string> = {
  success: 'ishruGreen',
  error: 'red',
  info: 'blue',
  warning: 'yellow',
};

const feedbackIcon: Record<FeedbackType, ReactNode> = {
  success: <IconCircleCheck size={uiConfig.icons.alert} />,
  error: <IconX size={uiConfig.icons.alert} />,
  info: <IconInfoCircle size={uiConfig.icons.alert} />,
  warning: <IconAlertTriangle size={uiConfig.icons.alert} />,
};

const feedbackDuration: Record<FeedbackType, number> = {
  success: 4600,
  info: 5600,
  warning: 6800,
  error: 8200,
};

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  useComponentLogger('FeedbackProvider');
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const nextId = useRef(1);

  const closeFeedback = (id: number) => {
    setMessages((currentMessages) => currentMessages.filter((message) => message.id !== id));
  };

  const showFeedback = (message: Omit<FeedbackMessage, 'id'>) => {
    const id = nextId.current;
    nextId.current += 1;
    setMessages((currentMessages) => [...currentMessages, { ...message, id }]);
    window.setTimeout(() => closeFeedback(id), feedbackDuration[message.type]);
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      <Box className="feedbackStack">
        <Stack gap="xs">
          {messages.map((message) => (
            <Notification
              key={message.id}
              className={`feedbackNotification ${message.type}`}
              color={feedbackColor[message.type]}
              icon={feedbackIcon[message.type]}
              onClose={() => closeFeedback(message.id)}
              title={message.title}
              withBorder
            >
              {message.message}
            </Notification>
          ))}
        </Stack>
      </Box>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }

  return context;
};
