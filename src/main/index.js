// tells electron-webpack that we are ok with hot module reloading
// it's not working for me. If i comment it out, atleast it restarts the whole
// thing by itself when i make a change to this file
// if (module.hot) {
// module.hot.accept();
// }

import { AxePuppeteer } from "axe-puppeteer";
import path from "path";
import { format as formatUrl } from "url";
import chai from "chai";

import { app, BrowserWindow, ipcMain, screen } from "electron";
import pie from "puppeteer-in-electron";
import puppeteer from "puppeteer-core";

// require("electron-reload")(__dirname, {
// electron: path.join(__dirname, "node_modules", ".bin", "electron"),
// });

const CONTROL_PANEL_WIDTH = 600;
let browserForPuppeteer;
let testingWindow;
let currentFrameLocation = "";
let findAndSelectInProgress = false;

const isDevelopment = process.env.NODE_ENV !== "production";

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
      nodeIntegrationInWorker: true,
    },
  });

  // we fix the position of the control panel to the left
  // and then position the puppeteer browser right besides the control
  // panel, using the args --window-position option when launching
  // browser window
  // controlPanelWindow.setPosition(0, 0);
  // copied from electron-webpack-quick-start repo
  if (isDevelopment) {
    controlPanelWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
  } else {
    controlPanelWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }
  // controlPanelWindow.loadFile("index.html");

  controlPanelWindow.webContents.on("will-navigate", () => {
    console.log("navigating");
  });

  controlPanelWindow.webContents.on("devtools-opened", () => {
    controlPanelWindow.focus();
    setImmediate(() => {
      controlPanelWindow.focus();
    });
  });

  if (isDevelopment) {
    controlPanelWindow.webContents.openDevTools({ mode: "detach" });
  }

  shiftControlPanelWindowToSide();

  return controlPanelWindow;
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

ipcMain.on("replay", async (event, codeBlocks, replaySpeed) => {
  console.log("got some puppeteer code to run");

  const page = puppeteerHandles.page;
  let frame = page.mainFrame();
  // we use these variables in teh generated code to hold some stuff
  let xpathEl, el, elPos, text, inputVal;
  // slow down the operations so that they are visible in replay
  // We can take input from user on how much to slow down the execution speed
  // of each operation
  const orignalOnMessage = page._client._onMessage;
  page._client._onMessage = async (...args) => {
    await new Promise((x) => setTimeout(x, replaySpeed));
    return orignalOnMessage.call(page._client, ...args);
  };
  let errorDuringReplay = {};

  // if i try to use the expect directly imported from chai, like
  // import { expect } from 'chai'
  // i get a reference error - expect is not defined
  // if i set expect variable inside this function, then the code inside eval
  // is able to see it. Don't know why.
  const expect = chai.expect;

  console.log("starting puppeteer replay run");
  for (let i = 0; i < codeBlocks.length; i++) {
    controlPanelWindow.webContents.send("update-replay-command-index", i);
    const code = codeBlocks[i].codeStrings.join("\n");
    console.log("code to run\n", code);
    try {
      await eval(`(async function() {
      ${code}
  })()`);
    } catch (e) {
      console.log("Error trying to replay", e);
      page.evaluate((errorMessage) => {
        alert(`Error replaying: ${errorMessage}`);
      }, e.message);
      errorDuringReplay = {
        message: e.message,
        commandIndex: i,
      };
      break;
    }
  }

  // // reset onMessage to original, so that future recording actions are not
  // // slowed down
  console.log("puppeteer replay over");
  console.log("resetting slowMo to 0");
  controlPanelWindow.webContents.send("replay-over", errorDuringReplay);
  page._client._onMessage = orignalOnMessage;
});

ipcMain.on("recording", (event, action) => {
  if (action.type === "START") {
    // When recording starts, give the renderer the current url. The first
    // command can then be to goto(url)
    event.returnValue = puppeteerHandles.page.url();
    testingWindow.focus();
  }
});

ipcMain.on("start-find-and-select", () => {
  findAndSelectInProgress = true;
  selectTarget(puppeteerHandles.page);
});

ipcMain.on("find-and-highlight", (e, target) => {
  highlightTarget(puppeteerHandles.page, target);
});

ipcMain.on("stop-find-and-select", () => {
  stopFindAndSelect(puppeteerHandles.page);
});

ipcMain.handle("run-accessibility-analysis", async () => {
  console.log("runAccessibilityAnalysis");
  const page = puppeteerHandles.page;
  if (page) {
    console.log("runAccessibilityAnalysis");
    const results = await new AxePuppeteer(puppeteerHandles.page).analyze();
    return results;
  } else {
    console.log("There is no page to run analysis on");
    return { blah: "di blah" };
  }
});

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

