import { Command } from "../../renderer/command";

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

interface Options {
  wrapAsync: boolean;
  headless: boolean;
  waitForNavigation: boolean;
  waitForSelectorOnClick: boolean;
  blankLinesBetweenBlocks: boolean;
  dataAttribute: string;
}

let options: Options = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  blankLinesBetweenBlocks: true,
  dataAttribute: "",
};
let hasNavigation = false;
let screenshotCounter = 1;

function cleanUp() {
  options = {
    wrapAsync: true,
    headless: true,
    waitForNavigation: true,
    waitForSelectorOnClick: true,
    blankLinesBetweenBlocks: true,
    dataAttribute: "",
  };
  hasNavigation = false;
}

export function getCommandBlocks(command: Command): string | Array<string> {
  const { name, value } = command;

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
    case "check":
    case "uncheck":
      return checkCode(command);
    // TODO
    // case "uncheck":
    // TODO
    // case "dragAndDropToObject"
    // TODO
    // case "editContent"
    case "change":
      return changeCode(command);
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
    case "waitForElementNotPresent":
      return waitForElementNotPresentCode(command);
    case "waitForElementVisible":
      return waitForElementVisibleCode(command);
    case "waitForElementNotVisible":
      return waitForElementNotVisibleCode(command);
    case "waitForText":
      return waitForTextCode(command);
    case "executeScript":
    case "executePuppetterCode":
      return executePuppetterCodeCode(command);
    case "waitFor":
      return waitForCode(command);
    case "waitForNavigation":
      return waitForNavigationCode();
    case "GOTO":
      return gotoCode(value as string);
    case "setViewport":
      return viewportCode(value);
    case "takeScreenshot":
      return screenshotCode(value);
    case "assertVisibility":
      return assertVisibilityCode(command);
    // default:
    // return [];
  }

  return [];
}

function getSelector(target: string): [string, string] {
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

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

// for key presses like Enter, Tab etc.
function keyPressCode(command: Command) {
  const { value } = command;

  if (typeof value !== "string") {
    return [];
  }

  const regex = /{([^}]+)}/g;
  const match = regex.exec(value);

  if (match && match[1]) {
    const keyToPress = capitalize(match[1].split("_")[1]);

    return `await page.keyboard.press("${keyToPress}")`;
  } else {
    return "";
  }
}

function getWaitForBlock(target: string) {
  const [selector, selectorType] = getSelector(target);
  if (selectorType !== "xpath") {
    return `await frame.waitForSelector("${selector}")`;
  } else {
    return `await frame.waitForXPath("${selector}")`;
  }
}

function getActionBlock(
  action: string,
  command: Command,
  extraArgs: Array<any>,
  options: Partial<Options> = {}
) {
  let { target } = command;
  const [selector, selectorType] = getSelector(target);
  const blocks = [];

  if (options.waitForSelectorOnClick) {
    blocks.push(getWaitForBlock(target));
  }

  if (selectorType !== "xpath") {
    blocks.push(
      `await frame.${action}("${selector}"${
        extraArgs.length > 0 ? ", " : ""
      }${extraArgs.join(",")})`
    );
  } else {
    blocks.push(`xpathEl = await frame.$x("${selector}")`);
    blocks.push(`await xpathEl[0].${action}(${extraArgs.join(",")})`);
  }

  return blocks;
}

function typeCode(command: Command) {
  return getActionBlock("type", command, [`"${command.value}"`]);
}

function clickCode(command: Command) {
  // TODO: We should specially handle clicking of urls
  // We should add a frame.waitForNavigation after clicking a url
  return getActionBlock("click", command, [], options);
}

function selectCode(command: Command) {
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
  ).concat(`await page.keyboard.press("Enter")`);
}

function selectFrameCode(command: Command) {
  if (command.target === "relative=parent") {
    return `frame = frame.parentFrame()`;
  } else if (command.target === "relative=top") {
    return `await frame.waitForNavigation();\nframe = page.frames()[1];`;
  } else {
    const frameIndex = parseInt(command.target.split("=")[1], 10);
    return `await frame.waitForNavigation();\nframe = (await frame.childFrames())[${frameIndex}]`;
  }
}

// to put content inside editablecontent elements
function editContentCode(command: Command) {
  const { target, value } = command;
  const [selector] = getSelector(target);

  return `
  let editableEl = frame.$("${selector}")
  await frame.evaluate((editableContentSelector) => {
    const el = document.querySelector(editableContentSelector);
    if(el) {
      el.innerHTML = "${value}"
    }
  }, "${selector}")`;
}

