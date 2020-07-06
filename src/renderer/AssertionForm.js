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

function AssertionForm({ onSave, onCancel }) {
  const [showTextarea, setShowTextarea] = React.useState(false);
  const [expectedValue, setExpectedValue] = React.useState("");
  const [assertionType, setAssertionType] = React.useState(
    assertionTypes[0].value
  );
  const [assertionTargets, setAssertionTargets] = React.useState([]);
  const [selectedTarget, setSelectedTarget] = React.useState(0);
  const assertionTypeRef = React.useRef(null);

  React.useEffect(() => {
    ipcRenderer.on("assertion-target", (_, targets) => {
      console.log("Got assertion target", targets);
      setAssertionTargets(targets);
    });
  }, []);

  function handleAssertionTypeChange(e) {
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

  function handleSubmit(e) {
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
        target: assertionTargets,
        selectedTarget,
        // TODO: send the selected assertionType
        command: assertionType,
        value: expectedValue,
      });
    }
  }

  function handleExpectedValueChange(e) {
    e.preventDefault();
    setExpectedValue(e.target.value);
  }

  return React.createElement("div", { className: "p-4 w-full" }, [
    React.createElement("h2", { className: "mb-2" }, "Assertion"),
    React.createElement(
      "form",
      {
        className: "mt-4",
        onSubmit: handleSubmit,
      },
      [
        React.createElement(
          "label",
          { className: "flex items-center w-full" },
          [
            "Assertion against: ",
            assertionTargets.length > 0
              ? React.createElement(
                  "select",
                  {
                    name: "selector",
                    className:
                      "w-full flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md bg-white",
                    value: selectedTarget,
                    onChange: (e) => {
                      e.preventDefault();
                      console.log("new target selected", e.target.value);
                      setSelectedTarget(Number(e.target.value));
                    },
                  },
                  [
                    assertionTargets.map((t, i) => {
                      return React.createElement("option", { value: i }, t[0]);
                    }),
                  ]
                )
              : React.createElement(
                  "input",
                  {
                    className:
                      "ml-4 px-4 py-2 flex-1 border border-gray-400 rounded-md bg-gray-100 text-gray-500",
                    disabled: true,
                    value: "locator comes here",
                  },
                  null
                ),
            React.createElement(
              "button",
              {
                className:
                  "flex items-center p-2 ml-2 h-9 bg-blue-700 text-gray-100 rounded-lg hover:bg-blue-900",
                onClick: (e) => {
                  e.preventDefault();
                  ipcRenderer.send("start-find-and-select");
                },
              },
              React.createElement(
                "svg",
                {
                  fill: "none",
                  width: 20,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                },
                React.createElement(
                  "path",
                  {
                    style: {
                      transform: "rotate(90deg)",
                      transformOrigin: "50% 50%",
                    },
                    d:
                      "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122",
                  },
                  null
                )
              )
            ),
          ]
        ),
        React.createElement(
          "label",
          { className: "flex items-center w-full mt-2" },
          [
            "Assertion type: ",
            React.createElement(
              "select",
              {
                className:
                  "w-full flex-1 ml-4 px-4 py-2 border border-gray-300 rounded-md bg-white",
                value: assertionType,
                onChange: handleAssertionTypeChange,
              },
              assertionTypes.map((assertionType) => {
                return React.createElement(
                  "option",
                  {
                    className: "ml-4",
                    value: assertionType.value,
                    key: assertionType.value,
                  },
                  assertionType.label
                );
              })
            ),
          ]
        ),
        showTextarea &&
          React.createElement(
            "label",
            { className: "flex items-center w-full mt-2" },
            [
              "Expected value",
              React.createElement(
                "textarea",
                {
                  value: expectedValue,
                  onChange: handleExpectedValueChange,
                  className:
                    "ml-4 px-4 py-2 flex-1 border border-gray-400 rounded-md",
                },
                null
              ),
            ]
          ),
        React.createElement(
          "div",
          { className: "flex flex-row-reverse mt-4" },
          [
            React.createElement(
              "button",
              {
                className: "px-4 py-2 bg-blue-500 rounded-md",
                type: "submit",
              },
              "Save"
            ),
            React.createElement(
              "button",
              {
                className: "px-4 py-2 mr-4 bg-gray-200 rounded-md",
                onClick: (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onCancel();
                },
              },
              "Cancel"
            ),
          ]
        ),
      ]
    ),
  ]);
}

module.exports = AssertionForm;
