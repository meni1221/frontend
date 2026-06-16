export type ReminderAudience = 'awaiting' | 'confirmed' | 'all';

export const normalizePhone = (value: string) => value.replace(/\D/g, '');

export const getReminderPlan = (eventDate: string | undefined, labels: Record<string, string>) => {
  if (!eventDate) {
    return labels.reminderPlanNoDate;
  }

  const now = new Date();
  const targetDate = new Date(eventDate);
  const daysUntilEvent = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilEvent <= 0) {
    return labels.reminderPlanPastEvent;
  }

  if (daysUntilEvent <= 3) {
    return labels.reminderPlanFinalWindow.replace('{days}', String(daysUntilEvent));
  }

  return labels.reminderPlanCadence.replace('{days}', String(daysUntilEvent));
};
