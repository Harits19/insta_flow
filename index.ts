import puppeteer from "puppeteer";
import UploadService from "./upload.service";
import FileService from "./file.service";

async function main(): Promise<void> {
  const fileService = new FileService();

  const files = await fileService.getAllImageFiles();
  const sortedFile = fileService.sortByNumber(files);
  const batchFile = fileService.batchFile(sortedFile);

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

    for (const item of batchFile) {
      await service.startUpload(item);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

main();
