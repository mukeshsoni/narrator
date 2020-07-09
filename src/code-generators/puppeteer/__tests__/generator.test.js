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
];

describe("generator for click commands", () => {
  commandsToTest.forEach((command) => {
    test(`should test ${command.command.name} with target ${command.command.target}`, () => {
      const commandBlocks = getCommandBlocks(command.command);
      expect(commandBlocks).toEqual(command.expectedBlocks);
    });
  });
});
