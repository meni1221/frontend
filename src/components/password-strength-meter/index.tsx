import { Progress, Stack, Text } from '@mantine/core';
import { getPasswordStrength } from '../../utils/password-strength';

type PasswordStrengthMeterProps = {
  labels: Record<string, string>;
  password: string;
};

export const PasswordStrengthMeter = ({ labels, password }: PasswordStrengthMeterProps) => {
  const strength = getPasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <Stack gap={6}>
      <Progress value={strength.value} color={strength.color} radius="xl" size="sm" />
      <Text size="xs" fw={800} c={strength.color}>
        {labels[strength.labelKey]}
      </Text>
      {!strength.isStrong && (
        <Text size="xs" c="dimmed">
          {labels.passwordMissingRules}: {strength.missingKeys.map((key) => labels[key]).join(', ')}
        </Text>
      )}
    </Stack>
  );
};
