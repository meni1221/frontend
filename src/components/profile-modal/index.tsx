import { Alert, Button, Divider, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconDeviceMobile, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import { AuthSession, changeCurrentPassword, updateCurrentProfile } from '../../api';
import { uiConfig } from '../../config';
import { AppModal } from '../app-modal';
import { useFeedback } from '../feedback';
import { PasswordStrengthMeter } from '../password-strength-meter';
import { useComponentLogger } from '../../utils/component-logger';
import { getFriendlyErrorMessage } from '../../utils/error-message';
import { sanitizeEmailInput, sanitizeNameInput, sanitizePhoneInput } from '../../utils/input-sanitize';
import { appLogger } from '../../utils/logger';
import { getPasswordStrength } from '../../utils/password-strength';
import { validateEmail, validateName, validatePhone } from '../../utils/validation';

type ProfileModalProps = {
  labels: Record<string, string>;
  isDemoMode?: boolean;
  onClose: () => void;
  onSaved: (session: AuthSession) => void;
  opened: boolean;
  required: boolean;
  session: AuthSession;
};

type FormErrors = {
  email: string | null;
  fullName: string | null;
  phoneNumber: string | null;
};

const getInitialErrors = (): FormErrors => ({
  email: null,
  fullName: null,
  phoneNumber: null,
});

export const ProfileModal = ({ isDemoMode = false, labels, onClose, onSaved, opened, required, session }: ProfileModalProps) => {
  useComponentLogger('ProfileModal', { opened, profileCompleted: session.profileCompleted, required });
  const { showFeedback } = useFeedback();
  const [email, setEmail] = useState(session.email);
  const [fullName, setFullName] = useState(session.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(session.phoneNumber ?? '');
  const [errors, setErrors] = useState<FormErrors>(getInitialErrors);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const passwordStrength = getPasswordStrength(newPassword);
  useEffect(() => {
    if (!opened) {
      return;
    }

    setEmail(session.email);
    setFullName(session.fullName ?? '');
    setPhoneNumber(session.phoneNumber ?? '');
    setErrors(getInitialErrors());
    setFormError(null);
    setCurrentPassword('');
    setNewPassword('');
  }, [opened, session.email, session.fullName, session.phoneNumber]);

  const title = required ? labels.completeProfileTitle : labels.editProfileTitle;
  const description = required ? labels.completeProfileDescription : labels.editProfileDescription;

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(email, labels.invalidEmail).message,
      fullName: validateName(fullName, labels.invalidFullName).message,
      phoneNumber: validatePhone(phoneNumber, labels.invalidPhone).message,
    };
    setErrors(nextErrors);

    return Object.values(nextErrors).every((error) => !error);
  };

  const saveProfile = async () => {
    setFormError(null);
    if (!validateForm()) {
      setFormError(labels.profileValidationBlocked);
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        const normalizedPhone = phoneNumber.replace(/[-\s()]/g, '');
        const nextSession = {
          ...session,
          email: email.trim(),
          fullName: fullName.trim(),
          phoneNumber: normalizedPhone,
          profileCompleted: Boolean(fullName.trim() && normalizedPhone),
        };

        onSaved(nextSession);
        appLogger.info('profile.demo_update.success', 'Demo profile updated locally', { email: nextSession.email });
        showFeedback({
          type: 'success',
          title: labels.profileSaved,
          message: labels.profileSavedMessage,
        });
        onClose();
        return;
      }

      const profile = await updateCurrentProfile({
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.replace(/[-\s()]/g, ''),
      });
      const nextSession = {
        ...session,
        email: profile.email || email.trim(),
        fullName: profile.fullName?.trim() || fullName.trim(),
        phoneNumber: profile.phoneNumber || phoneNumber.replace(/[-\s()]/g, ''),
        profileCompleted: profile.profileCompleted || Boolean(fullName.trim() && phoneNumber.trim()),
      };

      onSaved(nextSession);
      appLogger.info('profile.update.success', 'Admin profile updated', { email: profile.email, profileCompleted: profile.profileCompleted });
      showFeedback({
        type: 'success',
        title: labels.profileSaved,
        message: labels.profileSavedMessage,
      });
      onClose();
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      setFormError(message);
      appLogger.warn('profile.update.failed', 'Admin profile update failed', { email, message });
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    setFormError(null);

    if (!passwordStrength.isStrong) {
      setFormError(labels.passwordTooWeak);
      return;
    }

    setPasswordLoading(true);

    try {
      if (!isDemoMode) {
        await changeCurrentPassword(currentPassword, newPassword);
      }

      setCurrentPassword('');
      setNewPassword('');
      showFeedback({
        type: 'success',
        title: labels.passwordUpdated,
        message: labels.passwordUpdatedMessage,
      });
    } catch (cause) {
      const message = getFriendlyErrorMessage(cause, labels);
      setFormError(message);
      showFeedback({ type: 'error', title: labels.actionFailed, message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={title}
      description={description}
      alertIcon={<IconUser size={uiConfig.icons.alert} />}
      blocking={required}
      footer={(
        <Group justify="flex-end">
          {!required && (
            <Button variant="default" onClick={onClose}>
              {labels.cancel}
            </Button>
          )}
          <Button loading={loading} onClick={saveProfile}>
            {labels.saveProfile}
          </Button>
        </Group>
      )}
    >
      {formError && (
        <Alert color="red" variant="light">
          {formError}
        </Alert>
      )}

      <TextInput
        error={errors.fullName}
        label={labels.fullName}
        leftSection={<IconUser size={uiConfig.icons.input} />}
        onChange={(event) => setFullName(sanitizeNameInput(event.currentTarget.value))}
        required
        value={fullName}
      />

      <TextInput
        error={errors.phoneNumber}
        inputMode="tel"
        label={labels.phoneNumber}
        leftSection={<IconDeviceMobile size={uiConfig.icons.input} />}
        onChange={(event) => setPhoneNumber(sanitizePhoneInput(event.currentTarget.value))}
        required
        value={phoneNumber}
      />

      <TextInput
        error={errors.email}
        inputMode="email"
        label={labels.email}
        leftSection={<IconMail size={uiConfig.icons.input} />}
        onChange={(event) => setEmail(sanitizeEmailInput(event.currentTarget.value))}
        required
        value={email}
      />

      {!required && (
        <>
          <Divider my="sm" />
          <Stack gap="sm">
            <Text fw={900}>{labels.changePassword}</Text>
            <PasswordInput
              label={labels.currentPassword}
              leftSection={<IconLock size={uiConfig.icons.input} />}
              onChange={(event) => setCurrentPassword(event.currentTarget.value)}
              value={currentPassword}
            />
            <PasswordInput
              label={labels.newPassword}
              leftSection={<IconLock size={uiConfig.icons.input} />}
              onChange={(event) => setNewPassword(event.currentTarget.value)}
              value={newPassword}
            />
            <PasswordStrengthMeter labels={labels} password={newPassword} />
            <Button
              loading={passwordLoading}
              disabled={!currentPassword || !passwordStrength.isStrong}
              onClick={savePassword}
            >
              {labels.updatePassword}
            </Button>
          </Stack>
        </>
      )}
    </AppModal>
  );
};
