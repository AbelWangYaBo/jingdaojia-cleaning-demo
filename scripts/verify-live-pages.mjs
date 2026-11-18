import { chromium } from 'playwright-core';
const BASE = 'https://abelwangyabo.github.io/jingdaojia-cleaning-demo';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, locale: 'zh-CN', isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
const bad = [];
page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE ${m.text()}`); });
page.on('response', res => { if (res.status() >= 400) bad.push(`${res.status()} ${res.url()}`); });

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const deny = page.getByRole('button', { name: '暂不开启' });
if (await deny.count()) await deny.click();
await page.waitForTimeout(500);
console.log('LIVE hero:', (await page.locator('.hero-copy h2').innerText()).replace(/\n/g, ' / '));
console.log('LIVE stylesheet:', await page.locator('link[rel="stylesheet"]').getAttribute('href'));
await page.screenshot({ path: 'screenshots/80-live-pages-home.png' });

await page.goto(`${BASE}/#/service/ac`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
console.log('LIVE service rows:', await page.locator('.service-row').count());

await page.goto(`${BASE}/#/about`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
console.log('LIVE about wireframes href:', await page.locator('.about-links a').filter({ hasText: '低保真框线图' }).getAttribute('href'));
console.log('LIVE about pdf href:', await page.locator('.about-links a').filter({ hasText: '框线图 PDF' }).getAttribute('href'));

await page.goto(`${BASE}/wireframes.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
console.log('LIVE wireframe cards:', await page.locator('.card').count());
console.log('LIVE wireframe demo link:', await page.locator('.top-actions a').first().getAttribute('href'));
console.log('LIVE wireframe pdf link:', await page.locator('.top-actions a').nth(1).getAttribute('href'));
await page.screenshot({ path: 'screenshots/81-live-pages-wireframes.png' });

const pdfHead = await fetch(`${BASE}/wireframes.pdf`, { method: 'HEAD' });
console.log('LIVE pdf status:', pdfHead.status, '| content-type:', pdfHead.headers.get('content-type'), '| content-length:', pdfHead.headers.get('content-length'));

console.log('LIVE errors:', errors.length ? errors : 'none');
console.log('LIVE bad responses:', bad.length ? bad : 'none');
await browser.close();
