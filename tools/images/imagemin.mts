import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { globSync } from 'glob';
import imagemin, { Result } from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPng from 'imagemin-pngquant';
import imageminSVG from 'imagemin-svgo';

import { CashResult, Config, FileInfo } from './types';

// Folder, containing hashes of processed images + script config
const IMGMIN_DIR = 'tools/images';
// File, containing hashes of processed images
const CACHE_FILE_PATH = path.resolve(IMGMIN_DIR, 'results.json');
// File, containing script config
const CONFIG_FILE_PATH = path.resolve(IMGMIN_DIR, 'config.json');

const conf = fillConfig();

const init = async () => {
  const fileList = globSync(conf.srcPatterns);
  const cache = getCacheJson();

  for (const imgSrc of fileList) {
    const imgData = getFileData(imgSrc);

    if (cache[imgData.hash]) {
      continue;
    }

    if (conf.exclude?.some((pattern) => imgSrc.match(pattern))) {
      continue;
    }

    await compressImage(imgSrc, getImgDestDir(imgSrc));

    const newData = getFileData(imgSrc);

    cache[newData.hash] = {
      preCompressedSize: imgData.size,
      compressedSize: newData.size,
    };
  }

  writeCache(cache);
};

void init();

function getImgDestDir(src: string): string {
  return src.substring(0, src.lastIndexOf('/'));
}

function writeCache(cache: CashResult): void {
  const jsonString = JSON.stringify(cache, null, '\t');

  fs.writeFile(CACHE_FILE_PATH, jsonString, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

function getCacheJson(): CashResult {
  try {
    const raw = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
    const json = JSON.parse(raw) as CashResult;

    return json;
  } catch {
    return {};
  }
}

function compressImage(inputPath: string, outputDir: string): Promise<Result[]> {
  return imagemin([inputPath], {
    destination: outputDir,
    plugins: [
      // For different params check out https://github.com/imagemin/imagemin-mozjpeg
      imageminMozjpeg({ quality: 80 }),
      // For different params check out https://github.com/imagemin/imagemin-pngquant
      // @ts-ignore-next-line
      imageminPng({
        quality: [0.75, 0.95],
        speed: 1,
        dithering: 0.35,
      }),
      // For different params check out https://github.com/imagemin/imagemin-svgo
      imageminSVG({
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
        ],
      }),
    ],
  });
}

function fillConfig(): Config {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8')) as Config;
    const { srcPatterns, exclude } = config;

    if (srcPatterns === undefined || exclude === undefined) {
      throw new Error('config is missing data');
    }

    return { srcPatterns, exclude };
  } catch {
    throw new Error('no config found');
  }
}

function getFileData(src: string): FileInfo {
  const buffer = fs.readFileSync(src);
  const hash = crypto.createHash('sha1');
  const fileSize = `${(buffer.length / 1024).toPrecision(3)}kb`;

  hash.update(buffer);

  return { hash: hash.digest('hex'), size: fileSize };
}
