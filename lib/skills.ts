/**
 * Bundled Telegram skill discovery
 * Zones: pi agent, telegram guidance
 * Owns source-checkout and installed-package skill path contribution
 */

import { fileURLToPath } from "node:url";

import type { ExtensionAPI } from "./pi.ts";

export const TELEGRAM_SKILLS_PATH = fileURLToPath(
  new URL("../skills", import.meta.url),
);

export function registerTelegramSkillDiscovery(
  pi: Pick<ExtensionAPI, "on">,
): void {
  pi.on("resources_discover", () => ({
    skillPaths: [TELEGRAM_SKILLS_PATH],
  }));
}
