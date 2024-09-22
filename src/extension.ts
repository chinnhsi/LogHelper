import * as vscode from "vscode";
import { listFile, readFile, unzipFile } from "./utils/fileutils";
import { parseAppLogWithDecoratePosition } from "./utils/parseutils";
import LogInterface from "./interface/log.interface";

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

  // register a content provider for the cowsay-scheme
  const myScheme = "bmcloghelper";
  const myProvider = new (class implements vscode.TextDocumentContentProvider {
    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
      return readDialogData(uri.path);
    }
  })();
  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));
}
const AppLogZipFileRegex = /(app_debug_all_\d)\.gz/,
  AppLogFileRegex = /app_debug_all_\d/;
async function generateTimelineView() {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showInformationMessage("无法读取workspaceFolder");
    return;
  }
  const LogDumpPath = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\LogDump";
  let uri = vscode.Uri.parse("bmcloghelper:" + LogDumpPath);
  let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
  await vscode.window.showTextDocument(doc, { preview: false });
  activeEditor = vscode.window.activeTextEditor;
  updateDecorations();
}
async function readDialogData(LogDumpPath: string): Promise<string> {
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
  return generateContent(logData);
}
let activeEditor: vscode.TextEditor | undefined = undefined;
function generateContent(data: string): string {
  return data;
}
function updateDecorations() {
  if (!activeEditor || activeEditor.document.uri.scheme != "bmcloghelper") {
    return;
  }
  const text = activeEditor.document.getText();
  const arr = parseAppLogWithDecoratePosition(text);

  console.log(arr);
  const timeDecorate: vscode.DecorationOptions[] = [];
  const moduleDecorate: vscode.DecorationOptions[] = [];
  const logLevelDecorate: vscode.DecorationOptions[] = [];
  const sourceDecorate: vscode.DecorationOptions[] = [];
  const dataDecorate: vscode.DecorationOptions[] = [];

  for (const item of arr) {
    pushDecorateArr(item.time.start, item.time.end, timeDecorate);
    pushDecorateArr(item.module.start, item.module.end, moduleDecorate);
    pushDecorateArr(item.logLevel.start, item.logLevel.end, logLevelDecorate);
    pushDecorateArr(item.source.start, item.source.end, sourceDecorate);
    pushDecorateArr(item.data.start, item.data.end, dataDecorate);
  }
  activeEditor.setDecorations(timeDecorationType, timeDecorate);
  activeEditor.setDecorations(moduleDecorationType, moduleDecorate);
  activeEditor.setDecorations(logLevelDecorationType, logLevelDecorate);
  activeEditor.setDecorations(sourceDecorationType, sourceDecorate);
  activeEditor.setDecorations(dataDecorationType, dataDecorate);
}
const timeDecorationType = vscode.window.createTextEditorDecorationType({
  light: {
    color: "darkblue",
  },
  dark: {
    color: "lightblue",
  },
});
const moduleDecorationType = vscode.window.createTextEditorDecorationType({
  color: "red",
  overviewRulerColor: "blue",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
});
const logLevelDecorationType = vscode.window.createTextEditorDecorationType({
  color: "black",
});
const sourceDecorationType = vscode.window.createTextEditorDecorationType({
  light: {
    color: "darkblue",
  },
  dark: {
    color: "lightblue",
  },
});
const dataDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: "1px",
  borderStyle: "solid",
});
function pushDecorateArr(start: number, end: number, decorateCollection: vscode.DecorationOptions[]) {
  if (!activeEditor || activeEditor.document.uri.scheme != "bmcloghelper") {
    return;
  }
  const startPos = activeEditor.document.positionAt(start);
  const endPos = activeEditor.document.positionAt(end);
  const decoration = { range: new vscode.Range(startPos, endPos) };
  decorateCollection.push(decoration);
}
// This method is called when your extension is deactivated
export function deactivate() {}
