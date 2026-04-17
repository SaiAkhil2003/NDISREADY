export const dashboardUrl = "/dashboard";
export const workersUrl = `${dashboardUrl}/workers`;
export const participantsUrl = `${dashboardUrl}/participants`;
export const notesUrl = `${dashboardUrl}/notes`;
export const claimsUrl = `${dashboardUrl}/claims`;
export const signInUrl = "/sign-in";
export const signUpUrl = "/sign-up";

export function getParticipantDetailUrl(participantId: string) {
  return `${participantsUrl}/${participantId}`;
}
