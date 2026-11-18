import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5273';
const OUT = 'screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

async function newPage(viewport, mobile = false) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1.5,
    locale: 'zh-CN',
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  return { context, page };
}

const desktop = await newPage({ width: 1440, height: 900 });
await desktop.page.waitForTimeout(1000);
await desktop.page.screenshot({ path: `${OUT}/00-desktop-stage.png`, fullPage: true });
console.log('desktop stage ok');

const { context, page } = await newPage({ width: 390, height: 844 }, true);
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/01-mobile-location.png` });
// dismiss location prompt
const deny = page.getByRole('button', { name: '暂不开启' });
if (await deny.count()) await deny.click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-mobile-home.png` });

// open AC category
await page.getByRole('link', { name: /空调清洗/ }).first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/03-mobile-service-list.png` });

// open first service
const service = page.locator('.service-row').first();
await service.click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/04-mobile-service-detail.png` });

// go to providers
await page.getByRole('link', { name: /查看全部/ }).first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/05-mobile-providers.png` });
await page.goBack();
await page.waitForTimeout(400);

// book
await page.getByRole('button', { name: '立即预约' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/06-mobile-checkout.png`, fullPage: false });

// mine guest
await page.goto(`${BASE}/#/mine`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/07-mobile-mine-guest.png` });

// orders guest
await page.goto(`${BASE}/#/orders`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/08-mobile-orders-guest.png` });

console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
