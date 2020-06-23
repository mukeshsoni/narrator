const React = require("react");
const Modal = require("react-modal");

const { CommandTable, getEventValue } = require("./CommandTable");

const {
  generatePuppeteerCode,
} = require("./code-generator-puppeteer/code_generator");
const pptrActions = require("./code-generator-puppeteer/pptr_actions");

const SIDE_PANEL_WIDTH = 600;

function SidePanel({ urlToTest, events, onGenerateClick, onTestNewUrlClick }) {
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
            React.createElement("button", { className: "p-2 mr-2" }, "Record"),
            React.createElement("button", {}, "Pause"),
          ]),
          React.createElement(
            "button",
            { className: "p-2", onClick: onGenerateClick },
            "Generate"
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

const initialState = {
  events: [],
  urlToTest: "",
};

function addHttpsIfRequired(url) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function rootReducer(state, action) {
  switch (action.type) {
    case "SET_EVENTS":
      return {
        ...state,
        events: action.events,
      };
    case "ADD_EVENT":
      return {
        ...state,
        events: state.events.concat(action.event),
      };
    case "SET_URL_TO_TEST":
      return {
        ...state,
        urlToTest: addHttpsIfRequired(action.urlToTest),
      };
    default:
      return state;
  }
}

function App() {
  const [locationBarUrl, setLocationBarUrl] = React.useState("");
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [showGeneratedCode, setShowGeneratedCode] = React.useState(false);
  const webviewRef = React.useRef(null);
  const urlInputRef = React.useRef(null);
  const { urlToTest, events } = state;

  const addEvent = React.useCallback(
    (event) => {
      dispatch({ type: "ADD_EVENT", event });
    },
    [dispatch]
  );

  const handleMessageFromSitePanel = React.useCallback(
    (event) => {
      console.log(event.channel);
      if (event.channel === "user-event") {
        addEvent(event.args[0]);
      }
    },
    [addEvent]
  );

  const handleLocationBarUrlChange = React.useCallback((event) => {
    setLocationBarUrl(event.target.value);
  }, []);

  const handleUrlToTestSubmit = React.useCallback(() => {
    console.log("url to set", locationBarUrl);
    dispatch({ type: "SET_EVENTS", events: [] });
    dispatch({
      type: "SET_URL_TO_TEST",
      urlToTest: locationBarUrl,
    });
  }, [dispatch, locationBarUrl]);

  React.useEffect(() => {
    if (urlInputRef && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [urlInputRef.current]);

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

  const handleTestNewUrlClick = React.useCallback(() => {
    dispatch({ type: "SET_URL_TO_TEST", urlToTest: "" });
  }, [dispatch]);

  return React.createElement(
    "div",
    {
      className:
        "flex w-screen antialiased text-copy-primary bg-background-primary",

      style: { display: "flex" },
    },
    [
      urlToTest
        ? React.createElement(
            SidePanel,
            {
              urlToTest,
              events: state.events,
              onGenerateClick: handleGenerateClick,
              onTestNewUrlClick: handleTestNewUrlClick,
            },
            null
          )
        : React.createElement(
            "div",
            {
              className:
                "flex justify-center p-2 w-full h-screen border-r border-gray-200",
              style: { width: SIDE_PANEL_WIDTH },
            },
            [
              React.createElement(
                "form",
                {
                  className: "mt-16",
                  onSubmit: handleUrlToTestSubmit,
                },
                [
                  React.createElement(
                    "input",
                    {
                      ref: urlInputRef,
                      value: locationBarUrl,
                      className:
                        "px-4 py-2 border border-gray-300 focus:bg-gray-100",
                      onChange: handleLocationBarUrlChange,
                      placeholder: "Url to test",
                    },
                    null
                  ),
                  React.createElement(
                    "button",
                    {
                      className:
                        "px-4 py-2 bg-blue-600 border border-gray-300 border-l-0 text-white",
                    },
                    "Test"
                  ),
                ]
              ),
            ]
          ),
      ,
      urlToTest
        ? React.createElement(
            "webview",
            {
              src: urlToTest,
              preload: "webview-preload.js",
              className: "flex-1 w-full h-screen",
              ref: webviewRef,
            },
            null
          )
        : React.createElement(
            "div",
            {
              className:
                "flex flex-1 justify-center items-center w-full h-screen font-bold text-6xl",
            },
            React.createElement(
              "h3",
              { className: "uppercase tracking-wide" },
              "Test stuff"
            )
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
