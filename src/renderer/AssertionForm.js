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
    value: "assertContainsText",
    label: "contains",
  },
  {
    value: "assertStartsWithText",
    label: "starts with",
  },
  {
    value: "assertEndsWithText",
    label: "ends with",
  },
];

function AssertionForm({ onSave, onCancel }) {
  const [assertionTargets, setAssertionTargets] = React.useState([]);
  const [selectedTarget, setSelectedTarget] = React.useState(0);

  React.useEffect(() => {
    ipcRenderer.on("assertion-target", (_, targets) => {
      console.log("Got assertion target", targets);
      setAssertionTargets(targets);
    });
  }, []);

  return React.createElement("div", { className: "p-4 w-full" }, [
    React.createElement("h2", { className: "mb-2" }, "Assertion"),
    React.createElement(
      "form",
      {
        className: "mt-4",
        onSubmit: (e) => {
          e.stopPropagation();
          e.preventDefault();
          alert("on submit");
        },
      },
      [
        React.createElement(
          "label",
          { className: "flex items-center w-full" },
          [
            "Assertion against: ",
            assertionTargets
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
                      "ml-4 px-4 py-2 border border-gray-400 rounded-md bg-white",
                    disabled: true,
                    value: "locator comes here",
                  },
                  null
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
