function EnsureString (val, msg=undefined) {
    msg = msg ?? `${val} is not a string.`;

    if (typeof val != "string") {
        throw new CustomTypeError(msg);
    }
}

function EnsureInt (val, msg=undefined) {
    msg = msg ?? `${val} is not an integer.`;

    if (Number.isInteger(val) != true) {
        throw new CustomTypeError(msg);
    }
}

function EnsureMinMax (min, max, msg=undefined) {
    msg = msg ?? `min, ${min}, shouldn't be bigger than max, ${max}.`;

    if (min > max) {
        throw new CustomValueError(msg);
    }
}

function EnsureInRange(val, min=undefined, max=undefined, smallerMsg=undefined, largerMsg=undefined) {
    if (min != undefined && max != undefined) {
        EnsureMinMax(min, max);
    }

    smallerMsg = smallerMsg ?? `val, ${val}, shouldn't be smaller than min, ${min}.`;
    largerMsg = largerMsg ?? `val, ${val}, shouldn't be larger than max, ${max}.`;

    if (min != undefined) {
        if (val < min) {
            throw new CustomValueTooSmallError(smallerMsg, val, min);
        }
    }

    if (max != undefined) {
        if (val > max) {
            throw new CustomValueTooLargeError(largerMsg, val, max);
        }
    }
}

function IsInRange(val, min=undefined, max=undefined) {
    if (min != undefined && max != undefined) {
        EnsureMinMax(min, max);
    }

    if (min != undefined) {
        if (val < min) {
            return false;
        }
    }

    if (max != undefined) {
        if (val > max) {
            return false;
        }
    }

    return true;
}

class WatchedVal {
    #val = undefined;

    constructor (val, valOnChangeCallback=undefined, valOnSetCallback=undefined, valChangesCheckerCallback=undefined) {
        /*
        The default valChangesCheckerCallback() is for immutable only.

        * valOnChangeCallback(valBefore, valAfter):
            * Called when val changes.
            * valBefore is the val before changes.
            * valAfter is the val after changes.
        * valOnSetCallback(val):
            * Called when val is setted.
            * val is the val after setted.
        * valChangesCheckerCallback(oldVal, newVal) -> bool:
            * Called to check if oldVal and newVal are the same.
            * oldVal is the original value.
            * newVal is the new value.
            * Return true if oldVal and newVal aren't the same, false otherwise.
        */

        this.#val = val;

        this.ValOnChangeCallback = valOnChangeCallback ?? ((valBefore, valAfter) => { });
        this.ValOnSetCallback = valOnSetCallback ?? ((val) => { });
        this.ValChangesCheckerCallback = valChangesCheckerCallback ?? ((oldVal, newVal) => {
            return oldVal !== newVal;
        });
    }

    get Val () {
        return this.#val;
    }

