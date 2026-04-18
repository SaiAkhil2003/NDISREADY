import { formatDisplayParticipantName } from "@/lib/display-names";

export const noteTypeOptions = [
  { value: "case_note", label: "Case note", detail: "General participant update" },
  { value: "progress_update", label: "Progress update", detail: "Goal or support progress" },
  { value: "handover", label: "Handover", detail: "Shift-to-shift context" },
  { value: "incident_follow_up", label: "Incident follow-up", detail: "Escalation or risk review" },
] as const;

export type NoteType = (typeof noteTypeOptions)[number]["value"];

type RuleBasedNoteDraftInput = {
  sourceText: string;
  participantName: string;
  participantGoals: string[];
  noteType?: NoteType;
};

export type RuleBasedNoteDraft = {
  aiDraft: string;
  goalsAddressed: string[];
};

export function isNoteType(value: string): value is NoteType {
  return noteTypeOptions.some((option) => option.value === value);
}

export function getNoteTypeLabel(value: NoteType) {
  return noteTypeOptions.find((option) => option.value === value)?.label ?? "Support Note";
}

export function getNoteTypeValueFromLabel(value: string | null | undefined) {
  const normalisedValue = value?.trim().toLowerCase();

  if (!normalisedValue) {
    return null;
  }

  return noteTypeOptions.find((option) => option.label.toLowerCase() === normalisedValue)?.value ?? null;
}

export function formatParticipantName(input: {
  firstName: string;
  lastName: string;
  preferredName?: string | null;
}) {
  return formatDisplayParticipantName(input);
}

export function buildRuleBasedNoteDraft({
  sourceText,
  participantName,
  participantGoals,
  noteType,
}: RuleBasedNoteDraftInput): RuleBasedNoteDraft {
  const normalisedText = normaliseSourceText(sourceText);
  const cleanedSentences = extractCleanSentences(normalisedText);
  const detectedActivities = detectActivities(normalisedText);
  const detectedBarriers = detectBarriers(normalisedText);
  const detectedSupports = detectSupportNeeds(normalisedText);
  const detectedProgress = detectProgressSignals(normalisedText);
  const mentionsMedication = containsPattern(normalisedText, [
    /\bmedication\b/i,
    /\bmeds\b/i,
    /\breminder\b/i,
  ]);
  const mentionsNoIncidents = containsPattern(normalisedText, [
    /\bno (?:injury|incident|incidents)\b/i,
    /\bnothing major\b/i,
    /\bno behaviours?\b/i,
    /\bno behavioural concerns?\b/i,
  ]);
  const goalsAddressed = deriveGoalsAddressed(participantGoals, [normalisedText]);

  const summaryParagraph = buildSummaryParagraph({
    cleanedSentences,
    detectedActivities,
    detectedBarriers,
    detectedSupports,
    detectedProgress,
    mentionsMedication,
    mentionsNoIncidents,
  });
  const observations = buildObservationBullets({
    detectedActivities,
    detectedBarriers,
    detectedSupports,
    detectedProgress,
    mentionsMedication,
    mentionsNoIncidents,
  });
  const plan = buildPlanBullets({
    normalisedText,
    detectedActivities,
    detectedBarriers,
    mentionsMedication,
  });
  const goalsSection =
    participantGoals.length === 0
      ? "- No goals recorded"
      : goalsAddressed.length > 0
        ? goalsAddressed.map((goal) => `- ${goal}`).join("\n")
        : "- No specific participant goal was clearly referenced in this update";

  const noteTitle = noteType ? getNoteTypeLabel(noteType) : "Support Note";

  return {
    aiDraft:
      `${noteTitle}:\n\n` +
      `Participant: ${participantName}\n\n` +
      `Summary:\n${summaryParagraph}\n\n` +
      `Goals addressed:\n${goalsSection}\n\n` +
      `Observations:\n\n` +
      `${observations.map((item) => `- ${item}`).join("\n")}\n\n` +
      `Plan:\n\n` +
      `${plan.map((item) => `- ${item}`).join("\n")}`,
    goalsAddressed,
  };
}