function dragAndDropCode(command: Command) {
  const { target, value } = command;

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

  return `${dragAndDropFunc}

await dragAndDrop(page, "${getSelector(target)[0]}", "${
    getSelector(value)[0]
  }")`;
}

function checkCode(command: Command) {
  // const [ selector, selectorType ] =
  return getActionBlock("click", command, []);
}

function changeCode(command: Command) {
  return getActionBlock("select", command, [command.value]);
}

function gotoCode(href: string) {
  return `await page.goto("${href}")`;
}

function viewportCode({ width, height }: { width: number; height: number }) {
  return `await page.setViewport({ width: ${width}, height: ${height} })`;
}

function assertVisibilityCode(command: Command) {
  let { target } = command;

  return getWaitForBlock(target);
}

function screenshotCode(
  options: Partial<{
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
  }> = {}
) {
  let blocks = [];

  if (options && options.x && options.y && options.width && options.height) {
    options.x = parseInt(options.x + "", 10);
    options.y = parseInt(options.y + "", 10);
    options.width = parseInt(options.width + "", 10);
    options.height = parseInt(options.height + "", 10);

    screenshotCounter++;
    return `await page.screenshot({ path: 'screenshot${screenshotCounter}.png', clip: { x: ${options.x}, y: ${options.y}, width: ${options.width}, height: ${options.height} } })`;
  } else {
    screenshotCounter++;
    return `await page.screenshot({ path: 'screenshot${screenshotCounter}.png' })`;
  }
}

function waitForElementPresentCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}")`;
  } else {
    return `await frame.waitForSelector("${selector}")`;
  }
}

function waitForElementNotPresentCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `await frame.waitForFunction(
   'document.evaluate("${selector}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue'
`;
  } else {
    return `await frame.waitForFunction('!document.querySelector("${selector}"');`;
  }
}

/*
 * We can send second param to waitForSelector and waitForXPath to verify if the
 * element is visible, not just present in DOM. Thanks to this stackoverflow
 * answer - https://stackoverflow.com/a/55212494/821720
 */
function waitForElementVisibleCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}", { visible: true })`;
  } else {
    return `await frame.waitForSelector("${selector}", { visible :true })`;
  }
}

function waitForElementNotVisibleCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}", { visible: false })`;
  } else {
    return `await frame.waitForSelector("${selector}", { visible: false })`;
  }
}

function waitForTextCode(command: Command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    // It says try to find an element with the given xpath and ensure that it's
    // not null. Keep trying until it's not null. And then match it's text value
    // to given value
    // Finding element with some xpath is not that straight forward. This code
    // snippet was also picked from a stack overflow answer
    // https://stackoverflow.com/a/14284815/821720
    return `await frame.waitForFunction(
   'document.evaluate("${selector}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue && 
document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText.includes("${value}") 
   ' 
)`;
  } else {
    return `await frame.waitForFunction(
  'document.querySelector("${selector}").innerText.includes("${value}")'
);`;
  }
}

function executePuppetterCodeCode(command: Command) {
  return command.value;
}

function waitForCode(command: Command) {
  return `await frame.waitFor(${command.value})`;
}

function waitForNavigationCode() {
  return `await frame.waitForNavigation()`;
}

export function parseCommands(commands: Array<Command>) {
  console.debug(
    `generating code for ${commands ? commands.length : 0} commands`
  );
  const indent = options.wrapAsync ? "  " : "";
  const newLine = "\n";
  let result = indent + `let frame = page.mainFrame()${newLine}`;

  if (!commands) return result;

  const codeStrings: Array<string> = commands
    .filter((c) => c.target !== "css=html")
    .reduce((acc: Array<string>, command: Command) => {
      return acc
        .concat(getCommandBlocks(command))
        .filter((codeString) => codeString);
    }, []);

  if (hasNavigation && options.waitForNavigation) {
    console.debug("Adding navigationPromise declaration");
    const navigationBlock = `let navigationPromise = await page.waitForNavigation()`;
    codeStrings.unshift(navigationBlock);
  }

  console.debug("post processing codeStrings:", codeStrings);

  for (let codeString of codeStrings) {
    result += indent + codeString + newLine;
  }

  return result;
}

export function generatePuppeteerCode(
  commands: Array<Command>,
  opts?: Options
) {
  options = {
    ...options,
    ...opts,
  };

  cleanUp();
  return importPuppeteer + getHeader() + parseCommands(commands) + getFooter();
}
