import * as React from "react";

import { Command } from "./command";
import { commands } from "../command/commands";
const { ipcRenderer } = require("electron");

interface Props {
  onSave: (command: Command) => void;
  onCancel: () => void;
}

export default function AddCommandForm({ onSave, onCancel }: Props) {
  const [value, setValue] = React.useState("");
  const [selectedCommand, setCommand] = React.useState("");
  const [targets, setAssertionTargets] = React.useState<
    Array<[string, string]>
  >([]);
  const [target, setTarget] = React.useState("");

  React.useEffect(() => {
    ipcRenderer.on(
      "assertion-target",
      (_: any, targets: Array<[string, string]>) => {
        console.log("Got assertion target", targets);
        setAssertionTargets(targets);
      }
    );
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!selectedCommand) {
      alert("Please select a command");
    } else {
      onSave({
        target: targets.length > 0 ? targets[0][0] : "",
        targets: targets,
        // TODO: send the selected assertionType
        command: selectedCommand,
        name: selectedCommand,
        value,
      });
    }
  }

  function handleValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    setValue(e.target.value);
  }

  return (
    <div className="w-full p-4">
      <h2 className="mb-2">Add command</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        <label className="flex items-center w-full">
          Select command:&nbsp;&nbsp;
          <select
            name="selector"
            className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
            value={selectedCommand}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              e.preventDefault();
              console.log("new target selected", e.target.value);
              setCommand(e.target.value);
            }}
          >
            <option value="" key="None">
              -- Select a command --
            </option>
            {commands.map((command, i) => {
              return (
                <option value={command[0]} key={command[0]}>
                  {command[1].name}
                </option>
              );
            })}
          </select>
        </label>
        <label className="flex items-center w-full mt-4">
          Target:&nbsp;&nbsp;
          {targets.length > 0 ? (
            <select
              name="selector"
              className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
              value={target}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                e.preventDefault();
                console.log("new target selected", e.target.value);
                setTarget(e.target.value);
              }}
            >
              {targets.map((t, i) => {
                return (
                  <option value={t[0]} key={t[0]}>
                    {t[0]}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              className="flex-1 px-4 py-2 ml-4 text-gray-500 bg-gray-100 border border-gray-400 rounded-md"
              disabled={true}
              placeholder="locator comes here"
            />
          )}
          <button
            className="flex items-center p-2 ml-2 text-gray-100 bg-blue-700 rounded-lg h-9 hover:bg-blue-900"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              ipcRenderer.send("start-find-and-select");
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
              <path
                style={{
                  transform: "rotate(90deg)",
                  transformOrigin: "50% 50%",
                }}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              ></path>
            </svg>
          </button>
        </label>
        <label className="flex items-center w-full mt-2">
          Value
          <textarea
            value={value}
            onChange={handleValueChange}
            className="flex-1 px-4 py-2 ml-4 border border-gray-400 rounded-md"
          />
        </label>
        <div className="flex flex-row-reverse mt-4">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-300 hover:text-black"
          >
            Save
          </button>
          <button
            type="submit"
            className="px-4 py-2 mr-4 text-white bg-blue-500 rounded-md hover:bg-blue-300 hover:text-black"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
