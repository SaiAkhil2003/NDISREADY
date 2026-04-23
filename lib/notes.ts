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
  "If the input is not a meaningful care note, produce a safe insufficient-detail fallback instead of echoing irrelevant text.",
] as const;

export function buildRuleBasedNoteDraft({
  sourceText,
  participantName,
  participantGoals,
  noteType,
  shiftDate,
}: RuleBasedNoteDraftInput): RuleBasedNoteDraft {
  const normalisedText = normaliseSourceText(sourceText);
  const sourceFacts = extractCleanSentences(normalisedText).filter(isAllowedCareFact);
  const relevance = assessSupportNoteRelevance(normalisedText, sourceFacts);
  const factBuckets = categoriseSourceFacts(sourceFacts);
  const goalsAddressed = deriveGoalsAddressed(participantGoals, [normalisedText]);
  const goalsSection =
    participantGoals.length === 0
      ? "- No participant goals were available in the workspace context."
      : relevance.isRelevant && goalsAddressed.length > 0
        ? goalsAddressed.map((goal) => `- ${goal}`).join("\n")
        : "- No participant goal was clearly referenced in the worker's original input.";

  const noteTitle = noteType ? getNoteTypeLabel(noteType) : "Support Note";

  if (!relevance.isRelevant) {
    return {
      aiDraft: buildInsufficientDetailDraft({
        noteTitle,
        participantName,
        shiftDate,
        goalsSection,
      }),
      goalsAddressed: [],
    };
  }

  return {
    aiDraft:
      `${noteTitle}:\n\n` +
      `Participant: ${participantName}\n\n` +
      `${shiftDate?.trim() ? `Date: ${shiftDate.trim()}\n\n` : ""}` +
      formatDraftSection({
        heading: "What support was provided",
        bullets: buildSupportBullets(factBuckets, sourceFacts),
        fallback: "Support details were not clearly stated in the worker's original input.",
      }) +
      "\n\n" +
      formatDraftSection({
        heading: "Participant response / outcome",
        bullets: buildResponseBullets(factBuckets),
        fallback: "The participant's response or outcome was not stated in the worker's original input.",
      }) +
      "\n\n" +
      formatDraftSection({
        heading: "Progress / difficulty observed",
        bullets: buildProgressBullets(factBuckets, sourceFacts),
        fallback: "No specific progress, difficulty, incident, injury, or behavioural concern was stated in the worker's original input.",
      }) +
      "\n\n" +
      `Goals addressed:\n${goalsSection}\n\n` +
      formatDraftSection({
        heading: "Follow-up / next steps",
        bullets: buildFollowUpBullets(factBuckets),
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
  const sourceSegments = addVoiceTranscriptBoundaries(sourceText)
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

function buildInsufficientDetailDraft(input: {
  noteTitle: string;
  participantName: string;
  shiftDate?: string;
  goalsSection: string;
}) {
  return (
    `${input.noteTitle}:\n\n` +
    `Participant: ${input.participantName}\n\n` +
    `${input.shiftDate?.trim() ? `Date: ${input.shiftDate.trim()}\n\n` : ""}` +
    "What support was provided:\n" +
    "- The worker's original input did not include enough support-specific detail to produce a complete case note.\n\n" +
    "Participant response / outcome:\n" +
    "- The participant's response was not clearly stated.\n\n" +
    "Progress / difficulty observed:\n" +
    "- No clear care-related progress or difficulty was described.\n\n" +
    `Goals addressed:\n${input.goalsSection}\n\n` +
    "Follow-up / next steps:\n" +
    "- Please capture the support delivered, participant response, and any next step in the worker's original words."
  );
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

type CategorisedSourceFacts = ReturnType<typeof categoriseSourceFacts>;

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

function assessSupportNoteRelevance(normalisedText: string, sourceFacts: string[]) {
  const hasBlockedBusinessLanguage = containsPattern(normalisedText, blockedIrrelevantPatterns);
  const hasMinimalCompletion = containsPattern(normalisedText, minimalCareCompletionPatterns);
  const supportFactCount = sourceFacts.filter((fact) => containsPattern(fact, careActionPatterns)).length;
  const contextFactCount = sourceFacts.filter((fact) => containsPattern(fact, careContextPatterns)).length;
  const outcomeFactCount = sourceFacts.filter((fact) => containsPattern(fact, careOutcomePatterns)).length;
  const meaningfulSignalCount = supportFactCount + contextFactCount + outcomeFactCount;

  if (hasBlockedBusinessLanguage && supportFactCount + contextFactCount === 0) {
    return { isRelevant: false, meaningfulSignalCount };
  }

  if (hasMinimalCompletion) {
    return { isRelevant: true, meaningfulSignalCount: meaningfulSignalCount + 1 };
  }

  return {
    isRelevant: supportFactCount + contextFactCount > 0 || meaningfulSignalCount >= 2,
    meaningfulSignalCount,
  };
}

function buildSupportBullets(facts: CategorisedSourceFacts, sourceFacts: string[]) {
  const actionSupportFacts = facts.support.filter((fact) => containsPattern(fact, careActionPatterns));
  const supportFacts =
    actionSupportFacts.length > 0
      ? actionSupportFacts
      : facts.support.length > 0
        ? facts.support
        : sourceFacts.filter((fact) => containsPattern(fact, minimalCareCompletionPatterns));

  return supportFacts.map(professionaliseSupportFact).filter(Boolean);
}

function buildResponseBullets(facts: CategorisedSourceFacts) {
  return facts.response
    .map(professionaliseResponseFact)
    .filter((fact) => fact && !isOnlyRiskOrNoIssueFact(fact));
}

function buildProgressBullets(facts: CategorisedSourceFacts, sourceFacts: string[]) {
  const progressFacts =
    facts.progress.length > 0
      ? facts.progress
      : sourceFacts.filter((fact) => containsPattern(fact, minimalCareCompletionPatterns));

  return progressFacts.map(professionaliseProgressFact).filter(Boolean);
}

function buildFollowUpBullets(facts: CategorisedSourceFacts) {
  return facts.followUp.map(professionaliseFollowUpFact).filter(Boolean);
}

function professionaliseSupportFact(fact: string) {
  const cleanedFact = stripNonCareFragments(fact);
  const lowerFact = cleanedFact.toLowerCase();

  if (!cleanedFact) {
    return "";
  }

  if (containsPattern(lowerFact, minimalCareCompletionPatterns)) {
    return "Worker recorded that the shift was completed and no further support activity detail was stated.";
  }

  if (/\b(bus stop|which bus|bus to catch)\b/i.test(cleanedFact)) {
    return "Worker supported the participant to practise identifying which bus to catch at the bus stop.";
  }

  if (/\bshops?\b|\bshopping\b/i.test(cleanedFact)) {
    return cleanedFact
      .replace(/^Worker took (.+?) to the shops\.$/i, "Worker supported $1 with shopping.")
      .replace(/^Took (.+?) to the shops\.$/i, "Worker supported $1 with shopping.");
  }

  if (/\bcook|meal|pasta|kitchen/i.test(cleanedFact)) {
    return cleanedFact.replace(
      /^Worker helped .+? cook (.+?) and clean the kitchen\.$/i,
      "Worker supported the participant with meal preparation and kitchen clean-up.",
    );
  }

  return cleanedFact;
}

function professionaliseResponseFact(fact: string) {
  if (!containsPattern(fact, participantResponseSpecificPatterns)) {
    return "";
  }

  const cleanedFact = stripNonCareFragments(fact)
    .replace(/\bwas happy\b/gi, "was described as happy")
    .replace(/\band no incidents?\b/gi, "")
    .replace(/\bno incidents?\b/gi, "")
    .replace(/\bno issues?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanedFact ? withSentencePunctuation(cleanedFact) : "";
}

function professionaliseProgressFact(fact: string) {
  const cleanedFact = stripNonCareFragments(fact);

  if (!cleanedFact) {
    return "";
  }

  if (/\bno incidents?\b/i.test(cleanedFact)) {
    return "No incidents were stated.";
  }

  if (/\bno issues?\b/i.test(cleanedFact)) {
    return "No issues were stated.";
  }

  return cleanedFact.replace(/\bwas happy\b/gi, "was described as happy");
}

function professionaliseFollowUpFact(fact: string) {
  return stripNonCareFragments(fact);
}

function stripNonCareFragments(fact: string) {
  if (containsPattern(fact, blockedIrrelevantPatterns)) {
    return "";
  }

  return withSentencePunctuation(fact.replace(/\s+/g, " ").trim());
}

function isAllowedCareFact(fact: string) {
  if (!fact.trim()) {
    return false;
  }

  if (containsPattern(fact, blockedIrrelevantPatterns)) {
    return false;
  }

  return true;
}

function isOnlyRiskOrNoIssueFact(fact: string) {
  const normalisedFact = fact.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();

  return ["no incident", "no incidents", "no issue", "no issues"].includes(normalisedFact);
}

function addVoiceTranscriptBoundaries(value: string) {
  return value
    .replace(/\s+but\s+then\s+/gi, ". then ")
    .replace(
      /\s+(?=(?:he|she|they|participant)\s+(?:was|were|said|felt|became|settled|needed|completed|chose|asked|responded|engaged|refused|declined)\b)/gi,
      ". ",
    );
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
    .replace(/\b(?:yeah|like|you know|basically|sort of|kind of|i think)\b/gi, " ")
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
    .replace(/^(he|she|they)\s+/i, "Participant ")
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

const blockedIrrelevantPatterns = [
  /\bcompare\b/i,
  /\bdifference between\b/i,
  /\bdepartment\b/i,
  /\bgiven shift rate\b/i,
  /\bshift rate\b/i,
  /\bpay rate\b/i,
  /\broster rate\b/i,
  /\binvoice rate\b/i,
  /\bbilling rate\b/i,
];

const minimalCareCompletionPatterns = [
  /\bshift completed\b/i,
  /\bcompleted shift\b/i,
  /\bno issues?\b/i,
  /\bno incidents?\b/i,
];

const careActionPatterns = [
  /\bsupport(?:ed|ing)?\b/i,
  /\bassist(?:ed|ing)?\b/i,
  /\bhelp(?:ed|ing)?\b/i,
  /\bprompt(?:ed|ing|s)?\b/i,
  /\bremind(?:ed|er|ers)?\b/i,
  /\bpractic(?:ed|e|ing)\b/i,
  /\bworked on\b/i,
  /\breview(?:ed|ing)?\b/i,
  /\btook\b.+\bto\b/i,
  /\bwent to\b/i,
  /\battended\b/i,
  /\bshift completed\b/i,
  /\bcompleted shift\b/i,
];

const careContextPatterns = [
  /\bcommunity\b/i,
  /\bshopping?\b/i,
  /\bshops?\b/i,
  /\blunch\b/i,
  /\bdinner\b/i,
  /\bbus\b/i,
  /\btransport\b/i,
  /\btravel\b/i,
  /\bmeal\b/i,
  /\bcook(?:ed|ing)?\b/i,
  /\bclean(?:ed|ing)?\b/i,
  /\bkitchen\b/i,
  /\blaundry\b/i,
  /\bmedication\b/i,
  /\broutine\b/i,
  /\bappointment\b/i,
  /\bgym\b/i,
  /\bexercise\b/i,
  /\bshower\b/i,
  /\bpersonal care\b/i,
];

const careOutcomePatterns = [
  /\brespond(?:ed|ing)?\b/i,
  /\bengag(?:ed|ing)\b/i,
  /\bparticipat(?:ed|ing)\b/i,
  /\bcompleted\b/i,
  /\bchose\b/i,
  /\bindependent(?:ly)?\b/i,
  /\bhappy\b/i,
  /\bsettled\b/i,
  /\banxious\b/i,
  /\bnervous\b/i,
  /\bno issues?\b/i,
  /\bno incidents?\b/i,
  /\bprompts?\b/i,
];

const participantResponseSpecificPatterns = [
  /\brespond(?:ed|ing)?\b/i,
  /\bengag(?:ed|ing)\b/i,
  /\bparticipat(?:ed|ing)\b/i,
  /\bcompleted (?:most|all|the|his|her|their)\b/i,
  /\bchose\b/i,
  /\bsaid\b/i,
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
  /\bshift completed\b/i,
  /\bcompleted shift\b/i,
  /\bcommunity\b/i,
  /\bshopping?\b/i,
  /\bshops?\b/i,
  /\blunch\b/i,
  /\bdinner\b/i,
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
  /\bchose\b/i,
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
  /\bno issues?\b/i,
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
