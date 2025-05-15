class CustomError extends Error {
    #errorName = "CustomError";
    #identifier = null; // If needed to differentiate with other error of same class.

    constructor (msg, identifier=null) {
        super(msg);

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
    constructor (msg, carryValue=null, identifier=null) {
        super(msg, identifier);
        this.CarryValue = carryValue;
    }
}

class ValueError extends CustomCarryError {
    constructor (msg=undefined, val=null, carryValue=null, identifier=null) {
        if (val != null) {
            msg = msg ?? `Val, ${val}, is invalid.`;
        }

        super(msg, identifier, carryValue);
        this.Val = val;
    }
}

class ValueTooSmallError extends ValueError {
    constructor (msg=undefined, val=null, min=null, carryValue=null, identifier=null) {
        if (val != null && min != null) {
            msg = msg ?? `Val, ${val}, shouldn't be smaller than ${min}.`;
        }

        super(msg, identifier, carryValue, val);
        this.Min = min;
    }
}

class ValueTooLargeError extends ValueError {
    constructor (msg=undefined, val=null, max=null, carryValue=null, identifier=null) {
        if (val != null && max != null) {
            msg = msg ?? `Val, ${val}, shouldn't be larger than ${max}.`;
        }

        super(msg, identifier, carryValue, val);
        this.Max = max;
    }
}

class TypeError extends CustomCarryError { }

export { CustomError, CustomCarryError, ValueError, ValueTooSmallError, ValueTooLargeError, TypeError }
