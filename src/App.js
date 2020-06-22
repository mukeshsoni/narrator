const React = require("react");
const Modal = require("react-modal");

const { transformEvent } = require("../webview-preload");
const {
  generatePuppeteerCode,
} = require("./code-generator-puppeteer/code_generator");
const pptrActions = require("./code-generator-puppeteer/pptr_actions");

const SIDE_PANEL_WIDTH = 600;

function CommandRow({ event, onCommandRowClick }) {
  return React.createElement(
    "button",
    { className: "flex w-full hover:bg-gray-400", onClick: onCommandRowClick },
    [
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        event.action
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        event.selector
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        event.keyCode
      ),
    ]
  );
}

function CommandRowHeader() {
  return React.createElement("div", { className: "flex w-full" }, [
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg" },
      "Command"
    ),
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg" },
      "Target"
    ),
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg" },
      "Value"
    ),
  ]);
}

function getEventValue(event) {
  if (event.type === "click") {
    return event.coordinates;
  }

  return event.keyCode;
}

function EventDetails({ event, onRemoveClick }) {
  console.log("selected event", event);
  return React.createElement(
    "div",
    { className: "mt-6 px-4 py-2 bg-indigo-100" },
    [
      React.createElement("div", { className: "flex flex-row-reverse" }, [
        React.createElement("button", { onClick: onRemoveClick }, "X"),
      ]),
      React.createElement("form", { className: "flex flex-col" }, [
        React.createElement(
          "label",
          { className: "flex items-center w-full mb-4" },
          [
            "Command",
            React.createElement(
              "input",
              {
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                defaultValue: event.action,
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

function SidePanel({ events, onGenerateClick }) {
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  function handleCommandRowClick(event) {
    setSelectedEvent(event);
  }

  return React.createElement(
    "div",
    {
      className: "border border-gray-300 px-4 py-2",
      style: { width: SIDE_PANEL_WIDTH },
    },
    [
      React.createElement("div", { className: "flex justify-between w-full" }, [
        React.createElement("div", { className: "flex" }, [
          React.createElement("button", { className: "p-2 mr-2" }, "Record"),
          React.createElement("button", {}, "Pause"),
        ]),
        React.createElement(
          "button",
          { className: "p-2", onClick: onGenerateClick },
          "Generate"
        ),
      ]),
      React.createElement("div", {}, [
        React.createElement(CommandRowHeader, {}, null),
        React.createElement(
          "ul",
          {},
          events.map((event, i) => {
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
      ]),
      selectedEvent &&
        React.createElement(
          EventDetails,
          { event: selectedEvent, onRemoveClick: () => setSelectedEvent(null) },
          null
        ),
    ]
  );
}

const initialState = {
  events: [],
  urlToTest: null,
};

function rootReducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
      console.log("addEvent", action.event);
      return {
        ...state,
        events: state.events.concat(action.event),
      };
    case "SET_URL_TO_TEST":
      return {
        ...state,
        urlToTest: action.urlToTest,
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [showGeneratedCode, setShowGeneratedCode] = React.useState(false);
  const webviewRef = React.useRef(null);
  const { urlToTest, events } = state;

  const addEvent = React.useCallback(
    (event) => {
      dispatch({ type: "ADD_EVENT", event });
    },
    [dispatch]
  );

  const handleMessageFromSitePanel = React.useCallback(
    (event) => {
      addEvent(event.args[0]);
    },
    [addEvent]
  );

  React.useEffect(() => {
    // TODO: Later the url will be dynamically set
    dispatch({ type: "SET_URL_TO_TEST", urlToTest: "https://google.com" });
  }, []);

  React.useEffect(() => {
    if (urlToTest) {
      addEvent({ action: pptrActions.GOTO, href: urlToTest });
    }
  }, [urlToTest]);

  React.useEffect(() => {
    if (webviewRef && webviewRef.current) {
      /**
       * We listen to the messages our script we injected into the webview sends
       * us. That script sends us information about the events which happen in the
       * loaded page.
       */
      webviewRef.current.addEventListener(
        "ipc-message",
        handleMessageFromSitePanel
      );
    }

    return function cleanUp() {
      if (webviewRef && webviewRef.current) {
        webviewRef.current.removeEventListener(
          "ipc-message",
          handleMessageFromSitePanel
        );
      }
    };
  }, [webviewRef.current, handleMessageFromSitePanel]);

  const handleGenerateClick = React.useCallback(() => {
    console.log(generatePuppeteerCode(state.events));
    setGeneratedCode(generatePuppeteerCode(state.events));
    setShowGeneratedCode(true);
  }, [state.events]);

  return React.createElement(
    "div",
    {
      className:
        "flex w-screen antialiased text-copy-primary bg-background-primary",

      style: { display: "flex" },
    },
    [
      React.createElement(
        SidePanel,
        { events: state.events, onGenerateClick: handleGenerateClick },
        null
      ),
      urlToTest &&
        React.createElement(
          "webview",
          {
            src: urlToTest,
            preload: "webview-preload.js",
            className: "w-full h-screen",
            ref: webviewRef,
          },
          null
        ),
      showGeneratedCode &&
        React.createElement(
          Modal,
          {
            isOpen: showGeneratedCode,
            onRequestClose: () => setShowGeneratedCode(false),
          },
          [
            React.createElement("div", {}, [
              React.createElement(
                "div",
                { className: "flex flex-row-reverse" },
                [
                  React.createElement(
                    "button",
                    {
                      className: "p-2",
                      onClick: () => setShowGeneratedCode(false),
                    },
                    "X"
                  ),
                ]
              ),
              React.createElement(
                "pre",
                { className: "whitespace-pre" },
                generatedCode
              ),
            ]),
          ]
        ),
    ]
  );
}

module.exports = App;
