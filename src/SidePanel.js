const { CommandTable, getEventValue } = require("./CommandTable");

const SIDE_PANEL_WIDTH = 600;

function SidePanel({
  urlToTest,
  events,
  onGenerateClick,
  onTestNewUrlClick,
  isRecording,
  onStartRecording,
  onPauseClick,
}) {
  return React.createElement(
    "div",
    {
      className: "flex flex-col border border-gray-300",
      style: { width: SIDE_PANEL_WIDTH },
    },
    [
      React.createElement(
        "div",
        { className: "flex justify-between px-4 mb-4 w-full bg-gray-500" },
        [
          React.createElement("div", { className: "flex" }, [
            !isRecording
              ? React.createElement(
                  "button",
                  {
                    className:
                      "p-2 mr-2 flex flex-col justify-center items-center text-xs uppercase",
                    onClick: onStartRecording,
                  },
                  [
                    React.createElement(
                      "div",
                      { className: "w-6 h-6 bg-red-700 rounded-full mb-1" },
                      null
                    ),
                    "Rec",
                  ]
                )
              : React.createElement(
                  "button",
                  {
                    className:
                      "p-2 mr-2 flex flex-col justify-center items-center text-xs uppercase",
                    onClick: onPauseClick,
                  },
                  [
                    React.createElement(
                      "div",
                      { className: "text-lg tracking-tighter" },
                      "| |"
                    ),
                    "Pause",
                  ]
                ),
          ]),
          React.createElement(
            "button",
            { className: "p-2", onClick: onGenerateClick },
            "Generate code"
          ),
        ]
      ),
      React.createElement(
        "div",
        { className: "flex flex-col h-full justify-between" },
        [
          React.createElement(CommandTable, { events }, null),
          React.createElement("div", {}, [
            React.createElement(
              "div",
              { className: "px-4 py-2 bg-gray-300" },
              `Testing - ${urlToTest}`
            ),
            React.createElement(
              "button",
              {
                className: "w-full py-2 hover:bg-gray-300",
                onClick: onTestNewUrlClick,
              },
              "Test new url"
            ),
          ]),
        ]
      ),
    ]
  );
}

module.exports = { SidePanel, SIDE_PANEL_WIDTH };
