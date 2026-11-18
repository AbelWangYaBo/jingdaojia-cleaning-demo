import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5273';
const OUT = 'screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const errors = [];

async function scenario(name, fn) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1.5,
    locale: 'zh-CN',
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${name} PAGEERROR: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(`${name} CONSOLE: ${m.text()}`);
  });
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const deny = page.getByRole('button', { name: '暂不开启' });
    if (await deny.count()) {
      await deny.click();
      await page.waitForTimeout(400);
    }
    await fn(page);
    results.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
    console.log(`FAIL ${name}: ${error.message}`);
    try {
      await page.screenshot({ path: `${OUT}/fail-${name.replace(/\W+/g, '-')}.png` });
    } catch { /* ignore */ }
  } finally {
    await context.close();
  }
}

const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` });

await scenario('checkout-address-phone-cancel', async (page) => {
  await page.goto(`${BASE}/#/service/detail/ac-wall`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: '立即预约' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.checkout-address').count(), 1);

  // change seeded address
  await page.locator('.checkout-address').click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.address-select-tip').count(), 1, 'select mode tip');
  await page.locator('.address-card').nth(1).locator('.address-card-main').click();
  await page.waitForTimeout(500);
  assert.match(await page.locator('.checkout-address').innerText(), /福田区/);

  // add a new address from checkout
  await page.locator('.checkout-address').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '新增地址' }).click();
  await page.waitForTimeout(300);
  await page.locator('#addr-name').fill('张三');
  await page.locator('#addr-phone').fill('13712345678');
  await page.locator('#addr-detail').fill('测试小区 1栋 101');
  await page.locator('.address-tag').filter({ hasText: '公司' }).click();
  await page.getByRole('button', { name: '保存并使用此地址' }).click();
  await page.waitForTimeout(700);
  assert.match(await page.locator('.checkout-address').innerText(), /测试小区 1栋 101/);
  assert.match(await page.locator('.checkout-address').innerText(), /张三/);

  // invalid phone
  await page.locator('#contact-phone').fill('123');
  await page.locator('.checkout-submit').click();
  await page.waitForTimeout(400);
  assert.match(await page.locator('.form-error').first().innerText(), /11 位手机号/);
  await shot(page, '50-qa-checkout-phone-error');

  // valid phone + code flow
  await page.locator('#contact-phone').fill('13712345678');
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.code-input-row').count(), 1);
  await page.locator('.code-input-row input').fill('000000');
  await page.getByRole('button', { name: '验证', exact: true }).click();
  await page.waitForTimeout(250);
  assert.match(await page.locator('.form-error').first().innerText(), /验证码不正确/);
  await page.locator('.code-input-row input').fill('123456');
  await page.getByRole('button', { name: '验证', exact: true }).click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.verify-ok').count(), 1);

  // agreements validation
  await page.locator('.agreement-check-line').scrollIntoViewIfNeeded();
  await page.locator('.checkout-submit').click();
  await page.waitForTimeout(400);
  assert.match(await page.locator('.form-error').last().innerText(), /同意服务协议/);
  await page.locator('.agreement-check-line .checkbox').click();
  await page.waitForTimeout(200);

  // login gate
  await page.locator('.checkout-submit').click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.dialog').filter({ hasText: '登录后提交订单' }).count(), 1);
  await shot(page, '51-qa-login-gate');
  await page.locator('.dialog').getByRole('button', { name: '微信一键登录' }).click();
  await page.waitForTimeout(900);
  assert.match(page.url(), /\/payment\//);

  // pay later + cancel pending payment
  await page.getByRole('button', { name: '暂不支付，稍后再说' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.order-status-hero h1').innerText(), '待付款');
  await page.locator('.order-service-links').getByRole('button', { name: '取消订单' }).click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.sheet').filter({ hasText: '取消订单' }).count(), 1);
  await page.locator('.reason-option').first().click();
  await page.getByRole('button', { name: '确认取消' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.order-status-hero h1').innerText(), '已取消');
  await shot(page, '52-qa-order-cancelled');

  // coupon should be restored
  await page.goto(`${BASE}/#/coupons`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.coupon-item').count(), 4, 'coupon set should be 4 after restore');
});

await scenario('city-location', async (page) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  // first-launch modal may exist because we navigated again in a fresh context; deny if present
  const deny = page.getByRole('button', { name: '暂不开启' });
  if (await deny.count()) await deny.click();
  await page.waitForTimeout(300);
  await page.locator('.city-btn').click();
  await page.waitForTimeout(400);
  await page.locator('.city-hot-item').filter({ hasText: '广州' }).click();
  await page.waitForTimeout(500);
  assert.match(await page.locator('.city-btn').innerText(), /广州/);
  await page.locator('.city-btn').click();
  await page.waitForTimeout(400);
  await page.locator('.city-locate').click();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.location-dialog').count(), 1);
  await page.locator('.location-dialog').getByRole('button', { name: '允许' }).click();
  await page.waitForTimeout(1100);
  const current = await page.locator('.city-current').innerText();
  assert.match(current, /深圳/);
  assert.match(current, /已定位/);
  await shot(page, '53-qa-city-located');
});

await scenario('reschedule-and-cancel', async (page) => {
  await page.goto(`${BASE}/#/orders`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: '微信一键登录' }).click();
  await page.waitForTimeout(600);
  await page.locator('.orders-tab').filter({ hasText: '待服务' }).click();
  await page.waitForTimeout(400);
  await page.locator('.order-card-body').first().click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.order-status-hero h1').innerText(), '待服务');

  // reschedule
  await page.getByRole('button', { name: '修改时间' }).click();
  await page.waitForTimeout(300);
  await page.locator('.sheet .date-chip').nth(1).click();
  await page.waitForTimeout(200);
  await page.locator('.sheet .slot-chip').filter({ hasText: '10:00-12:00' }).click();
  await page.getByRole('button', { name: '确认改期' }).click();
  await page.waitForTimeout(600);
  assert.match(await page.locator('.order-appointment-card').innerText(), /明天/);

  // cancel
  await page.locator('.order-service-links').getByRole('button', { name: '取消订单' }).click();
  await page.waitForTimeout(300);
  await page.locator('.reason-option').filter({ hasText: '时间冲突' }).click();
  await shot(page, '54-qa-cancel-sheet');
  await page.getByRole('button', { name: '确认取消' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.order-status-hero h1').innerText(), '已取消');
});

await scenario('login-phone', async (page) => {
  await page.goto(`${BASE}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('tab', { name: '手机号登录' }).click();
  await page.waitForTimeout(200);
  await page.locator('.login-field input[aria-label="手机号"]').fill('123');
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.waitForTimeout(300);
  assert.match(await page.locator('.toast').last().innerText(), /手机号/);
  await page.locator('.login-field input[aria-label="手机号"]').fill('13912345678');
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.login-code-hint').count(), 1);
  await page.locator('.login-field input[aria-label="验证码"]').fill('000000');
  await page.locator('.login-agreement .checkbox').click();
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator('.toast').last().innerText(), /验证码不正确/);
  await page.locator('.login-field input[aria-label="验证码"]').fill('123456');
  await shot(page, '55-qa-login-phone');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.waitForTimeout(800);
  assert.match(page.url(), /\/mine/);
  assert.match(await page.locator('.mine-name-line').innerText(), /林小满/);
  assert.match(await page.locator('.mine-phone').innerText(), /139\*\*\*\*5678/);
});

await scenario('agreements-support-search-favorites', async (page) => {
  await page.goto(`${BASE}/#/agreements`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.locator('.agreement-item').first().click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.agreement-sheet').count(), 1);
  assert.match(await page.locator('.agreement-sheet').innerText(), /净到家用户协议/);
  await shot(page, '56-qa-agreement');
  await page.getByRole('button', { name: '我已阅读并知晓' }).click();
  await page.waitForTimeout(300);

  await page.goto(`${BASE}/#/support`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: '在线客服', exact: true }).click();
  await page.waitForTimeout(400);
  await page.locator('.chat-quick button').filter({ hasText: '怎么改期' }).click();
  await page.waitForTimeout(1200);
  assert.match(await page.locator('.chat-bubble').last().innerText(), /修改时间/);
  await shot(page, '57-qa-support-chat');
  await page.getByRole('button', { name: '关闭' }).click();
  await page.waitForTimeout(300);

  await page.goto(`${BASE}/#/search`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.locator('.search-input-wrap input').fill('沙发');
  await page.locator('.search-cancel').click();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.service-row').count(), 3);
  await shot(page, '58-qa-search');

  await page.goto(`${BASE}/#/service/detail/sofa-deep`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('.detail-bar-icon').filter({ hasText: '收藏' }).click();
  await page.waitForTimeout(300);
  await page.goto(`${BASE}/#/favorites`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.service-row').count(), 1);
});

await scenario('guest-gating', async (page) => {
  await page.goto(`${BASE}/#/orders`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  assert.match(await page.locator('.orders-login').innerText(), /登录后查看订单/);
  await page.goto(`${BASE}/#/mine`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const stats = await page.locator('.mine-head-stats').innerText();
  assert.match(stats, /0/);
  assert.equal(await page.locator('.tabbar-dot').count(), 0, 'guest has no tab badges');
});

console.log('\n=== RESULT ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.error ? ` — ${r.error}` : ''}`);
console.log(`\nPage errors: ${errors.length ? errors.join('\n') : 'none'}`);
const failed = results.filter((r) => !r.ok).length;
await browser.close();
process.exit(failed ? 1 : 0);
