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
    SetConfig(bfCode="", inputCallback, outputCallback, memSize, config)
    GetCellVal(index)
    SetCellVal(index, newVal)
    static ValidateMemArg(mem)
    static MapLoopPairs(bfCode)
    #CreateCell(index, cellVal)
    #CheckMemPtr()
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
    flowchart TD

    subgraph WatchedVal
        SetBFCode[#bfCode.Val = newVal]
        WatchedValCheckSameVal{originalVal === newVal}
    end

    subgraph BrainfuckExecuter
        Start([Set BFCode])
        EnsureString
        MapLoopPairs[mapResult = MapLoopPairs]
        SetLoopPairs[#loopPairs = mapResult.LoopPairs]
        SetLeftOutLoops[#leftOutLoops = mapResult.LeftOutLoops]
        End([End])
    end

    Start
    -->
    EnsureString
    -->
    SetBFCode
    -->
    WatchedValCheckSameVal
    --false-->
    MapLoopPairs
    -->
    SetLoopPairs
    -->
    SetLeftOutLoops
    -->
    End

    WatchedValCheckSameVal
    --true-->
    End
    ```

### CIndex

* Get CIndex

* Set CIndex
    ```mermaid
    flowchart TD

    subgraph WatchedVal
        SetCIndex[#cIndex.Val = newVal]
        WatchedValCheckSameVal{originalVal === newVal}
    end

    subgraph BrainfuckExecuter
        Start([Set CIndex])
        EnsureInt
        EnsureInRange[Ensure 0 <= newVal < BFCode.length]
        CIndexOnChangeCallback
        IsCodeEnded{CodeEnded === true}
        CodeEndedCallback
        End([End])
    end

    Start
    -->
    EnsureInt
    -->
    EnsureInRange
    -->
    SetCIndex
    -->
    WatchedValCheckSameVal
    --false-->
    CIndexOnChangeCallback
    -->
    IsCodeEnded
    --true-->
    CodeEndedCallback
    -->
    End

    WatchedValCheckSameVal
    --true-->
    End

    IsCodeEnded
    --false-->
    End
    ```

### MemPtr

* Get MemPtr

* Set MemPtr
    ```mermaid
    flowchart TD

    subgraph WatchedVal
        SetMemPtr[#memPtr.Val = newVal]
        WatchedValCheckSameVal{originalVal === newVal}
    end

    subgraph BrainfuckExecuter
        Start([Set MemPtr])
        EnsureInt
        MemPtrOnChangeCallback
        CheckMemPtr
        End([End])
    end

    Start
    -->
    EnsureInt
    -->
    SetMemPtr
    -->
    WatchedValCheckSameVal
    --false-->
    MemPtrOnChangeCallback
    -->
    CheckMemPtr
    -->
    End
    
    WatchedValCheckSameVal
    --true-->
    End
    ```

### CellMinVal

* Get CellMinVal

* Set CellMinVal
    ```mermaid
    flowchart TD

    subgraph WatchedVal
        SetCellMinVal[#cellMinVal.Val = newVal]
        WatchedValCheckSameVal{originalVal === newVal}
    end

    subgraph WrappedInt
        WrappedIntEnsureInt[Ensure newVal is int]
        WrappedIntEnsureIntValMinMax[Ensure all val, min, and max are int]
        WrappedIntEnsureMinMax1[EnsureMinMax]
        WrappedIntEnsureMinMax2[EnsureMinMax]
        SetIndCellMin[Cell.Min = newVal]
        CheckUnderflow[Flag val < min as underflow]
        CheckOverflow[Flag val > max as overflow]
        Wrap
        WasUnderflow{Was underflow}
        WasOverflow{Was overflow}
        WrappedIntValChanged{val changed?}
    end

    subgraph BrainfuckExecuter
        Start([Set CellMinVal])
        BrainfuckExecuterEnsureInt[Ensure newVal is int]
        BrainfuckExecuterEnsureMinMax[EnsureMinMax]
        ForAllCell{For Cell in #memArr}
        UnderflowCallback
        OverflowCallback
        ValOnChangeCallback
        End([End])
    end

    Start
    -->
    BrainfuckExecuterEnsureInt
    -->
    BrainfuckExecuterEnsureMinMax
    -->
    SetCellMinVal
    -->
    WatchedValCheckSameVal
    --false-->
    ForAllCell
    --Cell-->
    SetIndCellMin
    -->
    WrappedIntEnsureInt
    -->
    WrappedIntEnsureMinMax1
    -->
    CheckUnderflow
    -->
    CheckOverflow
    -->
    WrappedIntEnsureIntValMinMax
    -->
    WrappedIntEnsureMinMax2
    -->
    Wrap
    -->
    WasUnderflow
    --true-->
    UnderflowCallback
    -->
    WasOverflow
    --true-->
    OverflowCallback
    -->
    WrappedIntValChanged
    --true-->
    ValOnChangeCallback
    -->
    ForAllCell
    --End of #memArr-->
    End

    WatchedValCheckSameVal
    --true-->
    End

    WasUnderflow
    --false-->
    WasOverflow
    --false-->
    WrappedIntValChanged
    --false-->
    ForAllCell
    ```

### CellMaxVal

* Get CellMaxVal

* Set CellMaxVal
    ```mermaid
    flowchart TD

    subgraph WatchedVal
        SetCellMaxVal[#cellMaxVal.Val = newVal]
        WatchedValCheckSameVal{originalVal === newVal}
    end

    subgraph WrappedInt
        WrappedIntEnsureInt[Ensure newVal is int]
        WrappedIntEnsureIntValMinMax[Ensure all val, min, and max are int]
        WrappedIntEnsureMinMax1[EnsureMinMax]
        WrappedIntEnsureMinMax2[EnsureMinMax]
        SetIndCellMax[Cell.Max = newVal]
        CheckUnderflow[Flag val < min as underflow]
        CheckOverflow[Flag val > max as overflow]
        Wrap
        WasUnderflow{Was underflow}
        WasOverflow{Was overflow}
        WrappedIntValChanged{val changed?}
    end

    subgraph BrainfuckExecuter
        Start([Set CellMaxVal])
        BrainfuckExecuterEnsureInt[Ensure newVal is int]
        BrainfuckExecuterEnsureMinMax[EnsureMinMax]
        ForAllCell{For Cell in #memArr}
        UnderflowCallback
        OverflowCallback
        ValOnChangeCallback
        End([End])
    end

    Start
    -->
    BrainfuckExecuterEnsureInt
    -->
    BrainfuckExecuterEnsureMinMax
    -->
    SetCellMaxVal
    -->
    WatchedValCheckSameVal
    --false-->
    ForAllCell
    --Cell-->
    SetIndCellMax
    -->
    WrappedIntEnsureInt
    -->
    WrappedIntEnsureMinMax1
    -->
    CheckUnderflow
    -->
    CheckOverflow
    -->
    WrappedIntEnsureIntValMinMax
    -->
    WrappedIntEnsureMinMax2
    -->
    Wrap
    -->
    WasUnderflow
    --true-->
    UnderflowCallback
    -->
    WasOverflow
    --true-->
    OverflowCallback
    -->
    WrappedIntValChanged
    --true-->
    ValOnChangeCallback
    -->
    ForAllCell
    --End of #memArr-->
    End

    WatchedValCheckSameVal
    --true-->
    End

    WasUnderflow
    --false-->
    WasOverflow
    --false-->
    WrappedIntValChanged
    --false-->
    ForAllCell
    ```

### ConditionVal

* Get ConditionVal

* Set ConditionVal
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Set ConditionVal])
        EnsureInt
        EnsureInRange[Ensure CellMinVal <= newVal <= CellMaxVal]
        SetConditionVal[#conditionVal = newVal]
        End([End])
    end

    Start
    -->
    EnsureInt
    -->
    EnsureInRange
    -->
    SetConditionVal
    -->
    End
    ```

### LoopPairs

* Get LoopPairs

### LeftOutLoops

* Get LeftOutLoops

### MemArr

* Get MemArr

* Set MemArr
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Set MemArr])
        ValidateMemArg
        InitializeMemArr[#memArr = empty array]
        ForCond{For i in newMem.length}
        CreateCell
        PushToMemArr[#memArr.push new cell]
        CheckMemPtr
        End([End])
    end

    Start
    -->
    ValidateMemArg
    -->
    InitializeMemArr
    -->
    ForCond
    --i-->
    CreateCell
    -->
    PushToMemArr
    -->
    ForCond
    --loop ended-->
    CheckMemPtr
    -->
    End
    ```

### MemSize

* Get MemSize

* Set MemSize
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Set MemSize])
        AdjustMemSize
        End([End])
    end

    Start
    -->
    AdjustMemSize
    -->
    End
    ```

### CodeEnded

* Get CodeEnded

### CurrentCellVal

* Get CurrentCellVal

* Set CurrentCellVal
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Set CurrentCellVal])
        SetCellVal[SetCellVal with MemPtr and newVal]
        End([End])
    end

    Start
    -->
    SetCellVal
    -->
    End
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

### ValidateMemArg
```mermaid
flowchart TD

subgraph BrainfuckExecuter
    Start([ValidateMemArg])
    ForCond{For i in mem.length}
    SetVal[Get val in mem at index i]
    EnsureInt[EnsureInt val]
    End([End])
end

Start
-->
ForCond
--i-->
SetVal
-->
EnsureInt
-->
ForCond

ForCond
--loop ended-->
End
```

### MapLoopPairs
```mermaid
flowchart TD

subgraph MapLoopPairs
    Start([MapLooPairs])
    InitializeStack[Initialize empty loopHeadStack]
    InitializeLoopPairs[Initialize empty loopPairs]
    InitializeLeftOutLoops[Initialize empty leftOutLoops]
    ForCond{For i in bfCode.length}
    GetCode[Get code in bfCode at index i]
    IsHead{Code is head?}
    PushToStack[Push i to loopHeadStack]
    IsTail{Code is tail}
    HaveHeadInStack{Have head in loopHeadStack?}
    PopStack[Pop last head from stack]
    SetLoopHead[Store head = i in loopPairs]
    SetLoopTail[Store i = head in loopPairs]
    PushToLeftOut[Push i to leftOutLoops]
    PushStackToLeftOut[Push all unmapped heads to leftOutLoops]
    End([Return result])
end

Start
-->
InitializeStack
-->
InitializeLoopPairs
-->
InitializeLeftOutLoops
-->
ForCond
--i-->
GetCode
-->
IsHead
--true-->
PushToStack
-->
ForCond

IsHead
--false-->
IsTail
--true-->
HaveHeadInStack
--true-->
PopStack
-->
SetLoopHead
-->
SetLoopTail
-->
ForCond

IsTail
--false-->
ForCond

HaveHeadInStack
--false-->
PushToLeftOut
-->
ForCond
--loop ended-->
PushStackToLeftOut
-->
End
```

## Private Methods

### #CreateCell
```mermaid
flowchart TD
Start([#CreateCell])
```

### #CheckMemPtr
```mermaid
flowchart TD
Start([#CheckMemPtr])
```

### #AdjustMemSize
```mermaid
flowchart TD
Start([#AdjustMemSize])
```

### #BFDefaultCodeExecuteOperation
```mermaid
flowchart TD
Start([#BFDefaultCodeExecuteOperation])
```

## Public Methods

### constructor
```mermaid
flowchart TD
Start([constructor])
```

### SetConfig
```mermaid
flowchart TD
Start([SetConfig])
```

### GetCellVal
```mermaid
flowchart TD
Start([GetCellVal])
```

### SetCellVal
```mermaid
flowchart TD
Start([SetCellVal])
```

### SubscribeCallbacks
```mermaid
flowchart TD
Start([SubscribeCallbacks])
```

### BF_Execute
```mermaid
flowchart TD
Start([BF_Execute])
```

### BF_IncrementCellVal_Operation
```mermaid
flowchart TD
Start([BF_IncrementCellVal_Operation])
```

### BF_DecrementCellVal_Operation
```mermaid
flowchart TD
Start([BF_DecrementCellVal_Operation])
```

### BF_NextCell_Operation
```mermaid
flowchart TD
Start([BF_NextCell_Operation])
```

### BF_PrevCell_Operation
```mermaid
flowchart TD
Start([BF_PrevCell_Operation])
```

### BF_Input_Operation
```mermaid
flowchart TD
Start([BF_Input_Operation])
```

### BF_Output_Operation
```mermaid
flowchart TD
Start([BF_Output_Operation])
```
