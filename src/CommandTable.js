const React = require("react");

const pptrActions = require("./code-generator-puppeteer/pptr_actions");

function getCommandValue(command) {
  switch (command.command) {
    case "click":
      return command.coordinates;
    case "type":
      return command.value;
    case pptrActions.GOTO:
      return command.href;
    default:
      return command.keyCode;
  }
}

function getSelector(command) {
  return command.target && command.target.length ? command.target[0] : "";
}

function CommandRow({ command, onCommandRowClick }) {
  return React.createElement(
    "button",
    { className: "flex w-full hover:bg-gray-400", onClick: onCommandRowClick },
    [
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        command.command
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        getSelector(command)
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        getCommandValue(command)
      ),
    ]
  );
}

function CommandRowHeader() {
  return React.createElement("div", { className: "flex w-full" }, [
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg text-center" },
      "Command"
    ),
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg text-center" },
      "Target"
    ),
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg text-center" },
      "Value"
    ),
  ]);
}

function CommandDetails({ command, onRemoveClick }) {
  return React.createElement(
    "div",
    { className: "mt-6 px-4 py-2 bg-indigo-100" },
    [
      React.createElement(
        "div",
        { className: "flex flex-row-reverse mb-4 mt-2" },
        [React.createElement("button", { onClick: onRemoveClick }, "X")]
      ),
      React.createElement("form", { className: "flex flex-col" }, [
        React.createElement(
          "label",
          { className: "flex items-center w-full mb-4" },
          [
            "Command",
            React.createElement(
              "input",
              {
                // to blow the earlier value when we select a different command
                key: command.value,
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                value: command.command,
              },
              null
            ),
          ]
        ),
        React.createElement(
          "label",
          { className: "flex items-center w-full mb-4" },
          [
            "Target",
            React.createElement(
              "input",
              {
                key: getSelector(command),
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                defaultValue: getSelector(command),
              },
              null
            ),
          ]
        ),
        React.createElement(
          "label",
          { className: "flex items-center w-full" },
          [
            "Value",
            React.createElement(
              "input",
              {
                key: getCommandValue(command),
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                defaultValue: getCommandValue(command),
              },
              null
            ),
          ]
        ),
      ]),
    ]
  );
}

function CommandTable({ commands }) {
  const [selectedCommand, setSelectedCommand] = React.useState(null);

  function handleCommandRowClick(command) {
    setSelectedCommand(command);
  }

  return React.createElement("div", {}, [
    React.createElement(CommandRowHeader, {}, null),
    React.createElement(
      "ul",
      {},
      commands.map((command, i) => {
        return React.createElement(
          "li",
          { key: `action_no_${i}`, className: "bg-gray-200 mb-px" },
          React.createElement(
            CommandRow,
            {
              command,
              onCommandRowClick: handleCommandRowClick.bind(null, command),
            },
            null
          )
        );
      })
    ),
    selectedCommand &&
      React.createElement(
        CommandDetails,
        {
          command: selectedCommand,
          onRemoveClick: () => setSelectedCommand(null),
        },
        null
      ),
  ]);
}

module.exports = {
  CommandTable,
  getCommandValue,
};
