const React = require("react");
const Modal = require("react-modal");

const { SIDE_PANEL_WIDTH, SidePanel } = require("./SidePanel");

const {
  generatePuppeteerCode,
} = require("./code-generator-puppeteer/code_generator");
const pptrActions = require("./code-generator-puppeteer/pptr_actions");

const dummyUrlToTest = "https://opensource-demo.orangehrmlive.com/";

const initialState = {
  commands: [],
  urlToTest: "https://google.com",
  isRecording: false,
};

function addHttpsIfRequired(url) {
  if (url.length > 0 && !/^(?:f|ht)tps?\:\/\//.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function rootReducer(state, action) {
  console.log("action", action);
  switch (action.type) {
    case "RESET_COMMANDS":
      return {
        ...state,
        commands: [],
      };
    case "ADD_COMMAND":
      if (state.isRecording || action.command.command === pptrActions.GOTO) {
        return {
          ...state,
          commands: state.commands.concat(action.command),
        };
      } else {
        return state;
      }

    case "SET_URL_TO_TEST":
      return {
        ...state,
        urlToTest: addHttpsIfRequired(action.urlToTest),
      };
    case "START_RECORDING":
      console.log("starting recording");
      return {
        ...state,
        isRecording: true,
        commands:
          state.commands.lenght > 0
            ? state.commands
            : [{ command: pptrActions.GOTO, href: state.urlToTest }],
      };
    case "PAUSE_RECORDING":
      console.log("pausing recording");
      return {
        ...state,
        isRecording: false,
      };
    default:
      return state;
  }
}

function App() {
  const [locationBarUrl, setLocationBarUrl] = React.useState(
    "https://google.com"
  );
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [showGeneratedCode, setShowGeneratedCode] = React.useState(false);
  const webviewRef = React.useRef(null);
  const urlInputRef = React.useRef(null);
  const { urlToTest, commands, isRecording } = state;

  const addCommand = React.useCallback(
    (command) => {
      dispatch({ type: "ADD_COMMAND", command });
    },
    [dispatch]
  );

  const handleMessageFromSitePanel = React.useCallback(
    (event) => {
      console.log(event.channel);
      if (event.channel === "new-command") {
        addCommand(event.args[0]);
      }
    },
    [addCommand]
  );

  const handleLocationBarUrlChange = React.useCallback((event) => {
    console.log("aa");
    setLocationBarUrl(event.target.value);
  }, []);

  const handleUrlToTestSubmit = React.useCallback(
    (e) => {
      // IMP!
      // if we don't stop the propagation or preventDefault, the whole electron
      // page refreshes for some reason
      e.stopPropagation();
      e.preventDefault();
      console.log("url to set", locationBarUrl);
      // dispatch({ type: "RESET_COMMANDS" });
      dispatch({
        type: "SET_URL_TO_TEST",
        urlToTest: locationBarUrl,
      });
    },
    [dispatch, locationBarUrl]
  );

  React.useEffect(() => {
    if (urlInputRef && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [urlInputRef.current]);

  React.useEffect(() => {
    if (urlToTest) {
      // addCommand({ command: pptrActions.GOTO, href: urlToTest });
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
      setTimeout(() => {
        if (webviewRef.current.openDevTools) webviewRef.current.openDevTools();
      }, 100);
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
    console.log(generatePuppeteerCode(commands));
    setGeneratedCode(generatePuppeteerCode(commands));
    setShowGeneratedCode(true);
  }, [commands]);

  const handleTestNewUrlClick = React.useCallback(() => {
    dispatch({ type: "SET_URL_TO_TEST", urlToTest: "" });
  }, [dispatch]);

  const handleStartRecording = React.useCallback(() => {
    dispatch({ type: "START_RECORDING" });
  }, [dispatch]);

  const handlePauseClick = React.useCallback(() => {
    console.log("dispatch pause");
    dispatch({ type: "PAUSE_RECORDING" });
  }, [dispatch]);

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
        {
          isRecording,
          urlToTest,
          commands,
          onGenerateClick: handleGenerateClick,
          onTestNewUrlClick: handleTestNewUrlClick,
          onStartRecording: handleStartRecording,
          onPauseClick: handlePauseClick,
        },
        null
      ),
      React.createElement("div", { className: "w-full" }, [
        React.createElement(
          "form",
          {
            onSubmit: handleUrlToTestSubmit,
          },
          [
            React.createElement(
              "input",
              {
                ref: urlInputRef,
                value: locationBarUrl,
                className:
                  "w-full px-4 py-2 border border-gray-300 focus:bg-gray-100",
                onChange: handleLocationBarUrlChange,
                placeholder: "Url to test",
                title: locationBarUrl,
              },
              null
            ),
          ]
        ),
        urlToTest
          ? React.createElement(
              "webview",
              {
                // if we want to keep the webview around, we need to keep busting
                // the webview with key change, otherwise the previous rendered
                // url does not go
                key: urlToTest,
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
      ]),
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
