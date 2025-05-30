import { useState, useRef, useEffect } from "react";
import "./App.css";
import "./App_My.css";

import BrainfuckExecuter from "./Executer/BrainfuckExecuter";

function App() {
  // --- DOM refs ---
  const bfCodeTextareaRef = useRef(null);   // Reference to <textarea> for code input
  const terminalRef = useRef(null);         // Reference to the terminal container
  const inputPromptRef = useRef(null);  // Reference to the input prompt

  // --- Persistent BrainfuckExecuter instance ---
  const bfRef = useRef(new BrainfuckExecuter()); // Holds 1 instance across renders

  // --- UI state for terminal output display ---
  const [outputPromptString, setOutputPromptString] = useState("");

  // --- Internal buffer to store character codes for input handling ---
  const bufferRef = useRef([]);

  // --- Append text to terminal output state ---
  const OutputToOutputPrompt = (text) => {
    setOutputPromptString((prev) => prev + text);
  };

  // --- Reset core states of BF executer ---
  const ResetBFExecuter = () => {
    const bf = bfRef.current;
    bf.CIndex = 0;
    bf.MemPtr = 0;
    bf.AllCellVal = 0;
    bufferRef.current = [];
  };

  // --- Setup Input/Output callbacks once after mount ---
  useEffect(() => {
    const bf = bfRef.current;

    bf.OutputCallback = (output) => {
      OutputToOutputPrompt(String.fromCharCode(output));
    };

    bf.InputCallback = () => {
      const buffer = bufferRef.current;

      if (buffer.length === 0) {
        const inp = prompt("Input:") + "\n";
        OutputToOutputPrompt(inp);
        buffer.push(...inp.split("").map((c) => c.charCodeAt(0)));
      }

      return buffer.shift();
    };
  }, []);

  // --- Handle "Apply Code" click: load textarea content into BF engine ---
  const handleApplyCode = () => {
    const bf = bfRef.current;
    const code = bfCodeTextareaRef.current?.value ?? "";
    bf.BFCode = code;
    ResetBFExecuter();
    setOutputPromptString("");
  };

  // --- Run execution until completion ---
  const handleExecuteAll = () => {
    const bf = bfRef.current;
    while (!bf.CodeEnded) {
      bf.BF_Execute();
    }
  };

  // --- Manually write user text into terminal (debugging/demo button) ---
  const handleManualOutput = () => {
    const userInput = prompt("Your output:");
    if (userInput !== null) {
      OutputToOutputPrompt(userInput);
    }
  };

  const handleInputPromptKeyDown = (event) => {
    if (event.key == "Enter") {
      let input = event.target.value;
      if (input) {
        input += "\n";
        OutputToOutputPrompt(input);
        event.target.value = ""; // Clear input after submission
      }
    }
  }

  return (
    <>
      <textarea
        id="BFCodeTextarea"
        ref={bfCodeTextareaRef}
        placeholder="Enter your Brainfuck code here..."
      />

      <button onClick={handleApplyCode}>Apply BF code</button>

      <button onClick={handleExecuteAll}>Execute until end</button>

      <button onClick={handleManualOutput}>Output things</button>

      <div id="TerminalDiv" ref={terminalRef}>
        <span id="OutputPromptSpan">{outputPromptString}</span>
        <input
          id="InputPrompt"
          ref={inputPromptRef}
          onKeyDown={handleInputPromptKeyDown}
        />
      </div>
    </>
  );
}

export default App;
