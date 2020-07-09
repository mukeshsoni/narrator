const { getCommandBlocks } = require("../code-generator");

const commandsToTest = [
  {
    command: {
      name: "click",
      target: "css=#myid",
    },
    expectedBlocks: [
      { accessors: ["page", "waitForSelector"], args: ["#myid"] },
      { accessors: ["page", "click"], args: ["#myid"] },
    ],
  },
  {
    command: {
      name: "click",
      target: "xpath=(//div[@id='myid'])[1]",
    },
    expectedBlocks: [
      { accessors: ["page", "waitForXPath"], args: ["(//div[@id='myid'])[1]"] },
      {
        accessors: ["page", "$x"],
        args: ["(//div[@id='myid'])[1]"],
        lhs: "xpathEl",
      },
      { accessors: ["xpathEl", 0, "click"], args: [] },
    ],
  },
  {
    command: {
      name: "click",
      target: "linkText=Form Authentication",
    },
    expectedBlocks: [
      {
        accessors: ["page", "waitForXPath"],
        args: ["//a[contains(., 'Form Authentication')]"],
      },
      {
        accessors: ["page", "$x"],
        args: ["//a[contains(., 'Form Authentication')]"],
        lhs: "xpathEl",
      },
      { accessors: ["xpathEl", 0, "click"], args: [] },
    ],
  },
  {
    command: {
      name: "type",
      target: "css=#myid",
      value: "abcd",
    },
    expectedBlocks: [{ accessors: ["page", "type"], args: ["#myid", "abcd"] }],
  },
  {
    command: {
      name: "type",
      target: "xpath=(//div[@id='myid'])[1]",
      value: "abcd",
    },
    expectedBlocks: [
      {
        accessors: ["page", "$x"],
        args: ["(//div[@id='myid'])[1]"],
        lhs: "xpathEl",
      },
      {
        accessors: ["xpathEl", 0, "type"],
        args: ["abcd"],
      },
    ],
  },
  {
    command: {
      name: "sendKeys",
      target: "css=#myid",
      value: "${KEY_ENTER}",
    },
    expectedBlocks: [
      {
        accessors: ["page", "keyboard", "press"],
        args: ["Enter"],
      },
    ],
  },
  {
    command: {
      name: "sendKeys",
      target: "css=#myid",
      value: "${KEY_TAB}",
    },
    expectedBlocks: [
      {
        accessors: ["page", "keyboard", "press"],
        args: ["Tab"],
      },
    ],
  },
];

describe("generator for click commands", () => {
  commandsToTest.forEach((command) => {
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
