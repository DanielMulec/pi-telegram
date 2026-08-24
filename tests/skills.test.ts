/**
 * Bundled Telegram skill discovery regressions
 * Covers source/runtime path contribution and package publication metadata
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  registerTelegramSkillDiscovery,
  TELEGRAM_SKILLS_PATH,
} from "../lib/skills.ts";

test("Telegram extension contributes all bundled skills", async () => {
  let resourceHook: (() => { skillPaths: string[] }) | undefined;
  registerTelegramSkillDiscovery({
    on(name: string, hook: unknown) {
      assert.equal(name, "resources_discover");
      resourceHook = hook as () => { skillPaths: string[] };
    },
  } as never);

  assert.deepEqual(resourceHook?.(), { skillPaths: [TELEGRAM_SKILLS_PATH] });
  const skillNames = ["telegram-bridge", "generated-control-surface", "generative-apps"];
  const sources = new Map<string, string>();
  for (const name of skillNames) {
    const source = await readFile(join(TELEGRAM_SKILLS_PATH, name, "SKILL.md"), "utf8");
    sources.set(name, source);
    assert.match(source, new RegExp(`^name: ${name}$`, "m"));
    assert.match(source, /^description: .+$/m);
  }
  const bridge = sources.get("telegram-bridge") ?? "";
  assert.match(bridge, /`generated-control-surface`/u);
  assert.match(bridge, /Compact Matrix Literal \(CML\)/u);
  assert.match(
    bridge,
    /Prefer CML.*expanded JSON only.*concrete parse\/render failure fallback/su,
  );
  assert.match(bridge, /without a parser-level width cap/u);
  assert.match(bridge, /six through eight.*short position-bearing labels/u);
  assert.match(bridge, /bundled `generative-apps` Skill/u);
  assert.match(
    bridge,
    /maintained Generative App.*prefer binding or invoking.*one-shot prompt buttons/su,
  );
  assert.match(
    bridge,
    /routing guidance.*not permission.*discover capability-specific apps.*hard-code their identities/su,
  );
  assert.match(bridge, /before Pi queue admission/u);
  assert.match(
    bridge,
    /does not mean the current prompt came from Telegram.*does not grant intent.*only on a turn carrying structured Telegram origin/su,
  );
  assert.match(
    bridge,
    /do not activate it merely because Telegram is connected.*proactive push/su,
  );
  const generatedSurface = sources.get("generated-control-surface") ?? "";
  assert.match(generatedSurface, /without an explicit button request/u);
  assert.match(
    generatedSurface,
    /connected Telegram session.*proactive projection.*not activation intent/su,
  );
  assert.match(
    generatedSurface,
    /emitting controls is required.*bounded confirmations or choices.*2–6 safe controls/su,
  );
  assert.match(
    generatedSurface,
    /blocking questions.*scope, version, workflow classification, approval, or the next release step/su,
  );
  assert.match(
    generatedSurface,
    /do not ship a prose-only blocking question merely because the answer is short/su,
  );
  assert.match(
    generatedSurface,
    /workflow handoff.*complete correction or implementation command.*project the user's likely next intent.*prepare → release/su,
  );
  assert.match(
    generatedSurface,
    /anticipatory interaction.*demonstrated workflow.*never silently executed/su,
  );
  assert.match(
    generatedSurface,
    /completed act unblocks a high-confidence next intent.*parent goal and workflow trajectory.*no explicit pending question exists/su,
  );
  assert.match(
    generatedSurface,
    /no semantic column headings.*first data row as the syntactic header.*Do not insert blank, dash-only, duplicate, or invented placeholder headings/su,
  );
  assert.match(generatedSurface, /Compact Matrix Literal \(CML\)/u);
  assert.match(
    generatedSurface,
    /Prefer CML.*expanded JSON only.*concrete CML parse\/render failure/su,
  );
  assert.match(generatedSurface, /one or more controls.*parser-level width cap/u);
  assert.match(
    generatedSurface,
    /ordered ragged sequence.*not as a rectangular matrix/su,
  );
  assert.match(
    generatedSurface,
    /Rectangular grids are one specialization.*genuinely spatial/su,
  );
  assert.match(
    generatedSurface,
    /Default to one full-width button per row.*genuine peers.*narrow phone-width chat/su,
  );
  assert.match(generatedSurface, /1 → 2 → 4 → 1 → 2/u);
  assert.match(generatedSurface, /never pad a row.*no-op controls/su);
  assert.match(
    generatedSurface,
    /two columns as an earned compact mode.*one emoji plus roughly two average-length words.*own row/su,
  );
  assert.match(
    generatedSurface,
    /at most two columns for readable text labels.*more semantic rows/su,
  );
  assert.match(
    generatedSurface,
    /Three through five columns.*short symbols.*Six through eight.*emoji-only controls.*eight columns/su,
  );
  assert.match(generatedSurface, /Eight is the phone-width UX maximum/u);
  assert.match(generatedSurface, /never generate a row of nine or more controls/u);
  assert.match(generatedSurface, /Never shorten necessary wording/u);
  assert.match(
    generatedSurface,
    /explicit `label` over exposing a long prompt.*Emoji are explicitly allowed and encouraged.*consistent semantic marker/su,
  );
  assert.match(
    generatedSurface,
    /vertical extent independently.*`8×16` field.*do not paginate/su,
  );
  assert.match(
    generatedSurface,
    /non-spatial collections.*semantic grouping, progressive disclosure, or pagination/su,
  );
  assert.match(
    generatedSurface,
    /symmetry as an evidence claim.*non-spatial task should be ragged by default/su,
  );
  assert.match(generatedSurface, /### Layout Catalog/u);
  assert.match(generatedSurface, /`1 → 2 → N×1`/u);
  assert.match(generatedSurface, /Repeated `2`.*Text-bearing choices/u);
  assert.match(generatedSurface, /`R×C`.*`C ≤ 8`.*`R` may be substantially larger/u);
  assert.match(
    generatedSurface,
    /Do not select a catalog shape first and force the task into it/u,
  );
  assert.match(
    generatedSurface,
    /smallest sufficient action delta.*do not duplicate/su,
  );
  assert.match(generatedSurface, /human-auditable Markdown state artifact/u);
  assert.match(generatedSurface, /current state \+ admitted action → next state/u);
  assert.match(generatedSurface, /complementary `generative-apps` Skill/u);
  assert.match(
    generatedSurface,
    /logical button-matrix.*full JSON\/CML.*third button Skill/su,
  );
  assert.match(
    generatedSurface,
    /ordinary model-mediated prompt buttons beside deterministic bound methods/su,
  );
  assert.match(generatedSurface, /latency, token, cost, reliability, or UX value/u);
  assert.match(generatedSurface, /repeated clicks against current state/u);
  assert.match(
    generatedSurface,
    /Preserve tap-ahead.*source-then-destination.*do not regenerate the board, enumerate destinations, or duplicate controls/su,
  );
  assert.match(
    generatedSurface,
    /current state rather than rigid click parity.*selects or replaces the source.*not a selectable source becomes a destination attempt/su,
  );
  const generativeApps = sources.get("generative-apps") ?? "";
  assert.match(generativeApps, /complement `generated-control-surface`/u);
  assert.match(generativeApps, /Standalone deterministic application/u);
  assert.match(generativeApps, /View\/controller adapter/u);
  assert.match(generativeApps, /bound method.*ordinary prompt/su);
  assert.match(
    generativeApps,
    /same logical button matrix.*full JSON\/CML notation.*no third button Skill/su,
  );
  assert.match(
    generativeApps,
    /Compile only the stable transitions.*model-mediated plane.*use `generated-control-surface` instead/su,
  );
  assert.match(generativeApps, /transport-independent concept/u);
  assert.match(generativeApps, /`generated` \/ `generative` distinction is intentional/u);
  assert.match(generativeApps, /replace: true/u);
  assert.match(generativeApps, /generic remote terminals/u);
  assert.match(generativeApps, /authoritative real owner/u);
  assert.doesNotMatch(generativeApps, /states\.jsonl|worker-isolated|transition lock/u);

  const generativeAppsDoc = await readFile(
    join(dirname(TELEGRAM_SKILLS_PATH), "docs", "generative-apps.md"),
    "utf8",
  );
  assert.match(generativeAppsDoc, /concrete Generative App runtime implemented by `pi-telegram`/u);
  assert.match(generativeAppsDoc, /concept.*belong to the bundled.*Skill/su);
  assert.match(generativeAppsDoc, /owns only `pi-telegram` implementation contracts/u);
  assert.match(generativeAppsDoc, /states\.jsonl/u);
  assert.match(generativeAppsDoc, /installation generation plus state revision/u);
  assert.match(generativeAppsDoc, /worker-isolated/u);
});

test("Generated filesystem surfaces declare structural navigation around paginated entries", async () => {
  const source = await readFile(
    join(TELEGRAM_SKILLS_PATH, "generated-control-surface", "SKILL.md"),
    "utf8",
  );
  const lfSource = source.replaceAll("\r\n", "\n");
  for (const candidate of [lfSource, lfSource.replaceAll("\n", "\r\n")]) {
    const section = candidate.match(/### Filesystem\r?\n([\s\S]*?)(?=\r?\n### )/u)?.[1] ?? "";
    const rules = section.match(/^\d+\. .+$/gmu) ?? [];
    assert.equal(rules.length, 4);
    assert.match(rules[0] ?? "", /⬆️ Up.*`\/`/u);
    assert.match(rules[1] ?? "", /⬅️ Previous.*➡️ Next/u);
    assert.match(
      rules[2] ?? "",
      /visible directories.*hidden directories.*visible files.*hidden files/u,
    );
    assert.match(rules[2] ?? "", /\b10\b/u);
    assert.match(rules[3] ?? "", /\*\*Path:\*\*.*\*\*Entries:\*\*/u);
    assert.match(rules[3] ?? "", /monospaced.*Refresh/u);
    assert.doesNotMatch(rules[3] ?? "", /·/u);
    assert.match(section, /one `telegram_button` JSON matrix/u);
    assert.match(section, /numbered text fallback/u);
    assert.match(section, /user explicitly requests it or durable user Knowledge/u);
  }
});

test("Package metadata publishes the bundled skill root", async () => {
  const packageRoot = dirname(TELEGRAM_SKILLS_PATH);
  const manifest = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8"),
  ) as { files?: string[]; pi?: { skills?: string[] } };

  assert.ok(manifest.files?.includes("skills/"));
  assert.deepEqual(manifest.pi?.skills, ["./skills"]);
});
