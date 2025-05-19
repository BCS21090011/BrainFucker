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

    Start([Set ConditionVal])
    EnsureInt
    EnsureInRange[Ensure CellMinVal <= newVal <= CellMaxVal]
    SetConditionVal[#conditionVal = newVal]
    End([End])

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

    Start([Set MemArr])
    ValidateMemArg
    InitializeMemArr[#memArr = empty array]
    ForCond{For i in newMem.length}
    CreateCell
    PushToMemArr[#memArr.push new cell]
    CheckMemPtr
    End([End])

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

    Start([Set MemSize])
    AdjustMemSize[#AdjustMemSize]
    End([End])

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

    Start([Set CurrentCellVal])
    SetCellVal[SetCellVal with MemPtr and newVal]
    End([End])

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

Start([ValidateMemArg])
ForCond{For i in mem.length}
SetVal[Get val in mem at index i]
EnsureInt[EnsureInt val]
End([End])

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
End([Return new WrappedInt with provided cell value, BrainfuckExecuter object's CellMinVal, CellMaxVal, CellUnderflowCallback, CellOverflowCallback, MemCellOnChangeCallback, and MemCellOnSetCallback])

Start
-->
End
```

### #CheckMemPtr
```mermaid
flowchart TD

Start([#CheckMemPtr])
InitializeFlag[Initialize passed as true]
IsMemPtrUnderflow{MemPtr < 0}
FlagUnderflow[passed = false]
MemPtrUnderflowCallback
IsMemPtrOverflow{MemPtr >= MemSize}
FlagOverflow[passed = false]
MemPtrOverflowCallback
End([Return passed])

Start
-->
InitializeFlag
-->
IsMemPtrUnderflow
--true-->
FlagUnderflow
-->
MemPtrUnderflowCallback
-->
IsMemPtrOverflow
--true-->
FlagOverflow
-->
MemPtrOverflowCallback
-->
End

IsMemPtrUnderflow
--false-->
IsMemPtrOverflow
--false-->
End
```

### #AdjustMemSize
```mermaid
flowchart TD

Start([#AdjustMemSize])
EnsureIntMemSize[Ensure memSize is int]
EnsureInRangeMemSize[Ensure 1 <= memSize <= BFMemoryMaxSize]
SetDefaultDefaultVal[Set defaultVal to CellMinVal if not provided]
EnsureIntDefaultVal[Ensure defaultVal is int]
EnsureInRangeDefaultVal[Ensure CellMinVal <= defaultVal <= CellMaxVal]
SetCurrentMemSize[currentMemSize = MemSize before changes]
CalcDiff[diff = currentMemSize - new memSize]
IsMemSizeLarger{diff < 0}
ForCond{For i = currentMemSize, until i < new memSize}
CreateAndPushNewCell[#CreateCell and push to #memArr]
IsMemSizeSmaller{diff > 0}
SpliceMemArr[Splice the extra cells in #memArr]
CheckMemPtr[#CheckMemPtr]
End([End])

Start
-->
EnsureIntMemSize
-->
EnsureInRangeMemSize
-->
SetDefaultDefaultVal
-->
EnsureIntDefaultVal
-->
EnsureInRangeDefaultVal
-->
SetCurrentMemSize
-->
CalcDiff
-->
IsMemSizeLarger
--true-->
ForCond
--i-->
CreateAndPushNewCell
-->
ForCond
--loop ended-->
CheckMemPtr
-->
End

IsMemSizeLarger
--false-->
IsMemSizeSmaller
--true-->
SpliceMemArr
-->
CheckMemPtr

IsMemSizeSmaller
--false-->
CheckMemPtr
```

### #BFDefaultCodeExecuteOperation
```mermaid
flowchart TD

Start([#BFDefaultCodeExecuteOperation])
GetCIndex[cIndex = CIndex]
CheckInc{code === '+'}
BF_IncrementCellVal_Operation
CheckDec{code === '-'}
BF_DecrementCellVal_Operation
CheckNext{code === '>'}
BF_NextCell_Operation
CheckPrev{code === '<'}
BF_PrevCell_Operation
CheckInput{code === ','}
BF_Output_Operation
CheckOutput{code === '.'}
BF_Input_Operation
CheckLoopHead{code === '【'}
CheckCondPass{CurrentCellVal === ConditionVal}
HeadSetCIndex[cIndex = LoopPairs with cIndex]
CheckLoopTail{code === '】'}
CheckCondFail{CurrentCellVal !== ConditionVal}
TailSetCIndex[cIndex = LoopPairs with cIndex]
End([Return cIndex + 1])

Start
-->
GetCIndex
-->
CheckInc
--false-->
CheckDec
--false-->
CheckNext
--false-->
CheckPrev
--false-->
CheckOutput
--false-->
CheckInput
--false-->
CheckLoopHead
--false-->
CheckLoopTail
--false-->
End

CheckInc
--true-->
BF_IncrementCellVal_Operation
-->
End

CheckDec
--true-->
BF_DecrementCellVal_Operation
-->
End

CheckNext
--true-->
BF_NextCell_Operation
-->
End

CheckPrev
--true-->
BF_PrevCell_Operation
-->
End

CheckOutput
--true-->
BF_Output_Operation
-->
End

CheckInput
--true-->
BF_Input_Operation
-->
End

CheckLoopHead
--true-->
CheckCondPass
--true-->
HeadSetCIndex
-->
End

CheckLoopTail
--true-->
CheckCondFail
--true-->
TailSetCIndex
-->
End

CheckCondPass
--false-->
End

CheckCondFail
--false-->
End
```

## Public Methods

### constructor
```mermaid
flowchart TD

Start([constructor])
CheckInputCallback{InputCallback not provided?}
InpThrowCustomMissingArgumentError[Throw CustomMissingArgumentError]
CheckOutputCallback{OutputCallback not provided?}
OutThrowCustomMissingArgumentError[Throw CustomMissingArgumentError]
CheckMemMemSize{Both mem and memSize are not provided?}
MemThrowCustomMissingArgumentError[Throw CustomMissingArgumentError]
SetConfig
End([End])

Start
-->
CheckInputCallback
--true-->
InpThrowCustomMissingArgumentError
-->
CheckOutputCallback
--true-->
OutThrowCustomMissingArgumentError
-->
CheckMemMemSize
--true-->
MemThrowCustomMissingArgumentError
-->
SetConfig
-->
End

CheckInputCallback
--false-->
CheckOutputCallback
--false-->
CheckMemMemSize
--false-->
SetConfig
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
