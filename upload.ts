import puppeteer from "puppeteer";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const USERNAME: string = process.env.INSTAGRAM_USERNAME || "";
const PASSWORD: string = process.env.INSTAGRAM_PASSWORD || "";
const IMAGE_PATH: string = path.resolve(
  __dirname,
  process.env.IMAGE_PATH || ""
);
const CAPTION: string = process.env.CAPTION || "";

async function uploadToInstagram(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "networkidle2",
  });

  await page.type("input[name='username']", USERNAME, { delay: 100 });
  await page.type("input[name='password']", PASSWORD, { delay: 100 });
  await page.click("button[type='submit']");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  await page.waitForSelector("svg[aria-label='New post']");
  await page.click("svg[aria-label='New post']");

  await page.waitForSelector("input[type='file']");
  const fileInput = await page.$("input[type='file']");
  if (fileInput) {
    await fileInput.uploadFile(IMAGE_PATH);
  } else {
    console.error("Gagal menemukan input file.");
    await browser.close();
    return;
  }

  const runTimeOut = () => new Promise((resolve) => setTimeout(resolve, 2000));

  const clickButton = async (text: string) => {
    await runTimeOut();
    const idNext = "div[role='button'][tabindex='0']";

    await page.waitForSelector(idNext, { visible: true });
    const nextButtons = await page.$$(idNext);

    for (const button of nextButtons) {
      const buttonText = await page.evaluate((el) => el.textContent, button);
      if (buttonText === text) {
        await button.click();
        break;
      }
    }
  };

  await clickButton("Next");

  await clickButton("Next");

  const idCaption = "div[aria-label='Write a caption...']";
  await runTimeOut();
  await page.waitForSelector(idCaption);
  await page.type(idCaption, CAPTION);

  await runTimeOut();
  await clickButton("Share");

  await page.waitForSelector("img[alt='Animated checkmark']", {
    timeout: 60 * 60 * 1000,
  });

  await browser.close();
}

uploadToInstagram();
