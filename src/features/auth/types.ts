export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type VerifyEmailRequest = {
  token: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type RefreshRequest = {
  refresh_token: string;
};
