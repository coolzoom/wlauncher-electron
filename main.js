const { app, BrowserWindow } = require('electron')
if (require('electron-squirrel-startup')) return app.quit();

function createWindow () {
	const win = new BrowserWindow({width: 940, height: 600, minWidth: 940, minHeight: 600, maxHeight: 600, maxWidth: 940, webPreferences: {nodeIntegration: true,enableRemoteModule: true}, frame: false,})  
	win.loadFile('index.html')
	//win.openDevTools();
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {if (process.platform !== 'darwin') {app.quit()}})
app.on('activate', () => {if (BrowserWindow.getAllWindows().length === 0) {createWindow()}})