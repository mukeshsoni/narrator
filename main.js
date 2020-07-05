const path = require("path");
const fs = require("fs");

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const {
  getCommandBlocks,
} = require("./src/code-generators/puppeteer/code-generator.js");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

const CONTROL_PANEL_WIDTH = 600;
let commands = [];
let browserForPuppeteer;

async function initializePie() {
  await pie.initialize(app);
}

// keeping the window reference for electron browser window outside
// so that we can use it to send messages to the renderer script
let controlPanelWindow;
function createControlPanelWindow() {
  controlPanelWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // we fix the position of the control panel to the left
  // and then position the puppeteer browser right besides the control
  // panel, using the args --window-position option when launching
  // browser window
  // controlPanelWindow.setPosition(0, 0);
  controlPanelWindow.loadFile("index.html");

  controlPanelWindow.webContents.on("will-navigate", () => {
    console.log("navigating");
  });
  // controlPanelWindow.webContents.openDevTools({ mode: "detach" });
}

initializePie().then(() => {
  app.whenReady().then(() => {
    createControlPanelWindow();

    runPup();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createControlPanelWindow();
  }
});

ipcMain.on("replay", (event, commands) => {
  console.log("got puppeteer code to run", commands);
  // might be better to get the commands and then run puppeteer commands
  // by generating them here
  // or
  // instead write the generated code to a file and run the file
  const blocks = commands
    .filter((command) => !command.ignore)
    .reduce((acc, command) => acc.concat(getCommandBlocks(command)), [])
    .filter((block) => block);
  console.log("blocks", blocks);
  runBlocks(blocks);
});

ipcMain.on("recording", (event, action) => {
  if (action.type === "START") {
    // When recording starts, give the renderer the current url. The first
    // command can then be to goto(url)
    event.returnValue = puppeteerHandles.page.url.bind(puppeteerHandles.page)();
  }
});
// we construct the function to call using the accessors array
// and the puppeteerHandles properties
// E.g. if accessors = ['page', 'waitForNavigation']
// we construct functionToCall as puppeteerHandles['page']['waitForNavigation']
// We bind the call to page object since many of the functions use `this`
// internally
async function runBlocks(blocks) {
  console.log("running blocks");
  // didn't know for loops work with async await. I mean the whole loop blocks
  // when there's an await statement
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    console.log(i, block);

    // we want to bind to the element the function is called with
    // e.g. page.keyboard.press should have page.keyboard as thi
    const accessorToBindTo = block.accessors
      .slice(0, block.accessors.length - 1)
      .reduce((acc, accessor) => acc[accessor], puppeteerHandles);
    const functionToCall =
      accessorToBindTo[block.accessors[block.accessors.length - 1]];

    if (!block.lhs) {
      if (block.accessors[0] === "xpathEl") {
        // have to bind the action (like click, type etc.) calls the xpathEl
        // In our case it's puppeteerHandles['xpathEl'][0]
        await functionToCall.bind(accessorToBindTo)(...block.arguments);
      } else {
        await functionToCall.bind(accessorToBindTo)(...block.arguments);
      }
    } else {
      puppeteerHandles[block.lhs] = await functionToCall.bind(accessorToBindTo)(
        ...block.arguments
      );
    }
  }
}

let puppeteerHandles = {
  page: null,
};

const recorderScriptPath = path.resolve(process.cwd(), "build/recorder.js");
const recorderScript = fs.readFileSync(recorderScriptPath);

async function injectScripts(page) {
  await page.addScriptTag({ path: recorderScriptPath });
  await page.evaluate(() => {
    const recorder = new window.PuppeteerRecorder(window);

    recorder.onNewCommand(sendCommandToParent);
  });
}

async function runPup() {
  const browser = await pie.connect(app, puppeteer);
  const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const [controlPanelXPos] = controlPanelWindow.getPosition();
  const [controlPanelWidth] = controlPanelWindow.getSize();
  const window = new BrowserWindow({
    height: screenHeight,
    x: controlPanelXPos + controlPanelWidth + 1,
    // if i don't specify the y coordinate, the x coordinate is not honored
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      // webviewTag: true,
    },
  });
  const url = "http://testing-ground.scraping.pro/login";
  await window.loadURL(url);
  const page = await pie.getPage(browser, window);
  puppeteerHandles.page = page;

  controlPanelWindow.focus();
  // const browser = await puppeteer.launch({
  // headless: false,
  // // opens devtools when the window is launched
  // devtools: true,
  // // otherwise puppeteer sets a viewport height which is too less for larger
  // // screens. Setting it to null takes up whatever space is available
  // defaultViewport: null,
  // args: [
  // // "--window-size=1000",
  // // We open the window to the right of our electron based control panel
  // `--window-position=${CONTROL_PANEL_WIDTH},0`,
  // // "--no-sandbox",
  // // "--disable-setuid-sandbox",
  // // // '--disable-gpu',
  // // "--hide-scrollbars",
  // ],
  // });
  // const page = (await browser.pages())[0];
  // puppeteerHandles.page = page;
  // await page.goto(url);
  await page.exposeFunction("sendCommandToParent", (command) => {
    commands.push(command);
    // This is how we send message from the main process to our
    // renderer script which renders the control panel
    controlPanelWindow.webContents.send("new-command", command);
  });

  await injectScripts(page);

  await page.exposeFunction("injectScriptsOnNavigation", async () => {
    await injectScripts(page);
  });

  // when the user does something which changes the url, we need to inejct
  // the recorder again in the newly loaded page
  await page.evaluateOnNewDocument(() => {
    injectScriptsOnNavigation();
  });
}
