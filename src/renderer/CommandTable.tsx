import * as React from "react";
import classNames from "classnames";

import CommandRow from "./CommandRow";
import CommandDetails from "./CommandDetails";
import { Command } from "./command";

function CommandRowHeader() {
  return (
    <div className="flex w-full">
      <span className="flex-1 px-4 py-2 text-lg font-bold text-center">
        Command
      </span>
      <span className="flex-1 px-4 py-2 text-lg font-bold text-center">
        Target
      </span>
      <span className="flex-1 px-4 py-2 text-lg font-bold text-center">
        Value
      </span>
    </div>
  );
}

interface Props {
  commands: Array<Command>;
  onSelectorChange: (selectorIndex: number) => void;
  onCommandIgoreClick: (commandIndex: number) => void;
}

export default function CommandTable({
  commands,
  onSelectorChange,
  onCommandIgoreClick,
}: Props) {
  const [selectedCommandIndex, setSelectedCommandIndex] = React.useState<
    number | null
  >(null);

  function handleCommandRowClick(commandIndex: number) {
    setSelectedCommandIndex(commandIndex);
  }

  return (
    <div>
      <CommandRowHeader />
      <ul>
        {commands.map((command, i) => {
          return (
            <li
              key={`action_no_${i}`}
              className={classNames("bg-gray-200 mb-px", {
                "bg-gray-300 text-gray-500": command.ignore,
              })}
            >
              <CommandRow
                command={command}
                onCommandRowClick={handleCommandRowClick.bind(null, i)}
              />
            </li>
          );
        })}
      </ul>
      {selectedCommandIndex !== null && (
        <CommandDetails
          command={commands[selectedCommandIndex]}
          onRemoveClick={() => setSelectedCommandIndex(null)}
          onSelectorChange={onSelectorChange.bind(null, selectedCommandIndex)}
          onCommandIgoreClick={() => onCommandIgoreClick(selectedCommandIndex)}
        />
      )}
    </div>
  );
}
