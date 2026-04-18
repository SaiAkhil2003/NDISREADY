type PersonNameInput = {
  firstName: string;
  lastName: string;
  preferredName?: string | null;
};

type PersonNameOverride = {
  matchParts: readonly string[];
  firstName: string;
  lastName: string;
  preferredName?: string | null;
};

const personNameOverrides: readonly PersonNameOverride[] = [
  {
    matchParts: ["sai", "raju", "kantimahanthi"],
    firstName: "John",
    lastName: "Smith",
    preferredName: "John",
  },
] as const;

export function resolveDisplayName(input: PersonNameInput) {
  const fullNameParts = normaliseName(`${input.firstName} ${input.lastName}`).split(" ");
  const override = personNameOverrides.find((entry) =>
    entry.matchParts.length === fullNameParts.length &&
    entry.matchParts.every((part, index) => part === fullNameParts[index]),
  );

  const firstName = override?.firstName ?? input.firstName;
  const lastName = override?.lastName ?? input.lastName;
  const preferredName =
    typeof input.preferredName === "string" && input.preferredName.trim()
      ? (override?.preferredName ?? input.preferredName)
      : (override?.preferredName ?? input.preferredName ?? null);

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

function normaliseName(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}
