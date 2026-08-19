const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

const HAS_UPPER = /[A-Z]/;
const HAS_LOWER = /[a-z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

export function required(value: string, label: string): string | undefined {
  if (!value.trim()) {
    return `${label} is required.`;
  }
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const missing = required(value, "Email");
  if (missing) {
    return missing;
  }
  if (!EMAIL_PATTERN.test(value.trim())) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(
  value: string,
  options?: { email?: string; label?: string; requireComplexity?: boolean },
): string | undefined {
  const label = options?.label ?? "Password";
  const requireComplexity = options?.requireComplexity ?? true;
  const missing = required(value, label);
  if (missing) {
    return missing;
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `${label} must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (
    options?.email &&
    value.toLowerCase() === options.email.trim().toLowerCase()
  ) {
    return `${label} cannot be the same as your email.`;
  }
  if (requireComplexity) {
    if (!HAS_UPPER.test(value)) {
      return `${label} must include an uppercase letter.`;
    }
    if (!HAS_LOWER.test(value)) {
      return `${label} must include a lowercase letter.`;
    }
    if (!HAS_NUMBER.test(value)) {
      return `${label} must include a number.`;
    }
    if (!HAS_SPECIAL.test(value)) {
      return `${label} must include a special character.`;
    }
  }
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  const missing = required(confirmation, "Confirm password");
  if (missing) {
    return missing;
  }
  if (password !== confirmation) {
    return "Passwords do not match.";
  }
  return undefined;
}

export function validateName(value: string, label: string): string | undefined {
  const missing = required(value, label);
  if (missing) {
    return missing;
  }
  if (value.trim().length < 1) {
    return `${label} is required.`;
  }
  return undefined;
}

export function firstError<T extends string>(
  errors: Partial<Record<T, string | undefined>>,
): string | undefined {
  for (const value of Object.values(errors)) {
    if (typeof value === "string" && value) {
      return value;
    }
  }
  return undefined;
}
