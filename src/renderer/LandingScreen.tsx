import * as React from "react";
import Modal from "react-modal";
import { remote } from "electron";
import fs from "fs";

import { TestConfig } from "./test_config";
import NewTestForm from "./NewTestForm";

const testConfigFolderName = "test-config";
const userDataPath = remote.app.getPath("userData");

interface Props {
  onTestSelect: (test: TestConfig) => void;
}

async function createTestConfigFolder() {
  const testConfigFilesPath = `${userDataPath}/${testConfigFolderName}`;

  if (fs.existsSync(testConfigFilesPath)) {
    return Promise.resolve();
  } else {
    return fs.promises.mkdir(testConfigFilesPath);
  }
}

function getTestFilePath(name: string) {
  const testConfigFilesPath = `${userDataPath}/${testConfigFolderName}`;
  return `${testConfigFilesPath}/${name.replace(/\s+/g, "_")}.json`;
}

export async function saveCommandsToFile(test: TestConfig) {
  await fs.promises.writeFile(
    getTestFilePath(test.name),
    JSON.stringify(test),
    "utf-8"
  );
}

function TestRowHeader() {
  return (
    <div className="flex w-full">
      <span className="flex-1 px-4 py-2 text-lg font-semibold text-center">
        Test name
      </span>
      <span className="flex-1 px-4 py-2 text-lg font-semibold text-center">
        Commands
      </span>
      <span className="flex-shrink-0 px-4 py-2 mr-6 text-lg font-semibold text-center">
        A
      </span>
    </div>
  );
}

function LandingScreen({ onTestSelect }: Props) {
  const [tests, setTests] = React.useState<Array<TestConfig>>([]);
  const [showCreateNewTestModal, setShowNewCreateTestModal] = React.useState(
    false
  );

  async function readTestConfigFile(filePath: string) {
    console.log({ filePath });
    const fileContent = await fs.promises.readFile(filePath, "utf-8");

    return JSON.parse(fileContent);
  }

  async function readTestsFromFileSystem() {
    const testConfigFilesPath = `${userDataPath}/${testConfigFolderName}`;

    try {
      const testFiles = await fs.promises.readdir(testConfigFilesPath);

      console.log("testFiles", testFiles);
      const promises = testFiles
        .filter((fileName: string) => fileName.endsWith(".json"))
        .map((testFileName) =>
          readTestConfigFile(`${testConfigFilesPath}/${testFileName}`)
        );

      return Promise.all(promises).then((testConfigs: Array<TestConfig>) => {
        console.log({ testConfigs });
        setTests(testConfigs);
      });
    } catch (e) {
      console.log("Error reading test configs folder data", e);
    }
  }

  React.useEffect(() => {
    // load tests from file system

    readTestsFromFileSystem();
    console.log(remote.app.getPath("userData"));

    setTests([]);
  }, []);

  function handleCreateNewTestClick() {
    setShowNewCreateTestModal(true);
  }

  function hideCreateNewTestModal() {
    setShowNewCreateTestModal(false);
  }

  async function createNewTest(name: string, url: string) {
    await createTestConfigFolder();
    const testConfig = {
      name,
      url,
      commands: [],
    };

    const userDataPath = remote.app.getPath("userData");
    const testConfigFilesPath = `${userDataPath}/${testConfigFolderName}`;

    return fs.promises.writeFile(
      `${testConfigFilesPath}/${name.replace(/\s+/g, "_")}.json`,
      JSON.stringify(testConfig),
      "utf-8"
    );
  }

  function handleNewTestSubmit(name: string, url: string) {
    if (tests.some((test) => test.name.toLowerCase() === name.toLowerCase())) {
      return Promise.reject(new Error(`Test named "${name}" already exists`));
    } else {
      // return Promise.reject(new Error(`Test with "${name}" already exists`));
      // create the test-config folder
      // create file with file name same as test name
      // the content would be TestConfig { name, url, commands: [] }
      // return Promise.resolve();

      setTests(tests.concat({ name, url, commands: [] }));
      setShowNewCreateTestModal(false);
      return createNewTest(name, url);
    }
  }

  function handleDeleteTestClick(testName: string) {
    const response = confirm("Are you sure you want to delete the test?");

    if (response) {
      const indexOfTest = tests.findIndex((test) => test.name === testName);
      console.log({ indexOfTest });

      if (indexOfTest >= 0) {
        const newTests = [
          ...tests.slice(0, indexOfTest),
          ...tests.slice(indexOfTest + 1),
        ];

        setTests(newTests);
        const testFilePath = getTestFilePath(testName);
        fs.promises.unlink(testFilePath);
      }
    }
  }

  return (
    <div className="p-2 overflow-hidden">
      <button
        className="w-full px-4 py-2 bg-blue-200 rounded-md hover:bg-blue-500 hover:text-white"
        onClick={handleCreateNewTestClick}
      >
        Create new test
      </button>
      {tests.length > 0 && (
        <div className="flex flex-col h-full pb-4 mt-6">
          <h2 className="my-4 text-lg font-bold">
            List of tests (double click to open)
          </h2>
          <TestRowHeader />
          <ul className="h-full overflow-y-scroll">
            {tests.map((test: TestConfig) => {
              return (
                <li
                  key={test.name}
                  className="flex items-center w-full mb-px bg-gray-200"
                >
                  <button
                    className="flex items-center w-full hover:bg-gray-400"
                    onClick={(e: React.MouseEvent) => {}}
                    onDoubleClick={(e: React.MouseEvent) => {
                      onTestSelect(test);
                    }}
                  >
                    <div className="flex-1 px-4 py-2 truncate">{test.name}</div>
                    <span className="flex-1 px-4 py-2">
                      {test.commands.length}
                    </span>
                  </button>
                  <div className="flex">
                    <button
                      onClick={handleDeleteTestClick.bind(null, test.name)}
                      className="p-2 mr-4 hover:bg-purple-600 hover:text-gray-200"
                    >
                      <svg
                        width={18}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                    <button
                      onClick={onTestSelect.bind(null, test)}
                      className="p-2 mr-4 hover:bg-purple-600 hover:text-gray-200"
                    >
                      <svg
                        width={18}
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {showCreateNewTestModal && (
        <Modal
          isOpen={showCreateNewTestModal}
          onRequestClose={hideCreateNewTestModal}
        >
          <NewTestForm onSubmit={handleNewTestSubmit} />
        </Modal>
      )}
    </div>
  );
}

export default LandingScreen;
