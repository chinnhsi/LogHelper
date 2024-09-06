import * as vscode from "vscode";
import { listFile, readFile, unzipFile } from "./utils/fileutils";
import { parseAppLog } from "./utils/parseutils";

const TimeLineCommandStr = "bmcloghelper.timeline";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(TimeLineCommandStr, () => {
    generateTimelineView();
  });
  const GeneratorStatusBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  GeneratorStatusBtn.command = TimeLineCommandStr;
  GeneratorStatusBtn.text = "Generator TimeLine";
  GeneratorStatusBtn.show();

  context.subscriptions.push(disposable);
  context.subscriptions.push(GeneratorStatusBtn);
}
const AppLogZipFileRegex = /(app_debug_all_\d)\.gz/,
  AppLogFileRegex = /app_debug_all_\d/;
async function generateTimelineView() {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showInformationMessage("无法读取workspaceFolder");
    return;
  }
  const LogDumpPath = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\LogDump";
  const fileList = await listFile(LogDumpPath);
  let unzipFileList: { [key: string]: boolean } = {};
  for (const fileName of fileList) {
    if (!AppLogFileRegex.test(fileName)) {
      continue;
    }
    let arr = fileName.match(AppLogZipFileRegex);
    if (!arr || arr.length == 0) {
      unzipFileList[fileName] = true;
      continue;
    }
    if (unzipFileList[arr[1]] == undefined) {
      unzipFileList[arr[1]] = false;
    }
  }
  let keyArr = Object.keys(unzipFileList);
  for (const key of keyArr) {
    if (!unzipFileList[key]) {
      console.log("UnzipFile:" + key + ".gz");
      await unzipFile(LogDumpPath + "\\" + key + ".gz", LogDumpPath + "\\" + key);
    }
  }
  let logData: string = "";
  for (let i = 3; i >= 0; i--) {
    const filePath = LogDumpPath + "\\app_debug_all" + (i == 0 ? "" : "_" + i);
    try {
      logData += (await readFile(filePath)) + "\n";
    } catch {
      console.log("Cannot open file:" + filePath);
    }
  }
  console.log(logData);
  const logInfo = parseAppLog(logData);
  console.log(logInfo);
}
// This method is called when your extension is deactivated
export function deactivate() {}
