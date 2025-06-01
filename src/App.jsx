import { useState, useRef, useEffect, useCallback } from "react";
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
  const [memSize, setMemSize] = useState(30000); // Size of memory cells
  const [page, setPage] = useState(1);  // Current page number for memory display
  const [rowDimension, setRowDimension] = useState(10); // Rows in memory display
  const [colDimension, setColDimension] = useState(30); // Columns in memory display
  const [memPtr, setMemPtr] = useState(0);  // Current code index in BF code execution
  const [currentCellVal, setCurrentCellVal] = useState(0);  // Current value of the memory cell at MemPtr
  const [maxPage, setMaxPage] = useState(0);  // Max page number for memory display

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
    ChunkMemory();
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

    bf.MemPtrUnderflowCallback = (val) => {
      alert(`Memory pointer (${val}) underflow! Resetting to 0.`);
      bf.MemPtr = 0;  // Reset memory pointer to 0
      setMemPtr(0);
    }

    bf.MemPtrOverflowCallback = (val) => {
      const maxMemPtr = bf.MemSize - 1;
      alert(`Memory pointer (${val}) overflow! Resetting to ${maxMemPtr}.`);
      bf.MemPtr = maxMemPtr;  // Reset memory pointer to maxMemPtr
      setMemPtr(maxMemPtr);
    }
  }, []);

  const HandleMemPtrChange = useCallback((oldVal, newVal) => {
    if (newVal >= 0 && newVal < memSize) {
      setCurrentCellVal(bfRef.current.CurrentCellVal);
      setMemPtr(bfRef.current.MemPtr);
    }
  }, [rowDimension, colDimension, memSize]);

  useEffect(() => {
    bfRef.current.MemPtrOnChangeCallback = HandleMemPtrChange;
  }, [HandleMemPtrChange]);
  
  useEffect(() => {
      const bf = bfRef.current;

      const dimension = rowDimension * colDimension;

      const page = Math.floor(bf.MemPtr / dimension) + 1;
      const inputMaxPage = Math.floor((memSize - 1) / dimension) + 1;

      setPage(page);
      setMaxPage(inputMaxPage);
  }, [rowDimension, colDimension, memSize]);

  // --- Handle "Apply Code" click: load textarea content into BF engine ---
  const handleApplyCode = () => {
    const bf = bfRef.current;
    const code = bfCodeTextareaRef.current?.value ?? "";
    bf.BFCode = code;
    ResetBFExecuter();
    setOutputPromptString("");
  };

  const handleMemSizeChange = (e) => {
    const newSize = Number(e.target.value);
    const bf = bfRef.current;

    if (isNaN(newSize)) return;

    if (newSize <= 0 || newSize > 30000) {
      alert(`Memory size (${newSize}) must be between 1 and 30000!`);
    }
    else {
      setMemSize(newSize);
      bf.MemSize = newSize;
      ChunkMemory();
    }
  };

  // --- Run execution until completion ---
  const handleExecuteAll = async () => {
    const bf = bfRef.current;
    await bf.BF_Execute_Until_End();
    ChunkMemory();
  };

  const handleExecuteOnce = async () => {
    const bf = bfRef.current;
    await bf.BF_Execute();
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
  };

  const handleTerminalClick = () => {
    if (inputResolverRef.current) { // If input is pending, there should be a resolver:
      inputPromptRef.current.focus();
    }
  };

  const handleMemPtrInputChange = (e) => {
    const newMemPtr = Number(e.target.value);
    const bf = bfRef.current;

    if (isNaN(newMemPtr)) return; // Ignore empty or non-numeric input

    if (newMemPtr < 0 || newMemPtr > bf.MemSize - 1) {
      alert(`Memory pointer (${newMemPtr}) out of bounds!`);
    }
    else {
      bf.MemPtr = newMemPtr;
      ChunkMemory();
    }
  };

  const handleCurrentCellValInputChange = (e) => {
    let newVal = Number(e.target.value);
    const bf = bfRef.current;

    if (isNaN(newVal)) return;

    bf.CurrentCellVal = newVal;
    newVal = bf.CurrentCellVal;
    setCurrentCellVal(newVal);
    ChunkMemory();
  };

  return (
    <>
      <div id="ContainerDiv">
        <div id="ActionDiv">
          <div id="ConfigDiv">
            <div id="ConfigActionDiv">
              <input
                type="number"
                min={1}
                max={30000}
                value={memSize}
                onChange={handleMemSizeChange}
              />
              <button onClick={handleApplyCode}>Apply BF code</button>
              <button onClick={handleExecuteOnce}>Execute once</button>
              <button onClick={handleExecuteAll}>Execute until end</button>
            </div>
            <textarea
              id="BFCodeTextarea"
              ref={bfCodeTextareaRef}
              placeholder="Enter your Brainfuck code here..."
            />
          </div>
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
      </div>
      <input
        id="PageInput"
        type="number"
        ref={pageInputRef}
        min={1}
        max={maxPage}
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
          setCurrentCellVal(bfRef.current.CurrentCellVal);
          ChunkMemory();
        }}>Increment</button>
        <button onClick={() => {
          bfRef.current.BF_DecrementCellVal_Operation();
          setCurrentCellVal(bfRef.current.CurrentCellVal);
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
        <button onClick={async () => {
          await bfRef.current.BF_Input_Operation();
          ChunkMemory();
        }}>Input</button>
        <button onClick={async () => {
          await bfRef.current.BF_Output_Operation();
          ChunkMemory();
        }}>Output</button>
      </div>
      <div>
        <input
          type="number"
          min={0}
          max={memSize - 1}
          value={memPtr}
          onChange={handleMemPtrInputChange}
        />
        <input
          type="number"
          value={currentCellVal}
          onChange={handleCurrentCellValInputChange}
        />
      </div>
    </>
  );
}

export default App;
