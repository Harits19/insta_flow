import { Page } from "puppeteer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

const USERNAME: string = process.env.INSTAGRAM_USERNAME || "";
const PASSWORD: string = process.env.INSTAGRAM_PASSWORD || "";

const CAPTION: string = process.env.CAPTION || "";

export default class UploadService {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  startLogin = async () => {
    await this.page.type("input[name='username']", USERNAME, { delay: 100 });
    await this.page.type("input[name='password']", PASSWORD, { delay: 100 });
    await this.page.click("button[type='submit']");

    await this.page.waitForNavigation({ waitUntil: "networkidle2" });
  };

  startUpload = async (imagePath: string[]) => {
    const xPath = {
      newPost: "svg[aria-label='New post']",
      inputFile: "input[type='file']",
      button: "div[role='button'][tabindex='0']",
      caption: "div[aria-label='Write a caption...']",
      successUpload: "img[alt='Animated checkmark']",
      close: "svg[aria-label='Close']",
    } as const;

    await this.page.waitForSelector(xPath.newPost);
    await this.page.click(xPath.newPost);

    await this.page.waitForSelector(xPath.inputFile);
    const fileInput = await this.page.$(xPath.inputFile);

    if (fileInput) {
      await fileInput.uploadFile(...imagePath);
    } else {
      throw new Error("file input is undefined");
    }

    const runTimeOut = () =>
      new Promise((resolve) => setTimeout(resolve, 2000));

    const clickButton = async (text: string) => {
      await runTimeOut();

      await this.page.waitForSelector(xPath.button, { visible: true });
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

    await clickButton("Next");

    await clickButton("Next");

    await runTimeOut();
    await this.page.waitForSelector(xPath.caption);
    await this.page.type(xPath.caption, CAPTION);

    await runTimeOut();
    await clickButton("Share");

    await this.page.waitForSelector(xPath.successUpload, {
      timeout: 60 * 60 * 1000,
    });

    await this.page.waitForSelector(xPath.close);
    await this.page.click(xPath.close);
  };
}
