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
  onCommandDeleteClick: () => void;
}

export default function CommandRow({
  command,
  onCommandRowClick,
  onCommandDeleteClick,
}: Props) {
  return (
    <div className="flex w-full align-center">
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
      <button
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          const response = confirm(
            "Are you sure you want to delete the command?"
          );
          if (response) {
            onCommandDeleteClick();
          }
        }}
        className="p-2 mr-4 rounded-full hover:bg-purple-600 hover:text-gray-200"
      >
        <svg
          width={18}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  );
}
