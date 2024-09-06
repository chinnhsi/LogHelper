const compressing = require("compressing");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const doReadFile = promisify(fs.readFile),
  doReadDir = promisify(fs.readdir),
  doStat = promisify(fs.stat);

export async function unzipFile(filePath: string, destFilePath: string) {
  console.log(`[unzipFile] filePath:${filePath}, destPath:${destFilePath}`);
  try {
    await compressing.gzip.uncompress(filePath, destFilePath);
  } catch (err) {
    console.log(err);
  }
}

export async function readFile(filePath: string) {
  const fileBuffer = await doReadFile(filePath);
  return fileBuffer.toString();
}

export async function listFile(dirPath: string) {
  console.log("ReadDir:" + dirPath);
  const fileList = await doReadDir(dirPath);
  let ret: string[] = [];
  for (const file of fileList) {
    const filePath: string = path.join(dirPath, file);
    const fileState = await doStat(filePath);
    if (fileState.isFile()) {
      ret.push(file);
    }
  }
  return ret;
}
