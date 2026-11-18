import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const BASE = 'http://127.0.0.1:5273';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, locale: 'zh-CN', isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const deny = page.getByRole('button', { name: '暂不开启' });
  if (await deny.count()) await deny.click();
  await page.waitForTimeout(300);
  return { ctx, page };
}

{
  const { ctx, page } = await fresh();
  // Address management + validation + city/district + default
  await page.goto(`${BASE}/#/addresses`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const before = await page.locator('.address-card').count();
  await page.getByRole('button', { name: '新增地址' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '保存地址' }).click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.form-error').count() >= 3, true, 'address validation errors');
  await page.locator('#addr-name').fill('王五');
  await page.locator('#addr-phone').fill('13500001111');
  await page.locator('#addr-detail').fill('测试路 1 号');
  // city -> Guangzhou, district auto -> Tianhe, then choose Yuexiu
  await page.locator('.form-select').first().click();
  await page.waitForTimeout(300);
  await page.locator('.sheet .city-hot-item').filter({ hasText: '广州' }).click();
  await page.waitForTimeout(300);
  assert.match(await page.locator('.form-select').first().innerText(), /广州/);
  assert.match(await page.locator('.form-select').nth(1).innerText(), /天河区/);
  await page.locator('.form-select').nth(1).click();
  await page.waitForTimeout(300);
  await page.locator('.district-item').filter({ hasText: '越秀区' }).click();
  await page.waitForTimeout(300);
  assert.match(await page.locator('.form-select').nth(1).innerText(), /越秀区/);
  await page.getByRole('button', { name: '保存地址' }).click();
  await page.waitForTimeout(700);
  assert.match(page.url(), /addresses/);
  assert.equal(await page.locator('.address-card').count(), before + 1);
  assert.match(await page.locator('.address-card').last().innerText(), /王五/);
  assert.match(await page.locator('.address-card').last().innerText(), /广州/);
  assert.match(await page.locator('.address-card').last().innerText(), /越秀区/);

  // set default on new address
  await page.locator('.address-card').last().getByRole('button', { name: '设为默认' }).click();
  await page.waitForTimeout(300);
  assert.match(await page.locator('.address-card').last().innerText(), /默认/);
  // delete the new address
  await page.locator('.address-card').last().getByRole('button', { name: '删除' }).click();
  await page.waitForTimeout(300);
  await page.locator('.dialog').getByRole('button', { name: '删除' }).click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.address-card').count(), before);
  console.log('address management / validation / city-district / default / delete OK');
  await ctx.close();
}

{
  const { ctx, page } = await fresh();
  // Checkout -> change address; contact fields should sync
  await page.goto(`${BASE}/#/service/detail/ac-wall`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: '立即预约' }).click();
  await page.waitForTimeout(500);
  await page.locator('.checkout-address').click();
  await page.waitForTimeout(300);
  await page.locator('.address-card').nth(1).locator('.address-card-main').click();
  await page.waitForTimeout(500);
  assert.match(await page.locator('.checkout-address').innerText(), /福田区/);
  assert.match(await page.locator('#contact-name').inputValue(), /林小满/);
  assert.match(await page.locator('#contact-phone').inputValue(), /138/);
  console.log('checkout address sync OK');

  // Reorder from completed seeded order
  await page.goto(`${BASE}/#/orders`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const loginBtn = page.getByRole('button', { name: '微信一键登录' });
  if (await loginBtn.count()) {
    await loginBtn.click();
    await page.waitForTimeout(700);
  }
  await page.locator('.order-card').filter({ hasText: '已完成' }).first().locator('.order-card-body').click();
  await page.waitForTimeout(500);
  const reorder = page.getByRole('button', { name: '再次购买' });
  assert.equal(await reorder.count(), 1);
  await reorder.click();
  await page.waitForTimeout(600);
  assert.match(page.url(), /checkout/);
  assert.match(await page.locator('.checkout-service').innerText(), /空调挂机全拆深洗/);
  console.log('reorder OK');
  await ctx.close();
}

{
  const { ctx, page } = await fresh();
  // WeChat login agreement gate
  await page.goto(`${BASE}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: '微信一键登录' }).click();
  await page.waitForTimeout(350);
  assert.match(await page.locator('.toast').last().innerText(), /请先阅读并同意/);
  await page.locator('.login-agreement .checkbox').click();
  await page.getByRole('button', { name: '微信一键登录' }).click();
  await page.waitForTimeout(900);
  assert.match(page.url(), /mine/);
  console.log('wechat login agreement gate OK');
  await ctx.close();
}

console.log('errors:', errors.length ? errors : 'none');
assert.equal(errors.length, 0);
await browser.close();
