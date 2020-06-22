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
        event.name
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        event.selector
      ),
      React.createElement(
        "div",
        { className: "flex-1 px-4 py-2 truncate" },
        getEventValue(event)
      ),
    ]
  );
}

function CommandRowHeader() {
  return React.createElement("div", { className: "flex w-full" }, [
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg text-center" },
      "Command"
    ),
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg text-center" },
      "Target"
    ),
    React.createElement(
      "span",
      { className: "flex-1 px-4 py-2 font-bold text-lg text-center" },
      "Value"
    ),
  ]);
}

function getEventValue(event) {
  switch (event.action) {
    case "click":
      return event.coordinates;
    case "keydown":
      return event.value;
    case pptrActions.GOTO:
      return event.href;
    default:
      return event.keyCode;
  }
}

function EventDetails({ event, onRemoveClick }) {
  return React.createElement(
    "div",
    { className: "mt-6 px-4 py-2 bg-indigo-100" },
    [
      React.createElement(
        "div",
        { className: "flex flex-row-reverse mb-4 mt-2" },
        [React.createElement("button", { onClick: onRemoveClick }, "X")]
      ),
      React.createElement("form", { className: "flex flex-col" }, [
        React.createElement(
          "label",
          { className: "flex items-center w-full mb-4" },
          [
            "Command",
            React.createElement(
              "input",
              {
                // to blow the earlier value when we select a different command
                key: event.value,
                className:
                  "flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md",
                value: event.name,
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

function eventsToCommands(events) {
  return events.map((event) => ({
    ...event,
    name: event.action === "keydown" ? "sendKeys" : event.action,
  }));
}

function SidePanel({ urlToTest, events, onGenerateClick, onTestNewUrlClick }) {
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  function handleCommandRowClick(event) {
    setSelectedEvent(event);
  }

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
          React.createElement("div", {}, [
            (React.createElement(CommandRowHeader, {}, null),
            React.createElement(
              "ul",
              {},
              eventsToCommands(
                events.filter(
                  (event) => event.action !== "keydown" || event.keyCode === 9
                )
              ).map((event, i) => {
                console.log("event", event);
                return React.createElement(
                  "li",
                  { key: `action_no_${i}`, className: "bg-gray-200 mb-px" },
                  React.createElement(
                    CommandRow,
                    {
                      event,
                      onCommandRowClick: handleCommandRowClick.bind(
                        null,
                        event
                      ),
                    },
                    null
                  )
                );
              })
            )),
            selectedEvent &&
              React.createElement(
                EventDetails,
                {
                  event: selectedEvent,
                  onRemoveClick: () => setSelectedEvent(null),
                },
                null
              ),
          ]),
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

function rootReducer(state, action) {
  switch (action.type) {
    case "ADD_EVENT":
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
  const [locationBarUrl, setLocationBarUrl] = React.useState("");
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
    dispatch({
      type: "SET_URL_TO_TEST",
      urlToTest: locationBarUrl,
    });
  }, [dispatch, locationBarUrl]);
  // React.useEffect(() => {
  // // TODO: Later the url will be dynamically set
  // dispatch({
  // type: "SET_URL_TO_TEST",
  // urlToTest: "https://opensource-demo.orangehrmlive.com/",
  // });
  // }, []);

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
                "flex justify-center p-64 align-center w-full h-screen border-r border-gray-200",
              style: { width: SIDE_PANEL_WIDTH },
            },
            [
              React.createElement(
                "form",
                {
                  className: "flex items-center",
                  onSubmit: handleUrlToTestSubmit,
                },
                [
                  React.createElement(
                    "input",
                    {
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
                "flex flex-1 justify-center items-center w-full h-full font-bold text-xxl",
            },
            React.createElement("h3", {}, "SHIT")
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
