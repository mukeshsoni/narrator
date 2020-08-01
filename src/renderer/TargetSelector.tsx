import * as React from "react";

const { ipcRenderer } = require("electron");

interface Props {
  target?: string;
  onTargetSelect: (targets: Array<[string, string]>) => void;
}

export default function TargetSelector({ onTargetSelect, target }: Props) {
  React.useEffect(() => {
    ipcRenderer.on(
      "selected-target",
      (_: any, targets: Array<[string, string]>) => {
        console.log("Got assertion target", targets);
        onTargetSelect(targets);
      }
    );
  }, []);

  return (
    <div className="flex">
      <button
        className="flex items-center p-2 ml-2 rounded-lg h-9 hover:bg-blue-500 hover:text-white"
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
      <button
        className="flex items-center p-2 ml-2 rounded-lg h-9 hover:bg-blue-500 hover:text-white"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          ipcRenderer.send("find-and-highlight", target);
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
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </div>
  );
}
