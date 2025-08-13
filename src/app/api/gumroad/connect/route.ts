import { NextResponse } from 'next/server';

// Ensure Node.js runtime on Vercel and avoid edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getLauncher() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const puppeteerExtra = require('puppeteer-extra');
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const StealthPlugin = require('puppeteer-extra-plugin-stealth');
      puppeteerExtra.use(StealthPlugin());
    } catch {}
    return puppeteerExtra;
  } catch {
    return puppeteer;
  }
}

export async function POST() {
  try {
    // In worker mode (recommended on Vercel), no local browser is launched.
    if (process.env.GUMROAD_WORKER_URL) {
      return NextResponse.json({
        success: true,
        message: 'Worker mode active. No login window needed. Enter Gumroad email/password on the Config page.'
      });
    }

    // Fallback: local launch (for self-hosting only). Use dynamic imports to avoid bundling in Vercel.
    const path = (await import('path')).default;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - dynamic import at runtime only when needed
    const puppeteer = (await import('puppeteer')).default;

    const userDataDir = path.join(process.cwd(), '.gumroad_profile');
    const launchOptions: any = {
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      userDataDir,
    };
    if (process.env.CHROME_PATH) {
      (launchOptions as any).executablePath = process.env.CHROME_PATH;
    }

    try {
      const launcher: any = getLauncher();
      const browser = await (launcher.launch ? launcher.launch(launchOptions) : puppeteer.launch(launchOptions));
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('https://app.gumroad.com/login', { waitUntil: 'domcontentloaded' });
      return NextResponse.json({ success: true, message: 'Window opened. Log in once, then close it.' });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err?.message || 'Launch failed' }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unexpected error' }, { status: 200 });
  }
}


