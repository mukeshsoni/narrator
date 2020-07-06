const Block = require("./block");
const pptrActions = require("./pptr_actions");
const domEvents = require("./dom_events_to_record");

const importPuppeteer = `const puppeteer = require('puppeteer');\n\n`;
const wrappedHeader = `(async () => {
  let xpathEl;
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()\n`;

const header = `const browser = await puppeteer.launch({headless: false})
const page = await browser.newPage()`;

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

function getSelector(target) {
  const [selectorType, ...selectorParts] = target[0].split("=");
  const selector = selectorParts.join("=");

  switch (selectorType) {
    case "css":
      return [selector, selectorType];
    case "id": {
      return [`#${selector}`, selectorType];
    }
    case "name": {
      return [`[${selectorType}=${selector}]`, selectorType];
    }
    case "xpath": {
      return [`${selector}`, selectorType];
    }
    default:
      return [`[${selectorType}=${selector}]`, selectorType];
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
    frame = "page";
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

  return {
    accessors: ["page", "keyboard", "press"],
    arguments: [capitalize(match[1].split("_")[1])],
  };
}

function getXpathSelectorIndex(selector) {
  // it's always 0. Like xpathEl[0]. Because the index of the element is
  // encoded in the xpath selector itself. E.g.
  // (//div[@id='content']/h1)[1]
  return 0;
}

// The block should have all data required to construct a line
// instead of the line itself
// E.g. Block {
//    accessors: ['page', 'keyboard', 'press'],
//    arguments: [selector, value?],
//    lhs: 'string' | null // e.g. xpathEl
// }
// The above structure can be used to
// 1. Generate code
// 2. Or execute code
//    E.g. lhs = await accessors[0][accessors[1]][accessors[2]](...arguments)
//    The only thing to figure out is how to map accessors[0] to a real variable
//    e.g. to page?
//    we can store the page variable in some other object
//    pup = { page };
//    then await pup[accessors[0]][accessors[1]](...arguments) should work
function typeCode(command) {
  let { target, value, selectedTarget } = command;
  const [selector, selectorType] = getSelector(target[selectedTarget]);

  console.log({ selector, selectorType });
  const blocks = [];

  if (!selectorType === "xpath") {
    blocks.push({
      accessors: [frame, "type"],
      arguments: [selector, value],
    });
  } else {
    blocks.push({
      accessors: [frame, "$x"],
      arguments: [selector],
      lhs: "xpathEl",
    });
    blocks.push({
      accessors: ["xpathEl", getXpathSelectorIndex(selector), "type"],
      arguments: [value],
    });
  }

  return blocks;
}

function clickCode(command) {
  let { target, selectedTarget } = command;
  const [selector, selectorType] = getSelector(target[selectedTarget]);

  const blocks = [];

  if (options.waitForSelectorOnClick) {
    if (!selectorType === "xpath") {
      blocks.push({
        accessors: [frame, "waitForSelector"],
        arguments: [selector],
      });
    } else {
      blocks.push({
        accessors: [frame, "waitForXPath"],
        arguments: [selector],
      });
    }
  }

  if (!selectorType === "xpath") {
    blocks.push({
      accessors: [frame, "click"],
      arguments: [selector],
    });
  } else {
    blocks.push({
      accessors: [frame, "$x"],
      arguments: [selector],
      lhs: "xpathEl",
    });
    blocks.push({
      accessors: ["xpathEl", getXpathSelectorIndex(selector), "click"],
      arguments: [],
    });
  }

  return blocks;
}

function changeCode(command) {
  let { target, value, selectedTarget } = command;
  const [selector, selectorType] = getSelector(target[selectedTarget]);
  const blocks = [];

  if (!selectorType === "xpath") {
    blocks.push({
      accessors: [frame, "select"],
      arguments: [selector, value],
    });
  } else {
    blocks.push({
      accessors: [frame, "$x"],
      arguments: [selector],
      lhs: "xpathEl",
    });
    blocks.push({
      accessors: ["xpathEl", getXpathSelectorIndex(selector), "select"],
      arguments: [],
    });
  }

  return blocks;
}

function gotoCode(href) {
  return {
    accessors: [frame, "goto"],
    arguments: [href],
  };
}

function viewportCode(width, height) {
  return {
    accessors: [frame, "setViewport"],
    arguments: [{ width, height }],
  };
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

function waitForNavigationCode() {
  if (options.waitForNavigation) {
    return {
      accessors: ["navigationPromise"],
    };
  }
  return [];
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

function getCommandBlocks(command) {
  const { name, value, href, tagName, frameId, frameUrl } = command;

  // we need to keep a handle on what frames commands originate from
  setFrames(frameId, frameUrl);

  switch (name) {
    case "type":
      return typeCode(command);
    case "sendKeys":
      return keyPressCode(command);
    case "click":
      return clickCode(command);
    case "change":
      if (tagName === "SELECT") {
        return changeCode(command);
      } else {
        return [];
      }
    case "GOTO":
      return gotoCode(href);
    case pptrActions.VIEWPORT:
      return viewportCode(value.width, value.height);
    case pptrActions.NAVIGATION:
      hasNavigation = true;
      return waitForNavigationCode();
    case pptrActions.SCREENSHOT:
      return handleScreenshot(value);
  }
}

function parseCommands(commands) {
  console.debug(
    `generating code for ${commands ? commands.length : 0} commands`
  );
  let result = "";

  if (!commands) return result;

  commands.forEach((command) => {
    blocks = blocks.concat(getCommandBlocks(command));
  });

  if (hasNavigation && options.waitForNavigation) {
    console.debug("Adding navigationPromise declaration");
    const navigationBlock = {
      accessors: ["page", "waitForNavigation"],
      lhs: "navigationPromise",
    };
    blocks.unshift(navigationBlock);
  }

  console.debug("post processing blocks:", blocks);
  postProcess();

  const indent = options.wrapAsync ? "  " : "";
  const newLine = `\n`;

  for (let block of blocks) {
    result += indent + getCodeString(block) + newLine;
  }

  return result;
}

function getCodeString(block) {
  const { accessors, arguments, lhs } = block;

  const accessor = accessors.reduce(
    (acc, item) => (acc ? `${acc}.${item}` : item),
    ""
  );

  const argumentsString = arguments
    .map((arg) => (typeof arg === "string" ? `"${arg}"` : arg.toString()))
    .join(", ");

  if (lhs) {
    return `${lhs} = await ${accessor}(${argumentsString})`;
  } else {
    return `await ${accessor}(${argumentsString})`;
  }
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
