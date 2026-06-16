import { Card, Stack } from '@mantine/core';
import { WhatsappRecipient } from '../../api';
import { useComponentLogger } from '../../utils/component-logger';
import { ContactList } from './contact-list';
import { GoogleConnectionStatus } from './google-connection-status';
import { useGoogleContactPicker } from './hooks/use-google-contact-picker';
import { ManualContactForm } from './manual-contact-form';
import { SendActions } from './send-actions';

type GoogleContactPickerProps = {
  isDemoMode?: boolean;
  labels: Record<string, string>;
  onSendEmail: (contacts: WhatsappRecipient[], message: string) => Promise<void> | void;
  onSend: (contacts: WhatsappRecipient[], message: string) => Promise<void> | void;
};

export const GoogleContactPicker = ({ isDemoMode = false, labels, onSend, onSendEmail }: GoogleContactPickerProps) => {
  useComponentLogger('GoogleContactPicker');
  const contactPicker = useGoogleContactPicker({ isDemoMode, labels, onSend, onSendEmail });

  return (
    <Card className="studioCard" withBorder radius="sm" p="xl">
      <Stack gap="md">
        <GoogleConnectionStatus
          connected={contactPicker.googleConnected}
          labels={labels}
          loading={contactPicker.googleLoading}
          selectedCount={contactPicker.selectedCount}
          onConnect={contactPicker.loadGoogleContacts}
        />

        <ContactList
          contacts={contactPicker.contacts}
          labels={labels}
          query={contactPicker.contactQuery}
          selectedContactKeys={contactPicker.selectedContactKeys}
          onQueryChange={contactPicker.setContactQuery}
          onToggleContact={contactPicker.toggleContact}
        />

        <ManualContactForm
          email={contactPicker.manualEmail}
          labels={labels}
          name={contactPicker.manualName}
          phone={contactPicker.manualPhone}
          onAdd={contactPicker.addManualContact}
          onEmailChange={contactPicker.setManualEmail}
          onNameChange={contactPicker.setManualName}
          onPhoneChange={contactPicker.setManualPhone}
        />

        <SendActions
          emailDisabled={contactPicker.emailDisabled}
          emailLoading={contactPicker.emailLoading}
          labels={labels}
          message={contactPicker.message}
          sendDisabled={contactPicker.sendDisabled}
          sendLoading={contactPicker.sendLoading}
          onEmailSend={contactPicker.sendSelectedEmails}
          onMessageChange={contactPicker.setMessage}
          onSend={contactPicker.sendSelectedContacts}
        />
      </Stack>
    </Card>
  );
};
