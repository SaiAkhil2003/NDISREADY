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
  shiftDate?: string;
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

export const noteDraftingGuidance = [
  "Use the worker's original words as the source of truth.",
  "Preserve concrete support activities, participant responses, outcomes, and next steps when stated.",
  "Do not invent incidents, medical details, behaviours, goals, progress, or follow-up actions.",
  "Do not replace useful specific details with vague generic summaries.",
  "If a detail is missing, say it was not stated instead of inferring it.",
] as const;

export function buildRuleBasedNoteDraft({
  sourceText,
  participantName,
  participantGoals,
  noteType,
  shiftDate,
}: RuleBasedNoteDraftInput): RuleBasedNoteDraft {
  const normalisedText = normaliseSourceText(sourceText);
  const sourceFacts = extractCleanSentences(normalisedText);
  const factBuckets = categoriseSourceFacts(sourceFacts);
  const goalsAddressed = deriveGoalsAddressed(participantGoals, [normalisedText]);
  const goalsSection =
    participantGoals.length === 0
      ? "- No participant goals were available in the workspace context."
      : goalsAddressed.length > 0
        ? goalsAddressed.map((goal) => `- ${goal}`).join("\n")
        : "- No participant goal was clearly referenced in the worker's original input.";

  const noteTitle = noteType ? getNoteTypeLabel(noteType) : "Support Note";
  const supportProvided =
    factBuckets.support.length > 0 ? factBuckets.support : sourceFacts.slice(0, 3);

  return {
    aiDraft:
      `${noteTitle}:\n\n` +
      `Participant: ${participantName}\n\n` +
      `${shiftDate?.trim() ? `Date: ${shiftDate.trim()}\n\n` : ""}` +
      formatDraftSection({
        heading: "What support was provided",
        bullets: supportProvided,
        fallback: "Support details were not clearly stated in the worker's original input.",
      }) +
      "\n\n" +
      formatDraftSection({
        heading: "Participant response / outcome",
        bullets: factBuckets.response,
        fallback: "The participant's response or outcome was not stated in the worker's original input.",
      }) +
      "\n\n" +
      formatDraftSection({
        heading: "Progress / difficulty observed",
        bullets: factBuckets.progress,
        fallback: "No specific progress, difficulty, incident, injury, or behavioural concern was stated in the worker's original input.",
      }) +
      "\n\n" +
      `Goals addressed:\n${goalsSection}\n\n` +
      formatDraftSection({
        heading: "Follow-up / next steps",
        bullets: factBuckets.followUp,
        fallback: "No specific follow-up or next step was stated in the worker's original input.",
      }),
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
      .filter((keyword) => keyword.length >= 5 && !goalKeywordStopWords.has(keyword));

    if (keywords.length === 0) {
      return false;
    }

    const matchedKeywordCount = keywords.filter((keyword) =>
      getGoalKeywordMatches(keyword).some((match) => haystack.includes(match)),
    ).length;

    return keywords.length === 1
      ? matchedKeywordCount === 1
      : matchedKeywordCount >= Math.min(2, keywords.length) ||
          keywords.some((keyword) => highConfidenceGoalKeywords.has(keyword) && getGoalKeywordMatches(keyword).some((match) => haystack.includes(match)));
  });

  return matchedGoals.length > 0 ? matchedGoals : [];
}

function extractCleanSentences(sourceText: string) {
  const sourceSegments = sourceText
    .replace(/[\r\n]+/g, ". ")
    .split(/(?:[.!?]+|;\s+|\s+-\s+|\s*,\s*(?=(?:then|after that|also|but|however|next|we|i|he|she|they|participant)\b))/i)
    .flatMap(splitLongVoiceSegment)
    .map(cleanSourceFact)
    .filter(Boolean);

  const cleanedSegments = dedupeStrings(sourceSegments).slice(0, 8);

  return cleanedSegments.length > 0
    ? cleanedSegments
    : [cleanSourceFact(sourceText)].filter(Boolean);
}

function normaliseSourceText(sourceText: string) {
  return sourceText.replace(/\s+/g, " ").trim();
}

