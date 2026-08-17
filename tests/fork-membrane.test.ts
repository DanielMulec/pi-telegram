/**
 * Fork membrane contract tests
 * Zones: telegram, pi agent, extension interop
 * Proves the public command bridge, narrow context projection, and hermetic listing.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

import {
  createTelegramExtensionCommandActions,
  createTelegramExtensionCommandBridge,
  createTelegramExtensionCommandContextView,
  listSessions,
} from "../lib/commands.ts";
import { SessionManager, type ExtensionAPI, type ExtensionCommandContext } from "../lib/pi.ts";

type RegisteredCommand = Parameters<ExtensionAPI["registerCommand"]>[1];

type FixtureContext = ExtensionCommandContext & {
  sessionId: string;
  events: string[];
};

function createFixtureContext(sessionId: string): FixtureContext {
  const events: string[] = [];
  const sessionManager = {
    getTree: () => [{ id: `${sessionId}-entry` }],
    getEntries: () => [{ id: `${sessionId}-entry` }],
    getSessionFile: () => `/fixture/sessions/${sessionId}.jsonl`,
    getSessionId: () => sessionId,
  };
  return {
    cwd: "/fixture/project",
    sessionId,
    events,
    sessionManager,
    waitForIdle: async () => events.push("waitForIdle"),
    newSession: async () => {
      events.push("newSession");
      return { cancelled: false };
    },
    fork: async (entryId: string) => {
      events.push(`fork:${entryId}`);
      return { cancelled: false };
    },
    navigateTree: async (entryId: string) => {
      events.push(`navigateTree:${entryId}`);
      return { cancelled: false };
    },
    switchSession: async (sessionPath: string) => {
      events.push(`switchSession:${sessionPath}`);
      return { cancelled: false };
    },
    reload: async () => events.push("reload"),
  } as unknown as FixtureContext;
}

function createPublicCommandHarness(contexts: FixtureContext[]) {
  const commands = new Map<string, RegisteredCommand>();
  const bridgeOptions: unknown[] = [];
  let dispatchError: unknown;
  const api: Pick<ExtensionAPI, "registerCommand"> = {
    registerCommand(name, options) {
      commands.set(name, options);
    },
  };
  const sendUserMessage: ExtensionAPI["sendUserMessage"] = (
    content,
    options,
  ) => {
    bridgeOptions.push(options);
    if (typeof content !== "string") throw new Error("expected command text");
    const [rawCommandName, requestId] = content.split(/\s+/);
    const command = commands.get((rawCommandName ?? "").replace(/^\//, ""));
    const context = contexts.shift();
    assert.ok(command, "bridge command must be registered through Pi");
    assert.ok(context, "public command path must provide a context");
    void command.handler(requestId ?? "", context).catch((error: unknown) => {
      dispatchError = error;
    });
  };
  const bridge = createTelegramExtensionCommandBridge(api, sendUserMessage);
  return {
    bridge,
    getBridgeOptions: () => bridgeOptions,
    getDispatchError: () => dispatchError,
  };
}

test("The public Pi command path supplies fresh fenced lifecycle actions", async () => {
  const first = createFixtureContext("session-a");
  const second = createFixtureContext("session-b");
  const harness = createPublicCommandHarness([first, second]);
  const seenContexts: ExtensionCommandContext[] = [];
  const seenSessionIds: string[] = [];

  await harness.bridge.execute(async (ctx) => {
    seenContexts.push(ctx);
    const actions = createTelegramExtensionCommandActions(ctx);
    seenSessionIds.push(ctx.sessionManager.getSessionId());
    await actions.waitForIdle();
    await actions.newSession();
  });
  await harness.bridge.execute(async (ctx) => {
    seenContexts.push(ctx);
    const actions = createTelegramExtensionCommandActions(ctx);
    seenSessionIds.push(ctx.sessionManager.getSessionId());
    await actions.waitForIdle();
    await actions.reload();
  });

  assert.equal(harness.getDispatchError(), undefined);
  assert.deepEqual(harness.getBridgeOptions(), [
    { expandPromptTemplates: true },
    { expandPromptTemplates: true },
  ]);
  assert.notEqual(seenContexts[0], seenContexts[1]);
  assert.deepEqual(seenSessionIds, ["session-a", "session-b"]);
  assert.deepEqual(first.events, ["waitForIdle", "newSession"]);
  assert.deepEqual(second.events, ["waitForIdle", "reload"]);
});

test("The membrane exposes only lifecycle actions and read-only session accessors", () => {
  const context = createFixtureContext("session-surface");
  const actions = createTelegramExtensionCommandActions(context);
  const view = createTelegramExtensionCommandContextView(context);

  assert.deepEqual(Object.keys(actions).sort(), [
    "fork",
    "navigateTree",
    "newSession",
    "reload",
    "switchSession",
    "waitForIdle",
  ]);
  assert.deepEqual(Object.keys(view), ["sessionManager"]);
  assert.deepEqual(Object.keys(view.sessionManager).sort(), [
    "getEntries",
    "getSessionFile",
    "getSessionId",
    "getTree",
  ]);
  assert.equal("shutdown" in view, false);
  assert.equal("abort" in view, false);
});

test("Action calls fail closed after the Telegram execution fence is stale", () => {
  const context = createFixtureContext("session-fenced");
  let current = true;
  const actions = createTelegramExtensionCommandActions(context, () => {
    if (!current) throw new Error("stale Telegram execution");
  });

  current = false;
  assert.throws(() => actions.waitForIdle(), /stale Telegram execution/);
  assert.deepEqual(context.events, []);
});

test("Session listing uses Pi enumeration over an isolated fixture and drops transcript text", async () => {
  const sessionDir = await mkdtemp(join(tmpdir(), "pi-telegram-session-fixture-"));
  try {
    const first = SessionManager.create("/fixture/project-a", sessionDir, {
      id: "00000000-0000-4000-8000-000000000001",
    });
    const second = SessionManager.create("/fixture/project-b", sessionDir, {
      id: "00000000-0000-4000-8000-000000000002",
    });
    const header = (id: string, cwd: string) =>
      `${JSON.stringify({
        type: "session",
        version: 3,
        id,
        timestamp: "2026-01-01T00:00:00.000Z",
        cwd,
      })}\n`;
    await writeFile(
      first.getSessionFile()!,
      header("00000000-0000-4000-8000-000000000001", "/fixture/project-a"),
    );
    await writeFile(
      second.getSessionFile()!,
      header("00000000-0000-4000-8000-000000000002", "/fixture/project-b"),
    );

    const sessions = await listSessions({
      cwd: "/fixture/project-a",
      sessionDir,
    });
    assert.deepEqual(
      sessions.map((session) => session.id).sort(),
      ["00000000-0000-4000-8000-000000000001"],
    );
    assert.equal(
      sessions.some(
        (session) => session.id === "00000000-0000-4000-8000-000000000001",
      ),
      true,
      "current session id remains identifiable for picker exclusion",
    );
    assert.equal("allMessagesText" in sessions[0]!, false);
    assert.equal("firstMessage" in sessions[0]!, false);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
  }
});
