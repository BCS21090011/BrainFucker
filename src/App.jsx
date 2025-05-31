import { useState, useRef, useEffect } from "react";
import "./App.css";
import "./App_My.css";

import BrainfuckExecuter from "./Executer/BrainfuckExecuter";

function App() {
  // --- DOM refs ---
  const bfCodeTextareaRef = useRef(null);   // Reference to <textarea> for code input
  const terminalRef = useRef(null);         // Reference to the terminal container
  const inputPromptRef = useRef(null);  // Reference to the input prompt
  const pageInputRef = useRef(null); // Reference to the page input
  const rowDimensionInputRef = useRef(null); // Reference to the row dimension input
  const colDimensionInputRef = useRef(null); // Reference to the column dimension input

  // --- Persistent BrainfuckExecuter instance ---
  const bfRef = useRef(new BrainfuckExecuter()); // Holds 1 instance across renders

  // --- UI state for terminal output display ---
  const [outputPromptString, setOutputPromptString] = useState("");
  const [page, setPage] = useState(1);  // Current page number for memory display
  const [rowDimension, setRowDimension] = useState(10); // Rows in memory display
  const [colDimension, setColDimension] = useState(30); // Columns in memory display

  const [chunkedMem, setChunkedMem] = useState([]); // Memory cells chunked for display

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

  const ChunkMemory = () => {
    const bf = bfRef.current;
    const mem = bf.MemArr;

    const cellsPerPage = rowDimension * colDimension;
    const start = (page - 1) * cellsPerPage;
    const pageCells = mem.slice(start, start + cellsPerPage);

    // Chunk into 2D array with row and col dimension:
    const chunk = [];

    for (let r = 0; r < rowDimension; r++) {
      const row = pageCells.slice(r * colDimension, (r + 1) * colDimension);
      chunk.push(row);
    }

    setChunkedMem(chunk);
  }

  useEffect(ChunkMemory, [page, rowDimension, colDimension, outputPromptString]);

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
    ChunkMemory();
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
        <table className="MemTable">
          <tbody className="MemTableBody">
            {chunkedMem.map((row, rIndex) => {
              return (
                <tr key={rIndex} className="MemTableRow">
                  {row.map((val, colIndex) => {
                    const dimension = rowDimension * colDimension;
                    const currentPageStart = (page - 1) * dimension;
                    const currentRowStart = rIndex * colDimension;
                    const index = currentPageStart + currentRowStart + colIndex;

                    const bf = bfRef.current;

                    return (
                      <td key={colIndex} className={`MemCell${index === bf.MemPtr ? " ActiveCell" : ""}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <input
        id="PageInput"
        type="number"
        ref={pageInputRef}
        min={1}
        value={page}
        onChange={(e) => setPage(Number(e.target.value))}
      />
      <input
        id="RowDimensionInput"
        className="DimensionInput"
        type="number"
        ref={rowDimensionInputRef}
        min={1}
        value={rowDimension}
        onChange={(e) => setRowDimension(Number(e.target.value))}
      />
      <input
        id="ColDimensionInput"
        className="DimensionInput"
        type="number"
        ref={colDimensionInputRef}
        min={1}
        value={colDimension}
        onChange={(e) => setColDimension(Number(e.target.value))}
      />
      <div>
        <button onClick={() => {
          bfRef.current.BF_IncrementCellVal_Operation();
          ChunkMemory();
        }}>Increment</button>
        <button onClick={() => {
          bfRef.current.BF_DecrementCellVal_Operation();
          ChunkMemory();
        }}>Decrement</button>
        <button onClick={() => {
          bfRef.current.BF_NextCell_Operation();
          ChunkMemory();
        }}>Next cell</button>
        <button onClick={() => {
          bfRef.current.BF_PrevCell_Operation();
          ChunkMemory();
        }}>Previous cell</button>
        <button onClick={() => {
          bfRef.current.BF_Input_Operation();
          ChunkMemory();
        }}>Input</button>
        <button onClick={() => {
          bfRef.current.BF_Output_Operation();
          ChunkMemory();
        }}>Output</button>
      </div>
    </>
  );
}

export default App;
