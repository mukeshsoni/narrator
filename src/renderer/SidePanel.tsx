import * as React from "react";
import onClickOutside from "react-onclickoutside";

import CommandTable from "./CommandTable";
import { Command } from "./command";

const SIDE_PANEL_WIDTH = 600;

interface MenuProps {
  buttonText: string;
  children: React.ReactNode | React.ReactNodeArray;
}

function Menu({ buttonText, children }: MenuProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  Menu.handleClickOutside = () => setMenuOpen(false);

  return (
    <div className="relative h-full">
      <button
        className="flex items-center h-full px-4 py-2 hover:bg-blue-500 hover:text-white"
        onClick={() => (menuOpen ? setMenuOpen(false) : setMenuOpen(true))}
      >
        {buttonText}
        {menuOpen ? (
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
      <div
        className={
          menuOpen
            ? "flex flex-col border absolute bg-gray-100 rounded-lg"
            : "hidden"
        }
      >
        {children}
      </div>
    </div>
  );
}

namespace Menu {
  export let handleClickOutside: () => void;
}

const clickOutsideConfig = {
  handleClickOutside: () => Menu.handleClickOutside,
};

const MenuWithClickOutside = onClickOutside(Menu, clickOutsideConfig);

interface Props {
  commands: Array<Command>;
  onGenerateClick: (toolName: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onReplay: () => void;
  onPauseClick: () => void;
  onSelectorChange: (commandIndex: number, target: string) => void;
  onCommandIgoreClick: (commandIndex: number) => void;
  onAddAssertionClick: () => void;
  onCommandValueChange: (
    selectedCommandIndex: number,
    propName: string,
    newValue: string
  ) => void;
}

export default function SidePanel({
  commands,
  onGenerateClick,
  isRecording,
  onStartRecording,
  onReplay,
  onPauseClick,
  onSelectorChange,
  onCommandIgoreClick,
  onAddAssertionClick,
  onCommandValueChange,
}: Props) {
  return (
    <div
      className="flex flex-col border border-gray-300"
      style={{ width: SIDE_PANEL_WIDTH }}
    >
      <div className="flex items-center justify-between w-full px-4 mb-4 bg-gray-100">
        <div className="flex">
          {!isRecording ? (
            <button
              className="flex flex-col items-center justify-center px-4 py-2 mr-2 text-xs uppercase hover:bg-blue-500 hover:text-white"
              onClick={onStartRecording}
            >
              <div className="w-5 h-5 mb-1 bg-red-700 rounded-full" />
              <span>Rec</span>
            </button>
          ) : (
            <button
              className="flex flex-col items-center justify-center p-2 mr-2 text-xs uppercase hover:bg-blue-500 hover:text-white"
              onClick={onPauseClick}
            >
              <svg
                width={24}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Pause</span>
            </button>
          )}
          {commands && commands.length > 0 && (
            <button
              className="flex flex-col items-center justify-center p-2 mr-2 text-xs text-green-800 uppercase hover:bg-blue-500 hover:text-white"
              onClick={onReplay}
            >
              <svg
                width={24}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Play</span>
            </button>
          )}
        </div>
        <div className="flex items-center h-full">
          <button
            className="flex flex-col items-center justify-center p-2 mr-1 hover:bg-blue-500 hover:text-white"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onAddAssertionClick();
            }}
            title="Add assertion"
          >
            <svg
              width={24}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-xs uppercase">Assert</span>
          </button>
          <MenuWithClickOutside buttonText="Generate code">
            <>
              <button
                className="px-4 py-2 mb-2 hover:bg-blue-500 hover:text-white"
                onClick={onGenerateClick.bind(null, "puppeteer")}
                key="puppeteer"
              >
                Puppeteer
              </button>
              <button
                className="px-4 py-2 hover:bg-blue-500 hover:text-white"
                onClick={onGenerateClick.bind(null, "cypress")}
                key="cypress"
              >
                Cypress
              </button>
            </>
          </MenuWithClickOutside>
        </div>
      </div>
      <div className="flex flex-col justify-between h-full">
        <CommandTable
          commands={commands}
          onSelectorChange={onSelectorChange}
          onCommandIgoreClick={onCommandIgoreClick}
          onCommandValueChange={onCommandValueChange}
        />
      </div>
    </div>
  );
}
