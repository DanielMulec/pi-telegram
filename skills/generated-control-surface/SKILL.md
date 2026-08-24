---
name: generated-control-surface
description: Proactively compiles current state, available capabilities, and user intent into contextual, evidence-backed, ephemeral prompt-button interfaces. Use without an explicit button request on Telegram-originated turns when controls materially shorten likely feedback, or when a user explicitly requests controls on another prompt-button transport; connection or proactive projection alone is not activation intent. Route reusable deterministic loops toward Generative Apps, omit decorative UI, and preserve domain ownership while fixed transport menus and callbacks remain with their runtime owners.
---

# Generated Control Surface

Compile a temporary, truthful interface from current state, available capabilities, and user intent. The agent remains the interpreter and authority boundary; the generated surface remains an ephemeral renderer projection, not a second application, hidden daemon, state owner, or direct grant of capability.

## Primitive

```text
interface = f(state, capabilities, intent)

current evidence + available acts + user intent
→ compact state projection → contextual controls
→ next prompt → authorized act → fresh projection
```

This is late-bound UI rather than a fixed frontend for one backend. Each response is one generated control surface whose renderer may be Telegram, another prompt-button transport, or a numbered fallback. Reinspect mutable reality after actions and regenerate instead of maintaining a parallel UI model.

The primitive belongs to the Surface plane: it projects State, exposes Agency capabilities, and preserves Constitution constraints without absorbing any of those owners. Its reusable competence lives in this Skill so quality depends less on rediscovering interface policy in each turn.

## Scope

Use this Skill only to synthesize a state-derived prompt-button surface. Operating or modifying an existing Telegram bridge menu, callback interface, fixed frontend, runtime-owned control, or installed Generative App stays with that subsystem and does not route here merely because it contains buttons.

This Skill and `generative-apps` share one logical button-matrix and `label + prompt` interaction model while retaining different execution owners. On Telegram, the bridge runtime owns the full JSON/CML action notation: this Skill emits an ephemeral surface from current context, while a Generative App returns reusable views through its script ABI. Shared rendering does not justify a third button Skill or move transport grammar into either interaction Skill.

When a generated surface reveals repeated stable interaction with bounded state and deterministic transitions, load the complementary `generative-apps` Skill and consider compiling that loop. A Generative App may retain ordinary model-mediated prompt buttons beside deterministic bound methods, so only the stable actions need bypass inference. Conversely, keep one-off, interpretive, changing, and context-heavy interaction here when a reusable script would add no concrete latency, token, cost, reliability, or UX value.

On Telegram-originated turns, evaluate this Skill proactively rather than waiting for the user to ask for buttons. A connected Telegram session, available button syntax, or proactive projection of local output is capability evidence, not activation intent: do not load this Skill for an unrelated local/TUI prompt merely because its answer may also appear in Telegram. Load and apply it when the current turn is Telegram-originated or the user explicitly requests a prompt-button surface and a likely next decision, approval, navigation step, inspection, or bounded action can be made materially easier through controls; its correct output may still contain zero buttons when the admission test fails.

A control surface may expose:

- Observation: status, evidence, progress, diagnostics, or summaries.
- Navigation: files, concepts, projects, artifacts, media, threads, or Actor Runs.
- Action: safe next operations over tools, workflows, services, or project state.
- Choice: alternatives, filters, priorities, approvals, or design decisions.
- Supervision: pause, continue, inspect, redirect, retry, or stop bounded work.

Console programs are one capability source, not the defining boundary. Use the real owner of each capability: a tool, API, repository, Actor runtime, filesystem, media system, documented workflow, or the explicit state of the conversation.

## Core Contract

- Generate controls from current evidence, an explicit contract, or clearly labeled conversational state.
- Keep domain state with its real owner; never invent a shadow navigation tree, task database, or application session.
- Make every button prompt minimally sufficient for a truthful continuation: reuse unambiguous visible conversational context, but include stable target, state, constraint, or freshness identity whenever omission could change the action.
- Treat a click as an ordinary user request subject to the same authority, validation, and safety rules as typed text.
- Never infer permission for destructive, privileged, credential-bearing, external, or irreversible work merely because a button exists.
- Do not encode secrets, hidden reasoning, credentials, private keys, tokens, cookies, wallet material, or sensitive content in labels or prompts.
- Show uncertainty, unavailable state, truncation, filtering, and stale evidence honestly.
- Prefer a few high-value controls over exhaustive action enumeration.

## Control Admission

