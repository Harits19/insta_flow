import puppeteer from "puppeteer";
import UploadService from "./upload.service";
import ResizeService from "./resize.service";
import FileService from "./file.service";

async function main(): Promise<void> {
  const resizeService = new ResizeService({
    aspectRatio: "4x5",
    folderPath: "./photos",
  });

  const caption = "Essential";

  const directoryResizedImages = await resizeService.startResizeAllImage();

  const resizedFiles = await FileService.getAllImageFiles(
    directoryResizedImages
  );
  const sortedFiles = FileService.sortByNumber(resizedFiles);
  const batchFiles = FileService.batchFile(sortedFiles);

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

    for (const [index, item] of batchFiles.entries()) {
      await service.startUpload({
        items: item.map((item) => `${directoryResizedImages}/${item}`),
        caption,
        index,
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

main();
