const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 940,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }, 
	frame: false,
  })  
  //win.openDevTools();
  //win.removeMenu()
  //win.setResizable(false)
  win.loadFile('index.html')
  
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})