Buttons are optional only when no candidate passes the admission test. Bias toward offering them whenever they materially shorten a likely feedback loop. If the user can approve, reject, refine, prioritize, redirect, inspect, or choose a concrete next step faster by tapping than by composing a reply, proactively expose the smallest useful control set without waiting to be asked for buttons.

On a Telegram-originated turn, emitting controls is required when the response asks the user for one or more bounded confirmations or choices, the likely answers can be represented truthfully in 2–6 safe controls, and no secret-bearing or high-impact ambiguity blocks their formulation. This includes blocking questions such as confirming scope, version, workflow classification, approval, or the next release step. Ask in prose when explanation is necessary, but attach the controls in the same reply; the availability of free-form typing is not a reason to omit them. A high-impact operation still uses the required confirmation flow rather than a one-tap execution shortcut.

Apply the same requirement at a workflow handoff even when the current user message itself was a complete correction or implementation command. Before concluding a Telegram reply, project the user's likely next intent from the active goal, recent trajectory, newly completed act, and available capabilities—not only from an explicitly pending question. Typical phase transitions include “prepare → release”, “inspect → approve”, “fix → rerun”, and “draft → send”. If one next action or a small alternative set is high-confidence, newly unblocked, truthfully expressible, and safe to request, emit 2–6 controls now instead of waiting for the user to restate the obvious next step. A narrowly completed subtask does not erase the parent intent or make the predictive handoff decorative.

This is anticipatory interaction, not generic suggestion generation. Prefer controls that advance the user's demonstrated workflow over broad capability menus, speculative side quests, or “What next?” buttons. A predicted high-impact action is offered as an explicit self-contained request or confirmation, never silently executed. When confidence is low or materially different next intents compete, omit controls or expose only the smallest clarifying choice.

Zero buttons remains preferable when controls would only decorate the answer, restate visible prose, solicit generic “What next?” input, expose an unclear consequence, save negligible effort, or when the user already issued a complete command and neither that command nor the inferred active workflow leaves a high-confidence immediate decision. A button earns its place by reducing response effort, ambiguity, turnaround time, or supervision cost while preserving an ordinary typed reply as a first-class option.

For status requests, show a compact `Refresh` control and bounded inspect/drill-down controls only when work is active, blocked, stale-sensitive, or otherwise actionable. A completed static status needs no buttons. Do not add destructive shortcuts or actions whose target and consequence are not yet clear.

## Feedback Leverage

Treat feedback compression as the primary reason to make controls more visible and proactive:

- Offer 2–6 high-confidence choices when they cover likely responses without pretending to be exhaustive.
- Prefer controls for approval gates, bounded alternatives, priority changes, review verdicts, correction direction, and active-work supervision.
- Put the most likely or highest-leverage response first, while keeping labels neutral enough to avoid steering the decision dishonestly.
- Include an explicit free-form path in visible text when the listed choices cannot represent the full answer.
- Regenerate controls after feedback so the next surface reflects the new decision rather than repeating stale options.
- Omit controls when the user is already expressing a clear command and no immediate follow-up decision is needed.

## Surface Model

A surface normally contains:

1. A short title naming the controlled object or decision.
2. A compact projection of relevant state, evidence, choices, or output.
3. Provenance when it matters: target, source, timestamp, run identity, status, or truncation note.
4. Buttons for likely next intents.
5. `Back` or `Up` for hierarchy navigation when meaningful.
6. `Refresh` when the projected state can change.

Prefer 2–6 controls for feedback and decisions; navigation collections may use up to 12 when the additional entries remain scannable. Split larger sets by category or page instead of building a button wall. Do not add navigation controls when the surface is a one-step decision.

When a logical grid has no semantic column headings but Markdown table syntax requires a header row, use the grid's first data row as the syntactic header and render each remaining row once beneath it. Do not insert blank, dash-only, duplicate, or invented placeholder headings: they add a false row to the projected topology. Use ordinary semantic headings when the data actually has named columns.

Present compact metadata as stacked key-value rows that reuse status-surface grammar: a short bold label, a colon, and an inline-code value when the value is path-like, numeric, an identifier, or machine state. In Telegram Rich Markdown, use an actual Markdown list or blank paragraph boundaries so soft line breaks cannot collapse several fields into one visual line. Prefer ``- **Path:** `/home/llb` `` and ``- **Entries:** `1–10 of 52` `` over prose fragments joined by a middle dot or other decorative section separator.

## Truth Modes

Name the basis of the surface when ambiguity matters:

- Live: freshly inspected mutable state.
- Contract: stable documented capabilities or choices.
- Conversation: alternatives or intents established in the current dialogue.
- Adapted: bounded or transformed output whose omissions are stated.

