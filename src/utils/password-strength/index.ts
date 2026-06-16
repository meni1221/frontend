export type PasswordStrength = {
  color: string;
  isStrong: boolean;
  labelKey: string;
  missingKeys: string[];
  score: number;
  value: number;
};

const checks = [
  { key: 'passwordRuleLength', test: (password: string) => password.length >= 10 },
  { key: 'passwordRuleLowercase', test: (password: string) => /[a-z]/.test(password) },
  { key: 'passwordRuleUppercase', test: (password: string) => /[A-Z]/.test(password) },
  { key: 'passwordRuleNumber', test: (password: string) => /\d/.test(password) },
  { key: 'passwordRuleSpecial', test: (password: string) => /[^A-Za-z\d]/.test(password) },
];

export const getPasswordStrength = (password: string): PasswordStrength => {
  const passedChecks = checks.filter((check) => check.test(password));
  const score = passedChecks.length;
  const missingKeys = checks
    .filter((check) => !check.test(password))
    .map((check) => check.key);

  if (score <= 2) {
    return { color: 'red', isStrong: false, labelKey: 'passwordWeak', missingKeys, score, value: 35 };
  }

  if (score <= 4) {
    return { color: 'yellow', isStrong: false, labelKey: 'passwordMedium', missingKeys, score, value: 68 };
  }

  return { color: 'ishruGreen', isStrong: true, labelKey: 'passwordStrong', missingKeys, score, value: 100 };
};
