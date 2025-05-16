import { WrappedInt } from "./WrappedInt";
import { EnsureInRange, EnsureInt } from "../utils/utils";
import { CustomValueError } from "../utils/CustomErrors";

class MemPtrOutOfRangeError extends CustomValueError {
    constructor (msg=undefined, memPtr=null, memSize=null, carryValue=null, identifier=null) {
        if (memPtr != null) {
            msg = msg ?? `Memory pointer, ${memPtr}, is out of range.`;
        }

        super(msg, memPtr, carryValue, identifier);
        this.MemSize = memSize;
    }
}

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
            * CIndexOnChangeCallback(oldVal, brainfuckExecuterAfter):
                * Called when code index changes.
            * MemPtrOnChangeCallback(oldVal, brainfuckExecuterAfter):
                * Called when memory pointer changes.
            * MemPtrUnderflowCallback(oldVal, brainfuckExecuterAfter):
                * Called when memory pointer underflows.
                * Default to throwing error.
            * MemPtrOverflowCallback(oldVal, brainfuckExecuterAfter):
                * Called when memory pointer overflows.
                * Default to throwing error.
            * CodeEndedCallback(brainfuckExecuter):
                * Called when code execution ended, which means reached the end of code.
            
            Cell specific callbacks:
                * CellUnderflowCallback(index, valBeforeWrapped, wrappedIntAfter, brainfuckExecuterAfter):
                    * Called when memory cell underflows.
                * CellOverflowCallback(index, valBeforeWrapped, wrappedIntAfter, brainfuckExecuterAfter):
                    * Called when memory cell overflows.
                * MemCellOnChangeCallback(index, oldVal, wrappedIntAfter, brainfuckExecuterAfter):
                    * Called when memory cell changes.
                * MemCellOnSetCallback(index, wrappedInt, brainfuckExecuterAfter):
                    * Called when memory cell is setted.
    */

    constructor (bfCode="", inputCallback=null, outputCallback=null, memSize=null, config={}) {
        const {
            cIndex = 0,
            memPtr = 0,
            mem = null,
            cellMinVal = 0,
            cellMaxVal = 255,
            conditionVal = null,
            defaultVal = null,
            cIndexOnChangeCallback = ((oldVal, brainfuckExecuterAfter) => { }),
            memPtrOnChangeCallback = ((oldVal, brainfuckExecuterAfter) => { }),
            codeEndedCallback = ((brainfuckExecuter) => { }),
            cellUnderflowCallback = ((index, valBeforeWrapped, wrappedIntAfter, brainfuckExecuterAfter) => { }),
            cellOverflowCallback = ((index, valBeforeWrapped, wrappedIntAfter, brainfuckExecuterAfter) => { }),
            memCellOnChangeCallback = ((index, oldVal, wrappedIntAfter, brainfuckExecuterAfter) => { }),
            memCellOnSetCallback = ((index, wrappedInt, brainfuckExecuterAfter) => { })
        } = config;
    }

    #InitializeMemory (defaultVal=null) {
        // Use object's memSize and mem.
    }

    SetConfig (bfCode="", inputCallback=null, outputCallback=null, memSize=null, config={}) {
        const {
            cIndex = 0,
            memPtr = 0,
            mem = null,
            cellMinVal = 0,
            cellMaxVal = 255,
            conditionVal = null,
            defaultVal = null,
            cIndexOnChangeCallback = ((oldVal, brainfuckExecuterAfter) => { }),
            memPtrOnChangeCallback = ((oldVal, brainfuckExecuterAfter) => { }),
            codeEndedCallback = ((brainfuckExecuter) => { }),
            cellUnderflowCallback = ((index, valBeforeWrapped, wrappedIntAfter, brainfuckExecuterAfter) => { }),
            cellOverflowCallback = ((index, valBeforeWrapped, wrappedIntAfter, brainfuckExecuterAfter) => { }),
            memCellOnChangeCallback = ((index, oldVal, wrappedIntAfter, brainfuckExecuterAfter) => { }),
            memCellOnSetCallback = ((index, wrappedInt, brainfuckExecuterAfter) => { })
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
        */
    }

    Execute () {
        return this;    // For chaining
    }
}

