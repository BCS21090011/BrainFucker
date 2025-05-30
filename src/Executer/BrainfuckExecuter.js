import WrappedInt from "./WrappedInt";
import { EnsureInRange, EnsureInt, EnsureMinMax, EnsureString, IsInRange, WatchedVal } from "../utils/utils";
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
    #bfCode = new WatchedVal(
        "",
        (valBefore, valAfter) => {
            const mapResult = BrainfuckExecuter.MapLoopPairs(valAfter);

            this.#loopPairs = mapResult.LoopPairs;
            this.#leftOutLoops = mapResult.LeftOutLoops;
        }
    );
    #cIndex = new WatchedVal(
        0,
        (valBefore, valAfter) => {
            this.CIndexOnChangeCallback(valBefore, valAfter, this);

            if (this.CodeEnded === true) {
                this.CodeEndedCallback(this);
            }
        }
    );
    #memPtr = new WatchedVal(
        0,
        (valBefore, valAfter) => {
            this.MemPtrOnChangeCallback(valBefore, valAfter, this);
            this.#CheckMemPtr();
        }
    );
    #memArr = [];
    #cellMinVal = new WatchedVal(
        0,
        (valBefore, valAfter) => {
            for (let i = 0; i < this.MemSize; i++) {
                this.#memArr[i].Min = valAfter;
            }
        }
    );
    #cellMaxVal = new WatchedVal(
        255,
        (valBefore, valAfter) => {
            for (let i = 0; i < this.MemSize; i++) {
                this.#memArr[i].Max = valAfter;
            }
        }
    );
    #conditionVal = 0;

    #loopPairs = {};
    #leftOutLoops = [];

    InputCallback = (brainfuckExecuter) => { return brainfuckExecuter.CellMinVal; };
    OutputCallback = (output, brainfuckExecuter) => { };

    CIndexOnChangeCallback = (oldVal, newVal, brainfuckExecuterAfter) => { };
    MemPtrOnChangeCallback = (oldVal, newVal, brainfuckExecuterAfter) => { };
    MemPtrUnderflowCallback = (val, brainfuckExecuter) => {
        throw new MemPtrOutOfRangeError(undefined, val, brainfuckExecuter.MemSize);
    };
    MemPtrOverflowCallback = (val, brainfuckExecuter) => {
        throw new MemPtrOutOfRangeError(undefined, val, brainfuckExecuter.MemSize);
    };
    CodeEndedCallback = (brainfuckExecuter) => { };
    CellUnderflowCallback = (index, valBefore, valAfter, brainfuckExecuterAfter) => { };
    CellOverflowCallback = (index, valBefore, valAfter, brainfuckExecuterAfter) => { };
    MemCellOnChangeCallback = (index, oldVal, newVal, brainfuckExecuterAfter) => { };
    MemCellOnSetCallback = (index, val, brainfuckExecuterAfter) => { };
    CodeExecuteOperation = undefined;

    constructor (bfCode="", memSize=30000, config={}) {
        /*
        Check for arguments that are necessary to create the object.
        These arguments are handled/checked here rather than in SetConfig()
            is to avoid these arguments/parameters being undefined.
        All arguments in SetConfig() can be undefined, so that those will be skipped.
        */

        if (config.mem == undefined && memSize == undefined) {
            throw new CustomMissingArgumentError("Must provide either memSize or mem.", "memSize or mem");
        }

        // Other arguments for properties and callbacks won't be checked because they already have default value.
        
        this.SetConfig(bfCode, memSize, config);
    }

    get BFCode () {
        return this.#bfCode.Val;
    }

    set BFCode (newVal) {
        EnsureString(newVal);
        this.#bfCode.Val = newVal;
    }

    get MemSize () {
        return this.#memArr.length;
    }

    set MemSize (newVal) {
        this.#AdjustMemSize(newVal);
    }
    
    get LoopPairs () {
        return { ...this.#loopPairs };
    }

    get LeftOutLoops () {
        return [ ...this.#leftOutLoops ];
    }

    get CIndex () {
        return this.#cIndex.Val;
    }

    set CIndex (newVal) {
        EnsureInt(newVal);
        this.#cIndex.Val = newVal;
    }

    get MemPtr () {
        return this.#memPtr.Val;
    }

    set MemPtr (newVal) {
        EnsureInt(newVal);
        // Underflow and overflow will be handled by callbacks.
        this.#memPtr.Val = newVal;
    }

    get MemArr () {
        // Copy the whole this.#memArr and return it.
        const copiedMem = [];

        for (let i = 0; i < this.MemSize; i++) {
            copiedMem.push(this.GetCellVal(i));
        }

        return copiedMem;
    }

    set MemArr (newMem) {
        BrainfuckExecuter.ValidateMemArg(newMem);
        EnsureInRange(newMem.length, 1, BFMemoryMaxSize);

        this.#memArr = [];

        for (let i = 0; i < newMem.length; i++) {
            this.#memArr.push(this.#CreateCell(i, newMem[i]))
        }

        this.#CheckMemPtr();
    }

    get CellMinVal () {
        return this.#cellMinVal.Val;
    }
    
    set CellMinVal (newVal) {
        /*
        Cell val will be process by WrappedInt automatically.
        If changing min and max affect val,
        underflow or overflow callback, and on-change callback will be triggered.
        No callback will be triggered if val is not affected.
        If new min and max value will affect a lot of cell val,
        will trigger a lot callbacks.
        */

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
        this.#conditionVal = newVal;
    }

    get CodeEnded () {
        return this.CIndex >= this.BFCode.length;
    }
    
    GetCellVal (index) {
        return this.#memArr[index].Val;
    }

    SetCellVal (index, newVal) {
        EnsureInt(newVal);
        // Didn't check if in range so that it can be wrapped.
        this.#memArr[index].Val = newVal;
    }

    get CurrentCellVal () {
        return this.GetCellVal(this.MemPtr);
    }

    set CurrentCellVal (newVal) {
        this.SetCellVal(this.MemPtr, newVal);
    }

    set AllCellVal (newVal) {
        EnsureInt(newVal);

        this.#memArr.forEach((cell) => {
            cell.Val = newVal;
        });
    }

    SetAllCellVal (newVal) {
        this.AllCellVal = newVal;
        return this;
    }

    static ValidateMemArg (mem) {
        for (let i = 0; i < mem.length; i++) {
            const val = mem[i];
            EnsureInt(val);
        }
    }

    static MapLoopPairs (bfCode) {
        const loopHeadStack = [];
        const loopPairs = {};
        const leftOutLoops = [];

        for (let i = 0; i < bfCode.length; i++) {
            const code = bfCode[i];

            if (code === '[') {
                loopHeadStack.push(i);
            }
            else if (code === ']') {
                if (loopHeadStack.length > 0) {
                    const head = loopHeadStack.pop();
                    loopPairs[head] = i;
                    loopPairs[i] = head;
                }
                else {
                    leftOutLoops.push(i);
                }
            }
        }

        leftOutLoops.push(...loopHeadStack);

        return {
            LoopPairs: loopPairs,
            LeftOutLoops: leftOutLoops
        }
    }

    #CreateCell (index, cellVal) {
        return new WrappedInt(
            cellVal,
            this.CellMinVal,
            this.CellMaxVal,
            (valBefore, valAfter, wrappedIntAfter) => {
                this.CellUnderflowCallback(index, valBefore, valAfter, this);
            },
            (valBefore, valAfter, wrappedIntAfter) => {
                this.CellOverflowCallback(index, valBefore, valAfter, this);
            },
            (oldVal, newVal, wrappedIntAfter) => {
                this.MemCellOnChangeCallback(index, oldVal, newVal, this);
            },
            (val, wrappedInt) => {
                this.MemCellOnSetCallback(index, val, this);
            }
        );
    }

    #CheckMemPtr () {
        let passed = true;

        if (this.MemPtr < 0) {
            passed = false;
            this.MemPtrUnderflowCallback(this.MemPtr, this);
        }

        if (this.MemPtr >= this.MemSize) {
            passed = false;
            this.MemPtrOverflowCallback(this.MemPtr, this);
        }

        return passed;
    }

    #AdjustMemSize (memSize, defaultVal=undefined) {
        // Memory will be trimmed if memSize is smaller.

        EnsureInt(memSize);
        EnsureInRange(memSize, 1, BFMemoryMaxSize);

        defaultVal = defaultVal ?? this.CellMinVal;

        EnsureInt(defaultVal);
        EnsureInRange(defaultVal, this.CellMinVal, this.CellMaxVal);

        const currentMemSize = this.MemSize;
        const diff = currentMemSize - memSize;
        
        if (diff < 0) { // memSize is larger:
            for (let i = currentMemSize; i < memSize; i++) {
                this.#memArr.push(this.#CreateCell(i, defaultVal));
            }
        }
        else if (diff > 0) {    // memArr is larger:
            this.#memArr.splice(memSize, diff);
        }

        this.#CheckMemPtr();
    }

    SetConfig (bfCode=undefined, memSize=undefined, config={}) {
        const {
            cIndex = undefined,
            memPtr = undefined,
            mem = undefined,
            cellMinVal = undefined,
            cellMaxVal = undefined,
            conditionVal = undefined,
            defaultVal = undefined,
            inputCallback = undefined,
            outputCallback = undefined,
            cIndexOnChangeCallback = undefined,
            memPtrOnChangeCallback = undefined,
            memPtrUnderflowCallback = undefined,
            memPtrOverflowCallback = undefined,
            codeEndedCallback = undefined,
            cellUnderflowCallback = undefined,
            cellOverflowCallback = undefined,
            memCellOnChangeCallback = undefined,
            memCellOnSetCallback = undefined,
            codeExecuteOperation = undefined
        } = config;
        
        this.SubscribeCallbacks(
            inputCallback,
            outputCallback,
            cIndexOnChangeCallback,
            memPtrOnChangeCallback,
            memPtrUnderflowCallback,
            memPtrOverflowCallback,
            codeEndedCallback,
            cellUnderflowCallback,
            cellOverflowCallback,
            memCellOnChangeCallback,
            memCellOnSetCallback,
            codeExecuteOperation
        );

        if (bfCode != undefined) {
            this.BFCode = bfCode;
        }

        if (cIndex != undefined) {
            this.CIndex = cIndex;
        }
        else {
            if (this.CodeEnded === true) {
                this.CodeEndedCallback(this);
            }
        }

        if (memPtr != undefined) {
            this.MemPtr = memPtr;
        }

        if (cellMinVal != undefined) {
            this.CellMinVal = cellMinVal;
        }

        if (cellMaxVal != undefined) {
            this.CellMaxVal = cellMaxVal;
        }

        if (conditionVal != undefined) {
            this.ConditionVal = conditionVal;
        }

        if (mem != undefined) {
            this.MemArr = mem;
        }

        if (memSize != undefined) {
            this.#AdjustMemSize(memSize, defaultVal);
        }

        return this;
    }

    SubscribeCallbacks (
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
        memCellOnSetCallback=undefined,
        codeExecuteOperation=undefined
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

        // Since codeExecuteOperation can be undefined, won't check to skip:
        this.CodeExecuteOperation = codeExecuteOperation;

        return this;
    }

    toJSON () {
        return {
            "BFCode": this.BFCode,
            "CIndex": this.CIndex,
            "MemPtr": this.MemPtr,
            "MemSize": this.MemSize,
            "MemArr": this.MemArr,
            "CodeEnded": this.CodeEnded,
            "CellMinVal": this.CellMinVal,
            "CellMaxVal": this.CellMaxVal,
            "ConditionVal": this.ConditionVal,
            "LoopPairs": this.LoopPairs,
            "LeftOutLoops": this.LeftOutLoops
        }
    }

    Copy (includeCallbacks=true) {
        const copiedObj = new BrainfuckExecuter(
            this.BFCode,
            this.MemSize,
            {
                cIndex: this.CIndex,
                memPtr: this.MemPtr,
                mem: this.MemArr,
                cellMinVal: this.CellMinVal,
                cellMaxVal: this.CellMaxVal,
                conditionVal: this.ConditionVal,
                inputCallback: includeCallbacks ? this.InputCallback : undefined,
                outputCallback: includeCallbacks ? this.OutputCallback : undefined,
                cIndexOnChangeCallback: includeCallbacks ? this.CIndexOnChangeCallback : undefined,
                memPtrOnChangeCallback: includeCallbacks ? this.MemPtrOnChangeCallback : undefined,
                memPtrUnderflowCallback: includeCallbacks ? this.MemPtrUnderflowCallback : undefined,
                memPtrOverflowCallback: includeCallbacks ? this.MemPtrOverflowCallback : undefined,
                codeEndedCallback: includeCallbacks ? this.CodeEndedCallback : undefined,
                cellUnderflowCallback: includeCallbacks ? this.CellUnderflowCallback : undefined,
                cellOverflowCallback: includeCallbacks ? this.CellOverflowCallback : undefined,
                memCellOnChangeCallback: includeCallbacks ? this.MemCellOnChangeCallback : undefined,
                memCellOnSetCallback: includeCallbacks ? this.MemCellOnSetCallback : undefined,
                codeExecuteOperation: includeCallbacks ? this.CodeExecuteOperation : undefined
            }
        );
        return copiedObj;
    }

    async #BFDefaultCodeExecuteOperation (code) {
        let cIndex = this.CIndex;

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
            await this.BF_Output_Operation();
        }
        else if (code === ',') {
            await this.BF_Input_Operation();
        }
        else if (code === '[') {
            const tail = this.LoopPairs[cIndex];

            if (tail != undefined) {
                if (this.CurrentCellVal === this.ConditionVal) {
                    cIndex = this.LoopPairs[cIndex];
                }
            }
        }
        else if (code === ']') {
            const head = this.LoopPairs[cIndex];

            if (head != undefined) {
                if (this.CurrentCellVal !== this.ConditionVal) {
                    cIndex = this.LoopPairs[cIndex];
                }
            }
        }

        return cIndex + 1;
    }

    async BF_Execute () {
        if (this.CodeEnded === false) {
            const code = this.BFCode[this.CIndex];

            if (this.CodeExecuteOperation == undefined) {
                this.CIndex = await this.#BFDefaultCodeExecuteOperation(code);
            }
            else {
                this.CIndex = await this.CodeExecuteOperation(code, this);
            }
        }

        return this;    // For chaining.
    }

    BF_IncrementCellVal_Operation () {
        this.CurrentCellVal += 1;
        return this;
    }

    BF_DecrementCellVal_Operation () {
        this.CurrentCellVal -= 1;
        return this;
    }

    BF_NextCell_Operation () {
        this.MemPtr += 1;
        return this;
    }

    BF_PrevCell_Operation () {
        this.MemPtr -= 1;
        return this;
    }

    async BF_Input_Operation () {
        this.CurrentCellVal = await this.InputCallback(this);
        return this;
    }

    async BF_Output_Operation () {
        await this.OutputCallback(this.CurrentCellVal, this);
        return this;
    }
}

export default BrainfuckExecuter;
export { BFMemoryMaxSize, BrainfuckExecuter };
