import { useMemo, useState } from 'react';
import { getGoogleContacts, GoogleContact, startGoogleConnection, WhatsappRecipient } from '../../../../api';
import { useFeedback } from '../../../feedback';
import { useAsyncAction } from '../../../../hooks/use-async-action';
import { getFriendlyErrorMessage } from '../../../../utils/error-message';
import { sanitizeEmailInput } from '../../../../utils/input-sanitize';
import { validateEmail, validatePhone } from '../../../../utils/validation';
import { getContactKey, normalizePhone } from '../../helpers';

type UseGoogleContactPickerProps = {
  isDemoMode: boolean;
  labels: Record<string, string>;
  onSendEmail: (contacts: WhatsappRecipient[], message: string) => Promise<void> | void;
  onSend: (contacts: WhatsappRecipient[], message: string) => Promise<void> | void;
};

export const useGoogleContactPicker = ({
  isDemoMode,
  labels,
  onSend,
  onSendEmail,
}: UseGoogleContactPickerProps) => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleContacts, setGoogleContacts] = useState<GoogleContact[]>([]);
  const [selectedContactKeys, setSelectedContactKeys] = useState<string[]>([]);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualContacts, setManualContacts] = useState<WhatsappRecipient[]>([]);
  const [message, setMessage] = useState(labels.defaultWhatsappMessage);
  const [contactQuery, setContactQuery] = useState('');
  const { showFeedback } = useFeedback();
  const googleAction = useAsyncAction();
  const sendAction = useAsyncAction();
  const emailAction = useAsyncAction();

  const contacts = useMemo(
    () => [...googleContacts, ...manualContacts],
    [googleContacts, manualContacts],
  );

  const selectedContacts = useMemo(
    () => contacts.filter((contact) => selectedContactKeys.includes(getContactKey(contact))),
    [contacts, selectedContactKeys],
  );
  const selectedPhoneContacts = useMemo(
    () => selectedContacts.filter((contact) => Boolean(contact.phoneNumber)),
    [selectedContacts],
  );
  const selectedEmailContacts = useMemo(
    () => selectedContacts.filter((contact) => Boolean(contact.email)),
    [selectedContacts],
  );

  const showActionError = (cause: unknown) => {
    showFeedback({
      type: 'error',
      title: labels.actionFailed,
      message: getFriendlyErrorMessage(cause, labels),
    });
  };

  const loadGoogleContacts = () => {
    if (isDemoMode) {
      showFeedback({
        type: 'info',
        title: labels.demoGoogleDisabledTitle,
        message: labels.demoGoogleDisabledMessage,
      });
      return;
    }

    void googleAction.run(async () => {
      const result = await getGoogleContacts();
      if (!result.contacts.length) {
        const { authUrl } = await startGoogleConnection();
        window.location.href = authUrl;
        return;
      }

      setGoogleContacts(result.contacts);
      setGoogleConnected(true);
      showFeedback({
        type: 'success',
        title: labels.googleConnected,
        message: `${result.contacts.length} ${labels.phoneContacts}`,
      });
    }, { onError: showActionError });
  };

  const addManualContact = () => {
    const hasPhone = Boolean(manualPhone.trim());
    const hasEmail = Boolean(manualEmail.trim());

    if (!hasPhone && !hasEmail) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: labels.phoneOrEmailRequired,
      });
      return;
    }

    const phoneValidation = hasPhone ? validatePhone(manualPhone, labels.invalidPhone) : { isValid: true, message: null };
    const emailValidation = hasEmail ? validateEmail(manualEmail, labels.invalidEmail) : { isValid: true, message: null };

    if (!phoneValidation.isValid || !emailValidation.isValid) {
      showFeedback({
        type: 'error',
        title: labels.actionFailed,
        message: phoneValidation.message ?? emailValidation.message ?? labels.validationError,
      });
      return;
    }

    const normalizedPhone = normalizePhone(manualPhone);
    const normalizedEmail = sanitizeEmailInput(manualEmail);
    const contactAlreadyExists = contacts.some((contact) =>
      (normalizedPhone && normalizePhone(contact.phoneNumber) === normalizedPhone) ||
      (normalizedEmail && contact.email === normalizedEmail),
    );

    if (contactAlreadyExists) {
      showFeedback({
        type: 'info',
        title: labels.contactAlreadySelectedTitle,
        message: labels.contactAlreadySelectedMessage,
      });
      return;
    }

    const contact = {
      email: normalizedEmail || undefined,
      fullName: manualName.trim() || undefined,
      phoneNumber: manualPhone.trim(),
    };

    setManualContacts((currentContacts) => [...currentContacts, contact]);
    setSelectedContactKeys((currentKeys) => [...new Set([...currentKeys, getContactKey(contact)])]);
    setManualName('');
    setManualPhone('');
    setManualEmail('');
  };

  const toggleContact = (contact: WhatsappRecipient, checked: boolean) => {
    const contactKey = getContactKey(contact);

    setSelectedContactKeys((currentKeys) =>
      checked
        ? [...new Set([...currentKeys, contactKey])]
        : currentKeys.filter((key) => key !== contactKey),
    );
  };

  const sendSelectedContacts = () => {
    void sendAction.run(
      () => onSend(selectedPhoneContacts, message),
      { onError: showActionError },
    );
  };

  const sendSelectedEmails = () => {
    void emailAction.run(
      () => onSendEmail(selectedEmailContacts, message),
      { onError: showActionError },
    );
  };

  return {
    contacts,
    contactQuery,
    emailDisabled: selectedEmailContacts.length === 0 || !message.trim(),
    emailLoading: emailAction.loading,
    googleConnected,
    googleLoading: googleAction.loading,
    manualEmail,
    manualName,
    manualPhone,
    message,
    selectedContactKeys,
    selectedCount: selectedContacts.length,
    sendDisabled: selectedPhoneContacts.length === 0 || !message.trim(),
    sendLoading: sendAction.loading,
    addManualContact,
    loadGoogleContacts,
    sendSelectedContacts,
    sendSelectedEmails,
    setContactQuery,
    setManualEmail,
    setManualName,
    setManualPhone,
    setMessage,
    toggleContact,
  };
};