Do not present remembered or inferred state as live. After a mutation, refresh affected state before claiming success or generating dependent controls.

## Evidence Fidelity

Preserve material identities, values, ordering, warnings, errors, and status. Adaptation may group, translate, label, paginate, rank, or collapse repeated successful detail, but it must not:

- Convert failure into success.
- Hide material warnings or unavailable evidence.
- Present a subset as complete.
- Change identifiers, values, causal order, or authority.
- Turn a proposal into completed state.

State adaptation explicitly, for example: `Показаны 20 из 184 записей, по размеру`.

## Safety And Confirmation

Classify each action as read-only, ordinary mutation, privileged, destructive, secret-bearing, external, or irreversible.

Use a two-stage flow for high-impact actions:

1. An action button opens a confirmation surface naming the exact target, effect, and recovery boundary.
2. A distinct confirmation button requests the exact operation.

Re-check mutable targets immediately before execution. Access denial never authorizes automatic privilege escalation. If evidence may expose secrets, stop before display and offer metadata-only or redacted alternatives.

## Prompt Buttons

Use the transport's canonical prompt-button syntax. For pi-telegram, one top-level `telegram_button` comment accepts one JSON object, double-quoted attributes, an adaptive JSON/CML matrix, or positional Compact Matrix Literal (CML). One matrix or row may mix named JSON objects with positional cells, and commas are optional only between completed elements while JSON object internals remain strict. CML uses `{value}`, `{label|prompt}`, or `{label|prompt|selected_style}`; the optional third atom requires an explicit prompt and accepts only `primary`, `success`, or `danger`. It trims atom boundaries, preserves other printable text literally, and decodes only `\|`, `\}`, and `\\`. Prefer CML whenever the model authors the control and it can express the required surface; fall back to expanded JSON only for multiline prompts, non-positional metadata, or a concrete CML parse/render failure, never merely from implementation habit. Deterministic Generative App scripts may return ordinary JSON because their source payload does not consume model-output tokens; author and operate those adapters through the `generative-apps` Skill rather than growing a parallel app workflow here. A top-level cell becomes one full-width row, while a nested row groups one or more controls horizontally without a parser-level width cap. Prefer one layout comment for multiple controls instead of repeating the marker; `telegram_buttons` is a plural alias, not a different format.

### Semantic Row Composition

Model the control surface as an ordered ragged sequence of independently sized rows, not as a rectangular matrix to fill. Rectangular grids are one specialization for genuinely spatial or coordinate-bearing state; most interfaces should vary row width according to hierarchy, grouping, label pressure, and action priority.

- Default to one full-width button per row for non-spatial controls. Put controls in one compact row only when they are genuine peers that answer the same local question or form one coherent toolbar/navigation group **and** their rendered labels comfortably fit a narrow phone-width chat.
- Use a singleton full-width row for a structurally independent, pinned, primary, summary, or high-consequence action, and whenever label length makes horizontal grouping cramped or ambiguous.
- Vary row widths intentionally—for example `1 → 2 → 4 → 1 → 2`—and never pad a row with empty, duplicate, or no-op controls merely to produce uniform dimensions.
- Preserve reading order across rows: orientation and structural navigation first, primary content or choices next, secondary controls afterward, and destructive actions visibly separated when present.
- Treat two columns as an earned compact mode, not the default: a pair normally fits when each label is no more than one emoji plus roughly two average-length words. If either label has more words, unusually long words, qualifiers, or likely wrapping, place each button on its own row. Use at most two columns for readable text labels; move additional peer choices into more semantic rows rather than compressing textual buttons across a phone-width line. Three through five columns are for short symbols, glyphs, coordinates, or compact codes whose position carries meaning. Six through eight may be used only for single-glyph or similarly minimal position-bearing labels whose grouping materially improves the interaction; a row of emoji-only controls may therefore legitimately use up to eight columns. Eight is the phone-width UX maximum: never generate a row of nine or more controls even though the parser has no artificial width cap. Never shorten necessary wording merely to increase row density; regroup or use full-width rows when labels need explanation, wrap ambiguously, or lose meaning without prose.

Treat vertical extent independently from horizontal density. A genuinely spatial surface may retain many rows—such as an `8×16` field—when vertical continuity, coordinates, and one-glance topology matter; do not paginate merely to make its height match its width. For non-spatial collections, however, a tall button wall should yield to semantic grouping, progressive disclosure, or pagination. Keep compact state and instructions above a tall surface, preserve stable coordinates across regeneration, and avoid repeating prose between rows.

