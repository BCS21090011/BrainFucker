import { useState } from "react";
import "./App.css";

function App() {
  const [bfCode, set_bfCode] = useState("")
  const [memArrSize, set_memArrSize] = useState(30000)
  const [cIndex, set_cIndex] = useState(0)
  const [memPtr, set_memPtr] = useState(1000)

  function HandleCodeChange (e) {
    const newCode = e.target.value;
    set_bfCode(newCode);

    if (cIndex >= newCode.length) {
      set_cIndex(Math.max(newCode.length - 1, 0));
    }
  }

  function HandleMemSizeChange (e) {
    const newSize = parseInt(e.target.value) || 0;
    set_memArrSize(newSize);

    if (memPtr >= newSize) {
      set_memPtr(Math.max(newSize - 1, 0));
    }
  }

  return (
    <>
      <div id="UserInputsDiv">
        <label id="BF_Code_TA_Lbl">
          Brainfuck Code:
          <textarea
            id="BF_Code_TA"
            value={bfCode}
            onChange={HandleCodeChange}
          />
        </label>

        <label id="MemoryArraySize_input_Lbl">
          Memory Array Size:
          <input
            id="MemoryArraySize_input"
            type="number"
            min={0}
            max={30000}
            step={1}
            value={memArrSize}
            onChange={HandleMemSizeChange}
          />
        </label>

        <label id="CodeIndex_input_Lbl">
          Code Index (0 ~ {Math.max(bfCode.length - 1, 0)}):
          <input
            id="CodeIndex_input"
            type="number"
            min={0}
            max={Math.max(bfCode.length - 1, 0)}
            step={1}
            value={cIndex}
            onChange={e => set_cIndex(Number(e.target.value))}
          />
        </label>

        <label id="MemPtr_input_Lbl">
          Memory Pointer (0 ~ {Math.max(memArrSize - 1, 0)}):
          <input
            id="MemPtr_input"
            type="number"
            min={0}
            max={Math.max(memArrSize - 1, 0)}
            step={1}
            value={memPtr}
            onChange={e => set_memPtr(Number(e.target.value))}
          />
        </label>
      </div>
    </>
  )
}

export default App
