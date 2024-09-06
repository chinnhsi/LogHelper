import LogInterface, { BMCModule, BMCLogLevel } from "../interface/log.interface";

const AppLogRegex =
  /([\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2})\.([\d]{6}) ([A-Za-z 0-9_]+) ([A-Z]+): ([A-Za-z 0-9_]+)\.c\((\d+)\): ([\S ]*)/g;

export function parseAppLog(data: string) {
  const arr = data.matchAll(AppLogRegex);
  let ret: LogInterface[] = [];
  for (const item of arr) {
    ret.push({
      time: {
        timestamp: new Date(item[1]).getTime(),
        millionsecond: Number(item[2]),
        readable: item[1],
      },
      module: <BMCModule>item[3],
      logLevel: <BMCLogLevel>item[4],
      source: {
        file: item[5],
        line: Number(item[6]),
      },
      data: item[7],
    });
  }
  return ret;
}
