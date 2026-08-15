/**
 * Upstream drift detection script
 * Zones: shared validation
 * Compares the fork's base version against the latest published version of @llblab/pi-telegram on npm.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

interface PackageJson {
  version: string;
}

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
) as PackageJson;

const localBase = pkg.version.split("-fork")[0] ?? pkg.version;

let upstreamVer = "";
try {
  upstreamVer = execSync("npm view @llblab/pi-telegram version", {
    encoding: "utf-8",
  }).trim();
} catch (error) {
  console.warn("Could not query npm registry for @llblab/pi-telegram version:", error);
  process.exit(0);
}

console.log(`Local base: ${localBase} | Upstream latest: ${upstreamVer}`);
if (localBase !== upstreamVer) {
  console.log(`⚠️ Upstream update available: ${upstreamVer}. Run tag-based 3-way merge to update.`);
} else {
  console.log(`✅ Fork is in sync with upstream latest.`);
}
