import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5273';
const OUT = 'screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1.5,
  locale: 'zh-CN',
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
});

const shot = async (name) => {
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
};
const log = (...args) => console.log(...args);

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1100);
const denyLocation = page.getByRole('button', { name: '暂不开启' });
if (await denyLocation.count()) await denyLocation.click();
await page.waitForTimeout(3000);

// 1. Service category
await page.locator('.category-tile').filter({ hasText: '空调清洗' }).click();
await page.waitForTimeout(500);
log('service list:', await page.locator('.service-row').count());

// 2. Detail
await page.locator('.service-row').first().click();
await page.waitForTimeout(500);
log('detail title:', await page.locator('.detail-hero h1').innerText());

// select 2匹 option
await page.locator('.option-chip').filter({ hasText: '2 匹' }).first().click();
await page.waitForTimeout(200);

// choose provider
await page.locator('.detail-section').filter({ hasText: '服务师傅' }).getByRole('link', { name: /查看全部/ }).click();
await page.waitForTimeout(400);
log('providers:', await page.locator('.provider-row').count());
await page.locator('.provider-row').filter({ hasText: '陈建国' }).getByRole('button', { name: '选择 TA' }).click();
await page.waitForTimeout(500);
log('selected provider visible:', await page.locator('.provider-inline').filter({ hasText: '陈建国' }).count());
await page.getByRole('button', { name: '立即预约' }).click();
await page.waitForTimeout(600);
await shot('10-flow-checkout-top');

// 3. phone auth
await page.getByRole('button', { name: /获取手机号/ }).click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: '允许', exact: true }).click();
await page.waitForTimeout(900);
log('auth sheet closed:', (await page.locator('.auth-sheet').count()) === 0);
const phoneValue = await page.locator('#contact-phone').inputValue();
log('phone value:', phoneValue);
log('verified badge:', await page.locator('.verify-ok').count());

// scroll to agreement
await page.locator('.checkout-agreement').scrollIntoViewIfNeeded();
await page.waitForTimeout(250);
await page.locator('.agreement-check-line .checkbox').click();
await page.waitForTimeout(250);
await shot('11-flow-checkout-bottom');

// coupon + total
log('total bar:', await page.locator('.checkout-bar').innerText());

// submit
await page.getByRole('button', { name: '提交订单' }).click();
await page.waitForTimeout(700);
log('url after submit:', page.url());
await shot('12-flow-payment');

// 4. pay
await page.getByRole('button', { name: '立即支付' }).click();
await page.waitForTimeout(300);
await shot('13-flow-pay-sheet');
const confirmPay = page.getByRole('button', { name: /确认支付/ });
if (await confirmPay.count()) await confirmPay.click();
await page.waitForTimeout(1600);
log('url after pay:', page.url());
await page.waitForTimeout(8000);
await shot('14-flow-pay-success');

// 5. order detail
const viewOrder = page.getByRole('link', { name: '查看订单' });
if (await viewOrder.count()) await viewOrder.first().click();
await page.waitForTimeout(700);
log('order status:', await page.locator('.order-status-hero h1').innerText());
await shot('15-flow-order-detail');

// demo advance
await page.locator('.demo-tools summary').click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: '推进到下一状态' }).click();
await page.waitForTimeout(500);
log('after advance:', await page.locator('.order-status-hero h1').innerText());
await shot('16-flow-order-ontheway');

await page.locator('.demo-tools').evaluate((el) => { el.open = true; });
await page.waitForTimeout(200);
await page.locator('.demo-tool-actions').getByRole('button', { name: '推进到下一状态' }).click();
await page.waitForTimeout(500);
log('after advance2:', await page.locator('.order-status-hero h1').innerText());

// 6. complete service
const completeBtn = page.getByRole('button', { name: '确认服务完成' });
if (await completeBtn.count()) {
  await completeBtn.click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '确认完成' }).click();
  await page.waitForTimeout(500);
}
log('after complete:', await page.locator('.order-status-hero h1').innerText());

// 7. review
const reviewBtn = page.getByRole('button', { name: '去评价' });
if (await reviewBtn.count()) {
  await reviewBtn.click();
  await page.waitForTimeout(600);
  await page.locator('.review-textarea').fill('师傅很准时，拆洗得很彻底，出风口的灰都清干净了，家里也没有异味。演示流程很顺畅。');
  await page.locator('.review-tag-btn').filter({ hasText: '准时上门' }).click();
  await page.locator('.review-tag-btn').filter({ hasText: '清洗彻底' }).click();
  await shot('17-flow-review');
  await page.getByRole('button', { name: '提交评价' }).click();
  await page.waitForTimeout(1200);
  log('after review:', await page.locator('.order-status-hero h1').innerText());
  await shot('18-flow-order-completed');
}

// 8. mine logged in
await page.goto(`${BASE}/#/mine`);
await page.waitForTimeout(800);
await shot('19-flow-mine-logged');

// 9. orders
await page.goto(`${BASE}/#/orders`);
await page.waitForTimeout(700);
await shot('20-flow-orders');

// 10. other pages
for (const [path, name] of [
  ['#/addresses', '21-addresses'],
  ['#/city', '22-city'],
  ['#/coupons', '23-coupons'],
  ['#/notices', '24-notices'],
  ['#/agreements', '25-agreements'],
  ['#/support', '26-support'],
  ['#/about', '27-about'],
]) {
  await page.goto(`${BASE}/${path}`);
  await page.waitForTimeout(600);
  await shot(name);
}

const stored = await page.evaluate(() => localStorage.getItem('jingdaojia_demo_state_v1'));
const parsed = JSON.parse(stored);
log('orders in storage:', parsed.orders.length, parsed.orders.map((o) => `${o.status}:${o.serviceName}`).join(' | '));
log('user:', parsed.user);
log('ERRORS:', errors.length ? errors.join('\n') : 'none');

await browser.close();
