import fs from "node:fs";
import path from "node:path";
import { root } from "./check.mjs";

// Optional local export only. Vercel continues serving the repository root,
// with its existing Other/static configuration and no framework migration.
const output = path.join(root, "dist");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of [
  "index.html",
  "style.css",
  "script.js",
  "404.html",
  "favicon.svg",
  "favicon.png",
  "apple-touch-icon.png",
  "robots.txt",
  "sitemap.xml",
  "assets",
]) {
  fs.cpSync(path.join(root, file), path.join(output, file), {
    recursive: true,
  });
}
console.log(
  "Production static export created in dist/. No dependencies required.",
);
