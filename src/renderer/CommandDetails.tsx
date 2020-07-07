import * as React from "react";

import { Command } from "./command";
import { getCommandValue } from "./CommandRow";

interface Props {
  command: Command;
  onRemoveClick: () => void;
  onSelectorChange: (newSelectedIndex: number) => void;
  onCommandIgoreClick: () => void;
}

export default function CommandDetails({
  command,
  onRemoveClick,
  onSelectorChange,
  onCommandIgoreClick,
}: Props) {
  return (
    <div className="px-4 py-2 mt-6 bg-indigo-100">
      <div className="flex flex-row-reverse mt-2 mb-4">
        <button onClick={onRemoveClick}>X</button>
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
            className="p-2 ml-2 cursor-pointer hover:bg-blue-300 hover:text-blue-900 rounded-md"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onCommandIgoreClick();
            }}
            title="Ignore/comment this command"
          >
            //
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
              command.target.map((t, i) => <option value={i}>{t[0]}</option>)}
          </select>
        </label>
        <label className="flex items-center w-full mb-4">
          Value
          <input
            key={getCommandValue(command)}
            className="flex-1 px-4 py-2 ml-4 border border-gray-300 rounded-md"
            defaultValue={getCommandValue(command)}
          />
        </label>
      </form>
    </div>
  );
}
