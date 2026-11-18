import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const BASE = 'http://127.0.0.1:5273';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, locale: 'zh-CN', isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const deny = page.getByRole('button', { name: '暂不开启' });
if (await deny.count()) await deny.click();
await page.waitForTimeout(300);

// Service detail -> change address -> select existing address
await page.goto(`${BASE}/#/service/detail/ac-wall`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const hintBefore = await page.locator('.detail-address-hint').innerText();
assert.match(hintBefore, /南山区/);
await page.locator('.detail-address-hint').getByRole('link', { name: '更换' }).click();
await page.waitForTimeout(400);
assert.equal(await page.locator('.address-select-tip').count(), 1, 'service detail opens select mode');
console.log('tip:', (await page.locator('.address-select-tip').innerText()).trim());
assert.match(await page.locator('.address-select-tip').innerText(), /服务详情/);
await page.locator('.address-card').nth(1).locator('.address-card-main').click();
await page.waitForTimeout(600);
assert.match(page.url(), /service\/detail\/ac-wall/);
assert.match(await page.locator('.detail-address-hint').innerText(), /福田区/);
console.log('service detail select existing address OK');

// Service detail -> add address -> save -> back to detail
await page.locator('.detail-address-hint').getByRole('link', { name: '更换' }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: '新增地址' }).click();
await page.waitForTimeout(300);
await page.locator('#addr-name').fill('李四');
await page.locator('#addr-phone').fill('13600001111');
await page.locator('#addr-detail').fill('新测试花园 2栋 303');
await page.getByRole('button', { name: '保存并使用此地址' }).click();
await page.waitForTimeout(800);
console.log('url after add from detail:', page.url());
assert.match(page.url(), /service\/detail\/ac-wall/);
assert.match(await page.locator('.detail-address-hint').innerText(), /新测试花园/);
console.log('service detail add address OK');

// Go to checkout, verify it uses the new address
await page.getByRole('button', { name: '立即预约' }).click();
await page.waitForTimeout(600);
assert.match(await page.locator('.checkout-address').innerText(), /新测试花园/);

// Checkout -> change address -> select existing -> back to checkout
await page.locator('.checkout-address').click();
await page.waitForTimeout(400);
assert.equal(await page.locator('.address-select-tip').count(), 1, 'checkout opens select mode');
assert.match(await page.locator('.address-select-tip').innerText(), /确认订单/);
await page.locator('.address-card').nth(0).locator('.address-card-main').click();
await page.waitForTimeout(600);
assert.match(page.url(), /checkout/);
assert.match(await page.locator('.checkout-address').innerText(), /华润城润府/);
console.log('checkout select existing address OK');

// Coupon persists across service edit
await page.locator('.checkout-row').filter({ hasText: '优惠券' }).click();
await page.waitForTimeout(300);
await page.locator('.coupon-card').filter({ hasText: '空调清洗专享券' }).click();
await page.waitForTimeout(300);
assert.match(await page.locator('.checkout-row').filter({ hasText: '优惠券' }).innerText(), /空调清洗专享券/);
await page.getByRole('link', { name: /修改/ }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: '立即预约' }).click();
await page.waitForTimeout(600);
assert.match(await page.locator('.checkout-row').filter({ hasText: '优惠券' }).innerText(), /空调清洗专享券/);
console.log('coupon persists across service edit OK');

console.log('errors:', errors.length ? errors : 'none');
assert.equal(errors.length, 0);
await page.screenshot({ path: 'screenshots/fail-qa-address-fix.png' });
await browser.close();
