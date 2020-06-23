const React = require("react");
const Modal = require("react-modal");

const { SIDE_PANEL_WIDTH, SidePanel } = require("./SidePanel");

const {
  generatePuppeteerCode,
} = require("./code-generator-puppeteer/code_generator");
const pptrActions = require("./code-generator-puppeteer/pptr_actions");

const dummyUrlToTest = "https://opensource-demo.orangehrmlive.com/";

function getNextCommand(events, nextIndexToProcess) {
  const lastEvent = events[events.length - 1];

  switch (lastEvent.action) {
    case "keydown":
      if (lastEvent.keyCode === 9) {
        return lastEvent;
      }
      return null;
    default:
      return lastEvent;
  }
}

function addEventToCommander(commander, event) {
  const newEvents = commander.events.concat(event);

  const nextCommand = getNextCommand(newEvents, commander.nextIndexToProcess);

  return {
    nextIndexToProcess: nextCommand
      ? newEvents.length
      : commander.nextIndexToProcess,
    events: newEvents,
    commands: nextCommand
      ? commander.commands.concat(nextCommand)
      : commander.commands,
  };
}

const initialState = {
  commander: {
    events: [],
    nextIndexToProcess: 0,
    commands: [],
  },
  urlToTest: "",
  isRecording: false,
};

function addHttpsIfRequired(url) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function rootReducer(state, action) {
  switch (action.type) {
    case "RESET_EVENTS":
      return {
        ...state,
        commander: {
          events: [],
          nextIndexToProcess: 0,
          commands: [],
        },
      };
    case "ADD_EVENT":
      if (state.isRecording || action.event.action === pptrActions.GOTO) {
        return {
          ...state,
          commander: addEventToCommander(state.commander, action.event),
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
  const [locationBarUrl, setLocationBarUrl] = React.useState("");
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [showGeneratedCode, setShowGeneratedCode] = React.useState(false);
  const webviewRef = React.useRef(null);
  const urlInputRef = React.useRef(null);
  const {
    urlToTest,
    commander: { events, commands },
    isRecording,
  } = state;

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
    dispatch({ type: "RESET_EVENTS" });
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
    console.log(generatePuppeteerCode(events));
    setGeneratedCode(generatePuppeteerCode(events));
    setShowGeneratedCode(true);
  }, [events]);

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
      urlToTest
        ? React.createElement(
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
          )
        : React.createElement(
            "div",
            {
              className:
                "flex justify-center p-2 w-full h-screen border-r border-gray-200 bg-pink-100",
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
                      title: locationBarUrl,
                    },
                    null
                  ),
                  React.createElement(
                    "button",
                    {
                      className:
                        "px-8 py-2 bg-pink-600 border border-gray-300 border-l-0 text-white",
                      title: "Test",
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
