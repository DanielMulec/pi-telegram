/**
 * Disposable live tracer for the fork membrane acquisition contract
 * Zones: pi agent, shared validation
 * Drives the real Pi CLI through its public RPC prompt path and never reads host state.
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listAllSessions } from "../lib/commands.ts";
import { SessionManager } from "../lib/pi.ts";

const SURFACE = [
  "fork",
  "navigateTree",
  "newSession",
  "reload",
  "switchSession",
  "waitForIdle",
];
const TIMEOUT_MS = 10_000;

type TraceEvent =
  | { kind: "first"; surface: string[]; treeEntries: number }
  | { kind: "replacement"; staleRejected: boolean }
  | { kind: "second"; freshContext: boolean };

function rpcPrompt(child: ChildProcessWithoutNullStreams, message: string): void {
  child.stdin.write(`${JSON.stringify({ type: "prompt", message })}\n`);
}

function rpcShutdown(child: ChildProcessWithoutNullStreams): void {
  child.stdin.end(`${JSON.stringify({ type: "shutdown" })}\n`);
}

async function readTrace(path: string): Promise<TraceEvent[]> {
  const content = await readFile(path, "utf8").catch(() => "");
  return content
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TraceEvent);
}

async function waitForTraceCount(
  path: string,
  count: number,
  child: ChildProcessWithoutNullStreams,
): Promise<TraceEvent[]> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const events = await readTrace(path);
    if (events.length >= count) return events;
    if (child.exitCode !== null) {
      throw new Error("Pi CLI exited before the live tracer completed");
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for the live Pi CLI tracer");
}

async function waitForExit(child: ChildProcessWithoutNullStreams): Promise<void> {
  if (child.exitCode !== null) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Pi CLI did not shut down within the tracer budget"));
    }, TIMEOUT_MS);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function createFixtureSessions(sessionDir: string): Promise<void> {
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
}

function makeExtensionSource(commandsPath: string, tracePath: string): string {
  return `
import { appendFile } from "node:fs/promises";
import {
  createTelegramExtensionCommandActions,
  createTelegramExtensionCommandContextView,
} from ${JSON.stringify(commandsPath)};

const tracePath = ${JSON.stringify(tracePath)};
let firstContext;
let invocation = 0;

async function record(event) {
  await appendFile(tracePath, JSON.stringify(event) + "\\n");
}

export default function (pi) {
  pi.registerCommand("tracer-probe", {
    handler: async (_args, ctx) => {
      invocation += 1;
      const actions = createTelegramExtensionCommandActions(ctx);
      const view = createTelegramExtensionCommandContextView(ctx);
      if (invocation === 1) {
        firstContext = ctx;
        await record({
          kind: "first",
          surface: Object.keys(actions).sort(),
          treeEntries: view.sessionManager.getEntries().length,
        });
        await actions.waitForIdle();
        await actions.newSession();
        let staleRejected = false;
        try {
          await actions.waitForIdle();
        } catch {
          staleRejected = true;
        }
        await record({ kind: "replacement", staleRejected });
        return;
      }
      await actions.waitForIdle();
      await record({ kind: "second", freshContext: firstContext !== ctx });
    },
  });
}
`;
}

async function run(): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "pi-telegram-fork-tracer-"));
  const agentDir = join(root, "agent");
  const sessionDir = join(root, "sessions");
  const tracePath = join(root, "trace.jsonl");
  const extensionPath = join(root, "tracer-extension.ts");
  await mkdir(agentDir, { recursive: true });
  await mkdir(sessionDir, { recursive: true });
  await createFixtureSessions(sessionDir);
  await writeFile(
    extensionPath,
    makeExtensionSource(
      new URL("../lib/commands.ts", import.meta.url).href,
      tracePath,
    ),
  );

  let child: ChildProcessWithoutNullStreams | undefined;
  try {
    const sessions = await listAllSessions({ sessionDir });
    const hasCurrentFixture = sessions.some(
      (session) =>
        session.id === "00000000-0000-4000-8000-000000000001",
    );
    if (sessions.length !== 2 || !hasCurrentFixture) {
      throw new Error("Isolated SessionManager.listAll fixture proof failed");
    }

    child = spawn(
      process.env.PI_BIN ?? "pi",
      ["--mode", "rpc", "--no-session", "--no-extensions", "-e", extensionPath],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PI_OFFLINE: "1",
          PI_CODING_AGENT_DIR: agentDir,
          PI_CODING_AGENT_SESSION_DIR: sessionDir,
        },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    child.stdout.resume();
    rpcPrompt(child, "/tracer-probe first");
    const firstEvents = await waitForTraceCount(tracePath, 2, child);
    rpcPrompt(child, "/tracer-probe second");
    const events = await waitForTraceCount(tracePath, 3, child);
    rpcShutdown(child);
    await waitForExit(child);

    const first = firstEvents.find((event) => event.kind === "first");
    const replacement = events.find((event) => event.kind === "replacement");
    const second = events.find((event) => event.kind === "second");
    if (
      !first ||
      !replacement ||
      !second ||
      first.surface.join(",") !== SURFACE.join(",") ||
      first.treeEntries < 0 ||
      !replacement.staleRejected ||
      !second.freshContext
    ) {
      throw new Error("Live Pi CLI tracer proof failed");
    }
    console.log("Live Pi CLI tracer: PASS");
    console.log("fresh context per execution: PASS");
    console.log("stale action rejected after replacement: PASS");
    console.log("lifecycle-only action surface: PASS");
    console.log("isolated SessionManager.listAll fixture: PASS (2 sessions)");
    console.log("shutdown completed within budget: PASS");
  } catch (error) {
    if (child && child.exitCode === null) child.kill("SIGKILL");
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(detail);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

await run();
