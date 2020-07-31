import * as React from "react";
import Modal from "react-modal";
import { remote } from "electron";
import fs from "fs";

import { TestConfig } from "./test_config";
import NewTestForm from "./NewTestForm";

const testConfigFolderName = "test-config";

interface Props {
  onTestSelect: (test: TestConfig) => void;
}

async function createTestConfigFolder() {
  const userDataPath = remote.app.getPath("userData");
  const testConfigFilesPath = `${userDataPath}/${testConfigFolderName}`;

  if (fs.existsSync(testConfigFilesPath)) {
    return Promise.resolve();
  } else {
    return fs.promises.mkdir(testConfigFilesPath);
  }
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
    const userDataPath = remote.app.getPath("userData");
    const testConfigFilesPath = `${userDataPath}/${testConfigFolderName}`;

    try {
      const testFiles = await fs.promises.readdir(testConfigFilesPath);

      console.log("testFiles", testFiles);
      const promises = testFiles.map((testFileName) =>
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
      return createNewTest(name, url);
    }
  }

  return (
    <div>
      <button
        className="w-full px-4 py-2 bg-blue-200 rounded-md hover:bg-blue-500 hover:text-white"
        onClick={handleCreateNewTestClick}
      >
        Create new test
      </button>
      {tests.length > 0 && (
        <div>
          <h2>Open a test</h2>
          <ul>
            {tests.map((test: TestConfig) => {
              return (
                <li key={test.name} className="flex w-full align-center">
                  <button
                    className="flex w-full hover:bg-gray-400"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDoubleClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTestSelect(test);
                    }}
                  >
                    <div className="flex-1 px-4 py-2 truncate">{test.name}</div>
                  </button>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      const response = confirm(
                        "Are you sure you want to delete the test?"
                      );
                      if (response) {
                      }
                    }}
                    className="p-2 mr-4"
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
