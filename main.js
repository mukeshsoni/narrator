const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const puppeteer = require("puppeteer");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

const CONTROL_PANEL_WIDTH = 400;

// keeping the window reference for electron browser window outside
// so that we can use it to send messages to the renderer script
let win;
function createWindow() {
  win = new BrowserWindow({
    width: CONTROL_PANEL_WIDTH,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  // we fix the position of the control panel to the left
  // and then position the puppeteer browser right besides the control
  // panel, using the args --window-position option when launching
  // browser window
  win.setPosition(0, 0);
  win.loadFile("index.html");

  win.webContents.on("will-navigate", () => {
    console.log("navigating");
  });
  win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
  createWindow();

  runPup();
});

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

ipcMain.on("replay", (event, msg) => {
  console.log("got puppeteer code to run", msg);
  // might be better to get the commands and then run puppeteer commands
  // by generating them here
  // or
  // instead write the generated code to a file and run the file
  eval(msg);
});

async function runPup() {
  const browser = await puppeteer.launch({
    headless: false,
    // opens devtools when the window is launched
    devtools: true,
    // otherwise puppeteer sets a viewport height which is too less for larger
    // screens. Setting it to null takes up whatever space is available
    defaultViewport: null,
    args: [
      // "--window-size=1000",
      // We open the window to the right of our electron based control panel
      `--window-position=${CONTROL_PANEL_WIDTH},0`,
      // "--no-sandbox",
      // "--disable-setuid-sandbox",
      // // '--disable-gpu',
      // "--hide-scrollbars",
    ],
  });
  const page = (await browser.pages())[0];
  await page.goto("http://testing-ground.scraping.pro/login");
  const recorderScriptPath = path.resolve(process.cwd(), "build/recorder.js");
  await page.addScriptTag({ path: recorderScriptPath });

  await page.exposeFunction("sendCommandToParent", (command) => {
    // This is how we send message from the main process to our
    // renderer script which renders the control panel
    win.webContents.send("new-command", command);
  });

  try {
    await page.evaluate(() => {
      const recorder = new window.PuppeteerRecorder(window);

      sendCommandToParent("new command");
      recorder.onNewCommand(sendCommandToParent);
    });
  } catch (e) {
    console.log("error evaluating our script", e);
  }
}
