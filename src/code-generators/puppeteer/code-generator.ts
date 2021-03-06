import { Command, TestConfig } from "../../renderer/test_config";

const importPuppeteer = `const puppeteer = require('puppeteer');\n\n`;
const wrappedHeader = `(async () => {
  let xpathEl;
  // to store text when making text assertions
  let text; 
  // to store intermediate elements whenever that element needs to be passed
  // to frame.evaluate to get something from inside the page
  let el; 
  // for storing position of an element if we need to hover over it or click it
  let elPos; 
  // to store values from any kind of input element
  let inputVal;

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

export function getCommandBlocks(
  command: Command,
  baseUrl: string
): string | Array<string> {
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
    case "doubleClick":
      return doubleClickCode(command);
    // TODO
    // case "doubleClickAt":
    case "check":
    case "uncheck":
      return checkCode(command);
    // TODO
    case "uncheck":
      return checkCode(command);
    case "mouseDown":
      return mouseDownCode();
    case "mouseUp":
      return mouseUpCode();
    case "mouseMoveAt":
      return mouseMoveAt(command);
    case "mouseOver":
      return mouseOverCode(command);
    case "mouseOut":
      return mouseOutCode(command);
    case "change":
      return changeCode(command);
    case "select":
      return selectCode(command);
    case "dragAndDropToObject":
      return dragAndDropCode(command);
    case "selectFrame":
      return selectFrameCode(command);
    case "submit":
      return submitCode(command);
    case "editContent":
      return editContentCode(command);
    case "waitFor":
      return waitForCode(command);
    case "waitForNavigation":
      return waitForNavigationCode();
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
    case "executePuppetterCode":
      return executePuppetterCodeCode(command);
    case "executeScript":
      return executeScriptCode(command);
    case "open":
      return gotoCode(command, baseUrl);
    case "setViewport":
      return viewportCode(value);
    case "takeScreenshot":
      return screenshotCode(value);
    case "chooseOkOnNextConfirmation":
      return dialogOkCode();
    case "chooseCancelOnNextPrompt":
    case "chooseCancelOnNextConfirmation":
      return dialogCancelCode();
    case "assertElementPresent":
      return assertElementPresentCode(command);
    case "assertElementNotPresent":
      return assertElementNotPresentCode(command);
    case "assertText":
      return assertTextCode(command);
    case "assertNotText":
      return assertNotTextCode(command);
    case "assertTitle":
      return assertTitleCode(command);
    case "assertTextContains":
      return assertTextContainsCode(command);
    case "assertTextStartsWith":
      return assertTextStartsWithCode(command);
    case "assertVisibility":
      return assertVisibilityCode(command);
    case "assertChecked":
      return assertCheckedCode(command);
    case "assertNotChecked":
      return assertNotCheckedCode(command);
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

function doubleClickCode(command: Command) {
  // TODO: We should specially handle clicking of urls
  // We should add a frame.waitForNavigation after clicking a url
  return getActionBlock("click", command, [], options).concat(
    getActionBlock("click", command, ["{ clickCount: 2 }"])
  );
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
    return `frame = page.frames()[1];`;
  } else {
    const frameIndex = parseInt(command.target.split("=")[1], 10);
    return `frame = frame.childFrames()[${frameIndex}]`;
  }
}

function submitCode(command: Command) {
  let [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `xpathEl = await frame.$x("${selector}")
  await frame.evaluate(el => el.submit(), xpathEl[0])`;
  } else {
    return `await frame.$eval("${selector}", el => el.submit())`;
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

function mouseDownCode() {
  // the mouse property is only available on page not on frame
  return `await page.mouse.down()`;
}

function mouseUpCode() {
  // the mouse property is only available on page not on frame
  return `await page.mouse.up()`;
}

function mouseMoveAt(command: Command) {
  const { value } = command;

  return `await page.mouse.move(${value})`;
}

function mouseOverCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  // have to call toJSON() on getBoundingClientRect() return value which is a
  // DOMRect object. If we simply return the DOMRect object, we get back an
  // empty object
  if (selectorType === "xpath") {
    return `xpathEl = await frame.$x("${selector}")
  elPos = await frame.evaluate(el => el.getBoundingClientRect().toJSON(), xpathEl[0])
  await page.mouse.move(elPos.x, elPos.y)`;
  } else {
    return `elPos = await frame.$eval("${selector}", el => el.getBoundingClientRect().toJSON)
  await page.mouse.move(elPos.x, elPos.y)`;
  }
}

function mouseOutCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  // have to call toJSON() on getBoundingClientRect() return value which is a
  // DOMRect object. If we simply return the DOMRect object, we get back an
  // empty object
  if (selectorType === "xpath") {
    // we move the mouse 1 pixel outside the elements bounding rect
    return `xpathEl = await frame.$x("${selector}")
  elPos = await frame.evaluate(el => el.getBoundingClientRect().toJSON(), xpathEl[0])
  await page.mouse.move(elPos.x + elPos.width, elPos.y+elPos.height)`;
  } else {
    return `elPos = await frame.$eval("${selector}", el => el.getBoundingClientRect().toJSON)
  await page.mouse.move(elPos.x+elPos.width, elPos.y+elPos.height)`;
  }
}

function changeCode(command: Command) {
  return getActionBlock("select", command, [command.value]);
}

function gotoCode(command: Command, baseUrl: string) {
  console.log("url", baseUrl, command.value);
  return `await page.goto("${baseUrl}${command.value}")`;
}

function viewportCode({ width, height }: { width: number; height: number }) {
  return `await page.setViewport({ width: ${width}, height: ${height} })`;
}

function assertVisibilityCode(command: Command) {
  let { target } = command;

  return getWaitForBlock(target);
}

function assertCheckedCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    // we move the mouse 1 pixel outside the elements bounding rect
    return `xpathEl = await frame.$x("${selector}")
  inputVal = await frame.evaluate(el => el.checked, xpathEl[0])
  expect((inputVal).checked).to.equal(true)`;
  } else {
    return `inputVal = await frame.$eval("${selector}", el => el.checked)
  expect(inputVal).to.equal(true)`;
  }
}

function assertNotCheckedCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    // we move the mouse 1 pixel outside the elements bounding rect
    return `xpathEl = await frame.$x("${selector}")
  inputVal = await frame.evaluate(el => el.checked, xpathEl[0])
  expect((inputVal).checked).to.equal(false)`;
  } else {
    return `inputVal = await frame.$eval("${selector}", el => el.checked)
  expect(inputVal).to.equal(false)`;
  }
}

function assertElementPresentCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `el = await frame.$x("${selector}")
  expect(el).to.not.equal(null)`;
  } else {
    return `el = await frame.$("${selector}")
  expect(el).to.not.equal(null)`;
  }
}

function assertElementNotPresentCode(command: Command) {
  const [selector, selectorType] = getSelector(command.target);

  if (selectorType === "xpath") {
    return `el = await frame.$x("${selector}")
  expect(el).to.equal(null)`;
  } else {
    return `el = await frame.$("${selector}")
  expect(el).to.equal(null)`;
  }
}

function assertTextCode(command: Command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}")
  el = await frame.$x("${selector}")
  text = await frame.evaluate(el => el.innerText, el[0])
  expect(text).to.equal("${value}")`;
  } else {
    return `text = await frame.$eval("${selector}", el => el.innerText)
  expect(text).to.equal("${value}")`;
  }
}