    set Val (newVal) {
        if (this.ValChangesCheckerCallback(this.#val, newVal)) {
            const originalVal = this.#val;

            this.#val = newVal;

            this.ValOnChangeCallback(originalVal, this.#val);
        }

        this.ValOnSetCallback(this.#val);
    }

    toString () {
        return this.#val.toString();
    }

    valueOf () {
        return this.#val;
    }
}



class CustomError extends Error {
    #errorName = "CustomError";
    #identifier = undefined; // If needed to differentiate with other error of same class.

    constructor (msg, identifier=undefined) {
        super(msg);

        this.name = this.constructor.name;
        this.#errorName = this.constructor.name;
        this.#identifier = identifier;
    }

    get ErrorName () {
        return this.#errorName;
    }

    get Identifier () {
        return this.#identifier;
    }
}

class CustomCarryError extends CustomError {
    constructor (msg, carryValue=undefined, identifier=undefined) {
        super(msg, identifier);
        this.CarryValue = carryValue;
    }
}

class CustomValueError extends CustomCarryError {
    constructor (msg=undefined, val=undefined, carryValue=undefined, identifier=undefined) {
        if (val != undefined) {
            msg = msg ?? `Val, ${val}, is invalid.`;
        }

        super(msg, carryValue, identifier);
        this.Val = val;
    }
}

class CustomValueTooSmallError extends CustomValueError {
    constructor (msg=undefined, val=undefined, min=undefined, carryValue=undefined, identifier=undefined) {
        if (val != undefined && min != undefined) {
            msg = msg ?? `Val, ${val}, shouldn't be smaller than ${min}.`;
        }

        super(msg, val, carryValue, identifier);
        this.Min = min;
    }
}

class CustomValueTooLargeError extends CustomValueError {
    constructor (msg=undefined, val=undefined, max=undefined, carryValue=undefined, identifier=undefined) {
        if (val != undefined && max != undefined) {
            msg = msg ?? `Val, ${val}, shouldn't be larger than ${max}.`;
        }

        super(msg, val, carryValue, identifier);
        this.Max = max;
    }
}

class CustomTypeError extends CustomCarryError { }

class CustomMissingArgumentError extends CustomCarryError {
    constructor (msg, argumentName=undefined, carryValue=undefined, identifier=undefined) {
        if (argumentName != undefined) {
            msg = msg ?? `Argument, ${argumentName}, is required.`;
        }

        super(msg, carryValue, identifier);
        this.ArgumentName = argumentName;
    }
}



class WrappedInt {
    /*
    * All val, min, and max should be integer only.
    * min must be smaller or equal to max, or an error will be thrown.
    * val can be any integer, it will be wrapped if not within min and max.
    * Can use Copy() to create another WrappedInt with the states,
        but the callbacks might be copied as references only.

    * UnderflowCallback(valBefore, valAfter, wrappedIntAfter):
        * Will be called when val underflowed.
        * valBefore is an integer, which is the out-range val before wrapped.
        * valAfter is the wrapped val integer.
        * wrappedIntAfter is the WrappedInt object (this) after wrapped.
    * OverflowCallback(valBefore, valAfter, wrappedIntAfter):
        * Will be called when val overflowed.
        * valBefore is an integer, which is the out-range val before wrapped.
        * valAfter is the wrapped val integer.
        * wrappedIntAfter is the WrappedInt object (this) after wrapped.
    * ValOnChangeCallback(oldVal, newVal, wrappedIntAfter):
        * Will be called whenever val is changed after setted or wrapped (when changing min and max).
        * Called from the setters instead of Wrap() due to how Wrap() is called
            (unable to detect changes without wrap if not checked in val's setter;
            will be called twice if checked in both val's setter and Wrap()).
        * oldVal is the original val before changes.
        * newVal is the new val after changes.
        * wrappedIntAfter is the WrappedInt object (this) after changes.
    * ValOnSetCallback(val, wrappedInt):
        * Will be called when val is setted, regardless if val is changed.
        * val is the val integer after setted.
        * wrappedInt is the WrappedInt object (this) after it is setted.
    */

    #min = 0;
    #max = 0;
    #value = 0;

    constructor (
        val=0,
        min=0,
        max=0,
        underflowCallback=undefined,
        overflowCallback=undefined,
        valOnChangeCallback=undefined,
        valOnSetCallback=undefined
    ) {

        EnsureInt(val);
        EnsureInt(min);
        EnsureInt(max);
        EnsureMinMax(min, max);

        this.#min = min;
        this.#max = max;

        this.UnderflowCallBack = underflowCallback ?? ((valBefore, valAfter, wrappedIntAfter) => { });
        this.OverflowCallBack = overflowCallback ?? ((valBefore, valAfter, wrappedIntAfter) => { });
        this.ValOnChangeCallback = valOnChangeCallback ?? ((oldVal, newVal, wrappedIntAfter) => { });
        this.ValOnSetCallback = valOnSetCallback ?? ((val, wrappedInt) => { });

        this.#value = WrappedInt.Wrap(val, this.#min, this.#max);
    }

    get Min () {
        return this.#min;
    }

    set Min (newVal) {
        EnsureInt(newVal);
        EnsureMinMax(newVal, this.#max);

        if (this.#min !== newVal) {
            this.#min = newVal;

            const originalVal = this.#value;

            this.#Wrap();

            if (originalVal !== this.#value) {
                this.ValOnChangeCallback(originalVal, this.#value, this);
            }
        }
    }

    get Max () {
        return this.#max;
    }

    set Max (newVal) {
        EnsureInt(newVal);
        EnsureMinMax(this.#min, newVal);

        if (this.#max !== newVal) {
            this.#max = newVal;

            const originalVal = this.#value;

            this.#Wrap();

            if (originalVal !== this.#value) {
                this.ValOnChangeCallback(originalVal, this.#value, this);
            }
        }
    }

    get Val () {
        return this.#value;
    }

    set Val (newVal) {
        EnsureInt(newVal);

        const originalVal = this.#value;

        this.#value = newVal;
        this.#Wrap();

        if (originalVal !== this.#value) {
            this.ValOnChangeCallback(originalVal, this.#value, this);
        }
        
        this.ValOnSetCallback(this.#value, this);
    }

    static Wrap (val, min, max) {
        EnsureInt(val);
        EnsureInt(min);
        EnsureInt(max);
        EnsureMinMax(min, max);

        /*
        Take number with min = 0, max = 9 for example:
        diff = 9 - 0 + 1
        diff = 10

        If val = -1, which is one number before the smallest,
        it should actually be the largest value after wrap, which is 9.
        */

        const diff = max - min + 1;
        return ((val - min) % diff + diff) % diff + min;
    }

    #Wrap () {
        let underflowed = false;
        let overflowed = false;

        const originalVal = this.#value;

        if (this.#value < this.#min) {
            underflowed = true;
        }

        if (this.#value > this.#max) {
            overflowed = true;
        }

        this.#value = WrappedInt.Wrap(this.#value, this.#min, this.#max);

        if (underflowed === true) {
            this.UnderflowCallBack(originalVal, this.#value, this);
        }

        if (overflowed === true) {
            this.OverflowCallBack(originalVal, this.#value, this.#value, this);
        }
    }

    Copy (includeCallbacks=true) {
        return new WrappedInt(
            this.#value,
            this.#min,
            this.#max,
            includeCallbacks ? this.UnderflowCallBack : undefined,
            includeCallbacks ? this.OverflowCallBack : undefined,
            includeCallbacks ? this.ValOnChangeCallback : undefined,
            includeCallbacks ? this.ValOnSetCallback : undefined
        );
    }

    toString () {
        return `WrappedInt(${this.#value} [${this.#min}~${this.#max}])`;
    }

    valueOf () {
        return this.#value;
    }

    toJSON () {
        return {
            "Val": this.#value,
            "Min": this.#min,
            "Max": this.#max
        }
    }
}

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
        EnsureInRange(newVal, this.CellMinVal, this.CellMaxVal);
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
            EnsureInRange(conditionVal, this.CellMinVal, this.CellMaxVal);
            this.ConditionVal = conditionVal;
        }
        else {
            if (IsInRange(this.ConditionVal, this.CellMinVal, this.CellMaxVal) === false) {
                this.ConditionVal = this.CellMinVal;
            }
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

    #BFDefaultCodeExecuteOperation (code) {
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
            this.BF_Output_Operation();
        }
        else if (code === ',') {
            this.BF_Input_Operation();
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

    BF_Execute () {
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

    BF_Input_Operation () {
        this.CurrentCellVal = this.InputCallback(this);
        return this;
    }

    BF_Output_Operation () {
        this.OutputCallback(this.CurrentCellVal, this);
        return this;
    }
}



const body = document.querySelector("body");
const terminal = document.createElement("div");
terminal.style.width = "80vw";
terminal.style.height = "80vh";
terminal.style.border = "1px solid black";
terminal.style.overflowY = "auto";
terminal.style.color = "white";
terminal.style.backgroundColor = "black";
body.appendChild(terminal);

let buffer = [];

function TerminalAddText (text) {
    terminal.appendChild(document.createTextNode(text));
    terminal.scrollTop = terminal.scrollHeight;
}

function Char_To_ASCII_Int(str) {
    if (typeof str !== "string" || str.length === 0) {
        throw new Error("Expected non-empty string.");
    }
    return [...str].map(c => c.charCodeAt(0));
}

function MyInput (obj) {
    if (buffer.length <= 0) {
        const inp = prompt("Input:");
        TerminalAddText(inp);
        buffer.push(...Char_To_ASCII_Int(inp));
    }
    
    return buffer.shift();
}

function MyOutput (output, obj) {
    const outputChar = String.fromCharCode(output);
    TerminalAddText(outputChar);
}

const bf = new BrainfuckExecuter("", 30000, {
    "inputCallback": MyInput,
    "outputCallback": MyOutput
});

function ExecuteTillEnd (bfObj) {
    while (!bfObj.CodeEnded) {
        bfObj.BF_Execute();
    }
}
