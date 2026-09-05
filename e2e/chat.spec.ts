import { expect, test } from "@playwright/test";

test("submits a spending question and shows the mocked tool result", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}");
    const text = body.messages?.at(-1)?.parts?.[0]?.text ?? "";
    const stream = [
      `data: {"type":"start"}\n\n`,
      `data: {"type":"text-start","id":"text-1"}\n\n`,
      `data: {"type":"text-delta","id":"text-1","delta":"Here is your spending summary."}\n\n`,
      `data: {"type":"text-end","id":"text-1"}\n\n`,
      `data: {"type":"finish","finishReason":"stop"}\n\n`,
      `data: [DONE]\n\n`,
    ].join("");

    expect(text).toContain("spend");
    await route.fulfill({ status: 200, contentType: "text/event-stream", body: stream });
  });

  await page.goto("/chat");
  const input = page.getByPlaceholder("Ask about your spending...");
  const sendButton = page.getByRole("button", { name: "Send" });

  await input.fill("How much did I spend on food this month?");
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  await expect(page.getByText("Here is your spending summary.")).toBeVisible({ timeout: 10000 });
});
