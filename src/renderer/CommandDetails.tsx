import * as React from "react";

import { Command } from "./command";
import { getCommandValueProperty } from "./CommandRow";

interface Props {
  command: Command;
  onRemoveClick: () => void;
  onSelectorChange: (newSelectedIndex: number) => void;
  onCommandIgoreClick: () => void;
  onCommandValueChange: (propName: string, newValue: string) => void;
}

export default function CommandDetails({
  command,
  onRemoveClick,
  onSelectorChange,
  onCommandIgoreClick,
  onCommandValueChange,
}: Props) {
  return (
    <div className="px-4 py-2 mt-6 bg-indigo-100">
      <div className="flex flex-row-reverse mt-2 mb-4">
        <button
          className="p-1 rounded-full hover:bg-blue-500 hover:text-white"
          onClick={onRemoveClick}
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
      <form className="flex flex-col">
        <label className="flex items-center w-full mb-4">
          Command
          <input
            key={command.value}
            value={command.name}
            disabled={true}
            className="flex-1 px-4 py-2 ml-4 border border-gray-300 rounded-md"
          ></input>
          <button
            className="p-2 ml-2 cursor-pointer hover:bg-blue-500 hover:text-blue-100 rounded-md"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onCommandIgoreClick();
            }}
            title="Ignore/comment this command"
          >
            {command.ignore ? (
              <svg
                width={20}
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
              </svg>
            ) : (
              <svg
                width={20}
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            )}
          </button>
        </label>
        <label className="flex items-center w-full mb-4">
          Target
          <select
            name="selector"
            key={command.selectedTarget}
            className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
            value={command.selectedTarget}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onSelectorChange(Number(e.target.value))
            }
          >
            {command.target &&
              command.target.length > 0 &&
              command.target.map((t, i) => (
                <option value={i} key={t[0]}>
                  {t[0]}
                </option>
              ))}
          </select>
        </label>
        <label className="flex items-center w-full mb-4">
          Value
          <input
            className="flex-1 px-4 py-2 ml-4 border border-gray-300 rounded-md"
            value={command[getCommandValueProperty(command)]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onCommandValueChange(
                getCommandValueProperty(command),
                e.target.value
              );
            }}
          />
        </label>
      </form>
    </div>
  );
}