function containsPattern(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function formatDraftSection(input: {
  heading: string;
  bullets: string[];
  fallback: string;
}) {
  const bullets = input.bullets.length > 0 ? input.bullets : [input.fallback];

  return `${input.heading}:\n${dedupeStrings(bullets)
    .slice(0, 5)
    .map((item) => `- ${item}`)
    .join("\n")}`;
}

function categoriseSourceFacts(sourceFacts: string[]) {
  const buckets = {
    support: [] as string[],
    response: [] as string[],
    progress: [] as string[],
    followUp: [] as string[],
  };

  sourceFacts.forEach((fact) => {
    if (containsPattern(fact, supportPatterns)) {
      buckets.support.push(fact);
    }

    if (containsPattern(fact, responsePatterns)) {
      buckets.response.push(fact);
    }

    if (containsPattern(fact, progressAndRiskPatterns)) {
      buckets.progress.push(fact);
    }

    if (containsPattern(fact, followUpPatterns)) {
      buckets.followUp.push(fact);
    }
  });

  return {
    support: dedupeStrings(buckets.support),
    response: dedupeStrings(buckets.response),
    progress: dedupeStrings(buckets.progress),
    followUp: dedupeStrings(buckets.followUp),
  };
}

function splitLongVoiceSegment(segment: string) {
  const trimmedSegment = segment.trim();

  if (trimmedSegment.length <= 180) {
    return [trimmedSegment];
  }

  return trimmedSegment.split(/\s+(?=(?:and then|then|after that|also|but|next)\b)/i);
}

function cleanSourceFact(value: string) {
  const cleanedValue = value
    .trim()
    .replace(/\b(?:um|uh|ah|er|mm+)\b/gi, " ")
    .replace(/\b(?:yeah|you know|basically|sort of|kind of)\b/gi, " ")
    .replace(/\bthey was\b/gi, "they were")
    .replace(/\bwe done\b/gi, "we completed")
    .replace(/\bthey done\b/gi, "they completed")
    .replace(/\bmeds\b/gi, "medication")
    .replace(/\bgot him to\b/gi, "supported him to")
    .replace(/\bgot her to\b/gi, "supported her to")
    .replace(/\bgot them to\b/gi, "supported them to")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedValue) {
    return "";
  }

  return withSentencePunctuation(capitaliseFirst(toProfessionalPerspective(cleanedValue)));
}

function toProfessionalPerspective(value: string) {
  return value
    .replace(/^(took|helped|supported|prompted|reminded|assisted|drove|walked|completed|reviewed|discussed)\b/i, (match) => `Worker ${match.toLowerCase()}`)
    .replace(/^then\s+/i, "Participant then ")
    .replace(/^i\s+/i, "Worker ")
    .replace(/\bi\s+/gi, "worker ")
    .replace(/^we\s+/i, "Worker and participant ")
    .replace(/\bwe\s+/gi, "worker and participant ")
    .replace(/\bmy\b/gi, "worker's")
    .replace(/\bour\b/gi, "the support")
    .replace(/\bme and ([a-z]+)/gi, "worker and $1")
    .replace(/\bhad a chat\b/gi, "discussed");
}

