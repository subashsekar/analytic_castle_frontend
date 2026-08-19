import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  required,
} from "@/lib/utils/validation";

export function loginErrors(values: { email: string; password: string }) {
  return {
    email: validateEmail(values.email),
    password: required(values.password, "Password"),
  };
}

export function registerErrors(values: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  return {
    first_name: validateName(values.first_name, "First name"),
    last_name: validateName(values.last_name, "Last name"),
    email: validateEmail(values.email),
    password: validatePassword(values.password, { email: values.email }),
  };
}

export function forgotPasswordErrors(values: { email: string }) {
  return { email: validateEmail(values.email) };
}

export function resetPasswordErrors(values: {
  password: string;
  confirm_password: string;
}) {
  return {
    password: validatePassword(values.password, { label: "New password" }),
    confirm_password: validatePasswordConfirmation(
      values.password,
      values.confirm_password,
    ),
  };
}

export function changePasswordErrors(values: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) {
  return {
    current_password: required(values.current_password, "Current password"),
    new_password: validatePassword(values.new_password, {
      label: "New password",
    }),
    confirm_password: validatePasswordConfirmation(
      values.new_password,
      values.confirm_password,
    ),
  };
}

export function resendVerificationErrors(values: { email: string }) {
  return { email: validateEmail(values.email) };
}
