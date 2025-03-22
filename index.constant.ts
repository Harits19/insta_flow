import { AspectRatio } from "./resize.types";

export const prefixPath = "D:Fia & Harits/Edited Fia Harits/";

export const listFolder: {
  path: string;
  caption: string;
  aspectRatio?: AspectRatio;
  startIndex?: number;
  reduceQuality?: boolean;
}[] = [
  {
    path: "couple/Size 4x5",
    caption: "Couple",
  },
  {
    path: "decor/Size 1x1",
    caption: "Decor",
  },
  {
    path: "family/Size 16x9",
    caption: "Family",
  },
  {
    path: "group/Size 16x9",
    caption: "Group",
    aspectRatio: "16x9",
  },
  {
    path: "mc taufiq/Size 4x5",
    caption: "MC Taufiq",
  },
  {
    path: "mc vano/Size 4x5",
    caption: "MC Vano",
  },
  {
    path: "prepare/Size 4x5",
    caption: "Prepare",
  },
  {
    path: "resepsi/Size 16x9",
    caption: "Resepsi",
  },
];
