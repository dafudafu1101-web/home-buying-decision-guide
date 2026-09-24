const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end('Method Not Allowed');
  }

  const token = typeof req.query?.token === 'string' ? req.query.token : '';
  if (!token || token.length > 4000 || !/^[A-Za-z0-9._~-]+$/.test(token)) {
    res.statusCode = 400;
    return res.end('Invalid token');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (!host) {
    res.statusCode = 400;
    return res.end('Missing host');
  }

  const hashKey = String(req.query?.legacy || '') === '1' ? 'result' : 'r';
  const targetUrl = `${proto}://${host}/stress-test#${hashKey}=${token}`;
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 1800, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 25000 });
    await page.waitForFunction(() => {
      const result = document.querySelector('.screen[data-step="3"]');
      return result && result.classList.contains('active') && document.querySelector('#strategies .strategy') && document.querySelector('#currentPrice')?.textContent !== '—';
    }, { timeout: 12000 });

    await page.evaluate(() => {
      document.querySelectorAll('details').forEach(el => { el.open = true; });
      document.querySelectorAll('.saveShareCard,.nav,#again,.handoffOverlay,.strategyButtons,.selectPrompt,.cta button,.agentCard button').forEach(el => el.remove());
      const result = document.querySelector('.screen[data-step="3"]');
      document.querySelectorAll('.screen').forEach(el => { if (el !== result) el.remove(); });
      if (result) {
        result.style.display = 'block';
        result.style.maxWidth = '760px';
        result.style.margin = '0 auto';
        result.style.padding = '20px 24px 32px';
      }
      const style = document.createElement('style');
      style.textContent = `
        @page{size:A4;margin:10mm}
        html,body{background:#fff!important;height:auto!important;overflow:visible!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        body{margin:0!important}
        .app{max-width:none!important;width:100%!important;box-shadow:none!important}
        .top{position:static!important;max-width:760px!important;margin:0 auto!important}
        .resultHero,.strategy,.portfolioCard,.overCard,.detailCard,.netWorthCard,.whyCard,.agentCard,.lpScope,.lpChart,.lpAllocationCard,.cta{break-inside:avoid;page-break-inside:avoid}
        .choiceMargin,.lifeplanPreview{break-before:page;page-break-before:always}
        details>summary{display:none!important}
        a{color:inherit!important;text-decoration:none!important}
      `;
      document.head.appendChild(style);
    });

    await page.emulateMediaType('print');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="ADCAST-housing-result.pdf"');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.end(Buffer.from(pdf));
  } catch (error) {
    console.error('result-pdf error', error);
    res.statusCode = 500;
    return res.end('Failed to generate PDF');
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};
