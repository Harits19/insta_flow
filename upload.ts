import puppeteer from "puppeteer";
import UploadService from "./upload.service";

async function uploadToInstagram(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  try {
    const page = await browser.newPage();

    const service = new UploadService(page);

    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
    });

    await service.startLogin();

    await service.startUpload();
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

uploadToInstagram();
