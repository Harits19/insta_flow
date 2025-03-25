import { Browser, Page, WaitForSelectorOptions } from "puppeteer";
import dotenv from "dotenv";
import ResizeService from "./resize.service";
import * as fs from "fs";

// Load environment variables
dotenv.config();

const USERNAME: string = process.env.INSTAGRAM_USERNAME || "";
const PASSWORD: string = process.env.INSTAGRAM_PASSWORD || "";

export default class UploadService {
  page: Page;
  browser: Browser;

  // timeout = 5 * 60 * 1000;

  constructor(page: Page, browser: Browser) {
    this.page = page;
    this.browser = browser;
  }

  waitForSelector<Selector extends string>(
    selector: Selector,
    options?: WaitForSelectorOptions
  ) {
    return this.page.waitForSelector(selector, {
      ...options,
    });
  }

  startLogin = async () => {
    const COOKIES_FILE_PATH = "cookies.json"; // Path to save cookies

    // Check if cookies file exists and load the cookies if it does
    if (fs.existsSync(COOKIES_FILE_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE_PATH, "utf8"));
      await this.browser.setCookie(...cookies);
    }

    // Navigate to Instagram
    await this.page.goto("https://www.instagram.com/accounts/login/");

    // If not logged in, login manually
    const isLoggedIn = await this.page.evaluate(() => {
      return window.location.href.includes("instagram.com/accounts/login/");
    });

    console.log({ isLoggedIn });

    if (isLoggedIn) {
      // Fill in the login form and submit
      // Wait for the login form to appear
      await this.page.waitForSelector('input[name="username"]');
      await this.page.type('input[name="username"]', USERNAME);
      await this.page.type('input[name="password"]', PASSWORD);
      await this.page.click('button[type="submit"]');

      // Wait for page to load after login (can be optimized by checking specific elements)
      await this.page.waitForNavigation();

      // Save cookies after successful login
      const cookies = await this.browser.cookies();
      fs.writeFileSync(COOKIES_FILE_PATH, JSON.stringify(cookies));

      console.log("Logged in and cookies saved!");
    } else {
      console.log("Already logged in!");
    }
  };

  startUpload = async ({
    caption,
    items,
    index,
    reduceQuality = false,
  }: {
    items: string[];
    caption: string;
    index: number;
    reduceQuality?: boolean;
  }) => {
    const xPath = {
      newPost: "svg[aria-label='New post']",
      inputFile: "input[type='file']",
      button: "div[role='button'][tabindex='0']",
      caption: "div[aria-label='Write a caption...']",
      successUpload: "img[alt='Animated checkmark']",
      close: "svg[aria-label='Close']",
      errorUpload: "svg[aria-label='Something went wrong. Please try again.']",
    } as const;

    await this.waitForSelector(xPath.newPost);
    await this.page.click(xPath.newPost);

    await this.waitForSelector(xPath.inputFile);
    const fileInput = await this.page.$(xPath.inputFile);

    if (reduceQuality) {
      const newItems = await Promise.all(
        items.map((item) => ResizeService.reduceQuality(item))
      );

      console.log("new items after reduce quality ", newItems);
      items = newItems;
    }

    if (fileInput) {
      console.log("start upload items ", items);
      await fileInput.uploadFile(...items);
    } else {
      throw new Error("file input is undefined");
    }

    const runTimeOut = () => new Promise((resolve) => setTimeout(resolve, 1));

    const clickButton = async (text: string) => {
      await runTimeOut();

      await this.waitForSelector(xPath.button, { visible: true });
      const nextButtons = await this.page.$$(xPath.button);

      for (const button of nextButtons) {
        const buttonText = await this.page.evaluate(
          (el) => el.textContent,
          button
        );
        if (buttonText === text) {
          await button.click();
          break;
        }
      }
    };

    const clickSvg = async (ariaLabel: string) => {
      const xPath = `svg[aria-label='${ariaLabel}']`;
      await runTimeOut();
      await this.waitForSelector(xPath);
      await this.page.click(xPath);
    };

    await clickSvg("Select crop");

    await clickSvg("Photo outline icon");

    await clickButton("Next");

    await clickButton("Next");

    await runTimeOut();
    await this.waitForSelector(xPath.caption);
    await this.page.type(xPath.caption, `${caption} (${index + 1})`);

    const start = Date.now(); // Start time

    await runTimeOut();
    await clickButton("Share");

    const end = Date.now(); // End time
    console.log(`Time taken: ${end - start}ms`);

    await this.waitForSelector(xPath.successUpload);

    await this.waitForSelector(xPath.close);
    await this.page.click(xPath.close);
  };
}
