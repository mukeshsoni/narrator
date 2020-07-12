const pptrActions = require("./pptr_actions");

const importPuppeteer = `const puppeteer = require('puppeteer');\n\n`;
const wrappedHeader = `(async () => {
  let xpathEl;
  const browser = await puppeteer.launch()
  let page = await browser.newPage()\n`;

const header = `const browser = await puppeteer.launch()
let page = await browser.newPage()`;

const wrappedFooter = `  await browser.close()
})()`;
const footer = `await browser.close()`;

let options = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  blankLinesBetweenBlocks: true,
  dataAttribute: "",
};
let blocks = [];
let hasNavigation = false;
let frameId;
let frame;
let allFrames = {};

function cleanUp() {
  options = {
    wrapAsync: true,
    headless: true,
    waitForNavigation: true,
    waitForSelectorOnClick: true,
    blankLinesBetweenBlocks: true,
    dataAttribute: "",
  };
  blocks = [];
  hasNavigation = false;
  frameId;
  frame;
  allFrames = {};
}

function getCommandBlocks(command) {
  const { name, value, tagName, frameId, frameUrl } = command;

  // we need to keep a handle on what frames commands originate from
  setFrames(frameId, frameUrl);

  switch (name) {
    case "type":
      return typeCode(command);
    case "sendKeys":
      return keyPressCode(command);
    case "click":
      return clickCode(command);
    // TODO
    // case "clickAt":
    // // return clickCode(command);
    // TODO
    // case "doubleClick":
    // TODO
    // case "doubleClickAt":
    // TODO
    // case "check":
    // TODO
    // case "uncheck":
    // TODO
    // case "dragAndDropToObject"
    // TODO
    // case "editContent"
    case "change":
      if (tagName === "SELECT") {
        return changeCode(command);
      } else {
        return [];
      }
    case "select":
      return selectCode(command);
    case "dragAndDropToObject":
      return dragAndDropCode(command);
    case "selectFrame":
      return selectFrameCode(command);
    case "editContent":
      return editContentCode(command);
    case "waitForElementPresent":
      return waitForElementPresentCode(command);
    case "waitForElementVisible":
      return waitForElementVisibleCode(command);
    case "waitForText":
      return waitForTextCode(command);
    case "executePuppetterCode":
      return executePuppetterCodeCode(command);
    case "waitFor":
      return waitForCode(command);
    case "waitForNavigation":
      return waitForNavigationCode(command);
    case "GOTO":
      return gotoCode(value);
    case pptrActions.VIEWPORT:
      return viewportCode(value.width, value.height);
    case pptrActions.SCREENSHOT:
      return handleScreenshot(value);
    case "assertVisibility":
      return assertVisibilityCode(command);
    // default:
    // return [];
  }
}

function getSelector(target) {
  const [selectorType, ...selectorParts] = target.split("=");
  const selector = selectorParts.join("=");

  switch (selectorType) {
    case "css":
      return [selector, selectorType];
    case "id": {
      return [`#${selector}`, selectorType];
    }
    case "name": {
      return [`[${selectorType}='${selector}']`, selectorType];
    }
    case "xpath": {
      return [`${selector}`, selectorType];
    }
    case "linkText":
      // puppeteer doesn't have any selector equivalent to seleniums
      // linkText='text inside anchor tag'
      // Can be simulated using xpath selector
      // https://stackoverflow.com/a/55500914/821720
      return [`//a[contains(., '${selector}')]`, "xpath"];
    default:
      return [`[${selectorType}='${selector}']`, selectorType];
  }
}

function getHeader() {
  let hdr = options.wrapAsync ? wrappedHeader : header;
  hdr = options.headless
    ? hdr
    : hdr.replace("launch()", "launch({ headless: false })");
  return hdr;
}

function getFooter() {
  return options.wrapAsync ? wrappedFooter : footer;
}

