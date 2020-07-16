import * as React from "react";
import classNames from "classnames";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";

import CommandRow from "./CommandRow";
import CommandDetails from "./CommandDetails";
import { Command } from "./test_config";

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
  currentlyPlayingCommandIndex: number;
  onSelectorChange: (commandIndex: number, target: string) => void;
  onCommandIgoreClick: (commandIndex: number) => void;
  onCommandValueChange: (
    selectedCommandIndex: number,
    propName: string,
    newValue: string
  ) => void;
  onCommandPosChange: (change: { oldIndex: number; newIndex: number }) => void;
  onTargetListChange: (
    commandIndex: number,
    targets: Array<[string, string]>
  ) => void;
}

const DragHandle = SortableHandle(() => (
  <button className="flex items-center p-2 pl-4 text-gray-600 cursor-move">
    <svg
      width={18}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
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
  currentlyPlaying: boolean;
}

const SortableItem = SortableElement(
  ({ command, onCommandRowClick, currentlyPlaying }: SortableItemProps) => (
    <li
      className={classNames("flex bg-gray-200 mb-px", {
        "bg-gray-300 text-gray-500": command.ignore,
        "bg-green-200": currentlyPlaying,
      })}
    >
      <DragHandle />
      <span className="bg-black">{currentlyPlaying}</span>
      <CommandRow command={command} onCommandRowClick={onCommandRowClick} />
    </li>
  )
);

interface SortableListProps {
  commands: Array<Command>;
  onCommandRowClick: (commandIndex: number) => void;
  currentlyPlayingCommandIndex: number;
}

const SortableList = SortableContainer(
  ({
    commands,
    onCommandRowClick,
    currentlyPlayingCommandIndex,
  }: SortableListProps) => {
    console.log({ currentlyPlayingCommandIndex });
    return (
      <ul>
        {commands.map((command, i) => {
          return (
            <SortableItem
              key={`command_no_${i}`}
              index={i}
              command={command}
              onCommandRowClick={onCommandRowClick.bind(null, i)}
              currentlyPlaying={currentlyPlayingCommandIndex === i}
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
  onTargetListChange,
  currentlyPlayingCommandIndex,
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
        currentlyPlayingCommandIndex={currentlyPlayingCommandIndex}
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
          onTargetListChange={onTargetListChange.bind(
            null,
            selectedCommandIndex
          )}
        />
      )}
    </div>
  );
}
