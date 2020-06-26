const { CommandTable, getEventValue } = require("./CommandTable");
const onClickOutside = require("react-onclickoutside");

const SIDE_PANEL_WIDTH = 600;

function Menu({ buttonText, children }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  Menu.handleClickOutside = () => setMenuOpen(false);

  return React.createElement(
    "div",
    {
      className: "items-center relative bg-gray-500",
    },
    [
      React.createElement(
        "button",
        {
          className: "px-4 py-2",
          onClick: () => (menuOpen ? setMenuOpen(false) : setMenuOpen(true)),
        },
        buttonText
      ),
      React.createElement(
        "div",
        {
          className: menuOpen
            ? "flex flex-col p-4 border absolute bg-gray-500 rounded-lg"
            : "hidden",
        },
        children
      ),
    ]
  );
}

const clickOutsideConfig = {
  handleClickOutside: () => Menu.handleClickOutside,
};

const MenuWithClickOutside = onClickOutside.default(Menu, clickOutsideConfig);

function SidePanel({
  urlToTest,
  commands,
  onGenerateClick,
  onTestNewUrlClick,
  isRecording,
  onStartRecording,
  onPauseClick,
  onSelectorChange,
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
        {
          className:
            "flex justify-between items-center px-4 mb-4 w-full bg-gray-500",
        },
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
            MenuWithClickOutside,
            {
              buttonText: "Generate code",
            },
            [
              React.createElement(
                "button",
                {
                  className: "mb-2",
                  onClick: onGenerateClick.bind(null, "puppeteer"),
                  key: "puppeteer",
                },
                "Puppeteer"
              ),
              React.createElement(
                "button",
                {
                  onClick: onGenerateClick.bind(null, "cypress"),
                  key: "cypress",
                },
                "Cypress"
              ),
            ]
          ),
        ]
      ),
      React.createElement(
        "div",
        { className: "flex flex-col h-full justify-between" },
        [
          React.createElement(
            CommandTable,
            { commands, onSelectorChange },
            null
          ),
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
