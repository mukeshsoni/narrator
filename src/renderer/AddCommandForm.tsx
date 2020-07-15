import * as React from "react";
import Downshift from "downshift";
import classNames from "classnames";

import TargetSelector from "./TargetSelector";
import { Command } from "./command";
import { commands, CommandMeta } from "../command/commands";

interface Props {
  onSave: (command: Command) => void;
  onCancel: () => void;
  filter?: (c: CommandMeta) => void;
}

export default function AddCommandForm({
  onSave,
  onCancel,
  filter = (_: CommandMeta) => true,
}: Props) {
  const [value, setValue] = React.useState("");
  const [selectedCommand, setCommand] = React.useState("");
  const [targets, setAssertionTargets] = React.useState<
    Array<[string, string]>
  >([]);
  const [target, setTarget] = React.useState("");

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

  React.useEffect(() => {
    console.log("selected command changed", selectedCommand);
  }, [selectedCommand]);

  return (
    <div className="w-full p-4">
      <h2 className="mb-2">Add command</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        <Downshift
          onChange={(selection) => setCommand(selection[0])}
          itemToString={(item) => (item && item[1] ? item[1].name : "")}
        >
          {({
            getLabelProps,
            getRootProps,
            getInputProps,
            getMenuProps,
            getItemProps,
            getToggleButtonProps,
            isOpen,
            inputValue,
            highlightedIndex,
            selectedItem,
          }) => {
            console.log({ isOpen });
            return (
              <div>
                <label {...getLabelProps}>Select command</label>
                <div className="flex items-center mt-2">
                  <input
                    {...getInputProps()}
                    className="flex-1 px-4 py-2 border border-r-0 border-gray-300 rounded-l-md"
                  />
                  <button
                    {...getToggleButtonProps()}
                    className="p-3 border border-l-0 border-gray-300 rounded-r-md"
                  >
                    {isOpen ? (
                      <svg
                        className="w-4 ml-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 15l7-7 7 7"></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 ml-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </button>
                </div>
                {isOpen && (
                  <ul
                    {...getMenuProps()}
                    className="py-2 overflow-auto border border-gray-200 rounded-md"
                    style={{ maxHeight: 400 }}
                  >
                    {commands
                      .filter((command) => command[1].enabled)
                      .filter(filter)
                      .filter(
                        (command) =>
                          !inputValue || command[1].name.includes(inputValue)
                      )
                      .map((command, index) => {
                        return (
                          <li
                            {...getItemProps({
                              key: command[0],
                              index,
                              item: command,
                            })}
                            className={classNames("px-4 py-2 cursor-pointer", {
                              "bg-blue-200": highlightedIndex === index,
                              "bg-white": highlightedIndex !== index,
                              "font-bold": selectedItem === command,
                              "font-normal": selectedItem !== command,
                            })}
                          >
                            {command[1].name}
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            );
          }}
        </Downshift>
        <label className="block mt-4">
          Target
          <div className="flex items-center w-full mt-2">
            {targets.length > 0 ? (
              <select
                name="selector"
                className="flex-1 w-full px-4 py-2 bg-white border border-gray-300 rounded-md"
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
                className="flex-1 px-4 py-2 text-gray-500 bg-gray-100 border border-gray-400 rounded-md"
                disabled={true}
                placeholder="locator comes here"
              />
            )}
            <TargetSelector onTargetSelect={setAssertionTargets} />
          </div>
        </label>
        <label className="block mt-4">
          Value
          <textarea
            value={value}
            onChange={handleValueChange}
            className="flex-1 block w-full px-4 py-2 mt-2 border border-gray-400 rounded-md"
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
