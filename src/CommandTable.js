const React = require("react");

const pptrActions = require("./code-generator-puppeteer/pptr_actions");

function getEventValue(event) {
  switch (event.action) {
    case "click":
      return event.coordinates;
    case "keydown":
      return event.value;
    case pptrActions.GOTO:
      return event.href;
    default:
      return event.keyCode;
  }
}

function CommandRow({ event, onCommandRowClick }) {
  return React.createElement(
    "button",
    { className: "flex w-full hover:bg-gray-400", onClick: onCommandRowClick },
    [
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        event.name
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        event.selector
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        getEventValue(event)
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

function eventsToCommands(commands) {
  return commands.map((event) => ({
    ...event,
    name: event.action === "keydown" ? "sendKeys" : event.action,
  }));
}

function EventDetails({ event, onRemoveClick }) {
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
                key: event.value,
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                value: event.name,
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
                key: event.selector,
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                defaultValue: event.selector,
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
                key: getEventValue(event),
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                defaultValue: getEventValue(event),
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
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  function handleCommandRowClick(event) {
    setSelectedEvent(event);
  }

  return React.createElement("div", {}, [
    React.createElement(CommandRowHeader, {}, null),
    React.createElement(
      "ul",
      {},
      eventsToCommands(commands).map((event, i) => {
        return React.createElement(
          "li",
          { key: `action_no_${i}`, className: "bg-gray-200 mb-px" },
          React.createElement(
            CommandRow,
            {
              event,
              onCommandRowClick: handleCommandRowClick.bind(null, event),
            },
            null
          )
        );
      })
    ),
    selectedEvent &&
      React.createElement(
        EventDetails,
        {
          event: selectedEvent,
          onRemoveClick: () => setSelectedEvent(null),
        },
        null
      ),
  ]);
}

module.exports = {
  CommandTable,
  getEventValue,
};
