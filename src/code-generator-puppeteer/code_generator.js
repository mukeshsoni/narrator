const Block = require("./block");
const pptrActions = require("./pptr_actions");
const domEvents = require("./dom_events_to_record");

const importPuppeteer = `const puppeteer = require('puppeteer');\n\n`;
const wrappedHeader = `(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`;

const header = `const browser = await puppeteer.launch()
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

function typeCode(selector, value) {
  const block = new Block(frameId);
  block.addLine({
    type: domEvents.KEYDOWN,
    value: `await ${frame}.type('${selector}', '${value}')`,
  });
  return block;
}

function clickCode(selector) {
  const block = new Block(frameId);
  if (options.waitForSelectorOnClick) {
    block.addLine({
      type: domEvents.CLICK,
      value: `await ${frame}.waitForSelector('${selector}')`,
    });
  }
  block.addLine({
    type: domEvents.CLICK,
    value: `await ${frame}.click('${selector}')`,
  });
  return block;
}

function changeCode(selector, value) {
  return new Block(frameId, {
    type: domEvents.CHANGE,
    value: `await ${frame}.select('${selector}', '${value}')`,
  });
}

function gotoCode(href) {
  return new Block(frameId, {
    type: pptrActions.GOTO,
    value: `await ${frame}.goto('${href}')`,
  });
}

function viewportCode(width, height) {
  return new Block(frameId, {
    type: pptrActions.VIEWPORT,
    value: `await ${frame}.setViewport({ width: ${width}, height: ${height} })`,
  });
}

function handleScreenshot(options) {
  let block;

  if (options && options.x && options.y && options.width && options.height) {
    // remove the tailing 'px'
    for (let prop in options) {
      if (options.hasOwnProperty(prop) && options[prop].slice(-2) === "px") {
        options[prop] = options[prop].substring(0, options[prop].length - 2);
      }
    }

    block = new Block(frameId, {
      type: pptrActions.SCREENSHOT,
      value: `await ${frame}.screenshot({ path: 'screenshot${screenshotCounter}.png', clip: { x: ${options.x}, y: ${options.y}, width: ${options.width}, height: ${options.height} } })`,
    });
  } else {
    block = new Block(frameId, {
      type: pptrActions.SCREENSHOT,
      value: `await ${frame}.screenshot({ path: 'screenshot${screenshotCounter}.png' })`,
    });
  }

  screenshotCounter++;
  return block;
}

function waitForNavigationCode() {
  const block = new Block(frameId);
  if (options.waitForNavigation) {
    block.addLine({
      type: pptrActions.NAVIGATION,
      value: `await navigationPromise`,
    });
  }
  return block;
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
    const blankLine = new Block();
    blankLine.addLine({ type: null, value: "" });
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
    postProcessAddBlankLines();
  }
}

function parseEvents(events) {
  console.debug(`generating code for ${events ? events.length : 0} events`);
  let result = "";

  if (!events) return result;

  for (let i = 0; i < events.length; i++) {
    const {
      command,
      value,
      href,
      keyCode,
      tagName,
      frameId,
      frameUrl,
      target,
      selectedTarget,
    } = events[i];
    const selector =
      target && target.length > 0 ? target[selectedTarget || 0][0] : "";

    // we need to keep a handle on what frames events originate from
    setFrames(frameId, frameUrl);

    switch (command) {
      case "type":
        console.log("keycode", keyCode);
        // tab key
        blocks.push(typeCode(selector, value));
        break;
      case "click":
        blocks.push(clickCode(selector, events));
        break;
      case "change":
        if (tagName === "SELECT") {
          blocks.push(changeCode(selector, value));
        }
        break;
      case pptrActions.GOTO:
        blocks.push(gotoCode(href, frameId));
        break;
      case pptrActions.VIEWPORT:
        blocks.push(viewportCode(value.width, value.height));
        break;
      case pptrActions.NAVIGATION:
        blocks.push(waitForNavigationCode());
        hasNavigation = true;
        break;
      case pptrActions.SCREENSHOT:
        blocks.push(handleScreenshot(value));
        break;
    }
  }

  if (hasNavigation && options.waitForNavigation) {
    console.debug("Adding navigationPromise declaration");
    const block = new Block(frameId, {
      type: pptrActions.NAVIGATIONPROMISE,
      value: "const navigationPromise = page.waitForNavigation()",
    });
    blocks.unshift(block);
  }

  console.debug("post processing blocks:", blocks);
  postProcess();

  const indent = options.wrapAsync ? "  " : "";
  const newLine = `\n`;

  for (let block of blocks) {
    const lines = block.getLines();
    for (let line of lines) {
      result += indent + line.value + newLine;
    }
  }

  return result;
}

function generate(events) {
  cleanUp();
  return importPuppeteer + getHeader() + parseEvents(events) + getFooter();
}

module.exports = {
  generatePuppeteerCode: generate,
};
