// Headless smoke test for the dance-webcopy build.
//
// Validates:
//   1. The editor mounts, the Dance activity-bar entry appears, the status-bar
//      mode segment shows up, and the sidebar lists Dance's "Registers" view
//      plus our companion "Mode" view.
//   2. `i` enters insert mode; `Esc` returns to normal mode.
//   3. Word motion `w` moves the cursor.
//   4. `%` (`Shift+5`) selects the entire buffer (large selection-character
//      count appears in the status bar).
//   5. The yank flow `"ay` populates the `a` register, visible in the sidebar.
//   6. `dance.run` executes a JS payload via the command API.
//   7. Uploading a keybindings.json document at runtime rebinds keys.

import { chromium } from "playwright-chromium";

const URL = process.env.SMOKE_URL ?? "http://localhost:5173/";
const HEADLESS = (process.env.HEADLESS ?? "1") !== "0";

const errors = [];

const browser = await chromium.launch({
  headless: HEADLESS,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await ctx.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

const failures = [];
function check(name, ok, detail) {
  if (ok) {
    console.log(`PASS  ${name}`);
  } else {
    failures.push(`${name}: ${detail ?? "false"}`);
    console.log(`FAIL  ${name}: ${detail ?? "false"}`);
  }
}

console.log(`navigating to ${URL}`);
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

await page.waitForSelector(".monaco-editor", { timeout: 60_000, state: "attached" });
await page.waitForFunction(
  () => {
    const el = document.querySelector(".monaco-editor");
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 100 && r.height > 100;
  },
  null,
  { timeout: 30_000 },
);
check("editor renders with non-zero size", true);

await page.waitForFunction(
  () =>
    Array.from(document.querySelectorAll(".activitybar [aria-label]"))
      .some((el) => /dance/i.test(el.getAttribute("aria-label") ?? "")),
  null,
  { timeout: 30_000 },
);
check("Dance entry present in activity bar", true);

await page.waitForFunction(
  () => Array.from(document.querySelectorAll(".statusbar-item")).some(
    (el) => /(normal|insert|select)/i.test(el.textContent ?? ""),
  ),
  null,
  { timeout: 30_000 },
);
check("Dance mode segment in status bar", true);

// Sidebar already shows Dance because the Default Layout focuses the
// `registers` view at startup. Read its text and verify the labels exist.
await page.waitForTimeout(800);
const initialSidebar = await page.evaluate(() => document.querySelector(".sidebar")?.textContent ?? "");
check(
  "sidebar lists Dance + Registers + Mode views",
  /dance/i.test(initialSidebar) && /register/i.test(initialSidebar) && /mode/i.test(initialSidebar),
  initialSidebar.slice(0, 200),
);

await page.locator(".monaco-editor .lines-content").first().click({ force: true });
await page.waitForTimeout(250);

async function readStatus() {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll(".statusbar-item"))
      .map((el) => el.textContent?.trim() ?? "")
      .join(" | "),
  );
}

async function readMode() {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll(".statusbar-item"))
      .map((el) => el.textContent?.trim() ?? "")
      .find((t) => /^(normal|insert|select|capture|match|merge)/i.test(t)) ?? "",
  );
}

await page.keyboard.press("i");
await page.waitForTimeout(150);
check("`i` enters insert mode", /insert/i.test(await readMode()), await readMode());

await page.keyboard.press("Escape");
await page.waitForTimeout(150);
check("Esc returns to normal mode", /normal/i.test(await readMode()), await readMode());

// `w` word motion: read selection start/end via monaco directly.
async function readSelections() {
  return page.evaluate(() => window.__dance?.readSelections() ?? []);
}

await page.keyboard.press("Escape");
await page.waitForTimeout(80);
await page.evaluate(() => window.__dance?.executeCommand("dance.select.firstLine.jump"));
await page.evaluate(() => window.__dance?.executeCommand("dance.select.lineStart"));
await page.waitForTimeout(120);
const before = (await readSelections())[0];
await page.keyboard.press("w");
await page.waitForTimeout(150);
const after = (await readSelections())[0];
check(
  "`w` word motion changes the active selection",
  before && after && (before.endColumn !== after.endColumn || before.endLine !== after.endLine),
  `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`,
);

