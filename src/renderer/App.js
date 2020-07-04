const { ipcRenderer } = require("electron");
const React = require("react");
const Modal = require("react-modal");

const { SidePanel } = require("./SidePanel");

const {
  generatePuppeteerCode,
} = require("../code-generators/puppeteer/code-generator");
const generateCypressCode = require("../code-generators/cypress/code-generator");

// const dummyUrlToTest = "https://opensource-demo.orangehrmlive.com/";
// const dummyUrlToTest = "https://google.com/";
const dummyUrlToTest = "http://testing-ground.scraping.pro/login";

const initialState = {
  commands: [],
  urlToTest: dummyUrlToTest,
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
      if (state.isRecording || action.command.command === "GOTO") {
        return {
          ...state,
          commands: state.commands.concat({
            ...action.command,
            name: action.command.command,
            selectedTarget: 0,
          }),
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
      console.log("starting recording. url: ", action.url);
      return {
        ...state,
        isRecording: true,
        commands:
          state.commands.length > 0
            ? state.commands
            : [{ name: "GOTO", href: action.url }],
      };
    case "PAUSE_RECORDING":
      console.log("pausing recording");
      return {
        ...state,
        isRecording: false,
      };
    case "CHANGE_SELECTOR":
      return {
        ...state,
        commands: state.commands
          .slice(0, action.commandIndex)
          .concat({
            ...state.commands[action.commandIndex],
            selectedTarget: action.targetIndex,
          })
          .concat(state.commands.slice(action.commandIndex + 1)),
      };
    case "TOGGLE_IGNORE":
      console.log("TOGGLE_IGNORE", action);
      return {
        ...state,
        commands: state.commands
          .slice(0, action.commandIndex)
          .concat({
            ...state.commands[action.commandIndex],
            ignore: !state.commands[action.commandIndex].ignore,
          })
          .concat(state.commands.slice(action.commandIndex + 1)),
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [showGeneratedCode, setShowGeneratedCode] = React.useState(false);
  const urlInputRef = React.useRef(null);
  const { urlToTest, commands, isRecording } = state;

  const addCommand = React.useCallback(
    (command) => {
      dispatch({ type: "ADD_COMMAND", command });
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (urlInputRef && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [urlInputRef.current]);

  React.useEffect(() => {
    if (urlToTest) {
      // addCommand({ command: 'GOTO', href: urlToTest });
    }
  }, [urlToTest]);

  const handleGenerateClick = React.useCallback(
    (toolName) => {
      switch (toolName) {
        case "puppeteer":
          generator = generatePuppeteerCode;
          break;
        case "cypress":
          generator = generateCypressCode;
      }

      console.log(generator(commands));
      setGeneratedCode(generator(commands));
      setShowGeneratedCode(true);
    },
    [commands]
  );

  const handleStartRecording = React.useCallback(() => {
    // When recording starts, give the renderer the current url. The first
    // command can then be to goto(url)
    const url = ipcRenderer.sendSync("recording", { type: "START" });
    dispatch({ type: "START_RECORDING", url });
  }, [dispatch]);

  const handlePauseClick = React.useCallback(() => {
    console.log("dispatch pause");
    dispatch({ type: "PAUSE_RECORDING" });
  }, [dispatch]);

  const handleSelectorChange = React.useCallback(
    (commandIndex, targetIndex) => {
      dispatch({ type: "CHANGE_SELECTOR", commandIndex, targetIndex });
    },
    [dispatch]
  );

  const handleReplayClick = React.useCallback(() => {
    if (commands && commands.length > 0) {
      ipcRenderer.send("replay", commands);
    }
  }, [commands]);

  React.useEffect(() => {
    // the first argument allows the renderer process to reply back on the
    // same channel. It has helpers methods for the same.
    ipcRenderer.on("new-command", (_, command) => {
      if (command.command) {
        addCommand(command);
      }
    });
  }, [addCommand]);

  const handleCommandIgnoreClick = React.useCallback(
    (commandIndex) => {
      dispatch({ type: "TOGGLE_IGNORE", commandIndex });
    },
    [dispatch]
  );

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
          commands,
          onGenerateClick: handleGenerateClick,
          onStartRecording: handleStartRecording,
          onReplay: handleReplayClick,
          onPauseClick: handlePauseClick,
          onSelectorChange: handleSelectorChange,
          onCommandIgoreClick: handleCommandIgnoreClick,
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
