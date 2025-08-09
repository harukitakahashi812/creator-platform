import { NextResponse } from 'next/server';
import path from 'path';
import puppeteer from 'puppeteer';

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
    const userDataDir = path.join(process.cwd(), '.gumroad_profile');
    const launchOptions: any = {
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      userDataDir,
    };
    if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }

    // Launch browser and open login page
    try {
      const launcher: any = getLauncher();
      const browser = await (launcher.launch ? launcher.launch(launchOptions) : puppeteer.launch(launchOptions));
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('https://app.gumroad.com/login', { waitUntil: 'domcontentloaded' });
      return NextResponse.json({
        success: true,
        message: 'Window opened. Log in once, then close it.'
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err?.message || 'Launch failed' }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unexpected error' }, { status: 200 });
  }
}


