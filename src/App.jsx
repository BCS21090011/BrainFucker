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

  // --- Resolver for input ---
  const inputResolverRef = useRef(null);

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

    bf.InputCallback = async () => {
      const inputPrompt = inputPromptRef.current;
      inputPrompt.classList.remove("Hidden");
      inputPrompt.focus();

      return new Promise((resolve) => {
        inputResolverRef.current = resolve;
      });
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
  const handleExecuteAll = async () => {
    const bf = bfRef.current;
    await bf.BF_Execute_Until_End();
  };

  const handleInputPromptKeyDown = (event) => {
    if (event.key == "Enter") {
      const input = event.target.value + "\n";
      event.target.value = "";
      event.target.classList.add("Hidden");
      OutputToOutputPrompt(input);

      const codes = input.split("").map(c => c.charCodeAt(0));
      bufferRef.current.push(...codes);

      if (inputResolverRef.current) {
        const charCode = bufferRef.current.shift();
        inputResolverRef.current(charCode);
        inputResolverRef.current = null;
      }
    }
  }

  const handleTerminalClick = () => {
    if (inputResolverRef.current) { // If input is pending, there should be a resolver:
      inputPromptRef.current.focus();
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

      <div
        id="TerminalDiv"
        ref={terminalRef}
        onClick={handleTerminalClick}
      >
        <span id="OutputPromptSpan">{outputPromptString}</span>
        <input
          id="InputPromptInput"
          className="Hidden"
          ref={inputPromptRef}
          onKeyDown={handleInputPromptKeyDown}
        />
      </div>

      <div
        id="MemoryContainerDiv"
      >
      </div>
      <input
        id="PageInput"
        type="number"
        min={1}
        value={1}
      />
      <input
        id="RowDimensionInput"
        className="DimensionInput"
        type="number"
        min={1}
        value={10}
      />
      <input
        id="ColDimensionInput"
        className="DimensionInput"
        type="number"
        min={1}
        value={30}
      />
    </>
  );
}

export default App;
