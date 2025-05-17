import WrappedInt from "./WrappedInt";
import { EnsureInRange, EnsureInt, EnsureMinMax, WatchedVal } from "../utils/utils";
import { CustomValueError, CustomMissingArgumentError } from "../utils/CustomErrors";

class MemPtrOutOfRangeError extends CustomValueError {
    constructor (msg=undefined, memPtr=undefined, memSize=undefined, carryValue=undefined, identifier=undefined) {
        if (memPtr != undefined) {
            msg = msg ?? `Memory pointer, ${memPtr}, is out of range.`;
        }

        super(msg, memPtr, carryValue, identifier);
        this.MemSize = memSize;
    }
}

const BFMemoryMaxSize = 30000;

class BrainfuckExecuter {
    /*
    BrainfuckExecuter design:

    Separate concern, this class should only execute Brainfuck,
        with callback functions to interact with.

    Parameters:
        * Brainfuck code
        * Input callback
            * IO action
        * Output callback
            * IO action
        * Memory size
            * The size of memory, will trim or extend memory if needed,
                or initialize memory with default value if no memory provided.
            * Will be initialized when creating object.
        * Code index
        * Memory pointer
        * Memory
            * To initialize memory with value (if wanted).
        * Cell min value
            * The min value of cell before wrap.
        * Cell max value
            * The max value of cell before wrap.
        * Conditional value
            * The value which current cell must equal to to not execute loop.
            * Must within cell min and max value.
            * Default should be cell min value.
        * Default value
            * Default value of each cell.
            * Won't be save as property.
            * Will only be used when mem needed to be extended, i.e.,
                memory size is longer than existing memory.
            * Changing default value won't affect existing memory,
                as it isn't easy to trace which memory cell is changed.
        * Other callbacks
            * For interaction with others.
    All these parameters above, except Brainfuck code (which is required to execute)
        and IO callbacks (these should interact with UI), are for customized behaviour,
        especially cell min and max value, as these doesn't follow the Brainfuck behaviours.

    Properties that will accept changes (class should react to these changes appropriately):
        * Brainfuck code
            * Will need to re-map loop pairs and left out loops.
        * Callbacks
            * Minor to no effect, just need to update the relevant callbacks.
            * Unlikely to affect the codeflow (except IO related), depends on the callback functions.
        * Memory size
            * Change memory if needed.
        * Code index
            * Minor to no effect, the code will still be executed,
            but might cause unexpected behaviour.
            * Very likely to affect code flow.
        * Memory pointer
            * Minor to no effect, the code will still be executed,
                but might cause unexpected behaviour.
            * Might cause out of memory range issue.
            * Very likely to affect code flow.
        * Memory
            * Minor to no effect, the code will still be executed since the value should be
                handled automatically by WrappedInt.
            * Very likely to affect code flow.
        * Cell min value
            * The code will still be executed since the value should be handled automatically by WrappedInt.
            * Very likely to affect code flow.
            * Likely to affect a large range of memory cells.
        * Cell max value
            * The code will still be executed since the value should be handled automatically by WrappedInt.
            * Very likely to affect code flow.
            * Likely to affect a large range of memory cells.
        * Conditional value
            * Minor to no effect, the code will still be executed, the behaviour of loops will change.
            * Very likely to affect code flow.
            * Might cause infinite loop.
            * Need to be re-calculated when cell min and max value changes.
        
        Indirectly:
            * Loop pairs
            * Left out loops
                * The index of unpaired loop heads and tails.

    Properties that will change (should have callbacks to listen for these changes):
        * Code index
        * Memory pointer
        * Memory
        * Code ended
            * A flag to indicate that the code execution ended.
    
    Callback functions:
        * InputCallback(brainfuckExecuter) -> int:
            * Return an integer that represents the input value.
            * Called when brainfuck code is inputing ('.').
        * OutputCallback(output, brainfuckExecuter):
            * Called when brainfuck code is outputing (',').

        For others to listen to:
            * CIndexOnChangeCallback(oldVal, newVal, brainfuckExecuterAfter):
                * Called when code index changes.
            * MemPtrOnChangeCallback(oldVal, newVal, brainfuckExecuterAfter):
                * Called when memory pointer changes.
            * MemPtrUnderflowCallback(val, brainfuckExecuter):
                * Called when memory pointer underflows.
                * Default to throwing error.
            * MemPtrOverflowCallback(val, brainfuckExecuter):
                * Called when memory pointer overflows.
                * Default to throwing error.
            * CodeEndedCallback(brainfuckExecuter):
                * Called when code execution ended, which means reached the end of code.
            
            Cell specific callbacks:
                * CellUnderflowCallback(index, valBefore, valAfter, wrappedIntAfter, brainfuckExecuterAfter):
                    * Called when memory cell underflows.
                * CellOverflowCallback(index, valBefore, valAfter, wrappedIntAfter, brainfuckExecuterAfter):
                    * Called when memory cell overflows.
                * MemCellOnChangeCallback(index, oldVal, newVal, wrappedIntAfter, brainfuckExecuterAfter):
                    * Called when memory cell changes.
                * MemCellOnSetCallback(index, val, wrappedInt, brainfuckExecuterAfter):
                    * Called when memory cell is setted.
    */

