const React = require("react");

const { transformEvent } = require("../webview-preload");
const { generatePuppeteerCode } = require("../code_generator");

function SidePanel({ events, onGenerateClick }) {
  console.log("Sidebar");
  return React.createElement(
    "div",
    {
      className: "border border-gray-300 px-4 py-2",
      style: { width: 400 },
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
      React.createElement(
        "ul",
        {},
        events.map((event, i) => {
          return React.createElement(
            "li",
            { key: `action_no_${i}`, className: "px-4 py-2 bg-gray-200 mb-px" },
            `${event.action} - ${event.keyCode}`
          );
        })
      ),
    ]
  );
}

const initialState = {
  events: [],
};

function rootReducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
      return {
        ...state,
        events: state.events.concat(action.event),
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const webviewRef = React.useRef();

  const handleMessageFromSitePanel = React.useCallback(
    (event) => {
      dispatch({ type: "ADD_EVENT", event: event.args[0] });
    },
    [dispatch]
  );

  React.useEffect(() => {
    console.log("webview ref changed");
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
        webviewRef.removeEventListener("ipc-message");
      }
    };
  }, [webviewRef, handleMessageFromSitePanel]);

  function handleGenerateClick() {
    console.log("ooo", generatePuppeteerCode(state.events));
  }

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
      React.createElement(
        "webview",
        {
          src: "http://google.com",
          preload: "webview-preload.js",
          className: "w-full h-screen",
          ref: webviewRef,
        },
        null
      ),
    ]
  );
}

module.exports = App;
