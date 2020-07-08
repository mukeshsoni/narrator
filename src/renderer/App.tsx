import * as React from "react";
import Modal from "react-modal";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";

const { ipcRenderer } = require("electron");

import SidePanel from "./SidePanel";
import AssertionForm from "./AssertionForm";
import { Command } from "./command";

const {
  generatePuppeteerCode,
} = require("../code-generators/puppeteer/code-generator");
const generateCypressCode = require("../code-generators/cypress/code-generator");

// const dummyUrlToTest = "https://opensource-demo.orangehrmlive.com/";
// const dummyUrlToTest = "https://google.com/";
const dummyUrlToTest = "http://testing-ground.scraping.pro/login";

interface State {
  commands: Array<Command>;
  urlToTest: string;
  isRecording: boolean;
  showAssertionPanel: boolean;
}

const initialState: State = {
  commands: [],
  urlToTest: dummyUrlToTest,
  isRecording: false,
  showAssertionPanel: false,
};

function addHttpsIfRequired(url: string) {
  if (url.length > 0 && !/^(?:f|ht)tps?\:\/\//.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function rootReducer(state: State, action: any) {
  console.log("action", action);
  switch (action.type) {
    case "RESET_COMMANDS":
      return {
        ...state,
        commands: [],
      };
    case "ADD_COMMAND":
      if (
        (state.isRecording || action.command.command.startsWith("assert")) &&
        state.urlToTest
      ) {
        let currentCommands = state.commands;
        if (currentCommands.length === 0) {
          currentCommands.push({
            command: "GOTO",
            name: "GOTO",
            href: state.urlToTest,
            target: [],
            selectedTarget: 0,
          });
        }

        return {
          ...state,
          commands: currentCommands.concat({
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
    case "SHOW_ASSERTION_PANEL":
      return {
        ...state,
        isRecording: false,
        showAssertionPanel: true,
      };
    case "HIDE_ASSERTION_PANEL":
      return {
        ...state,
        showAssertionPanel: false,
      };
    default:
      return state;
  }
}

export default function App() {
  const [copied, setCopied] = React.useState(false);
  const [state, dispatch] = React.useReducer(rootReducer, initialState);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [showGeneratedCode, setShowGeneratedCode] = React.useState(false);
  const urlInputRef = React.useRef<HTMLInputElement>(null);
  const { urlToTest, commands, isRecording, showAssertionPanel } = state;

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
      ipcRenderer.send("url-to-test", urlToTest);
    }
  }, [urlToTest]);

  const handleGenerateClick = React.useCallback(
    (toolName) => {
      let generator;
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
      // let's pause the recording when we start the replay. Keep it paused
      // even if the replay has ended. Let the user restart recording if they
      // want to.
      dispatch({ type: "PAUSE_RECORDING" });
      // setTimeout(() => {
      ipcRenderer.send("replay", commands);
      // }, 500);
    }
  }, [commands]);

  const handleNewCommand = React.useCallback(
    (_, command) => {
      if (command.command) {
        console.log("got command to add", command);
        addCommand(command);
      }
    },
    [addCommand]
  );

  React.useEffect(() => {
    ipcRenderer.removeListener("new-command", handleNewCommand);
    // the first argument allows the renderer process to reply back on the
    // same channel. It has helpers methods for the same.
    ipcRenderer.on("new-command", handleNewCommand);
  }, [handleNewCommand]);

  const handleCommandIgnoreClick = React.useCallback(
    (commandIndex) => {
      dispatch({ type: "TOGGLE_IGNORE", commandIndex });
    },
    [dispatch]
  );

  const handleUrlInputSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (urlInputRef.current) {
        dispatch({
          type: "SET_URL_TO_TEST",
          urlToTest: urlInputRef.current.value,
        });
      }
    },
    [urlInputRef, dispatch]
  );

  const handleAddAssertionClick = React.useCallback(() => {
    dispatch({ type: "SHOW_ASSERTION_PANEL" });
    ipcRenderer.send("start-find-and-select");
  }, [dispatch]);

  const handleAssertionSave = React.useCallback(
    (command) => {
      console.log("let us save the assertion", command);
      dispatch({ type: "HIDE_ASSERTION_PANEL" });
      addCommand(command);
    },
    [dispatch, addCommand]
  );

  const handleAssertionCancel = React.useCallback(() => {
    dispatch({ type: "HIDE_ASSERTION_PANEL" });
    ipcRenderer.send("stop-find-and-select");
  }, [dispatch]);

  return (
    <div className="flex w-screen antialiased text-copy-primary bg-background-primary">
      {urlToTest ? (
        showAssertionPanel ? (
          <AssertionForm
            onSave={handleAssertionSave}
            onCancel={handleAssertionCancel}
          />
        ) : (
          <SidePanel
            isRecording={isRecording}
            commands={commands}
            onGenerateClick={handleGenerateClick}
            onStartRecording={handleStartRecording}
            onReplay={handleReplayClick}
            onPauseClick={handlePauseClick}
            onSelectorChange={handleSelectorChange}
            onCommandIgoreClick={handleCommandIgnoreClick}
            onAddAssertionClick={handleAddAssertionClick}
          />
        )
      ) : (
        <div className="flex items-center justify-center w-full h-screen bg-blue-800">
          <form onSubmit={handleUrlInputSubmit}>
            <input
              ref={urlInputRef}
              defaultValue={urlToTest}
              placeholder="Enter url to test"
              className="w-64 px-4 py-2 text-xl text-gray-900 bg-gray-100 border rounded-lg "
            />
          </form>
        </div>
      )}
      {showGeneratedCode && (
        <Modal
          isOpen={showGeneratedCode}
          onRequestClose={() => {
            setCopied(false);
            setShowGeneratedCode(false);
          }}
        >
          <div>
            <div className="flex flex-row-reverse">
              <button
                className="p-1 rounded-full hover:bg-blue-500 hover:text-white"
                onClick={() => {
                  setCopied(false);
                  setShowGeneratedCode(false);
                }}
              >
                <svg
                  width={20}
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <CopyToClipboard
              text={generatedCode}
              onCopy={() => setCopied(true)}
            >
              <button className="px-4 py-2 mt-4 text-gray-100 bg-blue-500 border hover:bg-blue-300 hover:text-black rounded-md">
                Copy to clipboard
              </button>
            </CopyToClipboard>
            {copied && (
              <p className="mt-1 text-red-700">
                The code is copied to your clipboard!
              </p>
            )}
            <hr className="mt-4" />
            <div className="relative mt-4">
              <CopyToClipboard
                text={generatedCode}
                onCopy={() => setCopied(true)}
                className="absolute top-0 right-0 p-2 mt-1 mr-1 text-black border border-gray-300 opacity-0 hover:opacity-100 hover:bg-blue-100 hover:text-blue-800 hover:border-gray-600 rounded-md transition ease-in duration-100"
              >
                <button>
                  <svg
                    width={20}
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                  </svg>
                </button>
              </CopyToClipboard>
              <SyntaxHighlighter language="javascript" style={docco}>
                {generatedCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}