    #bfCode = new WatchedVal("");
    #cIndex = new WatchedVal(0);
    #memPtr = new WatchedVal(0);
    #memArr = [];
    #cellMinVal = new WatchedVal(0);
    #cellMaxVal = new WatchedVal(255);
    #conditionVal = 0;

    #loopPairs = {};
    #leftOutLoops = [];

    constructor (bfCode="", inputCallback=undefined, outputCallback=undefined, memSize=undefined, config={}) {
        /*
        Don't link callbacks together directly, instead, call them via BrainfuckExecuter.
        This is to prevent the callback functions called from WatchedVal not being the callback
        function of BrainfuckExecuter (if it was changed).
        */
        
        this.#cIndex.ValOnChangeCallback = (valBefore, valAfter) => {
            this.CIndexOnChangeCallback(valBefore, valAfter, this);
        };

        this.#memPtr.ValOnChangeCallback = (valBefore, valAfter) => {
            this.MemPtrOnChangeCallback(valBefore, valAfter, this);

            if (valAfter < 0) {
                this.MemPtrUnderflowCallback(valAfter, this);
            }

            if (valAfter >= this.MemSize) {
                this.MemPtrOverflowCallback(valAfter, this);
            }
        };
    }

    get BFCode () {
        return this.#bfCode.Val;
    }

    set BFCode (newVal) {
        this.#bfCode.Val = newVal;
    }

    get MemSize () {
        return this.#memArr.length;
    }

    set MemSize (newVal) {
        this.#AdjustMemSize(newVal);
    }

    get CIndex () {
        return this.#cIndex.Val;
    }

    set CIndex (newVal) {
        EnsureInt(newVal);
        EnsureInRange(0, this.BFCode.length - 1);
        this.#cIndex.Val = newVal;

        if (this.CodeEnded === true) {
            this.CodeEndedCallback(this);
        }
    }

    get MemPtr () {
        return this.#memPtr.Val;
    }

    set MemPtr (newVal) {
        // Underflow and overflow will be handled by callbacks.
        this.#memPtr.Val = newVal;
    }

    get MemArr () {
        // Copy the whole this.#memArr and return it.
        const copiedMem = []

        for (let i = 0; i < this.MemSize; i++) {
            copiedMem.push(this.#memArr[i].Val);
        }

        return copiedMem;
    }

    set MemArr (newMem) {
        BrainfuckExecuter.ValidateMemArg(newMem);

        this.#memArr = [];

        for (let i = 0; i < newMem.length; i++) {
            this.#memArr.push(this.#CreateCell(i, newMem[i]))
        }
    }

    get CellMinVal () {
        return this.#cellMinVal.Val;
    }
    
    set CellMinVal (newVal) {
        EnsureInt(newVal);
        EnsureMinMax(newVal, this.CellMaxVal);
        this.#cellMinVal.Val = newVal;
    }

    get CellMaxVal () {
        return this.#cellMaxVal.Val;
    }

    set CellMaxVal (newVal) {
        EnsureInt(newVal);
        EnsureMinMax(this.CellMinVal, newVal);
        this.#cellMaxVal.Val = newVal;
    }

    get ConditionVal () {
        return this.#conditionVal;
    }

    set ConditionVal (newVal) {
        EnsureInt(newVal);
        EnsureInRange(newVal, this.CellMinVal, this.CellMaxVal);
        this.#conditionVal = newVal;
    }

    get CodeEnded () {
        if (this.CIndex >= this.BFCode.length) {
            return true;
        }

        return false;
    }
    
    GetCellVal (index) {
        return this.#memArr[index].Val;
    }

    SetCellVal (index, newVal) {
        this.#memArr[index].Val = newVal;
    }

    GetCurrentCellVal () {
        return this.GetCellVal(this.MemPtr);
    }

    SetCurrentCellVal (newVal) {
        this.SetCellVal(this.MemPtr, newVal);
    }

    static ValidateMemArg (mem) {
        for (let i = 0; i < mem.length; i++) {
            const val = mem[i];
            EnsureInt(mem);
        }
    }

    #CreateCell (index, cellVal) {
        return new WrappedInt(
            cellVal,
            this.CellMinVal,
            this.CellMaxVal,
            (valBefore, valAfter, wrappedIntAfter) => {
                this.CellUnderflowCallback(index, valBefore, valAfter, wrappedIntAfter, this);
            },
            (valBefore, valAfter, wrappedIntAfter) => {
                this.CellOverflowCallback(index, valBefore, valAfter, wrappedIntAfter, this);
            },
            (oldVal, newVal, wrappedIntAfter) => {
                this.MemCellOnChangeCallback(index, oldVal, newVal, wrappedIntAfter, this);
            },
            (val, wrappedInt) => {
                this.MemCellOnSetCallback(index, val, wrappedInt, this);
            }
        );
    }

    #AdjustMemSize (memSize, defaultVal=undefined) {
        // Memory will be trimmed if memSize is smaller.

        EnsureInt(memSize);
        EnsureInRange(memSize, 0, BFMemoryMaxSize);

        defaultVal = defaultVal ?? this.CellMinVal;

        EnsureInt(defaultVal);
        EnsureInRange(defaultVal, this.CellMinVal, this.CellMaxVal);

        const currentMemSize = this.#memArr.length;
        const diff = currentMemSize - memSize;
        
        if (diff < 0) { // memSize is larger:
            for (let i = currentMemSize; i < memSize; i++) {
                this.#memArr.push(this.#CreateCell(i, defaultVal));
            }
        }
        else if (diff > 0) {    // memArr is larger:
            this.#memArr.splice(memSize, diff);
        }
    }

    SetConfig (bfCode="", inputCallback=undefined, outputCallback=undefined, memSize=undefined, config={}) {
        const {
            cIndex = 0,
            memPtr = 0,
            mem = undefined,
            cellMinVal = 0,
            cellMaxVal = 255,
            conditionVal = undefined,
            defaultVal = undefined,
            cIndexOnChangeCallback = (oldVal, newVal, brainfuckExecuterAfter) => { },
            memPtrOnChangeCallback = (oldVal, newVal, brainfuckExecuterAfter) => { },
            memPtrUnderflowCallback = (val, brainfuckExecuter) => {
                throw new MemPtrOutOfRangeError(undefined, val, brainfuckExecuter.MemSize);
            },
            memPtrOverflowCallback = (val, brainfuckExecuter) => {
                throw new MemPtrOutOfRangeError(undefined, val, brainfuckExecuter.MemSize);
            },
            codeEndedCallback = (brainfuckExecuter) => { },
            cellUnderflowCallback = (index, valBefore, valAfter, wrappedIntAfter, brainfuckExecuterAfter) => { },
            cellOverflowCallback = (index, valBefore, valAfter, wrappedIntAfter, brainfuckExecuterAfter) => { },
            memCellOnChangeCallback = (index, oldVal, newVal, wrappedIntAfter, brainfuckExecuterAfter) => { },
            memCellOnSetCallback = (index, val, wrappedInt, brainfuckExecuterAfter) => { },
            codeExecuteOperation = undefined
        } = config;

        /*
        The parameters not included in config are required, except memSize which will depends on mem.
        The reason memSize doesn't have a default value (30000) is for more customized behaviour:
            * If memSize is provided:
                * If mem is not provided:
                    * Initialize a memSize mem with defaultVal
                * If mem is provided:
                    * If length of mem is smaller than memSize:
                        * Extend mem until it has length of memSize
                    * If length of mem is larger than memSize:
                        * Trim or remove the exceeded part
                    * Use mem
            * If memSize is not provided:
                * If mem is not provided:
                    * Throws an error
                * If mem is provided:
                    * Use mem
            
            Please note that algorithm above is only if mem is valid,
                meaning all value in mem is an integer.
                If the value is out-ranged,
                it will simply be wrapped (automatically by WrappedInt),
                which will trigger underflow and overflow callback.

        For conditionVal and defaultVal, they don't have default value (0) is because
            the validity of these parameters are based on cellMinVal and cellMaxVal.
            If value is given for these parameters, it will throw an error if the
            value isn't valid; If no value is given, no error will be thrown,
            conditionalVal and defaultVal will be setted as cellMinVal.

        codeExecuteOperation(code, brainfuckExecuter):
            * Is the custom code operation, if given value, i.e. not undefined nor null,
                the default standard brainfuck code operation will be prevented.
            * Return the cIndex for next operation.
            * Code is the code character that cIndex points to in BFCode.
        */

        if (inputCallback == undefined) {
            throw new CustomMissingArgumentError(undefined, "inputCallback");
        }

        if (outputCallback == undefined) {
            throw new CustomMissingArgumentError(undefined, "outputCallback");
        }

        if (mem == undefined && memSize == undefined) {
            throw new CustomMissingArgumentError(`Required either mem or memSize or both.`, "mem or memSize");
        }
        
        this.InputCallback = inputCallback;
        this.OutputCallback = outputCallback;
        this.CIndexOnChangeCallback = cIndexOnChangeCallback;
        this.MemPtrOnChangeCallback = memPtrOnChangeCallback;
        this.MemPtrUnderflowCallback = memPtrUnderflowCallback;
        this.MemPtrOverflowCallback = memPtrOverflowCallback;
        this.CodeEndedCallback = codeEndedCallback;
        this.CellUnderflowCallback = cellUnderflowCallback;
        this.CellOverflowCallback = cellOverflowCallback;
        this.MemCellOnChangeCallback = memCellOnChangeCallback;
        this.MemCellOnSetCallback = memCellOnSetCallback;

        this.CodeExecuteOperation = codeExecuteOperation;

        this.BFCode = bfCode;
        this.CIndex = cIndex;
        this.MemPtr = memPtr;
        this.CellMinVal = cellMinVal;
        this.CellMaxVal = cellMaxVal;
        this.ConditionVal = conditionVal ?? this.CellMinVal;

        if (mem != undefined) {
            this.MemArr = mem;
        }

        if (memSize != undefined) {
            this.#AdjustMemSize(memSize, defaultVal);
        }
    }

    Subscribe (
        inputCallback=undefined,
        outputCallback=undefined,
        cIndexOnChangeCallback=undefined,
        memPtrOnChangeCallback=undefined,
        memPtrUnderflowCallback=undefined,
        memPtrOverflowCallback=undefined,
        codeEndedCallback=undefined,
        cellUnderflowCallback=undefined,
        cellOverflowCallback=undefined,
        memCellOnChangeCallback=undefined,
        memCellOnSetCallback=undefined
    ) {
        if (inputCallback != undefined) {
            this.InputCallback = inputCallback;
        }

        if (outputCallback != undefined) {
            this.OutputCallback = outputCallback;
        }

        if (cIndexOnChangeCallback != undefined) {
            this.CIndexOnChangeCallback = cIndexOnChangeCallback;
        }

        if (memPtrOnChangeCallback != undefined) {
            this.MemPtrOnChangeCallback = memPtrOnChangeCallback;
        }

        if (memPtrUnderflowCallback != undefined) {
            this.MemPtrUnderflowCallback = memPtrUnderflowCallback;
        }

        if (memPtrOverflowCallback != undefined) {
            this.MemPtrOverflowCallback = memPtrOverflowCallback;
        }

        if (codeEndedCallback != undefined) {
            this.CodeEndedCallback = codeEndedCallback;
        }

        if (cellUnderflowCallback != undefined) {
            this.CellUnderflowCallback = cellUnderflowCallback;
        }

        if (cellOverflowCallback != undefined) {
            this.CellOverflowCallback = cellOverflowCallback;
        }

        if (memCellOnChangeCallback != undefined) {
            this.MemCellOnChangeCallback = memCellOnChangeCallback;
        }

        if (memCellOnSetCallback != undefined) {
            this.MemCellOnSetCallback = memCellOnSetCallback;
        }
    }

    #BFDefaultCodeExecuteOperation (code) {
        let nextCIndex = this.CIndex;

        if (code === '+') {
            this.BF_IncrementCellVal_Operation();
        }
        else if (code === '-') {
            this.BF_DecrementCellVal_Operation();
        }
        else if (code === '>') {
            this.BF_NextCell_Operation();
        }
        else if (code === '<') {
            this.BF_PrevCell_Operation();
        }
        else if (code === '.') {
            this.BF_Output_Operation();
        }
        else if (code === ',') {
            this.BF_Input_Operation();
        }
        else if (code === '[') {

        }
        else if (code === ']') {

        }

        return nextCIndex + 1;
    }

    Execute () {
        if (this.CodeEnded === false) {
            const code = this.BFCode[this.CIndex];

            if (this.CodeExecuteOperation == undefined) {
                this.CIndex = this.#BFDefaultCodeExecuteOperation(code);
            }
            else {
                this.CIndex = this.CodeExecuteOperation(code, this);
            }
        }

        return this;    // For chaining.
    }

    BF_IncrementCellVal_Operation () {
        const val = this.GetCurrentCellVal();
        this.SetCurrentCellVal(val + 1);
    }

    BF_DecrementCellVal_Operation () {
        const val = this.GetCurrentCellVal();
        this.SetCurrentCellVal(val - 1);
    }

    BF_NextCell_Operation () {
        this.CIndex += 1;
    }

    BF_PrevCell_Operation () {
        this.CIndex -= 1;
    }

    BF_Input_Operation () {
        const input = this.InputCallback(this);
        this.SetCurrentCellVal(input);
    }

    BF_Output_Operation () {
        const output = this.GetCurrentCellVal();
        this.OutputCallback(output, this);
    }
}

export default BrainfuckExecuter;
export { BFMemoryMaxSize, BrainfuckExecuter };