export function deriveGoalsAddressed(goals: string[], texts: string[]) {
  const haystack = texts.join(" ").toLowerCase();
  const matchedGoals = goals.filter((goal) => {
    const normalisedGoal = goal.trim().toLowerCase();

    if (!normalisedGoal) {
      return false;
    }

    if (haystack.includes(normalisedGoal)) {
      return true;
    }

    const keywords = normalisedGoal
      .split(/[^a-z0-9]+/)
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length >= 4);

    return keywords.some((keyword) => haystack.includes(keyword));
  });

  return matchedGoals.length > 0 ? matchedGoals : [];
}

function buildSummaryParagraph(input: {
  cleanedSentences: string[];
  detectedActivities: string[];
  detectedBarriers: string[];
  detectedSupports: string[];
  detectedProgress: string[];
  mentionsMedication: boolean;
  mentionsNoIncidents: boolean;
}) {
  const summaryParts: string[] = [];

  if (input.detectedActivities.length > 0) {
    summaryParts.push(
      `Participant engaged in a support shift focused on ${formatList(input.detectedActivities)}.`,
    );
  } else {
    summaryParts.push(
      "Participant engaged in a support shift and participated in planned support activities.",
    );
  }

  if (input.detectedBarriers.length > 0) {
    summaryParts.push(
      `Initial hesitation was observed in relation to ${formatList(input.detectedBarriers)}, however the participant continued with support after discussion and reassurance.`,
    );
  }

  if (input.detectedSupports.length > 0) {
    summaryParts.push(
      `The participant required support with ${formatList(input.detectedSupports)} during the shift.`,
    );
  }

  if (input.detectedProgress.length > 0) {
    summaryParts.push(
      `Progress was observed in ${formatList(input.detectedProgress)} when compared with previous support.`,
    );
  }

  if (input.mentionsMedication) {
    summaryParts.push(
      "Medication reminders were discussed to support consistency with the evening routine.",
    );
  }

  if (input.mentionsNoIncidents) {
    summaryParts.push(
      "No incidents, injuries, or behavioural concerns were reported during the shift.",
    );
  }

  if (summaryParts.length >= 2) {
    return summaryParts.join(" ");
  }

  if (input.cleanedSentences.length > 0) {
    return input.cleanedSentences.slice(0, 4).join(" ");
  }

  return "Participant engaged in the scheduled support shift. Ongoing support should continue in line with participant needs.";
}

function buildObservationBullets(input: {
  detectedActivities: string[];
  detectedBarriers: string[];
  detectedSupports: string[];
  detectedProgress: string[];
  mentionsMedication: boolean;
  mentionsNoIncidents: boolean;
}) {
  const bullets: string[] = [];

  if (input.detectedActivities.length > 0) {
    bullets.push(`Support focused on ${formatList(input.detectedActivities)}.`);
  }

  if (input.detectedBarriers.length > 0) {
    bullets.push(`Participant initially presented with ${formatList(input.detectedBarriers)}.`);
  }

  if (input.detectedSupports.length > 0) {
    bullets.push(`Prompting was required for ${formatList(input.detectedSupports)}.`);
  }

  if (input.detectedProgress.length > 0) {
    bullets.push(`Participant showed progress in ${formatList(input.detectedProgress)}.`);
  }

  if (input.mentionsMedication) {
    bullets.push("Medication reminder strategies were discussed during the shift.");
  }

  if (input.mentionsNoIncidents) {
    bullets.push("No incidents, injuries, or behavioural concerns were observed.");
  }

  if (bullets.length === 0) {
    bullets.push("Participant engaged with support activities during the shift.");
  }

  return dedupeStrings(bullets).slice(0, 5);
}

function buildPlanBullets(input: {
  normalisedText: string;
  detectedActivities: string[];
  detectedBarriers: string[];
  mentionsMedication: boolean;
}) {
  const plan: string[] = [];

  if (
    input.detectedActivities.includes("travel training") ||
    input.detectedActivities.includes("community access")
  ) {
    plan.push("Continue community access and travel practice with prompting reduced where appropriate.");
  }

  if (input.detectedActivities.includes("shopping confidence")) {
    plan.push("Continue building confidence with shopping and other community-based tasks.");
  }

  if (input.detectedBarriers.length > 0) {
    plan.push("Use reassurance, clear planning, and gradual exposure when entering busy environments.");
  }

  if (input.mentionsMedication) {
    plan.push("Reinforce the use of reminders to support the evening medication routine.");
  }

  if (containsPattern(input.normalisedText, [/\bnext shift\b/i, /\bnext week\b/i, /\bcontinue\b/i])) {
    plan.push("Review progress again at the next shift and update supports as needed.");
  }

  if (plan.length === 0) {
    plan.push("Continue current support strategies and monitor progress at the next shift.");
  }

  return dedupeStrings(plan).slice(0, 4);
}

