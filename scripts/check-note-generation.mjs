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
    name: "Good support note input",
    sourceText:
      "Supported Henry with shopping. He chose lunch items independently and was happy. No incidents.",
    participantGoals: ["Build community access confidence", "Improve daily living skills"],
    mustInclude: [
      "Worker supported Henry with shopping.",
      "chose lunch items independently",
      "No incidents were stated.",
    ],
    mustNotInclude: ["did not include enough support-specific detail"],
  },
  {
    name: "Rough voice-style input",
    sourceText:
      "um we went to the bus stop and practiced which bus to catch he was nervous but then settled",
    participantGoals: ["Build travel training confidence", "Improve daily living skills"],
    mustInclude: [
      "Worker supported the participant to practise identifying which bus to catch at the bus stop.",
      "Participant was nervous.",
      "Participant then settled.",
    ],
    mustNotInclude: ["um"],
  },
  {
    name: "Weak irrelevant input",
    sourceText:
      "Compare what is the difference between the department and worker within the given shift rate",
    participantGoals: ["Develop meal preparation skills", "Maintain medication routine"],
    mustInclude: [
      "did not include enough support-specific detail",
      "The participant's response was not clearly stated.",
      "Please capture the support delivered",
    ],
    mustNotInclude: [
      "Compare what is the difference",
      "department and worker",
      "given shift rate",
      "shift rate",
    ],
  },
  {
    name: "Minimal valid input",
    sourceText:
      "Shift completed, no issues.",
    participantGoals: ["Maintain medication routine", "Increase community participation"],
    mustInclude: [
      "Worker recorded that the shift was completed",
      "No issues were stated.",
    ],
    mustNotInclude: ["did not include enough support-specific detail"],
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
  "difference between the department and worker",
  "given shift rate",
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

  for (const phrase of example.mustInclude) {
    assert.match(
      result.aiDraft,
      new RegExp(escapeRegex(phrase), "i"),
      `${example.name} missing expected phrase: ${phrase}`,
    );
  }

  for (const phrase of example.mustNotInclude) {
    assert.equal(
      result.aiDraft.toLowerCase().includes(phrase.toLowerCase()),
      false,
      `${example.name} leaked unwanted phrase: ${phrase}`,
    );
  }

  console.log(`\n--- ${example.name} ---\n${result.aiDraft}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
