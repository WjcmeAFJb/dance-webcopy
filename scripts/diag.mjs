import { chromium } from "playwright-chromium";

const URL = process.env.SMOKE_URL ?? "http://localhost:5173/";

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    errors.push(`[${msg.type()}] ${msg.text()}`);
  }
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

await page.waitForTimeout(8000);

const diag = await page.evaluate(() => {
  function bbox(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      id: el.id,
      cls: el.className.toString().slice(0, 100),
      visible: cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0,
      display: cs.display,
      visibility: cs.visibility,
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
    };
  }
  const result = {};
  result.root = bbox(document.getElementById("root"));
  result.app = bbox(document.querySelector("#root > div"));
  result.main = bbox(document.querySelector("main"));
  result.workbench = bbox(document.querySelector(".monaco-workbench"));
  result.activitybar = bbox(document.querySelector(".activitybar"));
  result.sidebar = bbox(document.querySelector(".sidebar"));
  result.statusbar = bbox(document.querySelector(".statusbar"));
  result.editors = bbox(document.querySelector(".part.editor"));
  result.monacoEditor = bbox(document.querySelector(".monaco-editor"));
  result.titlebar = bbox(document.querySelector(".titlebar"));

  // check that our refs were actually used
  result.activityRefDiv = bbox(document.querySelector('main > div div[style*="activity"]'));

  // try to find elements that reference the parts via VSCode's dataset
  const allParts = document.querySelectorAll(".part");
  result.parts = [];
  for (const p of allParts) {
    result.parts.push({
      cls: p.className.slice(0, 80),
      w: p.getBoundingClientRect().width,
      h: p.getBoundingClientRect().height,
      parentClass: p.parentElement?.className?.toString().slice(0, 60),
      parentTag: p.parentElement?.tagName,
      parentW: p.parentElement?.getBoundingClientRect().width,
      parentH: p.parentElement?.getBoundingClientRect().height,
    });
  }

  // Body / document level structure
  const bodyChildren = Array.from(document.body.children).map((c) => ({
    tag: c.tagName,
    id: c.id,
    cls: c.className.toString().slice(0, 80),
  }));
  result.bodyChildren = bodyChildren;

  return result;
});

console.log(JSON.stringify(diag, null, 2));
console.log("--- errors / warnings ---");
console.log(errors.slice(0, 30).join("\n"));

await browser.close();
