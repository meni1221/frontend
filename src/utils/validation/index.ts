import { validationConfig } from '../../config';

export type ValidationResult = {
  isValid: boolean;
  message: string | null;
};

export const validateRequiredText = (value: string, invalidMessage: string): ValidationResult => {
  const trimmedValue = value.trim();
  const isValid = validationConfig.text.test(trimmedValue);

  return {
    isValid,
    message: isValid ? null : invalidMessage,
  };
};

export const validateName = (value: string, invalidMessage: string): ValidationResult => {
  const isValid = validationConfig.name.test(value.trim());

  return {
    isValid,
    message: isValid ? null : invalidMessage,
  };
};

export const validateEmail = (value: string, invalidMessage: string): ValidationResult => {
  const isValid = validationConfig.email.test(value.trim());

  return {
    isValid,
    message: isValid ? null : invalidMessage,
  };
};

export const validatePhone = (value: string, invalidMessage: string): ValidationResult => {
  const normalizedValue = value.replace(/[-\s()]/g, '');
  const isValid = validationConfig.phoneIL.test(normalizedValue);

  return {
    isValid,
    message: isValid ? null : invalidMessage,
  };
};

export const validateDate = (value: string, invalidMessage: string): ValidationResult => {
  const isValid = validationConfig.date.test(value);

  return {
    isValid,
    message: isValid ? null : invalidMessage,
  };
};

export const validatePositiveNumber = (value: string, invalidMessage: string): ValidationResult => {
  const isValid = validationConfig.number.test(value.trim()) && Number(value) > 0;

  return {
    isValid,
    message: isValid ? null : invalidMessage,
  };
};
