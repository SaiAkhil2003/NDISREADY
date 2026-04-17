"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createParticipant,
  isParticipantStatus,
  parseParticipantGoals,
} from "@/lib/participants";
import { participantsUrl } from "@/lib/routes";

export async function createParticipantAction(formData: FormData) {
  const firstName = getTextField(formData, "firstName");
  const lastName = getTextField(formData, "lastName");
  const preferredName = getTextField(formData, "preferredName");
  const dateOfBirth = getTextField(formData, "dateOfBirth");
  const ndisNumber = getTextField(formData, "ndisNumber");
  const status = getTextField(formData, "status");
  const goals = parseParticipantGoals(getTextField(formData, "goals"));

  if (
    !firstName ||
    !lastName ||
    !isParticipantStatus(status) ||
    (dateOfBirth && !isValidDate(dateOfBirth))
  ) {
    redirect(buildParticipantsRedirect({ error: "invalid" }));
  }

  let participant;

  try {
    participant = await createParticipant({
      firstName,
      lastName,
      preferredName,
      dateOfBirth,
      ndisNumber,
      status,
      goals,
    });
  } catch (error) {
    if (isDuplicateNdisNumberError(error)) {
      redirect(buildParticipantsRedirect({ error: "duplicate" }));
    }

    console.error("Failed to create participant:", error);
    redirect(buildParticipantsRedirect({ error: "save" }));
  }

  revalidatePath(participantsUrl);
  redirect(buildParticipantsRedirect({ created: participant.id }));
}

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isDuplicateNdisNumberError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

function buildParticipantsRedirect(params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `${participantsUrl}?${search.toString()}`;
}
