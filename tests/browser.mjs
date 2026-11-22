import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = path.join(root, ".artifacts");
fs.mkdirSync(artifacts, { recursive: true });
const server = spawn("python3", [
  "-m",
  "http.server",
  "8123",
  "--directory",
  root,
]);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:8123", { waitUntil: "networkidle" });
  const responsive = [];
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map(async (img) => {
          img.loading = "eager";
          await img.decode().catch(() => {});
        }),
      );
    });
    await page.screenshot({
      path: `${artifacts}/portfolio-${width}.png`,
      fullPage: false,
    });
    if (width === 1440 || width === 390) {
      await page.screenshot({
        path: `${artifacts}/portfolio-hero-${width}.png`,
      });
      await page.locator("#projects").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `${artifacts}/portfolio-projects-${width}.png`,
      });
      await page.evaluate(() => document.querySelector(".pf").scrollTo(0, 0));
    }
    const result = await page.evaluate(() => ({
      viewport: innerWidth,
      document: Math.max(
        document.documentElement.scrollWidth,
        document.querySelector(".pf").scrollWidth,
      ),
      overflow: [...document.querySelectorAll("body *")]
        .filter(
          (e) =>
            e.getBoundingClientRect().right > innerWidth + 1 &&
            e.getClientRects().length,
        )
        .map((e) => e.className)
        .slice(0, 8),
    }));
    responsive.push(result);
  }
  const axe = await new AxeBuilder({ page }).analyze();
  const interactions = [];
  for (const id of ["waad", "axiom", "voyara"]) {
    await page.locator(`[data-open=${id}]`).last().click();
    const dialog = page.locator(`#pf-dialog-${id}`);
    await dialog.waitFor({ state: "visible" });
    const modalAxe = await new AxeBuilder({ page }).analyze();
    interactions.push({
      id,
      open: await dialog.evaluate((d) => d.open),
      focused: await page.evaluate(() => document.activeElement.tagName),
      scrollLocked: await page.evaluate(
        () =>
          getComputedStyle(document.querySelector(".pf")).overflow === "hidden",
      ),
      violations: modalAxe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
      })),
    });
    if (id === "waad")
      await page.screenshot({ path: `${artifacts}/portfolio-case-study.png` });
    await page.keyboard.press("Escape");
    interactions.at(-1).closed = !(await dialog.evaluate((d) => d.open));
    interactions.at(-1).focusRestored = await page
      .locator(`[data-open=${id}]`)
      .last()
      .evaluate((e) => e === document.activeElement);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".pf-menu-button").click();
  await page.locator('#pf-menu a[href="#contact"]').click();
  interactions.push({
    menuCollapsed:
      (await page.locator(".pf-menu-button").getAttribute("aria-expanded")) ===
      "false",
    destination: await page.evaluate(() => document.activeElement.id),
  });
  await page.locator(".pf-contact-form button").click();
  interactions.push({
    invalidFields: await page.locator('[aria-invalid="true"]').count(),
  });
  await page.locator("[name=name]").fill("QA Test");
  await page.locator("[name=email]").fill("bad-email");
  await page.locator("[name=message]").fill("QA draft only");
  await page.locator(".pf-contact-form button").click();
  interactions.push({
    emailRejected:
      (await page.locator("#contact-email").getAttribute("aria-invalid")) ===
      "true",
  });
  await page.locator("[name=email]").fill("qa@example.com");
  const mailto = [];
  await page.evaluate(() => {
    window.__draft = "";
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target.closest("a");
        if (a?.href.startsWith("mailto:")) {
          window.__draft = a.href;
          e.preventDefault();
        }
      },
      true,
    );
  });
  await page.locator(".pf-contact-form button").click();
  interactions.push({
    draft: await page.evaluate(() => window.__draft),
    status: await page.locator(".pf-form-status").innerText(),
  });
  await page.locator("[data-open=waad]").last().click();
  await page.screenshot({
    path: `${artifacts}/portfolio-case-study-mobile.png`,
  });
  await page.keyboard.press("Escape");
  await page.goto("http://127.0.0.1:8123/404.html");
  await page.screenshot({ path: `${artifacts}/portfolio-404.png` });
  fs.writeFileSync(
    path.join(artifacts, "browser-results.json"),
    JSON.stringify(
      {
        responsive,
        interactions,
        errors,
        axe: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
      },
      null,
      2,
    ),
  );
  assert(
    responsive.every((r) => r.document === r.viewport),
    "Horizontal overflow detected",
  );
  assert.equal(errors.length, 0, "Browser errors");
  assert.equal(axe.violations.length, 0, "Accessibility violations");
  assert(
    interactions
      .filter((r) => r.id)
      .every(
        (r) =>
          r.closed &&
          r.focusRestored &&
          r.scrollLocked &&
          r.violations.length === 0,
      ),
    "Dialog checks",
  );
  assert(
    interactions.some((r) => r.draft?.startsWith("mailto:")),
    "Draft URL not generated",
  );
  console.log(
    fs.readFileSync(path.join(artifacts, "browser-results.json"), "utf8"),
  );
} finally {
  await browser.close();
  server.kill();
}
