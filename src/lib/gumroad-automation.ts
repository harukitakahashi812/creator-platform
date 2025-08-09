import puppeteer from 'puppeteer';
import path from 'path';

// Prefer puppeteer-extra with stealth if available, but fall back to puppeteer
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

export interface GumroadCredentials {
  email: string;
  password: string;
}

export interface GumroadProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  fileUrl?: string;
}

export interface GumroadCreateResult {
  success: boolean;
  productUrl?: string;
  message: string;
  error?: string;
  instructions?: string[];
}

// Robust Gumroad automation with better error handling and real product creation
export const createRealGumroadProduct = async (
  productData: GumroadProductData,
  credentials?: GumroadCredentials
): Promise<GumroadCreateResult> => {
  let browser;
  let page;

  try {
    console.log('🚀 Starting ROBUST Gumroad automation...');
    
    if (!credentials?.email || !credentials?.password) {
      return {
        success: false,
        message: 'Gumroad credentials are not configured',
        error: 'Missing GUMROAD_EMAIL / GUMROAD_PASSWORD',
        instructions: [
          'Add GUMROAD_EMAIL and GUMROAD_PASSWORD to .env.local',
          'Restart the dev server',
          'Resubmit the project to trigger publishing'
        ]
      };
    }

    // Launch browser with better settings
    const launcher: any = getLauncher();
    const userDataDir = path.join(process.cwd(), '.gumroad_profile');
    const launchOptions: any = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      userDataDir,
      defaultViewport: { width: 1366, height: 768 }
    };
    
    if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }
    
    browser = await (launcher && typeof launcher.launch === 'function'
      ? launcher.launch(launchOptions)
      : puppeteer.launch(launchOptions));

    page = await browser.newPage();
    
    // Set longer timeouts and better user agent
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('📱 Browser launched, starting Gumroad automation...');

    // Step 1: Navigate directly to product creation page (which will redirect to login if needed)
    console.log('🔐 Step 1: Navigating to product creation...');
    await page.goto('https://gumroad.com/products/new', { waitUntil: 'networkidle2' });
    
    // Check if we need to login first
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      console.log('🔐 Login required, handling authentication...');
      
      // Wait for login form and fill it
      await page.waitForSelector('input[type="email"], input[name="email"], #user_email, input[placeholder*="email" i]', { timeout: 30000 });
      
      // Clear and fill email
      await page.click('input[type="email"], input[name="email"], #user_email, input[placeholder*="email" i]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[type="email"], input[name="email"], #user_email, input[placeholder*="email" i]', credentials.email, { delay: 100 });
      
      // Clear and fill password
      await page.click('input[type="password"], input[name="password"], #user_password, input[placeholder*="password" i]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[type="password"], input[name="password"], #user_password, input[placeholder*="password" i]', credentials.password, { delay: 100 });
      
      // Submit login form
      await page.click('button[type="submit"], input[type="submit"], button:contains("Login"), button:contains("Sign in")');
      
      // Wait for login to complete and redirect
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      
      console.log('✅ Login successful');
      
      // Navigate to product creation after login
      await page.goto('https://gumroad.com/products/new', { waitUntil: 'networkidle2' });
    } else {
      console.log('✅ Already logged in or on product creation page');
    }
    
    // Wait for the product creation form to load
    await page.waitForSelector('input[placeholder*="Name" i], input[name="name"], input[id*="name" i]', { timeout: 30000 });
    
    console.log('✅ Product creation page loaded');

    // Step 2: Fill product details
    console.log('📋 Step 2: Filling product details...');
    
    // Fill product name
    await page.click('input[placeholder*="Name" i], input[name="name"], input[id*="name" i]');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.type('input[placeholder*="Name" i], input[name="name"], input[id*="name" i]', productData.name, { delay: 50 });
    
    // Scroll to find price field
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill price
    const priceInput = await page.$('input[placeholder*="price" i], input[name="price"], input[type="number"], [aria-label*="price" i]');
    if (priceInput) {
      await priceInput.click();
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[placeholder*="price" i], input[name="price"], input[type="number"], [aria-label*="price" i]', String(productData.price), { delay: 50 });
    }
    
    // Select digital product type
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], div')) as HTMLElement[];
      const digitalButton = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes('digital') && 
        btn.textContent?.toLowerCase().includes('product')
      );
      if (digitalButton) {
        digitalButton.click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Product details filled');

    // Step 3: Click "Next: Customize" button
    console.log('➡️ Step 3: Navigating to Customize page...');
    
    // Find and click the "Next: Customize" button
    const nextButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a')) as HTMLElement[];
      const nextBtn = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes('next') && 
        btn.textContent?.toLowerCase().includes('customize')
      );
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    });
    
    if (!nextButton) {
      throw new Error('Could not find "Next: Customize" button');
    }
    
    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Navigated to Customize page');

    // Step 4: Fill description
    console.log('📝 Step 4: Filling description...');
    
    // Try to find and fill the description field
    await page.evaluate((description) => {
      const editors = Array.from(document.querySelectorAll('[role="textbox"], .ProseMirror, [contenteditable="true"], textarea')) as HTMLElement[];
      for (const editor of editors) {
        if (editor.offsetHeight > 100) { // Likely the main description editor
          editor.focus();
          editor.innerHTML = '';
          editor.textContent = description;
          editor.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, productData.description);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Description filled');

    // Step 5: Click "Save and continue"
    console.log('💾 Step 5: Saving and continuing...');
    
    const saveButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a')) as HTMLElement[];
      const saveBtn = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes('save') && 
        btn.textContent?.toLowerCase().includes('continue')
      );
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    });
    
    if (!saveButton) {
      throw new Error('Could not find "Save and continue" button');
    }
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Saved and continued');

    // Step 6: Click "Publish and continue"
    console.log('🚀 Step 6: Publishing product...');
    
    const publishButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a')) as HTMLElement[];
      const publishBtn = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes('publish') && 
        btn.textContent?.toLowerCase().includes('continue')
      );
      if (publishBtn) {
        publishBtn.click();
        return true;
      }
      return false;
    });
    
    if (!publishButton) {
      throw new Error('Could not find "Publish and continue" button');
    }
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Product published');

    // Step 7: Capture the real product URL
    console.log('🔗 Step 7: Capturing product URL...');
    
    let productUrl = '';
    
    // Try multiple methods to capture the URL
    productUrl = await page.evaluate(() => {
      // Method 1: Look for input fields with Gumroad URLs
      const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
      for (const input of inputs) {
        if (input.value && input.value.includes('gumroad.com/l/')) {
          return input.value;
        }
      }
      
      // Method 2: Look for anchor tags with Gumroad URLs
      const anchors = Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[];
      for (const anchor of anchors) {
        if (anchor.href && anchor.href.includes('gumroad.com/l/')) {
          return anchor.href;
        }
      }
      
      // Method 3: Search all text content for Gumroad URLs
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent || '';
        const match = text.match(/https?:\/\/[a-z0-9-]+\.gumroad\.com\/l\/[\w-]+/i);
        if (match) {
          return match[0];
        }
      }
      
      // Method 4: Check if we're on a product page and construct URL
      const currentUrl = window.location.href;
      if (currentUrl.includes('gumroad.com') && !currentUrl.includes('/products/new')) {
        const hostname = window.location.hostname;
        const pathParts = window.location.pathname.split('/').filter(p => p);
        if (hostname.includes('.gumroad.com') && pathParts.length > 0) {
          const subdomain = hostname.replace('.gumroad.com', '');
          const productId = pathParts[pathParts.length - 1];
          if (subdomain && productId && productId !== 'new') {
            return `https://${subdomain}.gumroad.com/l/${productId}`;
          }
        }
      }
      
      return '';
    });
    
    console.log('🔍 Debug: Captured URL:', productUrl);

    // Normalize and strictly extract a valid Gumroad product URL
    const normalizedMatch = (productUrl || '').trim().match(/https?:\/\/[a-z0-9-]+\.gumroad\.com\/l\/[A-Za-z0-9_-]+/i);
    productUrl = normalizedMatch ? normalizedMatch[0] : '';

    // If still empty, try extracting from full page text as a fallback
    if (!productUrl) {
      productUrl = await page.evaluate(() => {
        const text = document.documentElement.innerText || document.body.innerText || '';
        const m = text.match(/https?:\/\/[a-z0-9-]+\.gumroad\.com\/l\/[A-Za-z0-9_-]+/i);
        return m ? m[0] : '';
      });
    }

    // Validate the URL
    if (!productUrl || !productUrl.includes('gumroad.com/l/')) {
      throw new Error('Failed to capture real Gumroad product URL');
    }
    
    console.log('✅ Real Gumroad product created:', productUrl);
    
    await browser.close();
    
    return {
      success: true,
      productUrl,
      message: 'Product successfully created on Gumroad!',
      instructions: [
        'Product has been automatically created on Gumroad',
        'You can now upload your files to the product',
        'Share the Gumroad link for sales'
      ]
    };

  } catch (error) {
    console.error('❌ Gumroad automation failed:', error);
    
    if (browser) {
      await browser.close();
    }

    return {
      success: false,
      message: 'Failed to create Gumroad product',
      error: error instanceof Error ? error.message : 'Unknown error',
      instructions: [
        'Manual creation required',
        'Go to https://gumroad.com/dashboard',
        'Create a new product with the provided details',
        'Upload your files and set as published'
      ]
    };
  }
};

// Validate if a Gumroad URL is real and accessible
export const validateRealGumroadProduct = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('❌ Gumroad product validation failed:', error);
    return false;
  }
};

// Get real product details from Gumroad
export const getRealGumroadProductDetails = async (url: string): Promise<any> => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url);
    
    // Extract product details
    const productDetails = await page.evaluate(() => {
      const name = document.querySelector('h1')?.textContent || '';
      const price = document.querySelector('.price')?.textContent || '';
      
      return {
        name,
        price,
        status: 'published',
        sales: 0
      };
    });
    
    await browser.close();
    return productDetails;
  } catch (error) {
    console.error('❌ Failed to get Gumroad product details:', error);
    return null;
  }
};