function assertNotTextCode(command: Command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}")
  el = await frame.$x("${selector}")
  text = await frame.evaluate(el => el.innerText, el[0])
  expect(text).to.not.equal("${value}")`;
  } else {
    return `text = await frame.$eval("${selector}", el => el.innerText)
  expect(text).to.not.equal("${value}")`;
  }
}

function assertTitleCode(command: Command) {
  return `expect(await page.title()).to.equal("${command.value}")`;
}

function assertTextContainsCode(command: Command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}")
  el = await frame.$x("${selector}")
  text = await frame.evaluate(el => el.innerText, el[0])
  expect(text.toLowerCase()).to.include("${value}".toLowerCase())`;
  } else {
    return `text = await frame.$eval("${selector}", el => el.innerText)
  expect(text.toLowerCase()).to.include("${value}".toLowerCase())`;
  }
}

function assertTextStartsWithCode(command: Command) {
  const { target, value } = command;
  const [selector, selectorType] = getSelector(target);

  if (selectorType === "xpath") {
    return `await frame.waitForXPath("${selector}")
  el = await frame.$x("${selector}")
  text = await frame.evaluate(el => el.innerText, el[0])
  expect(text.toLowerCase().startsWith("${value}")).to.be.true`;
  } else {
    return `text = await frame.$eval("${selector}", el => el.innerText)
  expect(text.toLowerCase().startsWith("${value}")).to.be.true`;
  }
}

function dialogOkCode() {
  return `page.once('dialog', async dialog => await dialog.accept())`;
}

function dialogCancelCode() {
  return `page.once('dialog', async dialog => await dialog.dismiss())`;
}

function screenshotCode(
  options: Partial<{
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
  }> = {}
) {
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

// executeScript will execute the code in the context of the window/page
// and not in puppeteer context
function executeScriptCode(command: Command) {
  return `await frame.evaluate(() => {
    ${command.value}
  })`;
}

function waitForCode(command: Command) {
  return `await frame.waitFor(${command.value})`;
}

function waitForNavigationCode() {
  return `await frame.waitForNavigation()`;
}

export function transformToCodeBlocks(
  commands: Array<Command>,
  baseUrl: string
): Array<{ command: Command; codeStrings: Array<string> }> {
  console.debug(
    `generating code for ${commands ? commands.length : 0} commands`
  );
  if (!commands) return [];

  const withCode: Array<{
    command: Command;
    codeStrings: Array<string>;
  }> = commands
    .filter((c) => c.target !== "css=html" && !c.name.startsWith("//"))
    .reduce(
      (
        acc: Array<{ command: Command; codeStrings: Array<string> }>,
        command: Command
      ) => {
        return acc.concat({
          command,
          codeStrings: ([] as Array<string>).concat(
            getCommandBlocks(command, baseUrl)
          ),
        });
      },
      []
    );

  if (hasNavigation && options.waitForNavigation) {
    const navigationBlock = `let navigationPromise = await page.waitForNavigation()`;
    withCode.unshift({
      command: {
        name: "waitForNavigation",
        command: "waitForNavigation",
        targets: [],
        target: "",
      },
      codeStrings: [navigationBlock],
    });
  }

  return withCode;
}

export function generatePuppeteerCode(testConfig: TestConfig, opts?: Options) {
  options = {
    ...options,
    ...opts,
  };
  const { url, commands } = testConfig;

  cleanUp();
  const indent = "  ";
  const frameAssignment = indent + `let frame = page.mainFrame()`;

  return (
    importPuppeteer +
    getHeader() +
    frameAssignment +
    "\n" +
    transformToCodeBlocks(commands, url)
      .map(({ codeStrings }) =>
        codeStrings.map((codeStr) => `${indent}${codeStr}`).join("\n")
      )
      .join("\n") +
    "\n" +
    "\n" +
    getFooter()
  );
}
