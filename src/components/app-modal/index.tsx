import { Alert, Modal, Stack } from '@mantine/core';
import { ReactNode } from 'react';
import { useComponentLogger } from '../../utils/component-logger';

type AppModalProps = {
  alertColor?: string;
  alertIcon?: ReactNode;
  blocking?: boolean;
  centered?: boolean;
  children: ReactNode;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  opened: boolean;
  size?: string;
  title: string;
  withCloseButton?: boolean;
};

export const AppModal = ({
  alertColor = 'ishruGreen',
  alertIcon,
  blocking = false,
  centered = true,
  children,
  closeOnClickOutside = true,
  closeOnEscape = true,
  description,
  footer,
  onClose,
  opened,
  size,
  title,
  withCloseButton = true,
}: AppModalProps) => {
  useComponentLogger('AppModal', { blocking, opened, title });

  return (
    <Modal
      centered={centered}
      closeOnClickOutside={blocking ? false : closeOnClickOutside}
      closeOnEscape={blocking ? false : closeOnEscape}
      onClose={blocking ? () => undefined : onClose}
      opened={opened}
      size={size}
      title={title}
      withCloseButton={blocking ? false : withCloseButton}
    >
      <Stack gap="md">
        {description && (
          <Alert icon={alertIcon} color={alertColor} variant="light">
            {description}
          </Alert>
        )}

        {children}
        {footer}
      </Stack>
    </Modal>
  );
};
