const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
  let win = new BrowserWindow({
    width: 1400,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  win.loadFile("index.html");

  win.webContents.on("will-navigate", () => {
    console.log("navigating");
  });
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("synchronous-message", (event, msg) => {
  console.log("got message", msg);
});
