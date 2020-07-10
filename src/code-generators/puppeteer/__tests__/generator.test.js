const { getCommandBlocks } = require("../code-generator");

const commandsToTest = [
  {
    command: {
      name: "click",
      target: "css=#myid",
    },
    expectedBlocks: [
      { line: 'await page.waitForSelector("#myid")' },
      { line: 'await page.click("#myid")' },
    ],
  },
  {
    command: {
      name: "click",
      target: "xpath=(//div[@id='myid'])[1]",
    },
    expectedBlocks: [
      { line: `await page.waitForXPath("(//div[@id='myid'])[1]")` },
      { line: `xpathEl = await page.$x("(//div[@id='myid'])[1]")` },
      { line: `await xpathEl[0].click()` },
    ],
  },
  {
    command: {
      name: "click",
      target: "linkText=Form Authentication",
    },
    expectedBlocks: [
      {
        line: `await page.waitForXPath("//a[contains(., 'Form Authentication')]")`,
      },
      {
        line: `xpathEl = await page.$x("//a[contains(., 'Form Authentication')]")`,
      },
      { line: `await xpathEl[0].click()` },
    ],
  },
  {
    command: {
      name: "type",
      target: "css=#myid",
      value: "abcd",
    },
    expectedBlocks: [
      {
        line: `await page.type("#myid", "abcd")`,
      },
    ],
  },
  {
    command: {
      name: "type",
      target: "xpath=(//div[@id='myid'])[1]",
      value: "abcd",
    },
    expectedBlocks: [
      { line: `xpathEl = await page.$x("(//div[@id='myid'])[1]")` },
      { line: `await xpathEl[0].type("abcd")` },
    ],
  },
  {
    command: {
      name: "sendKeys",
      target: "css=#myid",
      value: "${KEY_ENTER}",
    },
    expectedBlocks: [{ line: `await page.keyboard.press("Enter")` }],
  },
  {
    command: {
      name: "sendKeys",
      target: "css=#myid",
      value: "${KEY_TAB}",
    },
    expectedBlocks: [{ line: `await page.keyboard.press("Tab")` }],
  },
  {
    command: {
      name: "GOTO",
      value: "https://google.com",
    },
    expectedBlocks: [{ line: `await page.goto("https://google.com")` }],
  },
  {
    command: {
      name: "select",
      target: "id=dropdown",
      value: "label=Option 1",
    },
    expectedBlocks: [{ line: `await page.type("#dropdown", "Option 1")` }],
  },
  {
    command: {
      name: "VIEWPORT",
      value: { width: 500, height: 1000 },
    },
    expectedBlocks: [
      {
        line: `await page.setViewport({ width: 500, height: 1000 })`,
      },
    ],
  },
  {
    debug: true,
    command: {
      name: "dragAndDropToObject",
      target: "id=column-a",
      value: "id=column-b",
    },
    expectedBlocks: [
      {
        accessors: ["dragAndDrop"],
        args: [["page"], "#column-a", "#column-b"],
      },
    ],
  },
];

describe("generator for click commands", () => {
  commandsToTest.slice(0, 10).forEach((command) => {
    test(`should test ${command.command.name} with target ${command.command.target}`, () => {
      const commandBlocks = getCommandBlocks(command.command);
      // running tests with the forEach makes it really difficult to debug
      // one particular test. Setting a debug flag would print out stuff from
      // that test data
      if (command.debug) {
        console.log(command, commandBlocks);
      }
      expect(commandBlocks).toEqual(command.expectedBlocks);
    });
  });
});
