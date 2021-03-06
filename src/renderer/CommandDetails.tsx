import * as React from "react";

import TargetSelector from "./TargetSelector";
import { Command } from "./test_config";
import { getCommandValueProperty } from "./CommandRow";

interface Props {
  command: Command;
  onRemoveClick: () => void;
  onSelectorChange: (target: string) => void;
  onTargetListChange: (targets: Array<[string, string]>) => void;
  onCommandIgoreClick: () => void;
  onCommandValueChange: (propName: string, newValue: string) => void;
}

export default function CommandDetails({
  command,
  onRemoveClick,
  onSelectorChange,
  onTargetListChange,
  onCommandIgoreClick,
  onCommandValueChange,
}: Props) {
  const { value, values } = command;
  const [editingTarget, setEditingTarget] = React.useState(false);
  const [target, setTarget] = React.useState("");

  function handleTargetEditClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingTarget(true);
  }

  function handleTargetEditSubmit(e: React.MouseEvent | React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingTarget(false);
    // TODO: We don't want to create new target every time user edits a target
    onTargetListChange(
      [[`css=${target}`, "css:finder"] as [string, string]].concat(
        command.targets
      )
    );
  }

  React.useEffect(() => {
    console.log("targets", command.targets);
  }, []);
  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    setTarget(e.target.value);
  }

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
            {command.name.startsWith("//") ? (
              <svg
                width={20}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
              </svg>
            ) : (
              <svg
                width={20}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
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
          {!editingTarget ? (
            <select
              name="selector"
              key={command.target}
              className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
              value={command.target}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onSelectorChange(e.target.value)
              }
            >
              {command.targets &&
                command.targets.length > 0 &&
                command.targets.map((t, i) => (
                  <option value={t[0]} key={t[0]}>
                    {t[0]}
                  </option>
                ))}
            </select>
          ) : (
            <form onSubmit={handleTargetEditSubmit} className="flex flex-1">
              <input
                className="flex-1 px-4 py-2 ml-4 border border-gray-300 rounded-md"
                onChange={handleTargetChange}
                value={target}
              />
            </form>
          )}
          {!editingTarget ? (
            <button
              className="p-2 ml-2 cursor-pointer hover:bg-blue-500 hover:text-blue-100 rounded-md"
              onClick={handleTargetEditClick}
              title="Ignore/comment this command"
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
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          ) : (
            <button
              className="p-2 ml-2 cursor-pointer hover:bg-blue-500 hover:text-blue-100 rounded-md"
              onClick={handleTargetEditSubmit}
              title="Ignore/comment this command"
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
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
          )}
          <TargetSelector
            onTargetSelect={onTargetListChange}
            target={command.target}
          />
        </label>
        <label className="flex items-center w-full mb-4">
          Value
          {Array.isArray(values) ? (
            <select
              name="selector"
              key={value}
              className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onCommandValueChange("value", e.target.value)
              }
            >
              {command.values &&
                command.values.length > 0 &&
                command.values.map((t, i) => (
                  <option value={t[0]} key={t[0]}>
                    {t[0]}
                  </option>
                ))}
            </select>
          ) : (
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
          )}
        </label>
      </form>
    </div>
  );
}
