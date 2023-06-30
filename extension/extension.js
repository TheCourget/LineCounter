const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let totalCount = 0;

function countLinesOfCode(folderPath) {
    let totalLines = 0;

    fs.readdirSync(folderPath).forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        // Exclude the "vendor" directory
        if (stats.isDirectory() && file === 'vendor') {
            return;
        }

        if (stats.isFile() && isCodeFile(file)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            totalLines += lines.length;
        } else if (stats.isDirectory() && file !== 'vendor') {
            totalLines += countLinesOfCode(filePath);
        }
    });

    return totalLines;
}

function isCodeFile(fileName) {
    const extensions = ['.js', '.ts', '.html', '.css', '.php', '.py', '.java']; // Add more file extensions as needed
    const ext = path.extname(fileName);
    return extensions.includes(ext);
}

function activate(context) {
    const countCommand = vscode.commands.registerCommand('extension.countLinesOfCode', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            totalCount = 0;
            workspaceFolders.forEach(folder => {
                const folderPath = folder.uri.fsPath;
                totalCount += countLinesOfCode(folderPath);
            });

            vscode.window.showInformationMessage(`Count : ${totalCount} lines of code`);
        }
    });

    context.subscriptions.push(countCommand);

    // Create status bar items
    const countButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    countButton.text = '$(list-ordered)';
    countButton.tooltip = 'Count Lines of Code';
    countButton.command = 'extension.countLinesOfCode';
    countButton.show();

    // Update the sidebar with the extension name
    const extensionName = 'LineCounter'; // Replace with your extension name
    vscode.commands.executeCommand('setContext', 'extension.name', extensionName);
}

function deactivate() {
    // Clean up resources here
}

module.exports = {
    activate,
    deactivate
};