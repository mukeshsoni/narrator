import * as React from "react";
import Modal from "react-modal";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import CopyToClipboard from "react-copy-to-clipboard";
import arrayMove from "array-move";
import url from "url";

import "../tailwind_generated.css";
const { ipcRenderer } = require("electron");

import SidePanel from "./SidePanel";
import AddCommandForm from "./AddCommandForm";
import { Command } from "./test_config";

import {
  generatePuppeteerCode,
  transformToCodeBlocks,
} from "../code-generators/puppeteer/code-generator";
import generateCypressCode from "../code-generators/cypress/code-generator";

//
// const dummyurl = "https://opensource-demo.orangehrmlive.com/";
// const dummyUrl = "https://google.com/";
// http://the-internet.herokuapp.com/
// const dummyUrl = "http://the-internet.herokuapp.com/";

interface State {
  commands: Array<Command>;
  url: string;
  isRecording: boolean;
  showAssertionPanel: boolean;
  showAddCommandPanel: boolean;
  currentlyPlayingCommandIndex: number;
  replaySpeed: number;
}

const initialState: State = {
  commands: [],
  // url: dummyUrl,
  url: "",
  isRecording: false,
  showAssertionPanel: false,
  showAddCommandPanel: false,
  currentlyPlayingCommandIndex: -1,
  replaySpeed: 5,
};

function addHttpsIfRequired(url: string) {
  if (url.length > 0 && !/^(?:f|ht)tps?\:\/\//.test(url)) {
    return `https://${url}`;
  }

  return url;
}

