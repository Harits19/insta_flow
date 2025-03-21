import { Page } from "puppeteer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

const USERNAME: string = process.env.INSTAGRAM_USERNAME || "";
const PASSWORD: string = process.env.INSTAGRAM_PASSWORD || "";

const IMAGE_PATH: string = path.resolve(
  __dirname,
  process.env.IMAGE_PATH || ""
);
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

  startUpload = async () => {
    await this.page.waitForSelector("svg[aria-label='New post']");
    await this.page.click("svg[aria-label='New post']");

    await this.page.waitForSelector("input[type='file']");
    const fileInput = await this.page.$("input[type='file']");
    if (fileInput) {
      await fileInput.uploadFile(IMAGE_PATH);
    } else {
      throw new Error("file input is undefined");
    }

    const runTimeOut = () =>
      new Promise((resolve) => setTimeout(resolve, 2000));

    const clickButton = async (text: string) => {
      await runTimeOut();
      const idNext = "div[role='button'][tabindex='0']";

      await this.page.waitForSelector(idNext, { visible: true });
      const nextButtons = await this.page.$$(idNext);

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

    const idCaption = "div[aria-label='Write a caption...']";
    await runTimeOut();
    await this.page.waitForSelector(idCaption);
    await this.page.type(idCaption, CAPTION);

    await runTimeOut();
    await clickButton("Share");

    await this.page.waitForSelector("img[alt='Animated checkmark']", {
      timeout: 60 * 60 * 1000,
    });
  };
}
