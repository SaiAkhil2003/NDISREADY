"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createWorker,
  isWorkerRole,
  isWorkerStatus,
} from "@/lib/workers";
import { signInUrl, workersUrl } from "@/lib/routes";

export async function createWorkerAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect(signInUrl);
  }

  const firstName = getTextField(formData, "firstName");
  const lastName = getTextField(formData, "lastName");
  const email = getTextField(formData, "email").toLowerCase();
  const phone = getTextField(formData, "phone");
  const role = getTextField(formData, "role");
  const status = getTextField(formData, "status");

  if (
    !firstName ||
    !lastName ||
    !email ||
    !isValidEmail(email) ||
    !isWorkerRole(role) ||
    !isWorkerStatus(status)
  ) {
    redirect(buildWorkersRedirect({ error: "invalid" }));
  }

  try {
    await createWorker({
      firstName,
      lastName,
      email,
      phone,
      role,
      status,
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      redirect(buildWorkersRedirect({ error: "duplicate" }));
    }

    console.error("Failed to create worker:", error);
    redirect(buildWorkersRedirect({ error: "save" }));
  }

  revalidatePath(workersUrl);
  redirect(buildWorkersRedirect({ created: "1" }));
}

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDuplicateEmailError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

function buildWorkersRedirect(params: Record<string, string>) {
  const search = new URLSearchParams(params);

  return `${workersUrl}?${search.toString()}`;
}