Treat symmetry as an evidence claim about the task. Equal rectangular rows imply equal relationships and stable spatial correspondence; do not make that claim merely because the renderer supports a grid. Infer the task's independent, peer, ordered, hierarchical, and spatial relationships first, then let those relationships determine row boundaries and widths. A non-spatial task should be ragged by default, and its asymmetry should remain visible when that best communicates hierarchy or action weight.

### Layout Catalog

Use this catalog as a shape vocabulary, not a fixed menu of demos:

- `1`: One independent full-width action, destination, summary drill-down, or consequence boundary.
- `2`: One binary or tightly coupled peer decision; neither control is visually subordinated.
- `1 → 2`: One orienting or primary action followed by a local peer pair.
- `2 → 1`: One peer mode/filter pair followed by an independent continuation or detail action.
- `1 → 2 → N×1`: Pinned structural navigation, compact traversal, then a vertical collection of independently readable items.
- `1 → 2 → 3 → 1`: Ragged staged control where context, local alternatives, denser short peers, and a separated terminal action have different semantic weight.
- Repeated `2`: Text-bearing choices distributed down the screen instead of compressed across it.
- `R×C`: A rectangular layout only when rows and columns map to genuine coordinates, repeated dimensions, or another stable spatial topology; keep `C ≤ 8`, while `R` may be substantially larger when preserving vertical continuity is useful.

Adapt a surface by identifying relationships, grouping only genuine peers, ordering groups by task hierarchy, applying label-pressure limits, and then choosing the least regular layout that remains immediately comprehensible. Do not select a catalog shape first and force the task into it.

Preserve the ordinary admission test: proactively offer an interactive surface even when the user did not request buttons when it materially reduces effort or demonstrates an available capability, but do not manufacture decorative interaction.

### Interaction State And Prompt Compression

- Encode the smallest sufficient action delta in repeated controls. When the visible surface and immediately preceding conversation establish one unambiguous state, a coordinate, symbol, identifier, or short verb can be the entire prompt; do not duplicate the same board, form, or selection state into every button payload.
- Keep compact prompts semantically closed over their context. If delivery may be delayed, reordered, routed elsewhere, or separated from the state projection, add a stable target or state identity rather than copying a large volatile snapshot.
- Keep trivial interaction state in the visible conversation. When state becomes too large, long-lived, or error-prone for reliable conversational reconstruction, persist a small human-auditable Markdown state artifact at a deterministic task-owned path and render from it. The artifact belongs to the underlying task or domain, not to this Skill as shadow application state.
- When transition rules are non-trivial or correctness-sensitive, use a small deterministic state-transition owner—script, module, tool, or existing domain API—that validates `current state + admitted action → next state`; let the model compile the surface from its result instead of informally simulating every transition. Do not create code or files for a trivial one-step interaction.
- Treat repeated clicks against current state, not stale button appearance. If an action is already consumed or unavailable, keep state unchanged and say so briefly. Preserve an occupied or selected button when spatial layout matters, using its label or selected style as the visual state; omit unavailable controls when layout does not matter. Transport-level disabled buttons are optional, not assumed.
- Preserve tap-ahead on transports where existing controls remain actionable and rapid clicks queue separate turns. In a source-then-destination interaction, persist the source selection but do not regenerate the board, enumerate destinations, or duplicate controls between the two prompts; emit at most a minimal acknowledgement and let the already visible surface carry the destination click. Regenerate after the completed transition, invalid input, or evidence that the transport cannot preserve the intermediate surface.
- Resolve coordinate selection by current state rather than rigid click parity. Clicking any currently selectable source selects or replaces the source and then waits; acknowledge a replacement tersely without regenerating the surface. Only a click that is not a selectable source becomes a destination attempt when a source is already selected, at which point the domain owner validates the transition. Without a selected source, a non-source coordinate is a no-op.

```html
<!-- telegram_button {"label":"🔍 Inspect run","prompt":"Inspect Run run:example read-only, summarize its current status and latest material evidence, then regenerate relevant supervision controls."} -->
<!-- telegram_button [{⬆️ Up|/}[{⬅️ Previous}{➡️ Next}]{📁 etc|/etc}] -->
```

Button prompts must:

- Preserve the user's language.
- Name exact targets when visible context does not make them unambiguous.
- Express one coherent next intent with the shortest sufficient action delta.
- Carry material safety and scope restrictions.
- Request fresh inspection when state may have changed.
- Avoid embedding volatile output that should be rediscovered.