function detectActivities(sourceText: string) {
  const activities: string[] = [];

  if (containsPattern(sourceText, [/\bcommunity access\b/i, /\bcommunity\b/i])) {
    activities.push("community access");
  }

  if (containsPattern(sourceText, [/\bdaily living\b/i, /\bindependent living\b/i])) {
    activities.push("daily living skills");
  }

  if (containsPattern(sourceText, [/\bbus\b/i, /\bbus stop\b/i, /\btransport\b/i, /\btravel\b/i])) {
    activities.push("travel training");
  }

  if (containsPattern(sourceText, [/\bshop\b/i, /\bshopping\b/i, /\bshops\b/i])) {
    activities.push("shopping confidence");
  }

  if (containsPattern(sourceText, [/\bmedication\b/i, /\bmeds\b/i, /\breminder\b/i])) {
    activities.push("medication routine support");
  }

  return activities;
}

function detectBarriers(sourceText: string) {
  const barriers: string[] = [];

  if (containsPattern(sourceText, [/\bquiet at first\b/i])) {
    barriers.push("low confidence at the start of the shift");
  }

  if (
    containsPattern(sourceText, [
      /\btoo many people\b/i,
      /\bnoisy\b/i,
      /\bcrowd(?:ed)?\b/i,
      /\bbusy\b/i,
    ])
  ) {
    barriers.push("busy or noisy environments");
  }

  if (
    containsPattern(sourceText, [
      /\bnervous\b/i,
      /\banxious\b/i,
      /\bdidn.?t really want to go out\b/i,
      /\breluctant\b/i,
    ])
  ) {
    barriers.push("anxiety with community access");
  }

  return barriers;
}

function detectSupportNeeds(sourceText: string) {
  const supports: string[] = [];

  if (containsPattern(sourceText, [/\bprompt(?:ing|ed|s)?\b/i, /\breminder(?:s)?\b/i])) {
    supports.push("verbal prompting");
  }

  if (containsPattern(sourceText, [/\bwhat bus\b/i, /\bwhich bus\b/i, /\bcorrect bus\b/i])) {
    supports.push("identifying the correct bus");
  }

  if (containsPattern(sourceText, [/\btalk about the plan\b/i, /\bplan and then went\b/i])) {
    supports.push("reviewing the activity plan before leaving");
  }

  return supports;
}

function detectProgressSignals(sourceText: string) {
  const progress: string[] = [];

  if (
    containsPattern(sourceText, [
      /\bbetter than last time\b/i,
      /\bmore confident\b/i,
      /\bimprov(?:ed|ement)?\b/i,
      /\bsettled\b/i,
    ])
  ) {
    progress.push("confidence with support activities");
  }

  if (containsPattern(sourceText, [/\bokay\b/i, /\bengaged\b/i, /\bhappy\b/i])) {
    progress.push("engagement during the shift");
  }

  return progress;
}

function extractCleanSentences(sourceText: string) {
  const cleanedText = sourceText
    .replace(/\b(?:um|uh|ah|er|mm+)\b/gi, " ")
    .replace(/\b(?:yeah|like|you know|basically|sort of|kind of)\b/gi, " ")
    .replace(/\bI think\b/gi, " ")
    .replace(/\bno actually\b/gi, " ")
    .replace(/\bthey was\b/gi, "they were")
    .replace(/\bwe done\b/gi, "support focused on")
    .replace(/\bthey done\b/gi, "they completed")
    .replace(/\bmeds\b/gi, "medication")
    .replace(/\s+/g, " ")
    .trim();

  return cleanedText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1).trim() + ".");
}

function normaliseSourceText(sourceText: string) {
  return sourceText.replace(/\s+/g, " ").trim();
}

function containsPattern(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function formatList(items: string[]) {
  const values = dedupeStrings(items);

  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function dedupeStrings(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}
