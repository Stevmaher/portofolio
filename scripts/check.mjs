import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const ids = new Set(
  [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]),
);
const failures = [];
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const target = match[1];
  if (/^(https?:|mailto:|data:)/.test(target)) continue;
  if (target.startsWith("#")) {
    if (!ids.has(target.slice(1))) failures.push("Missing anchor: " + target);
  } else if (!fs.existsSync(path.join(root, target)))
    failures.push("Missing file: " + target);
}
const script = spawnSync(
  process.execPath,
  ["--check", path.join(root, "script.js")],
  { encoding: "utf8" },
);
if (script.status !== 0) failures.push(script.stderr);
for (const file of [
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "assets/social-preview.png",
]) {
  if (!fs.existsSync(path.join(root, file)))
    failures.push("Missing deliverable: " + file);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "Static checks passed: local resources, section anchors, JavaScript syntax and SEO assets.",
);
