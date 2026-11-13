// Drives the real first run for tools/capture.mjs (README media, reel B-roll). Fresh browser each run, so it starts
// from an empty cast. Reel shots (DESIGN.md): one line → a character; it greets you; another take; share.
// The idea and message are ones the small local model (qwen2.5:1.5b) answers well; with Claude any line works.
//   node tools/capture.mjs http://localhost:3000 --steps apps/dramatis/capture.steps.mjs --out apps/dramatis/docs/media --video
export default async function ({ page, go, click, type, wait, shot }) {
  const hideDev = () => page.evaluate(() => document.querySelector("nextjs-portal")?.remove());
  const idle = (label) => page.locator(label).waitFor({ timeout: 120000 });

  await go("/app");
  await hideDev();
  await wait(600);
  await shot("screen-1");

  // 1. One line becomes a character.
  await type("#idea", "a medieval knight who just discovered smartphones", { delay: 32 });
  await click('button:has-text("Write my character")');
  await page.waitForURL(/\/app\/new/);
  await hideDev();
  await idle('button:has-text("Write it for me")');
  await wait(900);
  await shot("screen-3");

  // 2. It greets you, and answers.
  await click('button:has-text("Save and start chatting")');
  await page.waitForURL(/\/app\/chat\//);
  await hideDev();
  await wait(1400);
  await type("#msg", "That is a phone. Want me to teach you to send a text?", { delay: 34 });
  await page.keyboard.press("Enter");
  await idle('button[aria-label="Send"]');
  await wait(1200);
  await shot("screen-2");

  // 3. Another take, then flip back, then share.
  await click("text=Another take");
  await page.getByText(/Take 2 of 2/).waitFor({ timeout: 120000 });
  await wait(1200);
  await shot("screen-4");
  await click('button[aria-label="Previous take"]');
  await wait(900);
  await click('button[aria-label="Next take"]');
  await wait(900);
  await click('button[aria-label="Chat options"]');
  await wait(400);
  await click("text=Copy share link");
  await wait(1600);

  // The landing, last (its cover uses the screens above once they're copied into public/).
  await go("/");
  await hideDev();
  await shot("cover", { cover: true });
  await shot("screen-5");
}
