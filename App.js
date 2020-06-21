const React = require("react");

function SidePanel({ events }) {
  console.log("Sidebar");
  return React.createElement("div", { style: { width: 300 } }, [
    React.createElement("h1", {}, "hoo ooo"),
    React.createElement(
      "div",
      {},
      events.map((event, i) => {
        return React.createElement("div", { key: i }, event.action);
      })
    ),
  ]);
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

  return React.createElement("div", { style: { display: "flex" } }, [
    React.createElement(SidePanel, { events: state.events }, null),
    React.createElement(
      "webview",
      {
        src: "http://google.com",
        preload: "webview-preload.js",
        style: { width: 640, height: 600 },
        ref: webviewRef,
      },
      null
    ),
  ]);
}

module.exports = App;
