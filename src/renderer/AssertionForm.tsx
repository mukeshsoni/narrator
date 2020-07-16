import * as React from "react";

import { Command } from "./test_config";
const { ipcRenderer } = require("electron");

const assertionTypes = [
  {
    value: "assertVisibility",
    label: "is present",
  },
  {
    value: "assertText",
    label: "equals",
  },
  {
    value: "assertTextContains",
    label: "contains",
  },
  {
    value: "assertTextStartsWith",
    label: "starts with",
  },
  {
    value: "assertTextEndsWith",
    label: "ends with",
  },
];

interface Props {
  onSave: (command: Command) => void;
  onCancel: () => void;
}

export default function AssertionForm({ onSave, onCancel }: Props) {
  const [showTextarea, setShowTextarea] = React.useState(false);
  const [expectedValue, setExpectedValue] = React.useState("");
  const [assertionType, setAssertionType] = React.useState(
    assertionTypes[0].value
  );
  const [assertionTargets, setAssertionTargets] = React.useState<
    Array<[string, string]>
  >([]);
  const [target, setTarget] = React.useState("");
  const assertionTypeRef = React.useRef(null);

  React.useEffect(() => {
    ipcRenderer.on(
      "selected-target",
      (_: any, targets: Array<[string, string]>) => {
        console.log("Got assertion target", targets);
        setAssertionTargets(targets);
      }
    );
  }, []);

  function handleAssertionTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    setAssertionType(e.target.value);
  }

  React.useEffect(() => {
    if (assertionType.startsWith("assertText")) {
      setShowTextarea(true);
    } else {
      setShowTextarea(false);
    }
  }, [assertionType]);

  function handleSubmit(e: React.FormEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (assertionTargets.length === 0) {
      alert("Select a target to assert on");
    } else if (
      assertionType.startsWith("assertText") &&
      expectedValue.trim() === ""
    ) {
      alert("Please enter text to compare with");
    } else {
      onSave({
        target: assertionTargets[0][0],
        targets: assertionTargets,
        // TODO: send the selected assertionType
        command: assertionType,
        name: assertionType,
        value: expectedValue,
      });
    }
  }

  function handleExpectedValueChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    e.preventDefault();
    setExpectedValue(e.target.value);
  }

  return (
    <div className="w-full p-4">
      <h2 className="mb-2">Assertion</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        <label className="flex items-center w-full">
          Assertion against:&nbsp;&nbsp;
          {assertionTargets.length > 0 ? (
            <select
              name="selector"
              className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
              value={target}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                e.preventDefault();
                console.log("new target selected", e.target.value);
                setTarget(e.target.value);
              }}
            >
              {assertionTargets.map((t, i) => {
                return (
                  <option value={t[0]} key={t[0]}>
                    {t[0]}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              className="flex-1 px-4 py-2 ml-4 text-gray-500 bg-gray-100 border border-gray-400 rounded-md"
              disabled={true}
              placeholder="locator comes here"
            />
          )}
          <button
            className="flex items-center p-2 ml-2 text-gray-100 bg-blue-700 rounded-lg h-9 hover:bg-blue-900"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              ipcRenderer.send("start-find-and-select");
            }}
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
              <path
                style={{
                  transform: "rotate(90deg)",
                  transformOrigin: "50% 50%",
                }}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              ></path>
            </svg>
          </button>
        </label>
        <label className="flex items-center w-full mt-2">
          Assertion type&nbsp;&nbsp;
          <select
            className="flex-1 w-full px-4 py-2 ml-4 bg-white border border-gray-300 rounded-md"
            value={assertionType}
            onChange={handleAssertionTypeChange}
          >
            {assertionTypes.map((assertionType) => {
              return (
                <option
                  className="ml-4"
                  value={assertionType.value}
                  key={assertionType.value}
                >
                  {assertionType.label}
                </option>
              );
            })}
          </select>
        </label>
        {showTextarea && (
          <label className="flex items-center w-full mt-2">
            Expected value
            <textarea
              value={expectedValue}
              onChange={handleExpectedValueChange}
              className="flex-1 px-4 py-2 ml-4 border border-gray-400 rounded-md"
            />
          </label>
        )}
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
