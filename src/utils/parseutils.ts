import LogInterface, { BMCModule, BMCLogLevel } from "../interface/log.interface";

const AppLogRegex =
  /([\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}:[\d]{2})\.([\d]{6}) ([A-Za-z 0-9_]+) ([A-Z]+): ([A-Za-z 0-9_]+\.c)\((\d+)\): ([\S ]*)/g;

export function parseAppLogWithDecoratePosition(data: string) {
  const arr = data.matchAll(AppLogRegex);
  let ret: LogInterface[] = [];
  for (const item of arr) {
    let baseindex = item.index;
    ret.push({
      time: {
        start: baseindex,
        end: (baseindex += item[1].length + 1 + item[2].length),
        data: {
          timestamp: new Date(item[1]).getTime(),
          millionsecond: Number(item[2]),
          readable: item[1],
        },
      },
      module: {
        start: (baseindex += 1),
        end: (baseindex += item[3].length),
        data: <BMCModule>item[3],
      },
      logLevel: {
        start: (baseindex += 1),
        end: (baseindex += item[4].length + 1),
        data: <BMCLogLevel>item[4],
      },
      source: {
        start: (baseindex += 1),
        end: (baseindex += item[5].length + 2 + item[6].length),
        data: {
          file: item[5],
          line: Number(item[6]),
        },
      },
      data: {
        start: (baseindex += 1),
        end: (baseindex += item[7].length),
        data: item[7],
      },
    });
  }
  return ret;
}
