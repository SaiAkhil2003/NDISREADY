import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const targetPath = path.join(rootDir, request.slice(2));
    const resolvedPath = ["", ".ts", ".tsx", ".js", ".jsx"]
      .map((extension) => `${targetPath}${extension}`)
      .find((candidate) => fs.existsSync(candidate));

    if (resolvedPath) {
      return resolvedPath;
    }
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });

  module._compile(output.outputText, filename);
};

const { buildRuleBasedNoteDraft } = require("../lib/notes.ts");

const representativeExamples = [
  {
    name: "Short casual worker note",
    sourceText:
      "Took Maya to the shops. She bought lunch and was happy. No incidents.",
    participantGoals: ["Build community access confidence", "Improve daily living skills"],
  },
  {
    name: "Voice-style imperfect note",
    sourceText:
      "um we went to the bus stop and practiced which bus to catch, he was nervous because it was busy, then settled and said it was easier than last time",
    participantGoals: ["Build travel training confidence", "Improve daily living skills"],
  },
  {
    name: "Activity and outcome",
    sourceText:
      "I helped Jordan cook pasta and clean the kitchen. Jordan completed most steps after two prompts and asked to cook again next week.",
    participantGoals: ["Develop meal preparation skills", "Maintain medication routine"],
  },
  {
    name: "Goals and support detail",
    sourceText:
      "Supported Priya with medication reminder after dinner and reviewed the evening checklist. Priya ticked off the checklist independently. Continue the checklist next shift.",
    participantGoals: ["Maintain medication routine", "Increase community participation"],
  },
];

const requiredHeadings = [
  "What support was provided:",
  "Participant response / outcome:",
  "Progress / difficulty observed:",
  "Goals addressed:",
  "Follow-up / next steps:",
];

const bannedUnsupportedPhrases = [
  "planned support activities",
  "after discussion and reassurance",
  "when compared with previous support",
  "Ongoing support should continue in line with participant needs",
  "Continue current support strategies",
];

for (const example of representativeExamples) {
  const result = buildRuleBasedNoteDraft({
    sourceText: example.sourceText,
    participantName: "Maya Chen",
    participantGoals: example.participantGoals,
    noteType: "progress_update",
    shiftDate: "2026-04-23",
  });

  for (const heading of requiredHeadings) {
    assert.match(result.aiDraft, new RegExp(escapeRegex(heading)), `${example.name} missing ${heading}`);
  }

  for (const phrase of bannedUnsupportedPhrases) {
    assert.equal(
      result.aiDraft.includes(phrase),
      false,
      `${example.name} reintroduced unsupported phrase: ${phrase}`,
    );
  }

  console.log(`\n--- ${example.name} ---\n${result.aiDraft}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
