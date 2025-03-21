import sharp from "sharp";
import FileService from "./file.service";
import * as fs from "fs/promises";

type AspectRatio = "16x9" | "1x1" | "4x5";
export default class ResizeService {
  aspectRatio: AspectRatio;
  directory: string;

  constructor({
    aspectRatio,
    folderPath: directory,
  }: {
    aspectRatio: AspectRatio;
    folderPath: string;
  }) {
    this.aspectRatio = aspectRatio;
    this.directory = directory;
  }

  get aspectRatioValue() {
    const [width, height] = this.aspectRatio.split("x");

    return parseInt(width) / parseInt(height);
  }

  getInputPath(file: string) {
    return `${this.directory}/${file}`;
  }

  private get outputDirectory() {
    return `${this.directory}/${this.aspectRatio}`;
  }

  getOutputPath(file: string) {
    const path = `${this.outputDirectory}/${file}`;
    return path;
  }

  async createOutputDirectory() {
    try {
      await fs.mkdir(this.outputDirectory);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   *
   * @returns output path all resized image
   */
  async startResizeAllImage() {
    const files = await FileService.getAllImageFiles(this.directory);
    console.log("files", files);
    await this.createOutputDirectory();
    for (const file of files) {
      await this.resizeImage(file);
    }

    return this.outputDirectory;
  }

  async resizeImage(file: string) {
    console.log("resizeImage", file);
    const aspectRatio = this.aspectRatioValue;

    const inputPath = this.getInputPath(file); // Replace with your image
    const outputPath = this.getOutputPath(file);

    const metadata = await sharp(inputPath).metadata();

    let targetWidth: number;
    let targetHeight: number;

    if (!metadata.height || !metadata.width) {
      return;
    }

    if (metadata.height > metadata.width) {
      // If the image is taller than wide, use the height to calculate the target width
      targetHeight = metadata.height; // Use the original height
      targetWidth = Math.round(targetHeight * aspectRatio); // Calculate width based on aspect ratio
    } else {
      // If the image is wider than tall, use the width to calculate the target height
      targetWidth = metadata.width; // Use the original width
      targetHeight = Math.round(targetWidth / aspectRatio); // Calculate height based on aspect ratio
    }

    console.log(
      `Original Width: ${metadata.width}, Original Height: ${metadata.height}`
    );
    console.log(`Target Width: ${targetWidth}, Target Height: ${targetHeight}`);

    try {
      const info = await sharp(inputPath)
        .resize(targetWidth, targetHeight, {
          fit: sharp.fit.contain,
          background: "white",
        })
        .jpeg({ quality: 100 })
        .toFile(outputPath);

      console.log(
        "Image resized to aspect ratio without cropping and saved successfully:",
        info
      );
    } catch (error) {
      console.error("Error resizing image:", error);
    }
  }
}
