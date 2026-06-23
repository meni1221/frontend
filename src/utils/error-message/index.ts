const parseErrorMessage = (value: string) => {
  try {
    const payload = JSON.parse(value) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(' ');
    }

    return payload.message ?? value;
  } catch {
    return value;
  }
};

export const getFriendlyErrorMessage = (cause: unknown, labels: Record<string, string>) => {
  const rawMessage = cause instanceof Error ? parseErrorMessage(cause.message) : '';
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes('invalid email or password')) {
    return `${labels.invalidCredentials} ${labels.invalidCredentialsHint}`;
  }

  if (normalizedMessage.includes('waiting for super admin approval')) {
    return `${labels.waitingApprovalError} ${labels.waitingApprovalHint}`;
  }

  if (normalizedMessage.includes('email is already used') || normalizedMessage.includes('duplicate key')) {
    return `${labels.emailAlreadyUsed} ${labels.emailAlreadyUsedHint}`;
  }

  if (normalizedMessage.includes('password') && (normalizedMessage.includes('matches') || normalizedMessage.includes('minlength'))) {
    return labels.passwordTooWeak;
  }

  if (normalizedMessage.includes('google_client_id') || normalizedMessage.includes('google_client_secret')) {
    return `${labels.googleNotConfigured} ${labels.googleNotConfiguredHint}`;
  }

  if (normalizedMessage.includes('whatsapp connection') && (normalizedMessage.includes('not connected') || normalizedMessage.includes('no saved session'))) {
    return `${labels.whatsappReconnectRequired} ${labels.whatsappReconnectRequiredHint}`;
  }

  if (normalizedMessage.includes('failed to fetch') || normalizedMessage.includes('networkerror')) {
    return `${labels.networkError} ${labels.networkErrorHint}`;
  }

  if (normalizedMessage.includes('unauthorized') || normalizedMessage.includes('authorization token')) {
    return `${labels.sessionExpired} ${labels.sessionExpiredHint}`;
  }

  if (normalizedMessage.includes('forbidden') || normalizedMessage.includes('owner access is required')) {
    return `${labels.permissionDenied} ${labels.permissionDeniedHint}`;
  }

  if (normalizedMessage.includes('not found')) {
    return `${labels.notFoundError} ${labels.notFoundHint}`;
  }

  if (normalizedMessage.includes('validation failed') || normalizedMessage.includes('bad request')) {
    return `${labels.validationError} ${labels.validationErrorHint}`;
  }

  return `${labels.genericError} ${labels.genericErrorHint}`;
};
