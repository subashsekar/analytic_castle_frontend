import { required } from "@/lib/utils/validation";
import {
  MAX_SECRET_LENGTH,
  SSL_MODES,
  type DataSourceFormValues,
  type SslMode,
} from "@/features/data-sources/types";

export function isSslMode(value: string): value is SslMode {
  return (SSL_MODES as readonly string[]).includes(value);
}

export function validatePort(value: string): string | undefined {
  const missing = required(value, "Port");
  if (missing) {
    return missing;
  }

  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return "Port must be a valid number.";
  }

  const port = Number(trimmed);
  if (port < 1 || port > 65535) {
    return "Port must be between 1 and 65535.";
  }
  return undefined;
}

export function dataSourceFormErrors(values: DataSourceFormValues) {
  const passwordMissing = required(values.password, "Password");
  const passwordTooLong =
    values.password.length > MAX_SECRET_LENGTH
      ? `Password must be at most ${MAX_SECRET_LENGTH} characters.`
      : undefined;

  return {
    name: required(values.name, "Name"),
    host: required(values.host, "Host"),
    port: validatePort(values.port),
    database_name: required(values.database_name, "Database"),
    username: required(values.username, "Username"),
    password: passwordMissing ?? passwordTooLong,
    ssl_mode: isSslMode(values.ssl_mode)
      ? undefined
      : "Select a valid SSL mode.",
  };
}

export function dataSourceNameErrors(values: { name: string }) {
  return { name: required(values.name, "Name") };
}