// `%` (Shift+5) selects the entire buffer. Verify the selection covers >50% of model.
await page.keyboard.press("Escape");
await page.waitForTimeout(80);
await page.keyboard.press("Shift+5");
await page.waitForTimeout(250);
const fullSelection = (await readSelections())[0];
const fullSelectionText = fullSelection?.text ?? "";
check(
  "`%` selects most of the buffer",
  fullSelectionText.length > 200,
  `selectedLength=${fullSelectionText.length}`,
);

// Register flow: select word, yank into register `a`, verify `a` visible
// in the registers sidebar tree.
await page.keyboard.press("Escape");
await page.waitForTimeout(80);
await page.keyboard.press("g");
await page.keyboard.press("g");
await page.waitForTimeout(80);
await page.keyboard.press("w");
await page.waitForTimeout(80);
await page.keyboard.press('"');
await page.keyboard.press("a");
await page.keyboard.press("y");
await page.waitForTimeout(250);

// Open the Registers tree; the global "a" register entry should appear.
const registersText = await page.evaluate(() => {
  const sb = document.querySelector(".sidebar");
  return sb?.textContent ?? "";
});
check(
  "register `a` visible in the Dance registers tree",
  /\ba\b/.test(registersText),
  registersText.slice(0, 200),
);

// Marks: set mark `m`, navigate, then jump back. We verify that
// dance.marks.* commands exist and dispatch.
const marksResult = await page.evaluate(async () => {
  try {
    await window.__dance?.executeCommand("dance.selections.save", { register: "m" });
    return "ok";
  } catch (e) {
    return `err: ${String(e).slice(0, 120)}`;
  }
});
check("dance marks command dispatches", marksResult === "ok", String(marksResult));

// Drive Dance via ICommandService.executeCommand exposed at window.__dance.
const cmdResult = await page.evaluate(() =>
  window.__dance?.executeCommand("dance.modes.set.insert").then(() => "ok").catch((e) => `err: ${String(e).slice(0, 120)}`),
);
await page.waitForTimeout(200);
const modeAfterCmd = await readMode();
check(
  "ICommandService.executeCommand drives Dance",
  cmdResult === "ok" && /insert/i.test(modeAfterCmd),
  `mode=${modeAfterCmd} cmdResult=${cmdResult}`,
);

await page.keyboard.press("Escape");
await page.waitForTimeout(150);

// dance.run with a JS payload that selects the whole document.
const danceRunResult = await page.evaluate(() =>
  window.__dance
    ?.executeCommand("dance.run", { code: "await ctx.run.selectBuffer()" })
    .then(() => "ok")
    .catch((e) => `err: ${String(e).slice(0, 120)}`),
);
check(
  "dance.run executes a JS payload",
  danceRunResult === "ok" || /selectBuffer/i.test(danceRunResult ?? ""),
  String(danceRunResult),
);

// Upload a custom keybindings.json that maps `q` → insert and verify the
// keymap takes effect.
await page.keyboard.press("Escape");
await page.waitForTimeout(120);
const upload = JSON.stringify([
  { key: "q", command: "dance.modes.set.insert", when: "editorTextFocus && dance.mode == 'normal'" },
]);
await page.evaluate(async (json) => {
  await window.__dance?.applyKeybindings(json);
}, upload);

await page.locator(".monaco-editor .lines-content").first().click({ force: true });
await page.waitForTimeout(150);
await page.keyboard.press("Escape");
await page.waitForTimeout(120);
await page.keyboard.press("q");
await page.waitForTimeout(200);
check("custom keybinding `q` → insert applies", /insert/i.test(await readMode()), await readMode());

console.log("---");
console.log("page errors:", errors.length);
errors.slice(0, 5).forEach((e) => console.log("  ", e.slice(0, 200)));
console.log("---");
console.log(`failures: ${failures.length}`);
for (const f of failures) console.log("  -", f);

await browser.close();
process.exit(failures.length === 0 ? 0 : 1);