function rootReducer(state: State, action: any) {
  console.log("action", action, state);
  switch (action.type) {
    case "RESET_COMMANDS":
      return {
        ...state,
        commands: [],
      };
    case "ADD_COMMAND":
      if (
        state.isRecording ||
        action.command.command.startsWith("assert") ||
        (action.forceAdd && state.url)
      ) {
        let currentCommands = state.commands;
        if (currentCommands.length === 0) {
          const parsedUrl = url.parse(state.url);
          console.log({ parsedUrl });
          currentCommands.push({
            command: "open",
            name: "open",
            value: parsedUrl.path,
            target: "",
            targets: [],
          });
        }

        return {
          ...state,
          commands: currentCommands.concat({
            ...action.command,
            name: action.command.command,
          }),
        };
      } else {
        return state;
      }
    case "SET_URL_TO_TEST":
      return {
        ...state,
        url: addHttpsIfRequired(action.url),
      };
    case "START_RECORDING":
      console.log("starting recording. url: ", action.url);
      return {
        ...state,
        url: action.url,
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
            target: action.target,
          })
          .concat(state.commands.slice(action.commandIndex + 1)),
      };
    case "TOGGLE_IGNORE": {
      console.log("TOGGLE_IGNORE", action);
      const commandToToggle = state.commands[action.commandIndex];

      return {
        ...state,
        commands: state.commands
          .slice(0, action.commandIndex)
          .concat({
            ...commandToToggle,
            name: commandToToggle.name.startsWith("//")
              ? commandToToggle.name.slice(2)
              : `//${commandToToggle.name}`,
            command: commandToToggle.name.startsWith("//")
              ? commandToToggle.name.slice(2)
              : `//${commandToToggle.name}`,
          })
          .concat(state.commands.slice(action.commandIndex + 1)),
      };
    }
    case "SHOW_ASSERTION_PANEL":
      return {
        ...state,
        isRecording: false,
        showAssertionPanel: true,
      };
    case "SHOW_ADD_COMMAND_PANEL":
      return {
        ...state,
        showAddCommandPanel: true,
      };
    case "HIDE_ADD_COMMAND_PANEL":
      return {
        ...state,
        showAddCommandPanel: false,
        showAssertionPanel: false,
      };
    case "HIDE_ASSERTION_PANEL":
      return {
        ...state,
        showAssertionPanel: false,
      };
    case "CHANGE_COMMAND_VALUE":
      return {
        ...state,
        commands: state.commands
          .slice(0, action.commandIndex)
          .concat({
            ...state.commands[action.commandIndex],
            [action.propName]: action.newValue,
          })
          .concat(state.commands.slice(action.commandIndex + 1)),
      };
    case "COMMAND_POS_CHANGE":
      return {
        ...state,
        commands: arrayMove(
          state.commands,
          action.change.oldIndex,
          action.change.newIndex
        ),
      };
    case "CHANGE_TARGETS":
      return {
        ...state,
        commands: state.commands
          .slice(0, action.commandIndex)
          .concat({
            ...state.commands[action.commandIndex],
            targets: action.targets,
            target: action.targets[0],
          })
          .concat(state.commands.slice(action.commandIndex + 1)),
      };
    case "CHANGE_URL":
      return {
        ...state,
        url: action.url,
      };
    case "UPDATE_CURRENTLY_PLAYING_COMMAND_INDEX":
      return {
        ...state,
        currentlyPlayingCommandIndex: action.commandIndex,
      };
    case "SET_REPLAY_SPEED":
      return {
        ...state,
        replaySpeed: action.replaySpeed,
      };
    case "DELETE_COMMAND":
      return {
        ...state,
        commands: state.commands
          .slice(0, action.commandIndex)
          .concat(state.commands.slice(action.commandIndex + 1)),
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
  const {
    url,
    commands,
    isRecording,
    showAssertionPanel,
    showAddCommandPanel,
    currentlyPlayingCommandIndex,
    replaySpeed,
  } = state;

  const addCommand = React.useCallback(
    (command, forceAdd = false) => {
      dispatch({ type: "ADD_COMMAND", command, forceAdd });
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (urlInputRef && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [urlInputRef.current]);

  React.useEffect(() => {
    if (url) {
      // addCommand({ command: 'open', href: url });
      ipcRenderer.send("url-to-test", url);
    }
  }, [url]);

  const handleGenerateClick = React.useCallback(
    (toolName) => {
      let generator = generatePuppeteerCode;
      switch (toolName) {
        case "puppeteer":
          generator = generatePuppeteerCode;
          break;
        case "cypress":
          generator = generateCypressCode;
      }

      console.log("generated code:", generator({ commands, url }));
      setGeneratedCode(generator({ commands, url }));
      setShowGeneratedCode(true);
    },
    [commands, url]
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
    (commandIndex, target) => {
      dispatch({ type: "CHANGE_SELECTOR", commandIndex, target });
    },
    [dispatch]
  );

  const handleReplayClick = React.useCallback(() => {
    if (commands && commands.length > 0) {
      // let's pause the recording when we start the replay. Keep it paused
      // even if the replay has ended. Let the user restart recording if they
      // want to.
      // TODO: Instead of pausing recording here, the main process should
      // maintain a state like 'selecting_target'. When it's in that state, it
      // should not send across newly recorded commands.
      dispatch({ type: "PAUSE_RECORDING" });
      const codeBlocks = transformToCodeBlocks(commands, url);
      ipcRenderer.send(
        "replay",
        codeBlocks,
        // so that the slowdown is not linear but on a curve
        (5 - replaySpeed) * (5 - replaySpeed + 1) * 20
      );
    }
  }, [commands, url, replaySpeed]);

  const handleNewCommand = React.useCallback(
    (_, command) => {
      if (command.command) {
        addCommand(command);
      }
    },
    [addCommand]
  );

  React.useEffect(() => {
    ipcRenderer.on(
      "update-replay-command-index",
      (_: any, commandIndex: number) => {
        dispatch({
          type: "UPDATE_CURRENTLY_PLAYING_COMMAND_INDEX",
          commandIndex,
        });
      }
    );

    ipcRenderer.on(
      "replay-over",
      (
        _: any,
        errorDuringReplay: { message: string; commandIndex: number } | null
      ) => {
        dispatch({
          type: "UPDATE_CURRENTLY_PLAYING_COMMAND_INDEX",
          commandIndex: -1,
        });
        if (errorDuringReplay) {
          // TODO
          // dispatch({
          // type: 'ERROR_DURING_REPLAY',
          // errorDuringReplay
          // })
        }
      }
    );
  }, [dispatch]);

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
          url: urlInputRef.current.value,
        });
      }
    },
    [urlInputRef, dispatch]
  );

  const handleAddAssertionClick = React.useCallback(() => {
    dispatch({ type: "SHOW_ASSERTION_PANEL" });
    ipcRenderer.send("start-find-and-select");
  }, [dispatch]);

  const handleAddCommandClick = React.useCallback(() => {
    dispatch({ type: "SHOW_ADD_COMMAND_PANEL" });
  }, [dispatch]);

  const hideAddCommandPanel = React.useCallback(() => {
    dispatch({ type: "HIDE_ADD_COMMAND_PANEL" });
  }, [dispatch]);

  const hideAssertionPanel = React.useCallback(() => {
    dispatch({ type: "HIDE_ASSERTION_PANEL" });
  }, [dispatch]);

  const handleCommandValueChange = React.useCallback(
    (commandIndex, propName, newValue) => {
      dispatch({
        type: "CHANGE_COMMAND_VALUE",
        commandIndex,
        newValue,
        propName,
      });
    },
    [dispatch]
  );

  const handleCommandPosChange = React.useCallback(
    (change) => {
      dispatch({ type: "COMMAND_POS_CHANGE", change });
    },
    [dispatch]
  );

  const handleCommandAddition = React.useCallback(
    (command) => {
      hideAddCommandPanel();
      addCommand(command, true);
    },
    [addCommand, hideAddCommandPanel]
  );

  const handleTargetListChange = React.useCallback(
    (commandIndex, targets) => {
      dispatch({ type: "CHANGE_TARGETS", commandIndex, targets });
    },
    [dispatch]
  );

  const handleUrlChange = React.useCallback(
    (url) => {
      dispatch({ type: "CHANGE_URL", url });
    },
    [dispatch]
  );

  const handleReplaySpeedChange = React.useCallback(
    (replaySpeed) => {
      dispatch({ type: "SET_REPLAY_SPEED", replaySpeed });
    },
    [dispatch]
  );

  const handleCommandDeleteClick = React.useCallback(
    (commandIndex) => {
      dispatch({ type: "DELETE_COMMAND", commandIndex });
    },
    [dispatch]
  );

  return (
    <div className="flex w-screen antialiased text-copy-primary bg-background-primary">
      {showAddCommandPanel && (
        <Modal
          isOpen={showAddCommandPanel}
          onRequestClose={() => {
            hideAddCommandPanel();
          }}
        >
          <AddCommandForm
            onSave={handleCommandAddition}
            onCancel={hideAddCommandPanel}
          />
        </Modal>
      )}
      {url ? (
        showAssertionPanel ? (
          <AddCommandForm
            onSave={handleCommandAddition}
            onCancel={hideAssertionPanel}
            filter={(command) => command[0].startsWith("assert")}
          />
        ) : (
          <SidePanel
            isRecording={isRecording}
            url={url}
            commands={commands}
            onGenerateClick={handleGenerateClick}
            onStartRecording={handleStartRecording}
            onReplay={handleReplayClick}
            onPauseClick={handlePauseClick}
            onSelectorChange={handleSelectorChange}
            onCommandIgoreClick={handleCommandIgnoreClick}
            onAddAssertionClick={handleAddAssertionClick}
            onAddCommandClick={handleAddCommandClick}
            onCommandValueChange={handleCommandValueChange}
            onCommandPosChange={handleCommandPosChange}
            onTargetListChange={handleTargetListChange}
            onUrlChange={handleUrlChange}
            currentlyPlayingCommandIndex={currentlyPlayingCommandIndex}
            replaySpeed={replaySpeed}
            onReplaySpeedChange={handleReplaySpeedChange}
            onCommandDeleteClick={handleCommandDeleteClick}
          />
        )
      ) : (
        <div className="flex items-center justify-center w-full h-screen bg-blue-800">
          <form onSubmit={handleUrlInputSubmit}>
            <input
              ref={urlInputRef}
              defaultValue={url}
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
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
              >
                <button className="absolute top-0 right-0 p-2 mt-1 mr-1 text-black border border-gray-300 opacity-0 hover:opacity-100 hover:bg-blue-100 hover:text-blue-800 hover:border-gray-600 rounded-md transition ease-in duration-100">
                  <svg
                    width={20}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
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
      <span />
    </div>
  );
}
