import * as React from "react";
import onClickOutside from "react-onclickoutside";
import InputRange from "react-input-range";

import "react-input-range/lib/css/index.css";
import "./side_panel_styles.css";
import CommandTable from "./CommandTable";
import { Command } from "./test_config";

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
  url: string;
  commands: Array<Command>;
  onGenerateClick: (toolName: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onReplay: () => void;
  onPauseClick: () => void;
  onSelectorChange: (commandIndex: number, target: string) => void;
  onCommandIgoreClick: (commandIndex: number) => void;
  onAddAssertionClick: () => void;
  onAddCommandClick: () => void;
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
  onUrlChange: (url: string) => void;
  currentlyPlayingCommandIndex: number;
  replaySpeed: number;
  onReplaySpeedChange: (replaySpeed: number) => void;
}

export default function SidePanel({
  url,
  commands,
  onGenerateClick,
  isRecording,
  onStartRecording,
  onReplay,
  onPauseClick,
  onSelectorChange,
  onCommandIgoreClick,
  onAddAssertionClick,
  onAddCommandClick,
  onCommandValueChange,
  onCommandPosChange,
  onTargetListChange,
  onUrlChange,
  currentlyPlayingCommandIndex,
  onReplaySpeedChange,
  replaySpeed,
}: Props) {
  const [showSpeedSlider, setShowSpeedSlider] = React.useState(false);

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
              className="flex flex-col items-center justify-center p-2 mr-2 text-xs uppercase cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={onPauseClick}
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
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              <span>Stop</span>
            </button>
          )}
          {commands && commands.length > 0 && (
            <button
              className="flex flex-col items-center justify-center p-2 mr-2 text-xs text-green-800 uppercase cursor-pointer hover:bg-blue-500 hover:text-white"
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
              setShowSpeedSlider(!showSpeedSlider);
            }}
            title="Speed"
          >
            <svg
              width={24}
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
              <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
            </svg>
            <span className="text-xs uppercase">Speed</span>
            {showSpeedSlider && (
              <InputRange
                maxValue={5}
                minValue={1}
                value={replaySpeed}
                onChange={(rs) => onReplaySpeedChange(rs as number)}
              />
            )}
          </button>
          <button
            className="flex flex-col items-center justify-center p-2 mr-1 hover:bg-blue-500 hover:text-white"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onAddCommandClick();
            }}
            title="Add command"
          >
            <svg
              width={24}
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span className="text-xs uppercase">Add command</span>
          </button>
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
            </>
          </MenuWithClickOutside>
        </div>
      </div>
      <div className="flex flex-col justify-between h-full">
        <input
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onUrlChange(e.target.value);
          }}
          className="flex-1 px-4 py-2 mb-2 border border-gray-300 rounded-md"
        />
        <CommandTable
          commands={commands}
          onSelectorChange={onSelectorChange}
          onCommandIgoreClick={onCommandIgoreClick}
          onCommandValueChange={onCommandValueChange}
          onCommandPosChange={onCommandPosChange}
          onTargetListChange={onTargetListChange}
          currentlyPlayingCommandIndex={currentlyPlayingCommandIndex}
        />
      </div>
    </div>
  );
}