function setFrames(frameId, frameUrl) {
  if (frameId && frameId !== 0) {
    frameId = frameId;
    frame = `frame${frameId}`;
    allFrames[frameId] = frameUrl;
  } else {
    frameId = 0;
    frame = "frame";
  }
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

// for key presses like Enter, Tab etc.
function keyPressCode(command) {
  const { value } = command;
  const regex = /{([^}]+)}/g;
  const match = regex.exec(value);
  const keyToPress = capitalize(match[1].split("_")[1]);

  return [
    {
      line: `await page.keyboard.press("${keyToPress}")`,
    },
  ];
}

function getXpathSelectorIndex(selector) {
  // it's always 0. Like xpathEl[0]. Because the index of the element is
  // encoded in the xpath selector itself. E.g.
  // (//div[@id='content']/h1)[1]
  return 0;
}

function getWaitForBlock(target) {
  const [selector, selectorType] = getSelector(target);
  if (selectorType !== "xpath") {
    return { line: `await ${frame}.waitForSelector("${selector}")` };
  } else {
    return { line: `await ${frame}.waitForXPath("${selector}")` };
  }
}

function selectElementBlock(target, elName) {
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    return { line: `let ${elName} = ${frame}.$x("${selector}")` };
  } else {
    return { line: `let ${elName} = ${frame}.$("${selector}")` };
  }
}

function getActionBlock(action, command, extraArgs, options = {}) {
  let { target } = command;
  const [selector, selectorType] = getSelector(target);
  const blocks = [];

  if (options.waitForSelectorOnClick) {
    blocks.push(getWaitForBlock(target));
  }

  if (selectorType !== "xpath") {
    blocks.push({
      line: `await ${frame}.${action}("${selector}"${
        extraArgs.length > 0 ? ", " : ""
      }${extraArgs.join(",")})`,
    });
  } else {
    blocks.push({ line: `xpathEl = await ${frame}.$x("${selector}")` });
    blocks.push({ line: `await xpathEl[0].${action}(${extraArgs.join(",")})` });
  }

  return blocks;
}

function typeCode(command) {
  return getActionBlock("type", command, [`"${command.value}"`]);
}

function clickCode(command) {
  // TODO: We should specially handle clicking of urls
  // We should add a frame.waitForNavigation after clicking a url
  return getActionBlock("click", command, [], options);
}

function selectCode(command) {
  const { target, value } = command;

  // The selectCode command is generated by our recorder after a command
  // which clicks the select element
  // Weirdly clicking the option with text doesn't work after that
  // What works is typing the text for that option in the select element
  return getActionBlock(
    "type",
    {
      ...command,
      target,
    },
    [`"${value.split("=")[1]}"`]
  ).concat({
    line: `await page.keyboard.press("Enter")`,
  });
}

function selectFrameCode(command) {
  if (command.target === "relative=parent") {
    return [{ line: `frame = frame.parentFrame()` }];
  } else if (command.target === "relative=top") {
    return [
      { line: `await frame.waitForNavigation();\nframe = page.frames()[1];` },
    ];
  } else {
    const frameIndex = parseInt(command.target.split("=")[1], 10);
    return [
      {
        line: `await frame.waitForNavigation();\nframe = (await frame.childFrames())[${frameIndex}]`,
      },
    ];
  }
}

// to put content inside editablecontent elements
function editContentCode(command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  return [
    {
      line: `
  let editableEl = frame.$("${selector}")
  await frame.evaluate((editableContentSelector) => {
    const el = document.querySelector(editableContentSelector);
    if(el) {
      el.innerHTML = "${value}"
    }
  }, "${selector}")`,
    },
  ];
}

