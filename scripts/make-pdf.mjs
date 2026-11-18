import { chromium } from 'playwright-core';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5273/wireframes.html', { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: 'deliverables/wireframes.pdf',
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `<div style="width:100%;font-size:7px;color:#9aa1ac;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;padding:0 12mm;display:flex;justify-content:space-between;">
    <span>净到家 · 家政清洗预约演示 · 低保真框线图</span>
    <span>第 <span class="pageNumber"></span> / <span class="totalPages"></span> 页</span>
  </div>`,
  margin: { top: '10mm', bottom: '16mm', left: '10mm', right: '10mm' },
});
await browser.close();
fs.copyFileSync('deliverables/wireframes.pdf', 'public/wireframes.pdf');
console.log('pdf created and copied to public/wireframes.pdf');
