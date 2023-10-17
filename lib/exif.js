const fs = require("fs");
const { tmpdir } = require("os");
const { randStr, getBuffer } = require("../functions.js");
const webp = require("node-webpmux");
const path = require("path");
const ff = require("fluent-ffmpeg");
const pathToFfmpeg = require("ffmpeg-static");
ff.setFfmpegPath(pathToFfmpeg);

const imageToWebp = async (media) => {
  const tmpFileOut = path.join(tmpdir(), `${randStr(10)}.webp`);
  const tmpFileIn = path.join(tmpdir(), `${randStr(10)}.png`);
  console.log(media);
  fs.writeFileSync(tmpFileIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
      ])
      .toFormat("webp")
      .save(tmpFileOut);
  });

  const buff = fs.readFileSync(tmpFileOut);
  fs.unlinkSync(tmpFileOut);
  fs.unlinkSync(tmpFileIn);
  return buff;
};

const videoToWebp = async (media) => {
  const tmpFileOut = path.join(tmpdir(), `${randStr(10)}.webp`);
  const tmpFileIn = path.join(tmpdir(), `${randStr(10)}.mp4`);
  console.log(media);
  fs.writeFileSync(tmpFileIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        "-loop",
        "0",
        "-ss",
        "00:00:00",
        "-t",
        "00:00:05",
        "-preset",
        "default",
        "-an",
        "-vsync",
        "0",
      ])
      .toFormat("webp")
      .save(tmpFileOut);
  });

  const buff = fs.readFileSync(tmpFileOut);
  fs.unlinkSync(tmpFileOut);
  fs.unlinkSync(tmpFileIn);
  return buff;
};

const writeExifImg = async (media, options) => {
  let name = options?.packname || "Sticker Bang";
  let publisher = options?.publisher || "SeeDev";
  let towebp = await imageToWebp(media);
  const tempFile = `./tmp/${randStr(10)}.webp`;
  fs.writeFileSync(tempFile, towebp);

  const img = new webp.Image();
  const json = {
    "sticker-pack-id": `https://github.com/seedev43`,
    "sticker-pack-name": name,
    "sticker-pack-publisher": publisher,
    emojis: [""],
  };
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);
  await img.load(tempFile);
  //fs.unlinkSync(tmpFileIn)
  img.exif = exif;
  await img.save();
  return tempFile;
};

const writeExifVid = async (media) => {
  let towebp = await videoToWebp(media);
  const tempFile = `./tmp/${randStr(10)}.webp`;
  fs.writeFileSync(tempFile, towebp);

  const img = new webp.Image();
  const json = {
    "sticker-pack-id": `https://github.com/seedev43`,
    "sticker-pack-name": "Sticker Bang",
    "sticker-pack-publisher": "SeeDev",
    emojis: [""],
  };
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);
  await img.load(tempFile);
  //fs.unlinkSync(tmpFileIn)
  img.exif = exif;
  await img.save();
  return tempFile;
};

module.exports = { writeExifImg, writeExifVid };
