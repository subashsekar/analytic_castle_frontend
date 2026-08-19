export function splitFullName(fullName: string | null | undefined): {
  first_name: string | null;
  last_name: string | null;
} {
  const trimmed = fullName?.trim();
  if (!trimmed) {
    return { first_name: null, last_name: null };
  }

  const [first, ...rest] = trimmed.split(/\s+/);
  return {
    first_name: first || null,
    last_name: rest.length ? rest.join(" ") : null,
  };
}

export function joinFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function displayName(input: {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  const joined = joinFullName(input.first_name, input.last_name);
  return input.full_name?.trim() || joined || input.email || "Unknown user";
}
