import * as React from "react";
import classNames from "classnames";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";

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
  onSelectorChange: (commandIndex: number, target: string) => void;
  onCommandIgoreClick: (commandIndex: number) => void;
  onCommandValueChange: (
    selectedCommandIndex: number,
    propName: string,
    newValue: string
  ) => void;
  onCommandPosChange: (change: { oldIndex: number; newIndex: number }) => void;
}

const DragHandle = SortableHandle(() => (
  <button className="flex items-center p-2 text-gray-600 cursor-move">
    <svg
      width={18}
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M4 4h16M4 8h16M4 12h16"></path>
    </svg>
  </button>
));

interface SortableItemProps {
  command: Command;
  onCommandRowClick: () => void;
}

const SortableItem = SortableElement(
  ({ command, onCommandRowClick }: SortableItemProps) => (
    <li
      className={classNames("flex bg-gray-200 mb-px", {
        "bg-gray-300 text-gray-500": command.ignore,
      })}
    >
      <DragHandle />
      <CommandRow command={command} onCommandRowClick={onCommandRowClick} />
    </li>
  )
);

interface SortableListProps {
  commands: Array<Command>;
  onCommandRowClick: (commandIndex: number) => void;
}

const SortableList = SortableContainer(
  ({ commands, onCommandRowClick }: SortableListProps) => {
    return (
      <ul>
        {commands.map((command, i) => {
          return (
            <SortableItem
              key={`command_no_${i}`}
              index={i}
              command={command}
              onCommandRowClick={onCommandRowClick.bind(null, i)}
            />
          );
        })}
      </ul>
    );
  }
);

export default function CommandTable({
  commands,
  onSelectorChange,
  onCommandIgoreClick,
  onCommandValueChange,
  onCommandPosChange,
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
      <SortableList
        commands={commands}
        onCommandRowClick={handleCommandRowClick}
        onSortEnd={onCommandPosChange}
        useDragHandle
      />
      {selectedCommandIndex !== null && (
        <CommandDetails
          command={commands[selectedCommandIndex]}
          onRemoveClick={() => setSelectedCommandIndex(null)}
          onSelectorChange={onSelectorChange.bind(null, selectedCommandIndex)}
          onCommandIgoreClick={() => onCommandIgoreClick(selectedCommandIndex)}
          onCommandValueChange={onCommandValueChange.bind(
            null,
            selectedCommandIndex
          )}
        />
      )}
    </div>
  );
}
