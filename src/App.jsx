import { useState, useRef, useEffect, useMemo } from "react";
import "./App.css";

import { MemPtrOutOfRangeError, BrainfuckExecuter, BFMemoryMaxSize } from "./Executer/BrainfuckExecuter";
import { CustomError } from "./utils/CustomErrors";
import { formatBFOutput } from "./utils/bfOutputFormatter";
import useInterval from "./hooks/useInterval";

import CodeEditor from "./components/CodeEditor";
import ExecutionControls from "./components/ExecutionControls";
import CodeViewer from "./components/CodeViewer";
import MemoryViewer from "./components/MemoryViewer";
import LogViewer from "./components/LogViewer";
import TerminalPanel from "./components/TerminalPanel";

/* ─── Helpers ────────────────────────────────────────────── */

function createLogTextObj(textColor, type, text) {
  return { textColor, type, text, timestamp: new Date() };
}

/* ─── App ────────────────────────────────────────────────── */

function App() {
  /* ── Executor refs ────────────────────────────────────── */
  const bfExecuter = useRef(null);
  const bfGenerator = useRef(null);
  const inputResolver = useRef(null);
  const terminalPanelRef = useRef(null);
  const getcharLineBuffer = useRef("");

  /* ── State ────────────────────────────────────────────── */
  const [bfCode, setBFCode] = useState("");
  const [strippedBFCode, setStrippedBFCode] = useState("");
  const [bfMemorySize, setBFMemorySize] = useState(3000);
  const [codeExecIntervalMS, setCodeExecIntervalMS] = useState(10);

  const [isBFRunning, setIsBFRunning] = useState(false);
  const [isBFPaused, setIsBFPaused] = useState(false);

  const [bfMemoryChunkSize, setBFMemoryChunkSize] = useState(100);
  const [bfMemoryChunk, setBFMemoryChunk] = useState([]);
  const [memPage, setMemPage] = useState(0);
  const [cIndex, setCIndex] = useState(0);
  const [latestCellChange, setLatestCellChange] = useState({ index: null, fromVal: null, toVal: null });

  const [logTexts, setLogTexts] = useState([]);
  const [logShowLog, setLogShowLog] = useState(true);
  const [logShowWarning, setLogShowWarning] = useState(true);
  const [logShowError, setLogShowError] = useState(true);

  const [executionCount, setExecutionCount] = useState(0);

  const [inputMode, setInputMode] = useState("keypress");
  const [displayMode, setDisplayMode] = useState("corrupted");
  const [inputBuffer, setInputBuffer] = useState("");

  /* ── Refs that mirror state for stale-closure safety ─── */
  const displayModeRef = useRef(displayMode);
  useEffect(() => { displayModeRef.current = displayMode; }, [displayMode]);

  const inputModeRef = useRef(inputMode);
  useEffect(() => { inputModeRef.current = inputMode; }, [inputMode]);

  const inputBufferRef = useRef(inputBuffer);
  useEffect(() => { inputBufferRef.current = inputBuffer; }, [inputBuffer]);

  /* ── Logging helpers ──────────────────────────────────── */
  function LogText(text) {
    setLogTexts((prev) => [...prev, createLogTextObj("white", "Log", text)]);
  }
  function LogWarning(text) {
    setLogTexts((prev) => [...prev, createLogTextObj("yellow", "Warning", text)]);
  }
  function LogError(text) {
    setLogTexts((prev) => [...prev, createLogTextObj("red", "Error", text)]);
  }

  // Refs so init-useEffect callbacks can call the latest versions
  const logTextFn = useRef(LogText);
  const logWarningFn = useRef(LogWarning);
  const logErrorFn = useRef(LogError);
  useEffect(() => {
    logTextFn.current = LogText;
    logWarningFn.current = LogWarning;
    logErrorFn.current = LogError;
  });

  /* ── Terminal print helpers (via ref) ──────────────────── */
  function termPrint(text) { terminalPanelRef.current?.write(text); }
  function termPrintInput(text) { terminalPanelRef.current?.write(`\x1b[36m${text}\x1b[0m`); }
  function termPrintWarning(text) { terminalPanelRef.current?.write(`\x1b[33m${text}\x1b[0m`); }
  function termPrintError(text) { terminalPanelRef.current?.write(`\x1b[30;41m${text}\x1b[0m`); }

  /* ── Core execution logic ─────────────────────────────── */
  function LogOperation() {
    const bfExec = bfExecuter.current;
    const ci = bfExec.CIndex;
    const char = bfExec.BFCode[ci];

    if (char === ".") LogText(`[${ci}] . -> Outputing`);
    else if (char === ",") LogText(`[${ci}] , -> Waiting for input`);
    else if (char === "+") LogText(`[${ci}] + -> Incrementing`);
    else if (char === "-") LogText(`[${ci}] - -> Decrementing`);
    else if (char === ">") LogText(`[${ci}] > -> Moving Right`);
    else if (char === "<") LogText(`[${ci}] < -> Moving Left`);
    else if (char === "[") {
      const tail = bfExec.LoopPairs[ci];
      const noTail = tail === undefined;
      const skip = bfExec.CurrentCellVal === bfExec.ConditionVal;
      LogText(`[${ci}] [${noTail ? " -> Has no tail (skipped)" : ` -> Tail at ${tail} (val=${bfExec.CurrentCellVal} ${skip ? "skipped to tail" : "enter loop"})`}`);
    } else if (char === "]") {
      const head = bfExec.LoopPairs[ci];
      const noHead = head === undefined;
      const skip = bfExec.CurrentCellVal === bfExec.ConditionVal;
      LogText(`[${ci}] ]${noHead ? " -> Has no head (skipped)" : ` -> Head at ${head} (val=${bfExec.CurrentCellVal} ${skip ? "exit loop" : "back to head"})`}`);
    }
  }

  function StopAndCleanup() {
    bfGenerator.current = null;
    setIsBFRunning(false);
    LogText("Brainfuck execution stopped");
    LogText(`CIndex: ${bfExecuter.current.CIndex}`);
    LogText(`MemPtr: ${bfExecuter.current.MemPtr}`);
  }

  async function ExecuteBFCodeOnce() {
    if (!bfGenerator.current) {
      bfGenerator.current = bfExecuter.current.BF_Execute_Generator();
    }

    if (inputResolver.current) {
      setCIndex(bfExecuter.current.CIndex);
      return;
    }

    try {
      LogOperation();
      const { done } = await bfGenerator.current.next();
      setExecutionCount((prev) => prev + 1);
      if (done) StopAndCleanup();
    } catch (error) {
      setCIndex(bfExecuter.current.CIndex);

      if (error instanceof MemPtrOutOfRangeError) {
        const id = error.Identifier;
        if (id === "MemPtrUnderflow") {
          termPrintError("[MEMPTR_UNDERFLOW]");
          LogError(`MemPtr Underflow (${error.Val})`);
        } else if (id === "MemPtrOverflow") {
          termPrintError("[MEMPTR_OVERFLOW]");
          LogError(`MemPtr Overflow (${error.Val})`);
        } else {
          termPrintError(`[${id}]`);
          LogError(`[${id}]`);
        }
      } else if (error instanceof CustomError) {
        termPrintError(`[${error.Identifier}]`);
        LogError(`[${error.Identifier}]`);
      } else {
        termPrintError(error.message);
        LogError(error.message);
      }
      StopAndCleanup();
    }
  }

  /* ── Reset / Run (imperative, no useEffect cascade) ──── */
  function ResetBF() {
    bfExecuter.current.Reset();
    terminalPanelRef.current?.reset();
    inputResolver.current = null;
    getcharLineBuffer.current = "";
    setLogTexts([]);
    setCIndex(bfExecuter.current.CIndex);
    setLatestCellChange({ index: null, fromVal: null, toVal: null });
    bfGenerator.current = null;
    setExecutionCount(0);
  }

  function RunBF() {
    const stripped = BrainfuckExecuter.StripBFCode(bfCode);
    bfExecuter.current.BFCode = stripped;
    setCIndex(bfExecuter.current.CIndex);

    LogText("Starting Brainfuck execution");
    LogText(`Code: ${bfExecuter.current.BFCode}`);
    LogText(`CIndex: ${bfExecuter.current.CIndex}`);
    LogText(`Cell Size: ${bfExecuter.current.CellMaxVal - bfExecuter.current.CellMinVal + 1} (${bfExecuter.current.CellMinVal} - ${bfExecuter.current.CellMaxVal})`);
    LogText(`ConditionVal: ${bfExecuter.current.ConditionVal}`);
    LogText(`MemSize: ${bfExecuter.current.MemSize}`);
    LogText(`MemPtr: ${bfExecuter.current.MemPtr}`);

    if (!bfGenerator.current) {
      bfGenerator.current = bfExecuter.current.BF_Execute_Generator();
    }
  }

  /* ── Event handlers (imperative, no useEffect on isBFRunning) */
  function handleRun() {
    ResetBF();
    RunBF();
    setIsBFRunning(true);
    setIsBFPaused(false);
  }

  function handleStop() {
    const confirmStop = window.confirm("Are you sure you want to stop the Brainfuck execution?");
    if (!confirmStop) return;
    setIsBFRunning(false);
    setIsBFPaused(true);
    bfGenerator.current = null;
  }

  function handleRunStop() {
    if (isBFRunning) handleStop();
    else handleRun();
  }

  function handleContinuePause() {
    setIsBFPaused((prev) => !prev);
  }

  async function handleStepOnce() {
    if (!bfGenerator.current) {
      ResetBF();
      RunBF();
      setIsBFRunning(true);
      setIsBFPaused(true);
    } else {
      await ExecuteBFCodeOnce();
      setIsBFPaused(true);
    }
  }

  function handleReset() {
    ResetBF();
    setIsBFRunning(false);
  }

  /* ── Terminal data handler ────────────────────────────── */
  function HandleData(data) {
    if (!inputResolver.current) return;

    if (inputModeRef.current === "keypress") {
      termPrintInput(data);
      const intData = data.charCodeAt(0);
      LogText(`Read input: ${intData} (${data})`);
      inputResolver.current(intData);
      terminalPanelRef.current?.setCursorBlink(false);
      inputResolver.current = null;
    } else {
      // getchar mode
      if (data === "\r" || data === "\n") {
        const buf = getcharLineBuffer.current;
        if (buf.length === 0) return;

        terminalPanelRef.current?.write("\r\n");
        const firstChar = buf.charCodeAt(0);
        const rest = buf.slice(1);
        LogText(`Read input: ${firstChar} (${buf[0]})`);

        if (rest.length > 0) {
          const newBuf = inputBufferRef.current + rest;
          inputBufferRef.current = newBuf;
          setInputBuffer(newBuf);
        }

        getcharLineBuffer.current = "";
        inputResolver.current(firstChar);
        terminalPanelRef.current?.setCursorBlink(false);
        inputResolver.current = null;
      } else if (data === "\x7f") {
        // Backspace
        if (getcharLineBuffer.current.length > 0) {
          getcharLineBuffer.current = getcharLineBuffer.current.slice(0, -1);
          terminalPanelRef.current?.write("\b \b");
        }
      } else {
        getcharLineBuffer.current += data;
        termPrintInput(data);
      }
    }
  }

  /* ── Memory chunking ──────────────────────────────────── */
  function ChunkMemory(mem, offset, chunkSize) {
    setBFMemoryChunk(mem.slice(offset, offset + chunkSize));
  }

  /* ── Effects ──────────────────────────────────────────── */
  // Sync memory size to executor
  useEffect(() => {
    try {
      if (bfExecuter.current) bfExecuter.current.MemSize = Number.parseInt(bfMemorySize);
    } catch (error) {
      alert(error.message);
      setBFMemorySize(bfExecuter.current.MemSize);
    }
  }, [bfMemorySize]);

  // Sync BF code to executor
  useEffect(() => {
    if (bfExecuter.current) {
      const stripped = BrainfuckExecuter.StripBFCode(bfCode);
      bfExecuter.current.BFCode = stripped;
      setStrippedBFCode(stripped);
    }
  }, [bfCode]);

  // Update memory chunk display
  useEffect(() => {
    if (bfExecuter.current) {
      ChunkMemory(bfExecuter.current.MemArr, memPage * bfMemoryChunkSize, bfMemoryChunkSize);
    }
  }, [bfMemoryChunkSize, isBFRunning, memPage, latestCellChange, bfMemorySize]);

  // Execution interval
  useInterval(async () => {
    if (!bfGenerator.current) return;
    await ExecuteBFCodeOnce();
  }, isBFRunning && !isBFPaused ? codeExecIntervalMS : null);

  // Init executor (once)
  useEffect(() => {
    const bfExec = new BrainfuckExecuter(bfCode, bfMemorySize);
    bfExecuter.current = bfExec;

    bfExec.InputCallback = () => {
      // Check input buffer first
      if (inputBufferRef.current.length > 0) {
        const charCode = inputBufferRef.current.charCodeAt(0);
        const remaining = inputBufferRef.current.slice(1);
        inputBufferRef.current = remaining;
        setInputBuffer(remaining);
        logTextFn.current(`Read input from buffer: ${charCode} (${String.fromCharCode(charCode)})`);
        return charCode;
      }

      terminalPanelRef.current?.focus();
      terminalPanelRef.current?.setCursorBlink(true);
      return new Promise((resolve) => {
        inputResolver.current = resolve;
      });
    };

    bfExec.OutputCallback = (outputInt) => {
      const { output, isInvalid } = formatBFOutput(outputInt, displayModeRef.current);
      if (isInvalid) {
        logWarningFn.current(`Invalid output: ${outputInt} (${output})`);
      }
      logTextFn.current(`\tOutput: ${outputInt} (${output})`);
      terminalPanelRef.current?.write(output);
    };

    bfExec.CIndexOnChangeCallback = (oldVal) => {
      setCIndex(oldVal);
    };

    bfExec.MemPtrOnChangeCallback = (oldVal, newVal, exec) => {
      const char = exec.BFCode[exec.CIndex];
      const cellVal = exec.CurrentCellVal;

      if (char === "<") logTextFn.current(`\tMemPtr moving left: ${oldVal} -> ${newVal}`);
      else if (char === ">") logTextFn.current(`\tMemPtr moving right: ${oldVal} -> ${newVal}`);
      else logTextFn.current(`\tMemPtr changed: ${oldVal} -> ${newVal}`);

      setLatestCellChange({ index: newVal, fromVal: cellVal, toVal: cellVal });
    };

    bfExec.MemCellOnChangeCallback = (index, oldVal, newVal, exec) => {
      const char = exec.BFCode[exec.CIndex];

      if (char === "+") logTextFn.current(`\tCell[${index}] incremented: ${oldVal} -> ${newVal}`);
      else if (char === "-") logTextFn.current(`\tCell[${index}] decremented: ${oldVal} -> ${newVal}`);
      else logTextFn.current(`\tCell[${index}] changed: ${oldVal} -> ${newVal}`);

      setLatestCellChange({ index, fromVal: oldVal, toVal: newVal });
    };
  }, []);

  /* ── Derived values ───────────────────────────────────── */
  const memPtr = bfExecuter.current?.MemPtr ?? 0;
  const memSize = bfExecuter.current?.MemSize ?? bfMemorySize;

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="app-layout">
      <ExecutionControls
        isBFRunning={isBFRunning}
        isBFPaused={isBFPaused}
        onRunStop={handleRunStop}
        onContinuePause={handleContinuePause}
        onStepOnce={handleStepOnce}
        onReset={handleReset}
        codeExecIntervalMS={codeExecIntervalMS}
        setCodeExecIntervalMS={setCodeExecIntervalMS}
        bfMemorySize={bfMemorySize}
        setBFMemorySize={setBFMemorySize}
        maxMemorySize={BFMemoryMaxSize}
        inputMode={inputMode}
        setInputMode={setInputMode}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        executionCount={executionCount}
      />

      <CodeEditor
        bfCode={bfCode}
        onCodeChange={setBFCode}
        disabled={isBFRunning}
      />

      <CodeViewer
        bfExecuter={bfExecuter.current}
        cIndex={cIndex}
        strippedBFCode={strippedBFCode}
      />

      <MemoryViewer
        bfMemoryChunk={bfMemoryChunk}
        memPage={memPage}
        setMemPage={setMemPage}
        bfMemoryChunkSize={bfMemoryChunkSize}
        setBFMemoryChunkSize={setBFMemoryChunkSize}
        memPtr={memPtr}
        memSize={memSize}
        isBFRunning={isBFRunning}
      />

      <TerminalPanel
        ref={terminalPanelRef}
        onData={HandleData}
        inputBuffer={inputBuffer}
        onInputBufferChange={setInputBuffer}
        showInputBuffer={true}
      />

      <LogViewer
        logTexts={logTexts}
        logShowLog={logShowLog}
        setLogShowLog={setLogShowLog}
        logShowWarning={logShowWarning}
        setLogShowWarning={setLogShowWarning}
        logShowError={logShowError}
        setLogShowError={setLogShowError}
      />
    </div>
  );
}

export default App;
