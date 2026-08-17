/**
 * Disposable live tracer for the fork membrane acquisition contract
 * Zones: pi agent, shared validation
 * Drives the public command bridge from an extension lifecycle hook only.
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

const SURFACE = [
  "fork",
  "navigateTree",
  "newSession",
  "reload",
  "switchSession",
  "waitForIdle",
];
const BRIDGE_COMMAND = "telegram-session-bridge";
const TRACE_TRIGGER = "bridge-tracer-start";
const TIMEOUT_MS = 10_000;

type TraceEvent =
  | { kind: "first"; surface: string[]; tokenObserved: boolean }
  | {
      kind: "second";
      freshContext: boolean;
      tokenObserved: boolean;
    }
  | { kind: "error"; message: string };

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
    if (events.length >= count || events.some((event) => event.kind === "error")) {
      return events;
    }
    if (child.exitCode !== null) {
      throw new Error("Pi CLI exited before the live tracer completed");
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for the live Pi CLI tracer");
}

function makeExtensionSource(commandsPath: string, tracePath: string): string {
  return `
import { appendFile } from "node:fs/promises";
import {
  createTelegramExtensionCommandActions,
  createTelegramExtensionCommandBridge,
} from ${JSON.stringify(commandsPath)};

const tracePath = ${JSON.stringify(tracePath)};
let firstContext;
let started = false;
let tokenObserved = false;

async function record(event) {
  await appendFile(tracePath, JSON.stringify(event) + "\\n");
}

export default function (pi) {
  const bridge = createTelegramExtensionCommandBridge(pi, pi.sendUserMessage);
  const run = () => {
    if (started) return;
    started = true;
    void (async () => {
      await bridge.execute(async (ctx) => {
        firstContext = ctx;
        const actions = createTelegramExtensionCommandActions(ctx);
        const surface = Object.keys(actions).sort();
        await actions.waitForIdle();
        await record({ kind: "first", surface, tokenObserved });
      });
      await bridge.execute(async (ctx) => {
        const actions = createTelegramExtensionCommandActions(ctx);
        await actions.waitForIdle();
        await record({
          kind: "second",
          freshContext: firstContext !== ctx,
          tokenObserved,
        });
      });
    })().catch(async (error) => {
      await record({ kind: "error", message: String(error) });
    });
  };
  pi.on("input", (event) => {
    if (event.text === ${JSON.stringify(TRACE_TRIGGER)}) {
      setImmediate(run);
      return { action: "handled" };
    }
    if (typeof event.text === "string" && event.text.includes(${JSON.stringify(BRIDGE_COMMAND)})) {
      tokenObserved = true;
      return { action: "handled" };
    }
  });
}
`;
}

function resolvePiBin(): string {
  if (process.env.PI_BIN) return process.env.PI_BIN;
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    if (directory.includes("node_modules/.bin")) continue;
    const candidate = join(directory, "pi");
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Keep looking for the host Pi rather than npm's stale peer shim.
    }
  }
  return "pi";
}

async function run(): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "pi-telegram-fork-tracer-"));
  const agentDir = join(root, "agent");
  const tracePath = join(root, "trace.jsonl");
  const extensionPath = join(root, "tracer-extension.ts");
  await mkdir(agentDir, { recursive: true });
  await writeFile(
    extensionPath,
    makeExtensionSource(
      new URL("../lib/commands.ts", import.meta.url).href,
      tracePath,
    ),
  );

  let child: ChildProcessWithoutNullStreams | undefined;
  try {
    child = spawn(
      resolvePiBin(),
      ["--mode", "rpc", "--no-session", "--no-extensions", "-e", extensionPath],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PI_OFFLINE: "1",
          PI_CODING_AGENT_DIR: agentDir,
        },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    child.stdout.resume();
    child.stderr.resume();
    rpcPrompt(child, TRACE_TRIGGER);
    const events = await waitForTraceCount(tracePath, 2, child);
    const failure = events.find((event) => event.kind === "error");
    if (failure?.kind === "error") throw new Error(failure.message);
    const first = events.find((event) => event.kind === "first");
    const second = events.find((event) => event.kind === "second");
    if (
      !first ||
      !second ||
      first.surface.join(",") !== SURFACE.join(",") ||
      first.tokenObserved ||
      second.tokenObserved ||
      !second.freshContext
    ) {
      throw new Error("Live Pi CLI tracer proof failed");
    }
    console.log("Live Pi CLI tracer: PASS");
    console.log("fresh context per execution: PASS");
    console.log("private bridge token stayed out of model input: PASS");
    console.log("lifecycle-only action surface: PASS");
    rpcShutdown(child);
  } catch (error) {
    if (child && child.exitCode === null) child.kill("SIGKILL");
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(detail);
  } finally {
    if (child && child.exitCode === null) child.kill("SIGKILL");
    await rm(root, { recursive: true, force: true });
  }
}

await run();
