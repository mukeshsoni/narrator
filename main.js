const path = require("path");

const { app, BrowserWindow, ipcMain, screen } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const {
  getCommandBlocks,
  parseCommands,
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
  controlPanelWindow.webContents.openDevTools({ mode: "detach" });
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

ipcMain.on("replay", async (event, commands) => {
  console.log("got some puppeteer commands to run", commands);
  // might be better to get the commands and then run puppeteer commands
  // by generating them here
  // or
  // instead write the generated code to a file and run the file
  const blocks = commands
    .filter((command) => !command.ignore)
    .reduce((acc, command) => acc.concat(getCommandBlocks(command)), [])
    .filter((block) => block);

  const page = puppeteerHandles.page;
  // slow down the operations so that they are visible in replay
  // We can take input from user on how much to slow down the execution speed
  // of each operation
  const orignalOnMessage = page._client._onMessage;
  page._client._onMessage = async (...args) => {
    await new Promise((x) => setTimeout(x, 20));
    return orignalOnMessage.call(page._client, ...args);
  };
  let xlpathEl;

  const code = parseCommands(commands);
  console.log("code to run", code);
  try {
    await eval(`(async function() {
    console.log('starting puppeteer replay run');
      ${code}
    console.log('puppeteer replay over')
  })()`);
  } catch (e) {
    console.log("Error trying to replay", e);
    page.evaluate((errorMessage) => {
      alert(`Error replaying: ${errorMessage}`);
    }, e.message);
  } finally {
    // // reset onMessage to original, so that future recording actions are not
    // // slowed down
    console.log("resetting slowMo to 0");
    page._client._onMessage = orignalOnMessage;
  }
});

ipcMain.on("recording", (event, action) => {
  if (action.type === "START") {
    // When recording starts, give the renderer the current url. The first
    // command can then be to goto(url)
    event.returnValue = puppeteerHandles.page.url.bind(puppeteerHandles.page)();
    testingWindow.focus();
  }
});

ipcMain.on("start-find-and-select", () => {
  selectTarget(puppeteerHandles.page);
});

ipcMain.on("stop-find-and-select", () => {
  stopFindAndSelect(puppeteerHandles.page);
});

// we construct the function to call using the accessors array
// and the puppeteerHandles properties
// E.g. if accessors = ['page', 'waitForNavigation']
// we construct functionToCall as puppeteerHandles['page']['waitForNavigation']
// We bind the call to page object since many of the functions use `this`
// internally
async function runBlocks(blocks) {
  // didn't know for loops work with async await. I mean the whole loop blocks
  // when there's an await statement
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    console.log("running block", block);
    // we want to bind to the element the function is called with
    // e.g. page.keyboard.press should have page.keyboard as thi
    const accessorToBindTo = block.accessors
      .slice(0, block.accessors.length - 1)
      .reduce((acc, accessor) => acc[accessor], puppeteerHandles);
    const functionToCall =
      accessorToBindTo[block.accessors[block.accessors.length - 1]];

    try {
      if (!block.lhs) {
        if (block.accessors[0] === "xpathEl") {
          // have to bind the action (like click, type etc.) calls the xpathEl
          // In our case it's puppeteerHandles['xpathEl'][0]
          await functionToCall.bind(accessorToBindTo)(...block.args);
        } else {
          await functionToCall.bind(accessorToBindTo)(...block.args);
        }
      } else {
        puppeteerHandles[block.lhs] = await functionToCall.bind(
          accessorToBindTo
        )(...block.args);
      }
    } catch (e) {
      console.log("Error trying to execute step", block, e);
      puppeteerHandles.page.evaluate((errorMessage) => {
        alert(`could not execute step: ${errorMessage}`);
      }, e.toString());
      // we don't want to continue other steps if one of them failed
      // Maybe in the future we allow this as an option
      return;
    }
  }
}

let puppeteerHandles = {
  page: null,
};

const recorderScriptPath = path.resolve(process.cwd(), "build/recorder.js");
const highlightCssPath = path.resolve(
  process.cwd(),
  "src/find-and-select/highlight.css"
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
      console.log("will start find and select");
      window.PuppeteerFindAndSelect.cleanSelection();
      window.PuppeteerFindAndSelect.startSelection()
        .then((target) => {
          console.log("found target", target);
          // call the exposed function from our puppeteer instance
          // which will then pass the message to our control center window
          sendFindAndSelectTargetToParent(target);
        })
        .catch((e) => {
          console.log("Error trying to find and select", e);
        });
    } else {
      console.log("could not find PuppeteerFindAndSelect");
    }
  });
}

async function stopFindAndSelect(page) {
  await page.evaluate(() => {
    if (window.PuppeteerFindAndSelect) {
      console.log("will clean selection");
      window.PuppeteerFindAndSelect.cleanSelection();
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

async function closeTestWindow() {
  if (testingWindow && puppeteerHandles.page) {
    try {
      await puppeteerHandles.page.close();
    } catch (e) {
      console.log("the page might be closed already");
    }
    testingWindow.destroy();
    testingWindow = null;
  }
}

async function createTestBrowserWindow(url) {
  shiftControlPanelWindowToSide();
  await closeTestWindow();
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
  // let's now wait more than 5 seconds for anything to appear
  page.setDefaultTimeout(3000);
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
    controlPanelWindow.webContents.send("new-command", {
      ...command,
      targets: command.target,
      target: command.target[0][0],
      value: Array.isArray(command.value) ? command.value[0][0] : command.value,
      values: Array.isArray(command.value) ? command.value : undefined,
    });
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
