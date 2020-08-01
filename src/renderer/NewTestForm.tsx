import * as React from "react";

interface Props {
  onSubmit: (name: string, url: string) => Promise<any>;
}

function NewTestForm({ onSubmit }: Props) {
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
  }

  return (
    <div className="p-4">
      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (!name.trim() || !url.trim()) {
            alert("Both name and url are required");
          } else {
            onSubmit(name, url)
              .then(() => {})
              .catch((e) => alert(e.message));
          }
        }}
        className="flex flex-col mt-4"
      >
        <label className="flex items-center w-full mb-4">
          Test name
          <input
            placeholder="Test name"
            value={name}
            onChange={handleNameChange}
            className="flex-1 px-4 py-2 ml-4 border border-gray-300 rounded-md"
          />
        </label>
        <label className="flex items-center w-full mb-4">
          Test url
          <input
            placeholder="Test url"
            value={url}
            onChange={handleUrlChange}
            className="flex-1 px-4 py-2 ml-4 border border-gray-300 rounded-md"
          />
        </label>
        <button
          className="w-full px-4 py-2 bg-blue-200 rounded-md hover:bg-blue-500 hover:text-white"
          type="submit"
        >
          Create test
        </button>
      </form>
    </div>
  );
}

export default NewTestForm;
