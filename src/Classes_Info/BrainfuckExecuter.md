# [BrainfuckExecuter](./src/Executer/BrainfuckExecuter.js)

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

## Private Properties

### #bfCode

### #cIndex

### #memPtr

### #cellMinVal

### #cellMaxVal

### #conditionVal

### #loopPairs

### #leftOutLoops

### #memArr

## Public Properties

### BFCode

* Get BFCode

* Set BFCode
    ```mermaid
    flowchart

    Start([Set BFCode])
    -->
    EnsureString
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

### CIndex

* Get CIndex

* Set CIndex
    ```mermaid
    flowchart

    Start([Set CIndex])
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

### MemPtr

* Get MemPtr

* Set MemPtr
    ```mermaid
    flowchart

    Start([Set MemPtr])
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

### CellMinVal

* Get CellMinVal

* Set CellMinVal
    ```mermaid
    flowchart

    Start([Set CellMinVal])
    -->
    EnsureInt
    -->
    EnsureMinMax
    -->
    SetcellMinVal[Set #cellMinVal.Val]
    -->
    LoopCond{for cell in #memArr}
    -->
    SetCellMin[Set cell.Min]
    -->
    LoopCond
    SetCellMin
    -->
    End([End])
    ```

### CellMaxVal

* Get CellMaxVal

* Set CellMaxVal
    ```mermaid
    flowchart

    Start([Set CellMaxVal])
    -->
    EnsureInt
    -->
    EnsureMinMax
    -->
    SetcellMaxVal[Set #cellMaxVal.Val]
    -->
    LoopCond{for cell in #memArr}
    -->
    SetCellMax[Set cell.Max]
    -->
    LoopCond
    SetCellMax
    -->
    End([End])
    ```

### ConditionVal

* Get ConditionVal

* Set ConditionVal
    ```mermaid
    flowchart

    Start([Set ConditionVal])
    -->
    End([End])
    ```

### LoopPairs

* Get LoopPairs

### LeftOutLoops

* Get LeftOutLoops

### MemArr

* Get MemArr

* Set MemArr
    ```mermaid
    flowchart

    Start([Set MemArr])
    -->
    End([End])
    ```

### MemSize

* Get MemSize

* Set MemSize
    ```mermaid
    flowchart

    Start([Set MemSize])
    -->
    End([End])
    ```

### CodeEnded

* Get CodeEnded

### CurrentCellVal

* Get CurrentCellVal

* Set CurrentCellVal
    ```mermaid
    flowchart

    Start([Set CurrentCellVal])
    -->
    End([End])
    ```

## Callbacks

### InputCallback

### OutputCallback

### CIndexOnChangeCallback

### MemPtrOnChangeCallback

### MmePtrUnderflowCallback

### MemPtrOverflowCallback

### CodeEndedCallback

### CellUnderflowCallback

### CellOverflowCallback

### MemCellOnChangeCallback

### MemCellOnSetCallback

### CodeExecuteOperation

## Static Methods

### ValidateMemArg(mem)

### MapLoopPairs(bfCode)

## Private Methods

### #CreateCell
```mermaid
flowchart
Start([#CreateCell])
-->
End([End])
```

### #AdjustMemSize
```mermaid
flowchart
Start([#AdjustMemSize])
-->
End([End])
```

### #BFDefaultCodeExecuteOperation
```mermaid
flowchart
Start([#BFDefaultCodeExecuteOperation])
-->
End([End])
```

## Public Methods

### Constructor
```mermaid
flowchart

Start([Constructor])
-->
SetConfig
-->
End([End])
```

### SetConfig
```mermaid
flowchart
Start([SetConfig])
-->
End([End])
```

### GetCellVal
```mermaid
flowchart
Start([GetCellVal])
-->
End([End])
```

### SetCellVal
```mermaid
flowchart
Start([SetCellVal])
-->
End([End])
```

### SubscribeCallbacks
```mermaid
flowchart
Start([SubscribeCallbacks])
-->
End([End])
```

### BF_Execute
```mermaid
flowchart
Start([BF_Execute])
-->
End([End])
```

### BF_IncrementCellVal_Operation
```mermaid
flowchart
Start([BF_IncrementCellVal_Operation])
-->
End([End])
```

### BF_DecrementCellVal_Operation
```mermaid
flowchart
Start([BF_DecrementCellVal_Operation])
-->
End([End])
```

### BF_NextCell_Operation
```mermaid
flowchart
Start([BF_NextCell_Operation])
-->
End([End])
```

### BF_PrevCell_Operation
```mermaid
flowchart
Start([BF_PrevCell_Operation])
-->
End([End])
```

### BF_Input_Operation
```mermaid
flowchart
Start([BF_Input_Operation])
-->
End([End])
```

### BF_Output_Operation
```mermaid
flowchart
Start([BF_Output_Operation])
-->
End([End])
```
