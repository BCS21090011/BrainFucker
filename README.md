# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## [BrainfuckExecuter](./src/Executer/BrainfuckExecuter.js)

```mermaid
classDiagram

class BrainfuckExecuter {
    WatchedVal #bfCode
    str BFCode
    WatchedVal #cIndex
    int CIndex
    WatchedVal #memPtr
    int MemPtr
    WatchedVal #cellMinVal
    int CellMinVal
    WatchedVal #cellMaxVal
    int CellMaxVal

    int #conditionVal
    int ConditionVal
    obj #loopPairs
    obj LoopPairs
    arr #leftOutLoops
    arr LeftOutLoops
    arr #memArr
    arr MemArr

    int MemSize
    bool CodeEnded
    int CurrentCellVal

    InputCallback
    OutputCallback
    CIndexOnChangeCallback
    MemPtrOnChangeCallback
    MmePtrUnderflowCallback
    MemPtrOverflowCallback
    CodeEndedCallback
    CellUnderflowCallback
    CellOverflowCallback
    MemCellOnChangeCallback
    MemCellOnSetCallback
    CodeExecuteOperation

    constructor(bfCode="", inputCallback, outputCallback, memSize, config)
    SetConfig()
    GetCellVal(index)
    SetCellVal(index, newVal)
    static ValidateMemArg(mem)
    static MapLoopPairs(bfCode)
    #CreateCell(index, cellVal)
    #AdjustMemSize(memSize, defaultVal)
    SubscribeCallbacks(all callbacks)

    #BFDefaultCodeExecuteOperation(code)
    BF_Execute()
    BF_IncrementCellVal_Operation()
    BF_DecrementCellVal_Operation()
    BF_NextCell_Operation()
    BF_PrevCell_Operation()
    BF_Input_Operation()
    BF_Output_Operation()
}
```

### Constructor

```mermaid
flowchart

Start([Constructor])
-->
SetConfig
-->
End([End])
```

### Set BFCode

```mermaid
flowchart

Start([bfCode changes])
-->
SetbfCode[Set #bfCode.Val]
-->
MapLoopPairs
-->
SetLoopPairsLeftOutLoops[
Set loopPairs
Set leftOutLoops
]
-->
CodeEnded{CodeEnded?}
--true-->
CodeEndedCallback
-->
End([End])
CodeEnded
--false-->
End
```

### Set CIndex

```mermaid
flowchart

Start([CIndex changes])
-->
EnsureInt
-->
EnsureInRange
-->
SetcIndex[Set #cIndex.Val]
-->
CIndexOnChangeCallback
-->
End([End])
```

### Set MemPtr

```mermaid
flowchart

Start([MemPtr changes])
-->
EnsureInt
-->
SetmemPtr[Set #memPtr.Val]
-->
MemPtrOnChangeCallback
-->
SmallerCheck{<0}
--true-->
MemPtrUnderflowCallback
-->
LargerCheck
SmallerCheck
--false--> 
LargerCheck{>=MemSize}
--true-->
MemPtrOverflowCallback
-->
End([End])
LargerCheck
--false-->
End
```

### Set CellMinVal
```mermaid
flowchart

Start([CellMinVal changes])
EnsureInt
```

### Set CellMaxVal
```mermaid
flowchart


```