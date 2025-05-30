# [BrainfuckExecuter](/src/Executer/BrainfuckExecuter.js)

This class should and will only execute brainfuck. Can be interact with using callbacks.

```mermaid
classDiagram

class BrainfuckExecuter {
    -WatchedVal #bfCode
    +str BFCode
    -WatchedVal #cIndex
    +int CIndex
    -WatchedVal #memPtr
    +int MemPtr
    -WatchedVal #cellMinVal
    +int CellMinVal
    -WatchedVal #cellMaxVal
    +int CellMaxVal

    -int #conditionVal
    +int ConditionVal
    -obj #loopPairs
    +obj LoopPairs
    -arr #leftOutLoops
    +arr LeftOutLoops
    -arr #memArr
    +arr MemArr

    +int MemSize
    +bool CodeEnded
    +int CurrentCellVal
    +AllCellVal

    +InputCallback
    +OutputCallback
    +CIndexOnChangeCallback
    +MemPtrOnChangeCallback
    +MemPtrUnderflowCallback
    +MemPtrOverflowCallback
    +CodeEndedCallback
    +CellUnderflowCallback
    +CellOverflowCallback
    +MemCellOnChangeCallback
    +MemCellOnSetCallback
    +CodeExecuteOperation

    +constructor(bfCode="", memSize, config)
    +SetConfig(bfCode="", memSize, config)
    +SetAllCellVal(newVal)
    +GetCellVal(index)
    +SetCellVal(index, newVal)
    +ValidateMemArg(mem)$
    +MapLoopPairs(bfCode)$
    -#CreateCell(index, cellVal)
    -#CheckMemPtr()
    -#AdjustMemSize(memSize, defaultVal)
    +SubscribeCallbacks(all callbacks)
    +toJSON()
    +Copy(includeCallbacks)

    -async #BFDefaultCodeExecuteOperation(code)
    +async BF_Execute()
    +BF_IncrementCellVal_Operation()
    +BF_DecrementCellVal_Operation()
    +BF_NextCell_Operation()
    +BF_PrevCell_Operation()
    +async BF_Input_Operation()
    +async BF_Output_Operation()
}
```

## Constants

## BFMemoryMaxSize

* Value is 30000.
* The maximum cell a `BrainfuckExecuter` can have.

## Private Properties

### #bfCode