async function highlightTarget(page, target) {
  console.log("will start find and highlight", target);
  try {
    await page.evaluate((target) => {
      if (window.PuppeteerFindAndSelect) {
        console.log("will start find and highlight");
        window.PuppeteerFindAndSelect.findAndHighlight(target).catch((e) => {
          console.log("Error trying to highlight target:", target, e);
        });
      } else {
        console.log("could not find PuppeteerFindAndSelect");
      }
    }, target);
  } catch (e) {
    console.log("Error trying to run highlight function", e);
  }
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

async function injectScriptsIntoFrame(frame) {
  await frame.addScriptTag({ path: recorderScriptPath });
  await frame.addStyleTag({ path: highlightCssPath });
  await frame.addScriptTag({ path: findAndSelectPath });

  await frame.evaluate(() => {
    window.puppeteerPuppeteerStuff = window.puppeteerPuppeteerStuff || {};

    window.puppeteerPuppeteerStuff.recorder = new window.PuppeteerRecorder(
      window
    );
    // let's not start the recording until required
    // TODO: This is not working. I thought i would detach event listeners when
    // we first load or whenever user stops recording and then call attach when
    // user starts recording.
    // window.puppeteerPuppeteerStuff.recorder.detach();

    window.puppeteerPuppeteerStuff.recorder.onNewCommand(
      // the sendCommandToParent function is only exposed on the root window
      // not on the individual iframe window objects
      window.top.sendCommandToParent
    );
  });
}

async function injectScripts(page) {
  await injectScriptsIntoFrame(page);

  for (const frame of page.mainFrame().childFrames()) {
    console.log("got frame");

    await injectScriptsIntoFrame(frame);
  }
}

function shiftControlPanelWindowToSide() {
  const { height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  controlPanelWindow.setPosition(0, 0);
  controlPanelWindow.setSize(CONTROL_PANEL_WIDTH, screenHeight);
}

function destroyTestingWindow() {
  return new Promise((resolve, reject) => {
    // we don't want to set testingWindow to null before the destroy operation
    // is complete. So we wait for it.
    // The way to wait for it is to create a promise and then await it's
    // resolution in our closeTestWindow function
    testingWindow.on("closed", () => {
      testingWindow = null;
      resolve();
    });
    testingWindow.destroy();
  });
}

async function closeTestWindow() {
  if (testingWindow && puppeteerHandles.page) {
    try {
      await puppeteerHandles.page.close();
    } catch (e) {
      console.log("the page might be closed already");
    }
    await destroyTestingWindow();
  }
}

/*
 * This function finds the path from the current frame in focus to the new
 * frame we want to go to. Assume that the frames are arranged in a tree.
 * We are given locations of 2 nodes. The locations are encoded as colon
 * separated indices. E.g. root:2:4:0. We have to find directions from one
 * node to another. The operations we can use are
 * relative=parent -> which takes us from the selected frame to it's parent
 * relative=top -> to directly jump to root of the tree, i.e. the top window
 * index=n -> to select the nth child frame of the selected frame
 * E.g. To go from root:2:3 to root:2:3:0, we generate
 * directions = [index=0]
 * To go from root:2:3:5 to root:2:1, we generate
 * directions = ['relative=parent', 'relative=parent', 'index=1']
 * To go from root:2:0 to root:3:5:0, we generate
 * directions = ['relative=parent', 'relative=parent', 'index=3', 'index=5',
 *    'index=0'
 * ]
 */
function getDirectionsToReachFrameLocation(
  currentFrameLocation,
  frameLocation
) {
  let directions = [];

  let newFrameLevels = frameLocation.split(":");
  let oldFrameLevels = currentFrameLocation.split(":");
  while (oldFrameLevels.length > newFrameLevels.length) {
    directions.push("relative=parent");
    oldFrameLevels.pop();
  }

  while (
    oldFrameLevels.length != 0 &&
    oldFrameLevels[oldFrameLevels.length - 1] !=
      newFrameLevels[oldFrameLevels.length - 1]
  ) {
    directions.push("relative=parent");
    oldFrameLevels.pop();
  }

  while (oldFrameLevels.length < newFrameLevels.length) {
    directions.push("index=" + newFrameLevels[oldFrameLevels.length]);
    oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
  }

  console.log("directions", JSON.stringify(directions, null, "\t"));
  return directions;
}

function handleCommandFromTestWindow(command) {
  // we don't want to send recorded events when findAndSelect is in progress
  if (findAndSelectInProgress) {
    return;
  }
  // if the command has come from an iframe which is not the currently
  // tracked frame, we have to generate commands to be able to first select
  // the new frame from the current frame. We do that by generating a list
  // of selectFrame commands. In most scenarios it should just be a single
  // selectFrame command.
  if (command.frameLocation !== currentFrameLocation) {
    let directions = getDirectionsToReachFrameLocation(
      currentFrameLocation,
      command.frameLocation
    );
    currentFrameLocation = command.frameLocation;
    directions.forEach((direction) => {
      const frameSelectCommand = {
        command: "selectFrame",
        target: direction,
        targets: [[direction]],
        value: "",
      };

      controlPanelWindow.webContents.send("new-command", frameSelectCommand);
    });
  }
  // This is how we send message from the main process to our
  // renderer script which renders the control panel
  controlPanelWindow.webContents.send("new-command", {
    ...command,
    targets: command.target,
    target: command.target[0][0],
    value: Array.isArray(command.value) ? command.value[0][0] : command.value,
    values: Array.isArray(command.value) ? command.value : undefined,
  });
}

async function createTestBrowserWindow(url) {
  console.log("going to url", url);
  currentFrameLocation = "root";
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

  // testingWindow.openDevTools();
  console.log("abc");
  await testingWindow.loadURL(url);
  const page = await pie.getPage(browserForPuppeteer, testingWindow);
  // to do accessibility analysis
  await page.setBypassCSP(true);
  // await page.setViewport({
  // width: 400,
  // height: 800,
  // deviceScaleFactor: 1,
  // });
  // let's now wait more than 5 seconds for anything to appear
  page.setDefaultTimeout(3000);
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
  await page.exposeFunction("sendCommandToParent", handleCommandFromTestWindow);

  await injectScripts(page);

  await page.exposeFunction("injectScriptsOnNavigation", async () => {
    await injectScripts(page);
  });

  await page.exposeFunction("sendFindAndSelectTargetToParent", (target) => {
    findAndSelectInProgress = false;
    controlPanelWindow.webContents.send("selected-target", target);
  });
  // when the user does something which changes the url, we need to inejct
  // the recorder again in the newly loaded page
  await page.evaluateOnNewDocument(() => {
    injectScriptsOnNavigation();
  });
}
