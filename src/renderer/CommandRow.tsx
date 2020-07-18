import * as React from "react";

import { Command } from "./test_config";

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
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onCommandRowClick();
      }}
    >
      <div className="flex-1 px-4 py-2 truncate">{command.name}</div>
      <div className="flex-1 px-4 py-2 truncate">{command.target}</div>
      <div className="flex-1 px-4 py-2 truncate">
        {command[getCommandValueProperty(command)]}
      </div>
    </button>
  );
}