/*
class BrainfuckExecuter {
    #cell_minVal = 0;
    #cell_maxVal = 255;

    #code = "";
    #memSize = 30000;
    #cIndex = 0;
    #memPtr = 0;
    #mem = null;

    #loopMap = {}
    #leftOutLoops = [];

    constructor (
        code="",
        memSize=30000,
        cIndex=0,
        memPtr=0,
        mem=null,
        inputCallback=null,
        outputCallback=null,
        onEachCIterAftCallback=null,
        cellUnderflowCallback=null,
        cellOverflowCallback=null,
        cellOnChangeCallback=null,
        cellOnSetCallback=null,
        cIndexOnChangeCallback=null,
        memPtrOnChangeCallback=null,
        cell_minValOnChangeCallback=null,
        cell_maxValOnChangeCallback=null

    ) {
        this.#code = code;
        this.#memSize = memSize;
        this.#cIndex = cIndex;
        this.#memPtr = memPtr;

        this.InputCallback = inputCallback ?? function (brainfuckExecuter) { };
        this.OuptutCallback = outputCallback ?? function (output, brainfuckExecuter) { };

        this.OnEachCIterAftCallback = onEachCIterAftCallback ?? function (brainfuckExecuter) { };

        this.CellUnderflowCallback = cellOnChangeCallback ?? function (index, valBeforeWrapped, wrappedIntAfter) { };
        this.CellOverflowCallback = cellOverflowCallback ?? function (index, valBeforeWrapped, wrappedIntAfter) { };
        this.CellOnChangeCallback = cellOnChangeCallback ?? function (index, original, wrappedIntAfter) { };
        this.CellOnSetCallback = cellOnSetCallback ?? function (index, wrappedIntAfter) { };

        this.CIndexOnChangeCallback = cIndexOnChangeCallback ?? function (original, brainfuckExecuter) { };
        this.MemPtrOnChangeCallback = memPtrOnChangeCallback ?? function (original, brainfuckExecuter) { };
        this.Cell_minValOnChangeCallback = cell_minValOnChangeCallback ?? function (original, brainfuckExecuter) { };
        this.Cell_maxValOnChangeCallback = cell_maxValOnChangeCallback ?? function (original, brainfuckExecuter) { };

        this.#initializeMem();
    }

    get Cell_minVal () {
        return this.#cell_minVal;
    }

    get Cell_maxVal () {
        return this.#cell_maxVal;
    }

    get CIndex () {
        return this.#cIndex;
    }

    set CIndex (newVal) {
        EnsureInt(newVal);
        EnsureInRange(newVal, 0, this.#code.length);

        if (this.#cIndex !== newVal) {
            const originalCIndex = this.#cIndex;

            this.#cIndex = newVal;

            this.CIndexOnChangeCallback(originalCIndex, this);
        }
    }

    get MemPtr () {
        return this.#memPtr;
    }

    set MemPtr (newVal) {
        EnsureInt(newVal);
        EnsureInRange(newVal, 0, this.#memSize);

        if (this.#memPtr !== newVal) {
            const originalMemPtr = this.#memPtr;

            this.#memPtr = newVal;

            this.MemPtrOnChangeCallback(originalMemPtr, this);
        }
    }

    #createCell (index, defaultVal=0) {
        EnsureInt(index);
        EnsureInRange(index, 0, this.#memSize);

        EnsureInt(defaultVal);

        return new WrappedInt(
            defaultVal,
            this.#cell_minVal,
            this.#cell_maxVal,
            function (valBeforeWrapped, wrappedIntAfter) {
                this.CellUnderflowCallback(index, valBeforeWrapped, wrappedIntAfter);
            },
            function (valBeforeWrapped, wrappedIntAfter) {
                this.CellOverflowCallback(index, valBeforeWrapped, wrappedIntAfter);
            },
            function (oldVal, wrappedIntAfter) {
                this.CellOnChangeCallback(index, oldVal, wrappedIntAfter);
            },
            null
        );
    }
    
    #initializeMem (defaultVal=0) {
        EnsureInt(defaultVal);

        this.#mem = [];

        for (let i = 0; i < this.#memSize; i++) {
            this.#mem.push(this.#createCell(i, defaultVal));
        }
    }

    MapLoop () {
        const loopHeadStack = [];

        for (let i = 0; i < this.#code.length; i++) {
            const char = this.#code[i];

            if (char === '[') {
                loopHeadStack.push(i);
            }
            else if (char === ']') {
                if (loopHeadStack.length >= 1) {
                    const loopHead = loopHeadStack.pop();
                    this.#loopMap[loopHead] = i;
                    this.#loopMap[i] = loopHead;
                }
                else {
                    this.#leftOutLoops.push(i);
                }
            }
        }

        this.#leftOutLoops.push(...loopHeadStack);
    }

    ExecuteCode () {
        if (this.CIndex < this.#code.length) {
            const code = this.#code[this.CIndex];

            if (code === '+') {
                this.BF_Increment();
            }
            else if (code === '-') {
                this.BF_Decrement();
            }
            else if (code === '>') {
                this.BF_MoveRight();
            }
            else if (code === '<') {
                this.BF_MoveLeft();
            }
            else if (code === '.') {
                this.BF_Input();
            }
            else if (code === ',') {
                this.BF_Output();
            }
            else if (code === '[') {
                if (this.#mem[this.MemPtr].Val === 0) {
                    const tail = this.#loopMap[this.CIndex];
                    this.CIndex = tail;
                }
            }
            else if (code === ']') {
                if (this.#mem[this.MemPtr].Val !== 0) {
                    const head = this.#loopMap[this.CIndex];
                    this.CIndex = head;
                }
            }
            else {

            }

            this.CIndex += 1;

            this.OnEachCIterAftCallback(this);
        }
    }

    // BF_actions:
    BF_MoveLeft () {
        this.MemPtr -= 1;
    }

    BF_MoveRight () {
        this.MemPtr += 1;
    }

    BF_Increment () {
        this.#mem[this.MemPtr].Val += 1;
    }

    BF_Decrement () {
        this.#mem[this.MemPtr].Val -= 1;
    }

    BF_Input () {
        const input = this.InputCallback(this);

        EnsureInt(input);
        EnsureInRange(input, this.#cell_minVal, this.#cell_maxVal);

        this.#mem[this.MemPtr].Val = input;
    }

    BF_Output () {
        const output = Number(this.#mem[this.MemPtr].Val);

        this.OuptutCallback(output, this);
    }
}
*/

export default BrainfuckExecuter;
