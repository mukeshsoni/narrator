const React = require("react");

function getCommandValue(command) {
  switch (command.name) {
    case "click":
      return command.coordinates;
    case "type":
    case "sendKeys":
      return command.value;
    case "GOTO":
      return command.href;
    default:
      return command.keyCode;
  }
}

function getSelector(command) {
  return command.target && command.target.length
    ? command.target[command.selectedTarget][0]
    : "";
}

function CommandRow({ command, onCommandRowClick }) {
  return React.createElement(
    "button",
    { className: "flex w-full hover:bg-gray-400", onClick: onCommandRowClick },
    [
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        command.name
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

function CommandDetails({ command, onRemoveClick, onSelectorChange }) {
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
                value: command.name,
                disabled: true,
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
              "select",
              {
                name: "selector",
                key: command.selectedTarget,
                className:
                  "w-full flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md bg-white",
                value: command.selectedTarget,
                onChange: (e) => onSelectorChange(Number(e.target.value)),
              },
              [
                command.target &&
                  command.target.length > 0 &&
                  command.target.map((t, i) => {
                    return React.createElement("option", { value: i }, t[0]);
                  }),
              ]
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

function CommandTable({ commands, onSelectorChange }) {
  const [selectedCommandIndex, setSelectedCommandIndex] = React.useState(null);

  function handleCommandRowClick(commandIndex) {
    setSelectedCommandIndex(commandIndex);
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
              onCommandRowClick: handleCommandRowClick.bind(null, i),
            },
            null
          )
        );
      })
    ),
    selectedCommandIndex !== null &&
      React.createElement(
        CommandDetails,
        {
          command: commands[selectedCommandIndex],
          onRemoveClick: () => setSelectedCommandIndex(null),
          onSelectorChange: onSelectorChange.bind(null, selectedCommandIndex),
        },
        null
      ),
  ]);
}

module.exports = {
  CommandTable,
  getCommandValue,
};