Labels stay short, distinct, and scannable. Prefer an explicit `label` over exposing a long prompt as button text. Emoji are explicitly allowed and encouraged when one consistent semantic marker improves scanning or expressiveness; keep their meaning consistent across sibling controls, avoid decorative noise, and do not rely on emoji or color alone. If buttons are unavailable, render the same control surface as a numbered choice list.

## Capability Adapters

### Console And System

Use normal console programs as the capability owner. Check exit status and stderr before rendering success. Preserve complete output when reasonably sized; otherwise label pagination, filtering, head/tail, or ranked subsets. High-impact process, service, package, permission, shutdown, disk, and deletion actions require confirmation.

### Filesystem

Treat a user prompt that is exactly a plausible filesystem path—including `/`—as legitimate intent to render that location through a generated filesystem surface. Resolve and freshly inspect it before display. Directory surfaces use one stable navigation layout:

1. Pin `⬆️ Up` as the first full-width row whenever the current path is not filesystem root; its entire prompt is the exact parent path. Omit Up at `/`.
2. When page traversal exists, place `⬅️ Previous` and `➡️ Next` together in one compact row immediately after Up, omitting either unavailable direction. Page traversal re-inspects the directory and preserves a fixed 10-entry page size; moving Up opens the parent at page one.
3. Sort entries by semantic category before pagination: visible directories, hidden directories, visible files, then hidden files; sort names alphabetically within each category. Render at most 10 resulting entry buttons as full-width rows after structural navigation. Each label uses the entry name plus a semantic folder/file emoji, and its entire prompt may be the exact target path because this Skill defines path-only prompts as navigation intent.
4. Keep visible text to two compact status-style rows such as ``**Path:** `/home/llb` `` and ``**Entries:** `1–10 of 52` ``; do not join metadata with a middle dot and do not duplicate entry names as a plain or monospaced directory listing. Omit Refresh by default because resubmitting the current path already requests fresh rendering.

For pi-telegram, emit the complete filesystem control set—Up, compact page traversal, then current-page entries—in one `telegram_button` JSON matrix rather than repeating one hidden comment per button. If prompt buttons are unavailable or fail to render, preserve the same ordering and pagination as an ordinary numbered text fallback, not a monospaced inventory, so free-form path entry remains sufficient. Show a plain or monospaced directory listing instead only when the user explicitly requests it or durable user Knowledge establishes that presentation preference. Never preview credential stores, private keys, browser profiles, cookies, tokens, wallets, or other secret-bearing files, and never raise privileges merely to enumerate a path.

### Workflows And Actor Runs

Keep exact workflow, Recipe, Run, artifact, or task identity visible. Controls may inspect, pause, continue, redirect, retry, or stop only through the owning runtime contract. Never simulate lifecycle state, bypass Control semantics, or treat a generated button as direct execution authority.

### Decisions And Design

Buttons may represent explicit alternatives without live system inspection. State the decision being made, preserve meaningful trade-offs in visible text, and ensure each prompt records the selected intent rather than silently executing downstream consequences.

## Action Procedure

1. Identify the controlled object, user goal, and capability owner.
2. Decide whether the surface needs live, contract, conversational, or adapted evidence.
3. Inspect only the state required for a truthful projection.
4. Classify candidate controls by authority and impact.
5. Render compact state plus context-relevant controls.
6. On the next turn, interpret the click as a new request and execute only what it authorizes.
7. Validate the result and regenerate from retained reality.

## Failure And Empty States

- Show concise failure evidence and offer diagnosis, retry, refresh, back, or a narrower action.
- If a target disappears, return to the nearest valid parent or owner instead of reusing stale controls.
- If no action is currently valid, say so rather than generating decorative buttons.
- Mark unsupported, sentinel, inferred, or unreliable values explicitly.
- Keep safe navigation and refresh controls in empty collections when useful.

## Quality Check

Before sending a surface, verify:

- If the reply asks a Telegram user for bounded confirmation or selection, qualifying controls are present; do not ship a prose-only blocking question merely because the answer is short.
- If the completed act unblocks a high-confidence next intent inferred from the parent goal and workflow trajectory, qualifying handoff controls are present even when no explicit pending question exists and the latest user message was itself a complete command.
- State and controls share one clear owner and target.
- Live claims come from current evidence.
- Complete versus filtered or adapted output is labeled honestly.
- No secret appears in visible text or button payloads.
- Every button carries a valid self-contained next intent and measurably shortens likely feedback.
- The surface preserves free-form feedback when choices are not exhaustive.
- High-impact operations route through confirmation.
- Back/Up and Refresh appear only when useful.
- The surface remains readable on a mobile screen.
