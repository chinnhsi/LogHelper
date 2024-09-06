const vscode = require("vscode");

const TimeLineCommandStr = "bmcloghelper.timeline";
function activate({ subscriptions }) {
  const TimeLineCommandSubscription = vscode.commands.registerCommand(TimeLineCommandStr, function () {
    generateTimelineView();
  });
  const GeneratorStatusBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  GeneratorStatusBtn.command = TimeLineCommandStr;
	GeneratorStatusBtn.text = "Generator TimeLine";
  subscriptions.push(GeneratorStatusBtn);
	GeneratorStatusBtn.show();
}
function generateTimelineView() {
	vscode.window.showInformationMessage("Hello World from BMCLogHelper!");
}
// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