function dragAndDropCode(command) {
  const { target, value } = command;
  let blocks = [];

  // drag and drop support is not good in puppeteer. Their page.mouse.* apis are
  // unreliable. Somewhat reliable way is to use page.evaluate and simulate
  // drag and drop using browser apis
  // https://github.com/puppeteer/puppeteer/issues/1376
  const dragAndDropFunc = `async function dragAndDrop(page, sourceSelector, destinationSelector) {
    const sourceElement = await page.waitForSelector(sourceSelector);
    const destinationElement = await page.waitForSelector(destinationSelector);

    const sourceBox = await sourceElement.boundingBox();
    const destinationBox = await destinationElement.boundingBox();

    await page.evaluate(
      async (ss, ds, sb, db) => {
        const waitTime = 200;
        const sleep = (milliseconds) => {
          return new Promise((resolve) => setTimeout(resolve, milliseconds));
        };
        const source = document.querySelector(ss);
        const destination = document.querySelector(ds);

        const sourceX = sb.x + sb.width / 2;
        const sourceY = sb.y + sb.height / 2;
        const destinationX = db.x + db.width / 2;
        const destinationY = db.y + db.height / 2;

        source.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            screenX: sourceX,
            screenY: sourceY,
            clientX: sourceX,
            clientY: sourceY,
          })
        );
        await sleep(waitTime);
        source.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            screenX: sourceX,
            screenY: sourceY,
            clientX: sourceX,
            clientY: sourceY,
          })
        );
        await sleep(waitTime);
        const dataTransfer = new DataTransfer();
        dataTransfer.effectAllowed = "all";
        dataTransfer.dropEffect = "none";
        dataTransfer.files = [];
        let dragstart = source.dispatchEvent(
          new DragEvent("dragstart", {
            dataTransfer,
            bubbles: true,
            cancelable: true,
            screenX: sourceX,
            screenY: sourceY,
            clientX: sourceX,
            clientY: sourceY,
          })
        );

        await sleep(waitTime);

        await sleep(waitTime);
        destination.dispatchEvent(
          new DragEvent("dragover", {
            bubbles: true,
            cancelable: true,
            screenX: destinationX,
            screenY: destinationY,
            clientX: destinationX,
            clientY: destinationY,
            dataTransfer,
          })
        );
        await sleep(waitTime);
        destination.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            screenX: destinationX,
            screenY: destinationY,
            clientX: destinationX,
            clientY: destinationY,
            dataTransfer,
          })
        );
        await sleep(waitTime);
        source.dispatchEvent(
          new DragEvent("dragend", {
            bubbles: true,
            cancelable: true,
            screenX: destinationX,
            screenY: destinationY,
            clientX: destinationX,
            clientY: destinationY,
          })
        );
      },
      sourceSelector,
      destinationSelector,
      sourceBox,
      destinationBox
    );
  }`;

  return [
    {
      line: `${dragAndDropFunc}

await dragAndDrop(page, "${getSelector(target)[0]}", "${
        getSelector(value)[0]
      }")`,
    },
  ];
}

function changeCode(command) {
  return getActionBlock("select", command, [command.value]);
}

function gotoCode(href) {
  return [{ line: `await page.goto("${href}")` }];
}

function viewportCode(width, height) {
  return [
    {
      line: `await ${frame}.setViewport({ width: ${width}, height: ${height} })`,
    },
  ];
}

function assertVisibilityCode(command) {
  let { target } = command;
  const [selector, selectorType] = getSelector(target);

  return getWaitForBlock(target);
}

function handleScreenshot(options) {
  let blocks = [];

  if (options && options.x && options.y && options.width && options.height) {
    // remove the tailing 'px'
    for (let prop in options) {
      if (options.hasOwnProperty(prop) && options[prop].slice(-2) === "px") {
        options[prop] = options[prop].substring(0, options[prop].length - 2);
      }
    }

    blocks.push({
      type: pptrActions.SCREENSHOT,
      value: `await ${frame}.screenshot({ path: 'screenshot${screenshotCounter}.png', clip: { x: ${options.x}, y: ${options.y}, width: ${options.width}, height: ${options.height} } })`,
    });
  } else {
    blocks.push({
      type: pptrActions.SCREENSHOT,
      value: `await ${frame}.screenshot({ path: 'screenshot${screenshotCounter}.png' })`,
    });
  }

  screenshotCounter++;
  return blocks;
}

function waitForElementPresentCode(command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return [{ line: `await frame.waitForXPath("${selector}")` }];
  } else {
    return [{ line: `await frame.waitForSelector("${selector}")` }];
  }
}

