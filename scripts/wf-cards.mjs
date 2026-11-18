import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1.5, locale: 'zh-CN' });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5273/wireframes.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
for (const [title, name] of [
  ['确认订单 · 手机号与协议','42-wf-checkout-phone'],
  ['收银台','43-wf-cashier'],
  ['订单详情 · 待服务','44-wf-order'],
  ['我的 · 已登录','45-wf-mine'],
]) {
  const card = page.locator('.card').filter({ has: page.locator('.card-title h3', { hasText: title }) }).first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await card.screenshot({ path: `screenshots/${name}.png` });
}
await page.setViewportSize({ width: 420, height: 900 });
await page.goto('http://127.0.0.1:5273/wireframes.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.screenshot({ path: 'screenshots/46-wireframes-mobile.png' });
await browser.close();
