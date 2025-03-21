import { Page, WaitForSelectorOptions } from "puppeteer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const USERNAME: string = process.env.INSTAGRAM_USERNAME || "";
const PASSWORD: string = process.env.INSTAGRAM_PASSWORD || "";

export default class UploadService {
  page: Page;

  timeout = 60 * 60 * 1000;

  constructor(page: Page) {
    this.page = page;
  }

  waitForSelector<Selector extends string>(
    selector: Selector,
    options?: WaitForSelectorOptions
  ) {
    return this.page.waitForSelector(selector, {
      timeout: this.timeout,
      ...options,
    });
  }

  startLogin = async () => {
    await this.page.type("input[name='username']", USERNAME, { delay: 100 });
    await this.page.type("input[name='password']", PASSWORD, { delay: 100 });
    await this.page.click("button[type='submit']");

    await this.page.waitForNavigation({ waitUntil: "networkidle2" });
  };

  startUpload = async ({
    caption,
    items,
    index,
  }: {
    items: string[];
    caption: string;
    index: number;
  }) => {
    const xPath = {
      newPost: "svg[aria-label='New post']",
      inputFile: "input[type='file']",
      button: "div[role='button'][tabindex='0']",
      caption: "div[aria-label='Write a caption...']",
      successUpload: "img[alt='Animated checkmark']",
      close: "svg[aria-label='Close']",
    } as const;

    await this.waitForSelector(xPath.newPost);
    await this.page.click(xPath.newPost);

    await this.waitForSelector(xPath.inputFile);
    const fileInput = await this.page.$(xPath.inputFile);

    if (fileInput) {
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

    await runTimeOut();
    await clickButton("Share");

    await this.waitForSelector(xPath.successUpload);

    await this.waitForSelector(xPath.close);
    await this.page.click(xPath.close);
  };
}
