import * as React from "react";

import { Command } from "./command";

function getSelector(command: Command) {
  return command.target && command.target.length
    ? command.target[command.selectedTarget][0]
    : "";
}

export function getCommandValueProperty(command: Command) {
  switch (command.name) {
    case "clickAt":
    case "doubleClickAt":
      return "coordinates";
    case "type":
    case "sendKeys":
    case "GOTO":
      return "value";
    default:
      return "value";
  }
}

interface Props {
  command: Command;
  onCommandRowClick: () => void;
}

export default function CommandRow({ command, onCommandRowClick }: Props) {
  return (
    <button
      className="flex w-full hover:bg-gray-400"
      onClick={onCommandRowClick}
    >
      <div className="flex-1 px-4 py-2 truncate">
        {command.ignore ? `// ${command.name}` : command.name}
      </div>
      <div className="flex-1 px-4 py-2 truncate">{getSelector(command)}</div>
      <div className="flex-1 px-4 py-2 truncate">
        {command[getCommandValueProperty(command)]}
      </div>
    </button>
  );
}

