const path = require("path");

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
let testingWindow;

async function initializePie() {
  await pie.initialize(app);
  browserForPuppeteer = await pie.connect(app, puppeteer);
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

ipcMain.on("url-to-test", (event, url) => {
  createTestBrowserWindow(url);
});

ipcMain.on("replay", (event, commands) => {
  console.log("got some puppeteer code to run", commands);
  // might be better to get the commands and then run puppeteer commands
  // by generating them here
  // or
  // instead write the generated code to a file and run the file
  const blocks = commands
    .filter((command) => !command.ignore)
    .reduce((acc, command) => acc.concat(getCommandBlocks(command)), [])
    .filter((block) => block);
  runBlocks(blocks);
});

ipcMain.on("recording", (event, action) => {
  if (action.type === "START") {
    // When recording starts, give the renderer the current url. The first
    // command can then be to goto(url)
    event.returnValue = puppeteerHandles.page.url.bind(puppeteerHandles.page)();
  }
});

ipcMain.on("select-assertion-target", () => {
  selectTarget(puppeteerHandles.page);
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
const highlightCssPath = path.resolve(
  process.cwd(),
  "build/find-and-select/highlight.css"
);
const findAndSelectPath = path.resolve(
  process.cwd(),
  "build/find-and-select.js"
);

async function startRecording(page) {
  await page.evaluate(() => {
    if (
      window.puppeteerPuppeteerStuff &&
      window.puppeteerPuppeteerStuff.recorder
    ) {
      window.puppeteerPuppeteerStuff.attach();
    }
  });
}

async function stopRecording(page) {
  await page.evaluate(() => {
    if (
      window.puppeteerPuppeteerStuff &&
      window.puppeteerPuppeteerStuff.recorder
    ) {
      window.puppeteerPuppeteerStuff.detach();
    }
  });
}

async function selectTarget(page) {
  testingWindow.focus();
  await page.evaluate(() => {
    if (window.PuppeteerFindAndSelect) {
      window.PuppeteerFindAndSelect.startSelection().then((target) => {
        // call the exposed function from our puppeteer instance
        // which will then pass the message to our control center window
        sendFindAndSelectTargetToParent(target);
      });
    }
  });
}
async function injectScripts(page) {
  await page.addScriptTag({ path: recorderScriptPath });
  await page.addStyleTag({ path: highlightCssPath });
  await page.addScriptTag({ path: findAndSelectPath });

  await page.evaluate(() => {
    window.puppeteerPuppeteerStuff = window.puppeteerPuppeteerStuff || {};

    window.puppeteerPuppeteerStuff.recorder = new window.PuppeteerRecorder(
      window
    );
    // let's not start the recording until required
    // TODO: This is not working. I thought i would detach event listeners when
    // we first load or whenever user stops recording and then call attach when
    // user starts recording.
    // window.puppeteerPuppeteerStuff.recorder.detach();

    window.puppeteerPuppeteerStuff.recorder.onNewCommand(sendCommandToParent);
  });
}

function shiftControlPanelWindowToSide() {
  const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  controlPanelWindow.setPosition(0, 0);
  controlPanelWindow.setSize(CONTROL_PANEL_WIDTH, screenHeight);
}

function closeTestWindows() {
  if (testingWindow) {
    testingWindow.destroy();
    testingWindow = null;
  }
}

async function createTestBrowserWindow(url) {
  shiftControlPanelWindowToSide();
  closeTestWindows();
  const {
    height: screenHeight,
    width: screenWidth,
  } = screen.getPrimaryDisplay().workAreaSize;
  const [controlPanelXPos] = controlPanelWindow.getPosition();
  const [controlPanelWidth] = controlPanelWindow.getSize();
  testingWindow = new BrowserWindow({
    width: screenWidth - controlPanelWidth - 1,
    height: screenHeight,
    x: controlPanelXPos + controlPanelWidth + 1,
    // if i don't specify the y coordinate, the x coordinate is not honored
    y: 0,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  await testingWindow.loadURL(url);
  const page = await pie.getPage(browserForPuppeteer, testingWindow);
  puppeteerHandles.page = page;
  testingWindow.openDevTools();

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

  await page.exposeFunction("sendFindAndSelectTargetToParent", (target) => {
    controlPanelWindow.webContents.send("assertion-target", target);
  });
  // when the user does something which changes the url, we need to inejct
  // the recorder again in the newly loaded page
  await page.evaluateOnNewDocument(() => {
    injectScriptsOnNavigation();
  });
}
