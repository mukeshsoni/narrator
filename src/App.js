const React = require("react");

function SidePanel({ events }) {
  console.log("Sidebar");
  return React.createElement(
    "div",
    { className: "border border-gray-300", style: { width: 300 } },
    [
      React.createElement("div", { style: { display: "flex" } }, [
        React.createElement("button", { className: "p-2" }, "Record"),
        React.createElement("button", {}, "Pause"),
      ]),
      React.createElement(
        "div",
        {},
        events.map((event, i) => {
          return React.createElement("div", { key: i }, event.action);
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

  return React.createElement(
    "div",
    {
      className:
        "flex w-screen antialiased text-copy-primary bg-background-primary",

      style: { display: "flex" },
    },
    [
      React.createElement(SidePanel, { events: state.events }, null),
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
