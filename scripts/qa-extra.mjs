import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const make = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, locale: 'zh-CN', isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
  return { ctx, page };
};

{
  const { ctx, page } = await make();
  await page.goto('http://127.0.0.1:5273/#/notices', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  assert.match(await page.locator('.empty-state').innerText(), /登录后查看消息/);
  await page.getByRole('button', { name: '微信一键登录' }).click();
  await page.waitForTimeout(800);
  assert.equal(await page.locator('.notice-item').count() > 0, true);
  console.log('notices gate + login OK');
  await ctx.close();
}

{
  const { ctx, page } = await make();
  await page.goto('http://127.0.0.1:5273/#/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('tab', { name: '手机号登录' }).click();
  await page.locator('.login-field input[aria-label="手机号"]').fill('13912345678');
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.locator('.login-field input[aria-label="验证码"]').fill('123456');
  await page.locator('.login-agreement .checkbox').click();
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.waitForTimeout(800);
  await page.goto('http://127.0.0.1:5273/#/service/detail/sofa-deep', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: '立即预约' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: /获取手机号/ }).click();
  await page.waitForTimeout(200);
  const preview = await page.locator('.auth-phone-preview').innerText();
  assert.match(preview, /139 \*\*\*\* 5678/);
  await page.getByRole('button', { name: '允许', exact: true }).click();
  await page.waitForTimeout(800);
  const phone = await page.locator('#contact-phone').inputValue();
  console.log('auth phone after existing login:', phone, '| preview:', preview.replace(/\n/g,' '));
  assert.match(phone, /139 1234 5678/);
  await page.screenshot({ path: 'screenshots/59-qa-auth-existing-phone.png' });
  await ctx.close();
}
console.log('errors', errors);
await browser.close();