* Private `WatchedVal` type string.
* Stores the brainfuck code to be, or already, executed.
* Default to empty string (`""`).
* When the value changes, *[loop pairs](#looppairs-1)* and *[left-out loops](#leftoutloops-1)* will be remaped.
* Changing this will **not** change the CIndex.
* Exposed by [`BFCode`](#bfcode-1) with getter and setter.

### #cIndex

* Private `WatchedVal` type integer.
* This index points to the current code to be executed.
* The value can be any integer, not limited within 0 and [`BFCode`](#bfcode).
* Default to 0.
* When the value changes, [`CIndexOnChangeCallback`](#cindexonchangecallback) will be called, and if it is larger or equal to [`BFCode`](#bfcode), [`CodeEndedCallback`](#codeendedcallback) will be called.
* Will be affected by [`BF_Execute`](#bf_execute), which is the return value of [`CodeExecuteOperation`](#codeexecuteoperation), if that callback is provided.
* Exposed by [`CIndex`](#cindex-1) with getter and setter.

### #memPtr

* Private `WatchedVal` type integer.
* This points to the current cell in [`#memArr`](#memarr).
* Limited by the [`MemSize`](#memsize).
* Default to 0.
* When the value changes, [`MemPtrOnChangeCallback`](#memptronchangecallback) will be called, and if it is underflowed (smaller than 0) or overflowed (larger or equal to [`MemSize`](#memsize)), [`MemPtrUnderflowCallback`](#memptrunderflowcallback) or [`MemPtrOverflowCallback`](#memptroverflowcallback) will be called respectively.
* Will be affected by [`BF_NextCell_Operation`](#bf_nextcell_operation) and [`BF_PrevCell_Operation`](#bf_prevcell_operation).
* When be affected when [`MemArr`](#memarr-1) and [`MemSize`](#memsize) changes.
* Exposed by [`MemPtr`](#memptr-1) with getter and setter.

### #cellMinVal

* Private `WatchedVal` type integer.
* This is the min boundary of cells in [`#memArr`](#memarr) (inclusive).
* This property is for custom Brainfuck behaviour.
* Value is not limited, but must be smaller or equal to [`CellMaxVal`](#cellmaxval-1).
* Default to 0.
* When the value changes, the min of **all** cells in [`#memArr`](#memarr) will be changed, which might changes the value of each cell, and if the new value underflowed, overflowed, or changed, [`CellUnderflowCallback`](#cellunderflowcallback), [`CellOverflowCallback`](#celloverflowcallback), and [`MemCellOnChangeCallback`](#memcellonchangecallback) will be called respectively.
* This property, with [`#cellMaxVal`](#cellmaxval), [`AllCelVal`](#allcellval), and [`SetAllCellVal`](#setallcellval) are the only members that will affect every cells in [`#memArr`](#memarr).
* Brainfuck execution operations will not affect this property.
* Exposed by [`CellMinVal`](#cellminval-1) with getter and setter.

### #cellMaxVal

* Private `WatchedVal` type integer.
* This is the max boundary of cells in [`#memArr`](#memarr) (inclusive).
* This property is for custom Brainfuck behaviour.
* Value is not limited, but must be larger or equal to [`CellMinVal`](#cellminval-1).
* Default to 255.
* When the value changes, the max of **all** cells in [`#memArr`](#memarr) will be changed, which might changes the value of each cell, and if the new value underflowed, overflowed, or changed, [`CellUnderflowCallback`](#cellunderflowcallback), [`CellOverflowCallback`](#celloverflowcallback), and [`MemCellOnChangeCallback`](#memcellonchangecallback) will be called respectively.
* This property, with [`#cellMinVal`](#cellminval), [`AllCelVal`](#allcellval), and [`SetAllCellVal`](#setallcellval) are the only members that will affect every cells in [`#memArr`](#memarr).
* Brainfuck execution operations will not affect this property.
* Exposed by [`CellMaxVal`](#cellmaxval-1) with getter and setter.

### #conditionVal

* Private integer.
* This is the condition value, used in loop checking in [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation).
* Default to 0.
* The value is not limited, as long as it is an integer.
* The changing of this property will not affect anything, except how loop will behave in [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation).
* Brainfuck execution operations will not affect this property.
* Exposed by [`ConditionVal`](#conditionval-1) with getter and setter.
* The reason I didn't throw error for out-of-range conditionVal is because it will increase the complexity when setting [`CellMinVal`](#cellminval-1) and [`CellMaxVal`](#cellmaxval-1).
* In other word, this is a feature to allow never ending loop.
* User will need to ensure this value is correct to prevent infinity loop, so be aware when setting [`CellMinVal`](#cellminval-1) and [`CellMaxVal`](#cellmaxval-1).

### #loopPairs

* Private JavaScript object.
* This stores all pairs of *loop heads* (`[`) and *loop tails* (`]`) in [`BFCode`](#bfcode-1) by index (integer), which is where they jump to.
* Bi-directional.
* Default to empty.
* Can only be changed (re-mapped) when [`BFCode`](#bfcode-1) changes.
* The changing of this property will not affect anything, except how loop will behave in [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation).
* Brainfuck execution operations will not affect this property.
* Exposed by [`LoopPairs`](#looppairs-1) with getter **only** (can't be setted).

### #leftOutLoops

* Private array of integers.
* This stores the index (integer) of all *loop heads* (`[`) and *loop tails* (`]`) without it's pair of *tail* and *head* respectively.
* Default to empty.
* Can only be changed (re-mapped) when [`BFCode`](#bfcode-1) changes.
* The changing of this property will not affect anything, this is not even used within the class.
* Brainfuck execution operations will not affect this property.
* Exposed by [`LeftOutLoops`](#leftoutloops-1) with getter **only** (can't be setted).

### #memArr

* Private array of `WrappedInt`.
* This is the memory, with all the cells.
* Default to empty, but will have at least one cell when object is constructed.
* After object constructed, should have length between 1 and [`BFMemoryMaxSize`](#bfmemorymaxsize).
* Can only change the length, and when changed, will affect [`MemPtr`](#memptr-1).
* Can be changed by [`MemSize`](#memsize) and [`#AdjustMemSize`](#adjustmemsize), which will trim or extend the array.
* After changes, if [`MemPtr`](#memptr-1) is underflowed or overflowed, [`MemPtrUnderflowCallback`](#memptrunderflowcallback) or [`MemPtrOverflowCallback`](#memptroverflowcallback) will be called respectively.
* Will affect the maximum value of [`MemPtr`](#memptr-1).
* Brainfuck execution operations will not affect this property.
* Exposed by [`MemArr`](#memarr-1) with getter and setter, which getter will only return the value of each cell.

## Public Properties

### BFCode

* Public string.
* The getter and setter of [`bfCode`](#bfcode).

* Get BFCode
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Get BFCode])
    end

    subgraph WatchedVal
        End([Return #bfCode.Val])
    end

    Start
    -->
    End
    ```

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

* Public integer.
* The getter and setter of [`#cIndex`](#cindex).

* Get CIndex
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Get CIndex])
    end

    subgraph WatchedVal
        End([Return #cIndex.Val])
    end

    Start
    -->
    End
    ```

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
        CIndexOnChangeCallback
        IsCodeEnded{CodeEnded === true}
        CodeEndedCallback
        End([End])
    end

    Start
    -->
    EnsureInt
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

* Public integer.
* The getter and setter of [`#memPtr`](#memptr).

* Get MemPtr
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Get MemPtr])
    end

    subgraph WatchedVal
        End([Return #memPtr.Val])
    end

    Start
    -->
    End
    ```

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

* Public integer.
* The getter and setter of [`#cellMinVal`](#cellminval).

* Get CellMinVal
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Get CellMinVal])
    end

    subgraph WatchedVal
        End([Return #cellMinVal.Val])
    end

    Start
    -->
    End
    ```

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

* Public integer.
* The getter and setter of [`#cellMaxVal`](#cellmaxval).

* Get CellMaxVal
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Get CellMaxVal])
    end

    subgraph WatchedVal
        End([Return #cellMaxVal.Val])
    end

    Start
    -->
    End
    ```

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

* Public integer.
* The getter and setter of [`#conditionVal`](#conditionval).

* Get ConditionVal
    ```mermaid
    flowchart TD

    Start([Get ConditionVal])
    End([Return #conditionVal])

    Start
    -->
    End
    ```

* Set ConditionVal
    ```mermaid
    flowchart TD

    Start([Set ConditionVal])
    EnsureInt
    SetConditionVal[#conditionVal = newVal]
    End([End])

    Start
    -->
    EnsureInt
    -->
    SetConditionVal
    -->
    End
    ```

### LoopPairs

* Public JavaScript object.
* The getter of [`#loopPairs`](#looppairs).
* The getter will only return the shallow copy of [`#loopPairs`](#looppairs).

* Get LoopPairs
    ```mermaid
    flowchart TD

    Start([Get LoopPairs])
    End([Return shallow copy of #loopPairs])

    Start
    -->
    End
    ```

### LeftOutLoops

* Public array of integers.
* The getter of [`#leftOutLoops`](#leftoutloops).
* The getter will only return the shallow copy of [`#leftOutLoops`](#leftoutloops).

* Get LeftOutLoops
    ```mermaid
    flowchart TD

    Start([Get LeftOutLoops])
    End([Return shallow copy of #leftOutLoops])

    Start
    -->
    End
    ```

### MemArr

* Public array of integers.
* The getter and setter of [`#memArr`](#memarr).
* The getter will only return the value of cells in [`#memArr`](#memarr), not the `WrappedInt` object.
* The setter will only accept array of integers with length between 1 and [`BFMemoryMaxSize`](#bfmemorymaxsize), the setter will create cells with callbacks with values provided.

* Get MemArr
    ```mermaid
    flowchart TD

    Start([Get MemArr])
    InitializeEmptyCopiedMem[copiedMem = empty array]
    ForCond{For i in MemSize}
    Push[Push GetCellVal at index i to copiedMem]
    End([Return copiedMem])

    Start
    -->
    InitializeEmptyCopiedMem
    -->
    ForCond
    --i-->
    Push
    -->
    ForCond
    --loop ended-->
    End
    ```

* Set MemArr
    ```mermaid
    flowchart TD

    Start([Set MemArr])
    ValidateMemArg
    EnsureInRange[Ensure 1 <= newMem.length <= BFMemoryMaxSize]
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
    EnsureInRange
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

* Public integer.
* The getter and setter that shows and modify the size of memory ([`#memArr`](#memarr)).
* The getter will return the length of [`#memArr`](#memarr).
* The setter will trim or extend [`#memArr`](#memarr).
* When triming, will remove last few extra cells.
* When extending [`#memArr`](#memarr), will create cells with [`CellMinVal`](#cellminval-1) as value.
* The value should be in between 1 and [`BFMemoryMaxSize`](#bfmemorymaxsize).

* Get MemSize
    ```mermaid
    flowchart TD

    Start([Get MemSize])
    End([Return #memArr.length])

    Start
    -->
    End
    ```

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

* Public boolean.
* The getter that shows if the code execution is ended, i.e., no more character in [`BFCode`](#bfcode-1) pointed by [`CIndex`](#cindex-1) to execute.

* Get CodeEnded
    ```mermaid
    flowchart TD

    Start([Get CodeEnded])
    End([Return CIndex larger or equal to BFCode.length])

    Start
    -->
    End
    ```

### CurrentCellVal

* Public integer.
* The getter and setter to get and set the value of the cell pointed by [`MemPtr`](#memptr-1) in [`#memArr`](#memarr).
* The getter will only return the value of the cell, not the `WrappedInt` object.

* Get CurrentCellVal
    ```mermaid
    flowchart TD

    Start([Get CurrentCellVal])
    End([Return GetCellVal with MemPtr])

    Start
    -->
    End
    ```

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

### AllCellVal

* Public integer.
* The setter to set the value of all cells in [`#memArr`](#memarr).
* This might change the value of many cells, which, same as [`CellMinVal`](#cellminval-1) and [`CellMaxVal`](#cellmaxval-1), might trigger callbacks.
* No getter.

* Set AllCellVal
    ```mermaid
    flowchart TD

    subgraph BrainfuckExecuter
        Start([Set AllCellVal])
        BFEnsureInt[Ensure newVal is an int]
        ForCond{For cell in #memArr}
        CellUnderflowCallback
        CellOverflowCallback
        MemCellOnChangeCallback
        MemCellOnSetCallback
        End([End])
    end

    subgraph WrappedInt
        SetVal[Set cell.Val for cell in #memArr]
        EnsureInt[Ensure newVal is an int]
        SetOriginalVal[originalVal = val before changes]
        SetPrivVal[#value = newVal]
        InitializeUnderflowFlag[underflowed = false]
        InitializeOverflowFlag[overflowed = false]
        SetOriginalVal_wrap[originalVal = val before changes]
        CheckUnderflow[Flag val < min as underflow]
        CheckOverflow[Flag val > max as overflow]
        WrappedIntEnsureIntValMinMax[Ensure all val, min, and max are int]
        WrappedIntEnsureMinMax[Ensure min max]
        Wrap
        WasUnderflow{Was underflow}
        WasOverflow{Was overflow}
        WrappedIntValChanged{val changed?}
    end

    Start
    -->
    BFEnsureInt
    -->
    ForCond
    --cell-->
    SetVal
    -->
    EnsureInt
    -->
    SetOriginalVal
    -->
    SetPrivVal
    -->
    InitializeUnderflowFlag
    -->
    InitializeOverflowFlag
    -->
    SetOriginalVal_wrap
    -->
    CheckUnderflow
    -->
    CheckOverflow
    -->
    WrappedIntEnsureIntValMinMax
    -->
    WrappedIntEnsureMinMax
    -->
    Wrap
    -->
    WasUnderflow
    --true-->
    CellUnderflowCallback
    -->
    WasOverflow
    --true-->
    CellOverflowCallback
    -->
    WrappedIntValChanged
    --true-->
    MemCellOnChangeCallback
    -->
    MemCellOnSetCallback
    -->
    ForCond
    --loop end-->
    End

    WasUnderflow
    --false-->
    WasOverflow
    --false-->
    WrappedIntValChanged
    --false-->
    MemCellOnSetCallback
    ```

## Callbacks

### InputCallback

* Argument:
  * brainfuckExecuter: The current object.
* Return:
  * The integer input value or a `Promise` of that, how the input is converted or interpreted to integer is depends on the user.
* Default to return [`CellMinVal`](#cellminval-1).
* Will be called for input in [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation) and [`BF_Input_Operation`](#bf_input_operation).
* Can be `async`.

### OutputCallback

* Argument:
  * output: The integer output, how the output is converted or interpreted from integer is depends on the user.
  * brainfuckExecuter: The current object.
* Will be called for ouptut in [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation) and [`BF_Output_Operation`](#bf_output_operation).
* Can be `async`.

### CIndexOnChangeCallback

* Arguments:
  * oldVal: The original [`CIndex`](#cindex-1) value, integer.
  * newVal: The new changed [`CIndex`](#cindex-1) value, integer.
  * brainfuckExecuterAfter: The current object after the changes.
* Will be called when [`CIndex`](#cindex-1) changes.

### MemPtrOnChangeCallback

* Arguments:
  * oldVal: The original [`MemPtr`](#memptr-1) value, integer.
  * newVal: The new changed [`MemPtr`](#memptr-1) value, integer.
  * brainfuckExecuterAfter: The current object after the changes.
* Will be called when [`MemPtr`](#memptr-1) changes.

### MemPtrUnderflowCallback

* Arguments:
  * val: The underflowed value, integer.
  * brainfuckExecuter: The current object.
* Default to throw `MemPtrOutOfRangeError`.
* Will be called when [`MemPtr`](#memptr-1) is underflowed (smaller than 0).

### MemPtrOverflowCallback

* Arguments:
  * val: The overflowed value, integer.
  * brainfuckExecuter: The current object.
* Default to throw `MemPtrOutOfRangeError`.
* Will be called when [`MemPtr`](#memptr-1) is overflowed (larger or equal to [`MemSize`](#memsize)).

### CodeEndedCallback

* Arguments:
  * brainfuckExecuter: The current object.
* Will be called when the code is ended, i.e., [`CIndex`](#cindex-1) is larger or equal to the length of [`BFCode`](#bfcode-1).

### CellUnderflowCallback

* Arguments:
  * index: The index of cell that underflowed, integer.
  * valBefore: The original value of cell, integer.
  * valAfter: The wrapped value of cell, integer.
  * brainfuckExecuterAfter: The current object.
* Will be called when the cell value underflowed, i.e., smaller than [`CellMinVal`](#cellminval-1).

### CellOverflowCallback

* Arguments:
  * index: The index of cell that overflowed, integer.
  * valBefore: The original value of cell, integer.
  * valAfter: The wrapped value of cell, integer.
  * brainfuckExecuterAfter: The current object.
* Will be called when the cell value overflowed, i.e., larger than [`CellMaxVal`](#cellmaxval-1).

### MemCellOnChangeCallback

* Arguments:
  * index: The index of cell that value was changed, integer.
  * oldVal: The original value of cell, integer.
  * newVal: The new value of cell after changes, integer.
  * brainfuckExecuterAfter: The current object.
* Will be called when the cell value changes.
* Will be called after [`CellUnderflowCallback`](#cellunderflowcallback) and [`CellOverflowCalback`](#celloverflowcallback), if those are called.
* Please note that a cell underflowed or overflowed doesn't necessary change the value (wrapped into the same value), therefore not necessary call this callback.

### MemCellOnSetCallback

* Arguments:
  * index: The index of cell that value was setted, integer.
  * val: The value of cell, integer.
  * brainfuckExecuterAfter: The current object.
* Will be called when the cell value is setted.
* Will be called after [`CellUnderflowCallback`](#cellunderflowcallback), [`CellOverflowCalback`](#celloverflowcallback), and [`MemCellOnChangeCallback`](#memcellonchangecallback), if those are called.
* This will be called even if the value is not changed, underflowed, or overflowed.

### CodeExecuteOperation

* Arguments:
  * code: The current code character in [`BFCode`](#bfcode-1) pointed by [`CIndex`](#cindex-1).
  * brainfuckExecuter: The current object.
* Return:
  * The next cIndex, integer.
* To override the default Brainfuck execution, [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation), in [`BF_Execute`](#bf_execute).
* If this is `undefined`, then [`BF_Execute`](#bf_execute) will use the default [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation).
* Can be `async`.

## Static Methods

### ValidateMemArg

* Arguments:
  * mem: The array of integers (memory) to be validated.
* Validate and ensure that all values in `mem` are integers.
* Will not return anything, instead, it will raise an `CustomTypeError` when a non-integer value encountered.

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

* Arguments:
  * bfCode: The Brainfuck code to map.
* Return:
  * JavaScript object containing *loop-pairs* (bi-directional) and *left-out loops*, as shown below:
    ```JavaScript
        LoopPairs: {
            integer: integer
        },
        LeftOutLoops: [integers]
    ```
    * LoopPairs: A JavaScript object with both key and value are integers, bi-directional.
    * LeftOutLoops: The index of left-out, unpaired heads and tails.
* Map the *loop-pairs* (`[`) and *left-out loops* (`]`).

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

* Arguments:
  * index: The index of the new cell. This is required for the callbacks.
  * cellVal: The value of the create cell.
* Return:
  * The created `WrappedInt` cell.
* Create new `WrappedInt` cell, used when setting [`MemArr`](#memarr-1), [`MemSize`](#memsize), and [`#AdjustMemSize`](#adjustmemsize).

```mermaid
flowchart TD

Start([#CreateCell])
End([Return new WrappedInt with provided cell value, BrainfuckExecuter object's CellMinVal, CellMaxVal, CellUnderflowCallback, CellOverflowCallback, MemCellOnChangeCallback, and MemCellOnSetCallback])

Start
-->
End
```

### #CheckMemPtr

* Return:
  * Boolean, `true` if [`MemPtr`](#memptr-1) is within [`CellMinVal`](#cellminval-1) and [`CellMaxVal`](#cellmaxval-1), `false` otherwise.
* Check if [`MemPtr`](#memptr-1) is within [`CellMinVal`](#cellminval-1) and [`CellMaxVal`](#cellmaxval-1).
* Will call [`MemPtrUnderflowCallback`](#memptrunderflowcallback) if [`MemPtr`](#memptr-1) is smaller than [`CellMinVal`](#cellminval-1), [`MemPtrOverflowCallback`](#memptroverflowcallback) if [`MemPtr`](#memptr-1) is larger than [`CellMaxVal`](#cellmaxval-1).

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

* Arguments:
  * memSize: The intended size of [`#memArr`](#memarr).
  * defaultVal: The value used to create new `WrappedInt` when extending.
* Extend or trim [`#memArr`](#memarr) based on the given `memSize`.
* Will create new `WrappedInt` with `defaultVal` when extending. If `defaultVal` is not provided, will use [`CellMinVal`](#cellminval-1).
* Will remove the last extra cells (`WrappedInt`) when trimming.

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

### async #BFDefaultCodeExecuteOperation

* Arguments:
  * code: The code character to execute.
* Return:
  * The next `cIndex`, integer.
* The default execution, basically how brainfuck execution should behave.
* If loop head and tail is not in [`#LoopPairs`](#looppairs-1), it will be skipped.
* Will `await` for [`BF_Input_Operation`](#async-bf_input_operation) and [`BF_Output_Operation`](#async-bf_output_operation), if performed.

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
GetTail[tail = LoopPairs with cIndex]
CheckHasTail{tail != undefined}
CheckCondPass{CurrentCellVal === ConditionVal}
HeadSetCIndex[cIndex = LoopPairs with cIndex]
CheckLoopTail{code === '】'}
GetHead[head = LoopPairs with cIndex]
CheckHasHead{head != undefined}
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
GetTail
-->
CheckHasTail
--true-->
CheckCondPass
--true-->
HeadSetCIndex
-->
End

CheckLoopTail
--true-->
GetHead
-->
CheckHasHead
--true-->
CheckCondFail
--true-->
TailSetCIndex
-->
End

CheckHasTail
--false-->
End

CheckHasHead
--false-->
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

* Arguments:
  * bfCode: The Brainfuck code string, defaults to empty string (`""`).
  * memSize: The size (integer) of memory, defaults to 30000.
  * config: All other configs:
    * cIndex
    * memPtr
    * mem
    * cellMinVal
    * cellMaxVal
    * conditionVal
    * defaultVal
    * inputCallback
    * outputCallback
    * cIndexOnChangeCallback
    * memPtrOnChangeCallback
    * memPtrUnderflowCallback
    * memPtrOverflowCallback
    * codeEndedCallback
    * cellUnderflowCallback
    * cellOverflowCallback
    * memCellOnChangeCallback
    * memCellOnSetCallback
    * codeExecuteOperation

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

* Arguments:
  * bfCode: The Brainfuck code string, defaults to empty string (`""`).
  * memSize: The size (integer) of memory, defaults to 30000.
  * config: All other configs:
    * cIndex
    * memPtr
    * mem
    * cellMinVal
    * cellMaxVal
    * conditionVal
    * defaultVal
    * inputCallback
    * outputCallback
    * cIndexOnChangeCallback
    * memPtrOnChangeCallback
    * memPtrUnderflowCallback
    * memPtrOverflowCallback
    * codeEndedCallback
    * cellUnderflowCallback
    * cellOverflowCallback
    * memCellOnChangeCallback
    * memCellOnSetCallback
    * codeExecuteOperation
* Return:
  * Current object
* To setup or change the properties and callbacks.

```mermaid
flowchart TD

Start([SetConfig])
DestructureConfig[Destructure config argument]
SubscribeCallbacks[SubscribeCallbacks with all callbacks]
CheckBFCode{Is bfCode provided?}
SetBFCode[BFCode = new bfCode]
CheckCIndex{Is cIndex provided?}
SetCIndex[CIndex = new cIndex]
CheckCodeEnded{Check if CodeEnded === true}
CodeEndedCallback
CheckMemPtr{Is memPtr provided?}
SetMemPtr[MemPtr = new memPtr]
CheckCellMinVal{Is cellMinVal provided?}
SetCellMinVal[CellMinVal = new cellMinVal]
CheckCellMaxVal{Is cellMaxVal provided?}
SetCellMaxVal[CellMaxVal = new cellMaxVal]
CheckConditionVal{Is conditionVal provided?}
SetConditionVal[ConditionVal = new conditionVal]
CheckMem{Is mem provided?}
SetMem[Mem = new mem]
CheckMemSize{Is memSize provided?}
AdjustMemSize[#AdjustMemSize with memSize and defaultVal]
End([Return this])

Start
-->
DestructureConfig
-->
SubscribeCallbacks
-->
CheckBFCode
--true-->
SetBFCode
-->
CheckCIndex
--true-->
SetCIndex
-->
CheckMemPtr
--true-->
SetMemPtr
-->
CheckCellMinVal
--true-->
SetCellMinVal
-->
CheckCellMaxVal
--true-->
SetCellMaxVal
-->
CheckConditionVal
--true-->
SetConditionVal
-->
CheckMem
--true-->
SetMem
-->
CheckMemSize
--true-->
AdjustMemSize
-->
End

CheckBFCode
--false-->
CheckCIndex
--false-->
CheckCodeEnded
--true-->
CodeEndedCallback
-->
CheckMemPtr
--false-->
CheckCellMinVal
--false-->
CheckCellMaxVal
--false-->
CheckConditionVal
--false-->
CheckMem
--false-->
CheckMemSize
--false-->
End

CheckCodeEnded
--false-->
CheckMemPtr
```

### GetCellVal

* Arguments:
  * index: The index (integer) of cell to get value.
* Return:
  * The integer value of the cell.
* To get the value of certain cell in [`#memArr`](#memarr).

```mermaid
flowchart TD

subgraph BrainfuckExecuter
    Start([GetCellVal])
end

subgraph WrappedInt
    End([Return cell.Val for cell in #memArr at index])
end

Start
-->
End
```

### SetCellVal

* Arguments:
  * index: The index (integer) of cell to set value.
  * newVal: The new integer value to set for cell.
* To set the value of certain cell in [`#memArr`](#memarr).

```mermaid
flowchart TD

subgraph BrainfuckExecuter
    Start([SetCellVal])
    BFEnsureInt[Ensure newVal is an int]
    CellUnderflowCallback
    CellOverflowCallback
    MemCellOnChangeCallback
    MemCellOnSetCallback
    End([End])
end

subgraph WrappedInt
    SetVal[Set cell.Val for cell in #memArr at index]
    EnsureInt[Ensure newVal is an int]
    SetOriginalVal[originalVal = val before changes]
    SetPrivVal[#value = newVal]
    InitializeUnderflowFlag[underflowed = false]
    InitializeOverflowFlag[overflowed = false]
    SetOriginalVal_wrap[originalVal = val before changes]
    CheckUnderflow[Flag val < min as underflow]
    CheckOverflow[Flag val > max as overflow]
    WrappedIntEnsureIntValMinMax[Ensure all val, min, and max are int]
    WrappedIntEnsureMinMax[Ensure min max]
    Wrap
    WasUnderflow{Was underflow}
    WasOverflow{Was overflow}
    WrappedIntValChanged{val changed?}
end

Start
-->
BFEnsureInt
-->
SetVal
-->
EnsureInt
-->
SetOriginalVal
-->
SetPrivVal
-->
InitializeUnderflowFlag
-->
InitializeOverflowFlag
-->
SetOriginalVal_wrap
-->
CheckUnderflow
-->
CheckOverflow
-->
WrappedIntEnsureIntValMinMax
-->
WrappedIntEnsureMinMax
-->
Wrap
-->
WasUnderflow
--true-->
CellUnderflowCallback
-->
WasOverflow
--true-->
CellOverflowCallback
-->
WrappedIntValChanged
--true-->
MemCellOnChangeCallback
-->
MemCellOnSetCallback
-->
End


WasUnderflow
--false-->
WasOverflow
--false-->
WrappedIntValChanged
--false-->
MemCellOnSetCallback
```

### SetAllCellVal

* Arguments:
  * newVal: The new integer value to set for all cells.
* To set the value of all cells in [`#memArr`](#memarr).

```mermaid
flowchart TD

Start([SetAllCellVal])
SetAllCellVal[AllCellVal = newVal]
End([Return this])

Start
-->
SetAllCellVal
-->
End
```

### SubscribeCallbacks

* Arguments:
  * inputCallback
  * outputCallback
  * cIndexOnChangeCallback
  * memPtrOnChangeCallback
  * memPtrUnderflowCallback
  * memPtrOverflowCallback
  * codeEndedCallback
  * cellUnderflowCallback
  * cellOverflowCallback
  * memCellOnChangeCallback
  * memCellOnSetCallback
  * codeExecuteOperation
* Return:
  * Current object.
* To set or change the [callbacks](#callbacks).

```mermaid
flowchart TD

Start([SubscribeCallbacks])
CheckInputCallback{Is inputCallback provided?}
SetInputCallback[InputCallback = new inputCallback]
CheckOutputCallback{Is outputCallback provided?}
SetOutputCallback[OutputCallback = new outputCallback]
CheckCIndexOnChangeCallback{Is cIndexOnChangeCallback provided?}
SetCIndexOnChangeCallback[CIndexOnChangeCallback = new cIndexOnChangeCallback]
CheckMemPtrOnChangeCallback{Is memPtrOnChangeCallback provided?}
SetMemPtrOnChangeCallback[MemPtrOnChangeCallback = new memPtrOnChangeCallback]
CheckMemPtrUnderflowCallback{Is memPtrUnderflowCallback provided?}
SetMemPtrUnderflowCallback[MemPtrUnderflowCallback = new memPtrUnderflowCallback]
CheckMemPtrOverflowCallback{Is memPtrOverflowCallback provided?}
SetMemPtrOverflowCallback[MemPtrOverflowCallback = new memPtrOverflowCallback]
CheckCodeEndedCallback{Is codeEndedCallback provided?}
SetCodeEndedCallback[CodeEndedCallback = new codeEndedCallback]
CheckCellUnderflowCallback{Is cellUnderflowCallback provided?}
SetCellUnderflowCallback[CellUnderflowCallback = new cellUnderflowCallback]
CheckCellOverflowCallback{Is cellOverflowCallback provided?}
SetCellOverflowCallback[CellOverflowCallback = new cellOverflowCallback]
CheckMemCellOnChangeCallback{Is memCellOnChangeCallback provided?}
SetMemCellOnChangeCallback[MemCellOnChangeCallback = new memCellOnChangeCallback]
CheckMemCellOnSetCallback{Is memCellOnSetCallback provided?}
SetMemCellOnSetCallback[MemCellOnSetCallback = new memCellOnSetCallback]
SetCodeExecuteOperation[CodeExecuteOperation = new codeExecuteOperation]
End([Return this])

Start
-->
CheckInputCallback
--true-->
SetInputCallback
-->
CheckOutputCallback
--true-->
SetOutputCallback
-->
CheckCIndexOnChangeCallback
--true-->
SetCIndexOnChangeCallback
-->
CheckMemPtrOnChangeCallback
--true-->
SetMemPtrOnChangeCallback
-->
CheckMemPtrUnderflowCallback
--true-->
SetMemPtrUnderflowCallback
-->
CheckMemPtrOverflowCallback
--true-->
SetMemPtrOverflowCallback
-->
CheckCodeEndedCallback
--true-->
SetCodeEndedCallback
-->
CheckCellUnderflowCallback
--true-->
SetCellUnderflowCallback
-->
CheckCellOverflowCallback
--true-->
SetCellOverflowCallback
-->
CheckMemCellOnChangeCallback
--true-->
SetMemCellOnChangeCallback
-->
CheckMemCellOnSetCallback
--true-->
SetMemCellOnSetCallback
-->
SetCodeExecuteOperation
-->
End

CheckInputCallback
--false-->
CheckOutputCallback
--false-->
CheckCIndexOnChangeCallback
--false-->
CheckMemPtrOnChangeCallback
--false-->
CheckMemPtrUnderflowCallback
--false-->
CheckMemPtrOverflowCallback
--false-->
CheckCodeEndedCallback
--false-->
CheckCellUnderflowCallback
--false-->
CheckCellOverflowCallback
--false-->
CheckMemCellOnChangeCallback
--false-->
CheckMemCellOnSetCallback
--false-->
SetCodeExecuteOperation
```

### async BF_Execute

* Return:
  * Current object.
* Execute current code with provided [`CodeExecuteOperation`](#codeexecuteoperation) or default [`#BFDefaultCodeExecuteOperation`](#bfdefaultcodeexecuteoperation), if [`CIndex`](#cindex-1) is still within [`BFCode`](#bfcode).
* Will only execute once.
* Will `await` for [`#BFDefaultCodeExecuteOperation`](#async-bfdefaultcodeexecuteoperation).

```mermaid
flowchart TD

Start([BF_Execute])
IsCodeNotEnded{CodeEnded === false}
GetCurrentCode[code = character in BFCode at CIndex]
CodeExecuteOperationNotProvided{CodeExecuteOperation == undefined}
BFDefaultCodeExecuteOperation[CIndex = #BFDefaultCodeExecuteOperation]
CodeExecuteOperation[CIndex = CodeExecuteOperation]
End([Return this])

Start
-->
IsCodeNotEnded
--true-->
GetCurrentCode
-->
CodeExecuteOperationNotProvided
--true-->
BFDefaultCodeExecuteOperation
-->
End

CodeExecuteOperationNotProvided
--false-->
CodeExecuteOperation
-->
End

IsCodeNotEnded
--false-->
End
```

### BF_IncrementCellVal_Operation

* Return:
  * Current object.
* Perform `+` operation.

```mermaid
flowchart TD

Start([BF_IncrementCellVal_Operation])
Operation[CurrentCellVal += 1]
End([Return this])

Start
-->
Operation
-->
End
```

### BF_DecrementCellVal_Operation

* Return:
  * Current object.
* Perform `-` operation.

```mermaid
flowchart TD

Start([BF_DecrementCellVal_Operation])
Operation[CurrentCellVal -= 1]
End([Return this])

Start
-->
Operation
-->
End
```

### BF_NextCell_Operation

* Return:
  * Current object.
* Perform `>` operation.

```mermaid
flowchart TD

Start([BF_NextCell_Operation])
Operation[MemPtr += 1]
End([Return this])

Start
-->
Operation
-->
End
```

### BF_PrevCell_Operation

* Return:
  * Current object.
* Perform `<` operation.

```mermaid
flowchart TD

Start([BF_PrevCell_Operation])
Operation[MemPtr -= 1]
End([Return this])

Start
-->
Operation
-->
End
```

### async BF_Input_Operation

* Return:
  * Current object.
* Perform `.` operation by calling and `await` [`InputCallback`](#inputcallback).

```mermaid
flowchart TD

Start([BF_Input_Operation])
Operation[CurrentCellVal = InputCallback]
End([Return this])

Start
-->
Operation
-->
End
```

### async BF_Output_Operation

* Return:
  * Current object.
* Perform `,` operation by calling and `await` [`OutputCallback`](#outputcallback).

```mermaid
flowchart TD

Start([BF_Output_Operation])
Operation[Call OutputCallback with CurrentCellVal]
End([Return this])

Start
-->
Operation
-->
End
```

### toJSON

* Return:
  * The JSON representation of current object, with these values:
    * BFCode: String
    * CIndex: Integer
    * MemPtr: Integer
    * MemSize: Integer
    * MemArr: Array of integers
    * CodeEnded: Boolean
    * CellMinVal: Integer
    * CellMaxVal: Integer
    * ConditionVal: Integer
    * LoopPairs: JavaScript object
    * LeftOutLoops: Array of integers
* Return the JSON representation of current object.

```mermaid
flowchart TD

Start([toJSON])
End([Return properties as JSON])

Start
-->
End
```

### Copy

* Arguments:
  * includeCallbacks: To also copy the [callbacks](#callbacks).
* Return:
  * The copied `BrainfuckExecuter` object.
* Create a copy of current object.

```mermaid
flowchart TD

Start([Copy])
CreateCopiedObj[Create another object with properties]
End([Return the copied object])

Start
-->
CreateCopiedObj
-->
End
```
