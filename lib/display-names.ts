type PersonNameInput = {
  firstName: string;
  lastName: string;
  preferredName?: string | null;
};

export function resolveDisplayName(input: PersonNameInput) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const preferredName =
    typeof input.preferredName === "string" && input.preferredName.trim()
      ? input.preferredName.trim()
      : null;

  return {
    firstName,
    lastName,
    preferredName,
    fullName: `${firstName} ${lastName}`.trim(),
  };
}

export function formatDisplayName(input: PersonNameInput) {
  return resolveDisplayName(input).fullName;
}

export function formatDisplayParticipantName(input: PersonNameInput) {
  const resolved = resolveDisplayName(input);

  return resolved.preferredName?.trim()
    ? `${resolved.preferredName} (${resolved.fullName})`
    : resolved.fullName;
}
