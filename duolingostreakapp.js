const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9');
  await page.setViewport({ width:1280, height:960 });

  await page.goto('https://duolingo.com');

  const username = somename;
  const password = somepassword;

  // Login
  await page.click('#sign-in-btn');
  await page.type('#top_login', username, {delay: 100});
  await page.type('#top_password', password, {delay: 100});
  await page.click('#login-button');

  // Wait for Dashboard to load
  await page.waitForSelector('[data-test=user-dropdown]');

  // Go to the Lingot Store
  await page.goto('https://www.duolingo.com/show_store');
  await page.waitForSelector('#root > div > div.BWibf._3MLiB > div > div._3MT-S > div > div > div > div.CbIv7 > h3:nth-child(2)');

  // Click and Engage Streak Freeze Button
  await page.click('#root > div > div.BWibf._3MLiB > div > div._3MT-S > div > div > div > div.CbIv7 > ul:nth-child(3) > li:nth-child(1) > button');
  await page.waitForSelector('#root > div > div.BWibf._3MLiB > div > div._3MT-S > div > div > div > div.CbIv7 > ul:nth-child(3) > li:nth-child(2) > p');

  //We're in - take screenshot if wanted
  //await page.screenshot({path: 'example.png'});

  // await browser.close();
})();