/*
 * We can send second param to waitForSelector and waitForXPath to verify if the
 * element is visible, not just present in DOM. Thanks to this stackoverflow
 * answer - https://stackoverflow.com/a/55212494/821720
 */
function waitForElementVisibleCode(command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return [
      { line: `await frame.waitForXPath("${selector}", { visible: true })` },
    ];
  } else {
    return [
      { line: `await frame.waitForSelector("${selector}", { visible :true })` },
    ];
  }
}

function waitForTextCode(command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    // It says try to find an element with the given xpath and ensure that it's
    // not null. Keep trying until it's not null. And then match it's text value
    // to given value
    // Finding element with some xpath is not that straight forward. This code
    // snippet was also picked from a stack overflow answer
    // https://stackoverflow.com/a/14284815/821720
    return [
      {
        line: `await frame.waitForFunction(
   'document.evaluate("${selector}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue && 
document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.includes("${value}") 
   ' 
)`,
      },
    ];
  } else {
    return [
      {
        line: `await frame.waitForFunction(
  'document.querySelector("${selector}").innerText.includes("${value}")'
);`,
      },
    ];
  }
}

function executePuppetterCodeCode(command) {
  return [{ line: command.value }];
}

function waitForCode(command) {
  return `await frame.waitFor(${command.value})`;
}

function waitForNavigationCode() {
  return [{ line: `await frame.waitForNavigation()` }];
}

function postProcessSetFrames() {
  for (let [i, block] of blocks.entries()) {
    const lines = block.getLines();
    for (let line of lines) {
      if (
        line.frameId &&
        Object.keys(allFrames).includes(line.frameId.toString())
      ) {
        const declaration = `const frame${
          line.frameId
        } = frames.find(f => f.url() === '${allFrames[line.frameId]}')`;
        blocks[i].addLineToTop({
          type: pptrActions.FRAMESET,
          value: declaration,
        });
        blocks[i].addLineToTop({
          type: pptrActions.FRAMESET,
          value: "let frames = await page.frames()",
        });
        delete allFrames[line.frameId];
        break;
      }
    }
  }
}

function postProcessAddBlankLines() {
  let i = 0;
  while (i <= blocks.length) {
    const blankLine = [];
    blankLine.push({ type: null, value: "" });
    blocks.splice(i, 0, blankLine);
    i += 2;
  }
}

function postProcess() {
  // when events are recorded from different frames, we want to add a frame setter near the code that uses that frame
  if (Object.keys(allFrames).length > 0) {
    postProcessSetFrames();
  }

  if (options.blankLinesBetweenBlocks && blocks.length > 0) {
    // postProcessAddBlankLines();
  }
}

function parseCommands(commands) {
  console.debug(
    `generating code for ${commands ? commands.length : 0} commands`
  );
  let blocks = [];
  const indent = options.wrapAsync ? "  " : "";
  const newLine = "\n";
  let result = `let frame = page.mainFrame()${newLine}`;
  frame = "page";

  if (!commands) return result;

  commands
    .filter((c) => c.target !== "css=html")
    .forEach((command) => {
      blocks = blocks
        .concat(getCommandBlocks(command))
        .filter((block) => block);
    });

  if (hasNavigation && options.waitForNavigation) {
    console.debug("Adding navigationPromise declaration");
    const navigationBlock = {
      line: `let navigationPromise = await page.waitForNavigation()`,
    };
    blocks.unshift(navigationBlock);
  }

  console.debug("post processing blocks:", blocks);
  postProcess();

  for (let block of blocks) {
    const codeString = getCodeString(block);

    result += indent + codeString + newLine;
    // `console.log('running code', \`${codeString}\`);` +
    // newLine;
  }

  return result;
}

function getCodeString(block) {
  return block.line;
}

function generate(commands, opts) {
  options = {
    ...options,
    ...opts,
  };

  cleanUp();
  return importPuppeteer + getHeader() + parseCommands(commands) + getFooter();
}

module.exports = {
  generatePuppeteerCode: generate,
  getCommandBlocks,
  parseCommands,
};
