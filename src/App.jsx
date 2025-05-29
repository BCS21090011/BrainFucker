import { useState, useRef } from "react";
import "./App.css";
import "./App_My.css";

import BrainfuckExecuter from "./Executer/BrainfuckExecuter";

function App() {
  const bfCodeTextareaRef = useRef(null);
  const terminalRef = useRef(null);
  const outputPromptRef = useRef(null);
  const inputPromptRef = useRef(null);

  const [outputPromptString, setOutputPromptString] = useState("");

  function OutputToOutputPrompt (text) {
    setOutputPromptString(outputPromptString + text);
  }

  function InputPrompt_OnKeyDown (e) {
    if (e.key === "Enter") {
      let inputString = e.target.value;
      inputString += "\n";
      console.log(inputString);

      OutputToOutputPrompt(inputString);
      e.target.value = ""; // Clear the input prompt.
    }
  }

  let bfObj = new BrainfuckExecuter();
  bfObj.OutputCallback = (output, brainfuckExecuter) => {
    OutputToOutputPrompt(String.fromCharCode(output));
  }
  let buffer = [];
  bfObj.InputCallback = (brainfuckExecuter) => {
    if (buffer.length <= 0) {
        const inp = prompt("Input:") + "\n";
        OutputToOutputPrompt(inp);
        buffer.push(...[...inp].map(c => c.charCodeAt(0)));
    }
    
    return buffer.shift();
  }

  return (
    <>
      <textarea
        id="BFCodeTextarea"
        ref={bfCodeTextareaRef}
        placeholder="Enter your Brainfuck code here..."
      >
      </textarea>
      <button onClick={() => {
        bfObj.BFCode = bfCodeTextareaRef.current.value;
        bfObj.AllCellVal = 0;
        bfObj.CIndex = 0;
        bfObj.MemPtr = 0;
        setOutputPromptString("");
      }}>Apply BF code</button>
      <button onClick={() => {
        while (bfObj.CodeEnded == false) {
          bfObj.BF_Execute();
        }
      }}>
        Execute until end
      </button>
      <button onClick={() => { OutputToOutputPrompt(prompt("Your output:")); }}>Output things</button>
      <div
        id="TerminalDiv"
        ref={terminalRef}
      >
        <span id="OutputPromptSpan" ref={outputPromptRef}>
          {outputPromptString}
        </span>
        {/*
        <input
          id="InputPromptInput"
          ref={inputPromptRef}
          onKeyDown={InputPrompt_OnKeyDown}
        />
        */}
      </div>
    </>
  )
}

export default App
