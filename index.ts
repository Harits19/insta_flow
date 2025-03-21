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

  const totalSkipIndex = 1;

  const directoryResizedImages =
    "D:Fia & Harits/Edited Fia Harits/couple/Size 4x5";

  const caption = "Couple";

  const resizedFiles = await FileService.getAllImageFiles(
    directoryResizedImages
  );
  const sortedFiles = FileService.sortByNumber(resizedFiles);
  const batchFiles = FileService.batchFile(sortedFiles);

  console.log("sorted values", JSON.stringify(sortedFiles));
  console.log("batchFiles value", JSON.stringify(batchFiles));

  console.log(`result of sorted files length ${sortedFiles.length}`);

  // for (const [index, item] of batchFiles.entries()) {
  //   const reduceQuality = index === 1;
  //   if (index < totalSkipIndex) {
  //     console.log(`index ${index} already uploaded`);
  //     continue;
  //   }

  //   const resultReduced = await ResizeService.reduceQuality(`${directoryResizedImages}/${item.at(0)}`);

  //   console.log({ resultReduced });

  //   return;
  // }

  // return;

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  try {
    const page = await browser.newPage();


    const service = new UploadService(page, browser);

    await service.startLogin();

    for (const [index, item] of batchFiles.entries()) {
      const reduceQuality = index === 1;
      if (index < totalSkipIndex) {
        console.log(`index ${index} already uploaded`);
        continue;
      }
      console.log(
        `start upload batch index ${index} with value ${item} reduceQuality ${reduceQuality}`
      );
      await service.startUpload({
        items: item.map((item) => `${directoryResizedImages}/${item}`),
        caption,
        index,
        reduceQuality,
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
