import { useState, useRef } from "react";
import "./App.css";
import "./App_My.css";

import BrainfuckExecuter from "./Executer/BrainfuckExecuter";

function App() {
  const terminalRef = useRef(null);
  const outputPromptRef = useRef(null);
  const inputPromptRef = useRef(null);

  const [outputPromptString, setOutputPromptString] = useState("");

  function InputPrompt_OnKeyDown (e) {
    if (e.key === "Enter") {
      let inputString = e.target.textContent + '\n';
      e.target.textContent = ""; // Clear the input prompt.

      setOutputPromptString(inputString);
    }
  }

  return (
    <>
      <div
        ref={terminalRef}
        className="terminal"
        onClick={() => inputPromptRef.current?.focus()}
      >
        <pre
          ref={outputPromptRef}
        >
          {outputPromptString}
        </pre>
        <pre
          ref={inputPromptRef}
          contentEditable={true}
          onKeyDown={InputPrompt_OnKeyDown}
        >
        </pre>
      </div>
    </>
  )
}

export default App
