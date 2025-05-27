import { useState, useRef } from "react";
import "./App.css";
import "./App_My.css";

import BrainfuckExecuter from "./Executer/BrainfuckExecuter";

function App() {
  const terminalRef = useRef(null);
  const promptInputRef = useRef(null);

  const [output, setOutput] = useState([]);
  const [input, setInput] = useState("");
  const [waitingForInput, setWaitingForInput] = useState(true);

  
  function HandleInput (e) {
    setInput(e.currentTarget.textContent);
  }

  function HandleKey (e) {
    if (e.key === "Enter") {
      e.preventDefault();

      const finalInput = input;
      setInput("");
      setOutput((prev) => {
        console.log(prev);
        const newOutput = [...prev, finalInput];
        console.log(newOutput);
        return newOutput;
      });
      console.log(output);
      // setWaitingForInput(false);
    }
  }

  return (
    <>
      <div
        ref={terminalRef}
        className="terminal"
        onClick={() => promptInputRef.current?.focus()}
      >
        {output.map((line, idx) => {
          <div key={idx}>
            {line}
          </div>
        })}

        {waitingForInput && (
          <div>
            <span className="Prompt"></span>
            <span
              contentEditable = "true"
              ref={promptInputRef}
              onInput={HandleInput}
              onKeyDown={HandleKey}
              className="PromptInput"
            />
          </div>
        )}
      </div>
    </>
  )
}

export default App