function capitaliseFirst(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function withSentencePunctuation(value: string) {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function dedupeStrings(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

const goalKeywordStopWords = new Set([
  "about",
  "after",
  "being",
  "build",
  "develop",
  "improve",
  "increase",
  "maintain",
  "participant",
  "routine",
  "skills",
  "support",
  "supports",
  "their",
  "there",
  "through",
  "using",
  "while",
]);

const highConfidenceGoalKeywords = new Set([
  "access",
  "community",
  "living",
  "meal",
  "medication",
  "participation",
  "preparation",
  "travel",
]);

const goalKeywordAliases = new Map([
  ["access", ["access", "community", "shops", "shopping", "bus", "transport"]],
  ["community", ["community", "shops", "shopping", "bus", "transport"]],
  ["confidence", ["confidence", "confident", "nervous", "anxious", "settled", "easier"]],
  ["living", ["living", "cook", "cooking", "clean", "cleaning", "laundry", "kitchen"]],
  ["meal", ["meal", "cook", "cooking", "pasta", "food", "lunch", "dinner"]],
  ["medication", ["medication", "meds"]],
  ["participation", ["participation", "participate", "participated", "community", "shops", "shopping"]],
  ["preparation", ["preparation", "prepare", "prepared", "cook", "cooking", "pasta"]],
  ["travel", ["travel", "bus", "transport"]],
]);

function getGoalKeywordMatches(keyword: string) {
  return goalKeywordAliases.get(keyword) ?? [keyword];
}

const supportPatterns = [
  /\bsupport(?:ed|ing)?\b/i,
  /\bassist(?:ed|ing)?\b/i,
  /\bhelp(?:ed|ing)?\b/i,
  /\bprompt(?:ed|ing|s)?\b/i,
  /\bremind(?:ed|er|ers)?\b/i,
  /\bpractic(?:ed|e|ing)\b/i,
  /\bworked on\b/i,
  /\bdiscuss(?:ed|ing)?\b/i,
  /\breview(?:ed|ing)?\b/i,
  /\bwent to\b/i,
  /\battended\b/i,
  /\bcompleted\b/i,
  /\bcommunity\b/i,
  /\bshopping?\b/i,
  /\bshops?\b/i,
  /\bbus\b/i,
  /\btransport\b/i,
  /\btravel\b/i,
  /\bmeal\b/i,
  /\bcook(?:ed|ing)?\b/i,
  /\bclean(?:ed|ing)?\b/i,
  /\blaundry\b/i,
  /\bmedication\b/i,
];

const responsePatterns = [
  /\brespond(?:ed|ing)?\b/i,
  /\bengag(?:ed|ing)\b/i,
  /\bparticipat(?:ed|ing)\b/i,
  /\bcompleted\b/i,
  /\bsaid\b/i,
  /\btold\b/i,
  /\breported\b/i,
  /\basked\b/i,
  /\bwanted\b/i,
  /\benjoy(?:ed|ing)?\b/i,
  /\bindependent(?:ly)?\b/i,
  /\bhappy\b/i,
  /\bcalm\b/i,
  /\bsettled\b/i,
  /\bquiet\b/i,
  /\bupset\b/i,
  /\bfrustrated\b/i,
  /\banxious\b/i,
  /\bnervous\b/i,
  /\btired\b/i,
  /\brefus(?:ed|ing)?\b/i,
  /\bdeclin(?:ed|ing)?\b/i,
];

const progressAndRiskPatterns = [
  /\bprogress\b/i,
  /\bimprov(?:ed|ing|ement)?\b/i,
  /\bbetter\b/i,
  /\bmore confident\b/i,
  /\bconfidence\b/i,
  /\bindependent(?:ly)?\b/i,
  /\bwithout prompt/i,
  /\bneeded\b.*\bprompt/i,
  /\bprompting\b/i,
  /\bdifficult(?:y)?\b/i,
  /\bstruggl(?:ed|ing)?\b/i,
  /\bchalleng(?:e|ed|ing)\b/i,
  /\bbarrier\b/i,
  /\bbusy\b/i,
  /\bcrowd(?:ed)?\b/i,
  /\bnoisy\b/i,
  /\banxious\b/i,
  /\bnervous\b/i,
  /\breluctant\b/i,
  /\brefus(?:ed|ing)?\b/i,
  /\bdeclin(?:ed|ing)?\b/i,
  /\brisk\b/i,
  /\bincidents?\b/i,
  /\binjur(?:y|ies|ed)\b/i,
  /\bfall\b/i,
  /\bbehaviou?r\b/i,
  /\bconcern\b/i,
  /\bprompts?\b/i,
];

const followUpPatterns = [
  /\bnext shift\b/i,
  /\bnext week\b/i,
  /\btomorrow\b/i,
  /\bfollow up\b/i,
  /\bcontinue\b/i,
  /\bplan to\b/i,
  /\bwill\b/i,
  /\bmonitor\b/i,
  /\bremind\b/i,
  /\bbook\b/i,
  /\bcall\b/i,
  /\breport\b/i,
  /\bhandover\b/i,
  /\bteam\b/i,
  /\bfamily\b/i,
  /\bcoordinator\b/i,
  /\bcheck\b/i,
];
