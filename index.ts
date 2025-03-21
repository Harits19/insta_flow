import puppeteer from "puppeteer";
import UploadService from "./upload.service";
import ResizeService from "./resize.service";
import FileService from "./file.service";

async function main(): Promise<void> {
  // const resizeService = new ResizeService({
  //   aspectRatio: "4x5",
  //   folderPath: "./photos",
  // });

  // const directoryResizedImages = await resizeService.startResizeAllImage();

  console.log(__dirname);

  const totalSkipIndex = 4;

  const directoryResizedImages =
    "D:Fia & Harits/Edited Fia Harits/beauty shot/Size 4x5";

  const caption = "Beauty Shot";

  const resizedFiles = await FileService.getAllImageFiles(
    directoryResizedImages
  );
  const sortedFiles = FileService.sortByNumber(resizedFiles);
  const batchFiles = FileService.batchFile(sortedFiles);

  console.log('sorted values', JSON.stringify(sortedFiles))
  console.log(
    "batchFiles value", JSON.stringify(batchFiles)
  );

  console.log(`result of sorted files length ${sortedFiles.length}`);

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
      if (index < totalSkipIndex) {
        console.log(`index ${index} already uploaded`);
        continue;
      }
      console.log(`start upload batch index ${index} with value ${item}`);
      await service.startUpload({
        items: item.map((item) => `${directoryResizedImages}/${item}`),
        caption,
        index,
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await browser.close();
  }
}

main();
