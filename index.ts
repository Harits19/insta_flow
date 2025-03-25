import puppeteer from "puppeteer";
import UploadService from "./upload.service";
import ResizeService from "./resize.service";
import FileService from "./file.service";
import { AspectRatio } from "./resize.types";
import { listFolder, prefixPath } from "./index.constant";

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  const service = new UploadService(page, browser);

  await service.startLogin();

  for (const [index, folder] of listFolder.entries()) {
    const {
      caption,
      path,
      aspectRatio,
      startIndex = 0,
      reduceQuality = false,
    } = folder;

    let folderPath = `${prefixPath}${path}`;
    console.log(
      `index ${index} start upload folder with detail ${{
        folderPath,
        caption,
      }}`
    );

    if (aspectRatio) {
      console.log("start resize with aspect ratio ", aspectRatio);
      const resizeService = new ResizeService({ aspectRatio, folderPath });
      const resizePath = await resizeService.startResizeAllImage();
      folderPath = resizePath;
    }

    const batchFiles = await FileService.instagramFileReadyToUpload(folderPath);

    console.log("start index from ", startIndex);
    for (const [index, item] of batchFiles.entries()) {
      if (index < startIndex) {
        continue;
      }

      console.log(
        `start upload batch index ${index} with value ${item} reduceQuality ${reduceQuality}`
      );

      await service.startUpload({
        items: item.map((item) => `${folderPath}/${item}`),
        caption,
        index,
        reduceQuality,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  await browser.close();
}

main();
