const React = require("react");

const { transformEvent } = require("../webview-preload");
const { generatePuppeteerCode } = require("../code_generator");
const pptrActions = require("../pptr_actions");

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
  }, []);

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
    ]
  );
}

module.exports = App;
