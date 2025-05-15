class CustomError extends Error {
    #errorName = "CustomError";
    #identifier = null; // If needed to differentiate with other error of same class.

    constructor (msg, identifier=null) {
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
    constructor (msg, carryValue=null, identifier=null) {
        super(msg, identifier);
        this.CarryValue = carryValue;
    }
}

class CustomValueError extends CustomCarryError {
    constructor (msg=undefined, val=null, carryValue=null, identifier=null) {
        if (val != null) {
            msg = msg ?? `Val, ${val}, is invalid.`;
        }

        super(msg, carryValue, identifier);
        this.Val = val;
    }
}

class CustomValueTooSmallError extends CustomValueError {
    constructor (msg=undefined, val=null, min=null, carryValue=null, identifier=null) {
        if (val != null && min != null) {
            msg = msg ?? `Val, ${val}, shouldn't be smaller than ${min}.`;
        }

        super(msg, val, carryValue, identifier);
        this.Min = min;
    }
}

class CustomValueTooLargeError extends CustomValueError {
    constructor (msg=undefined, val=null, max=null, carryValue=null, identifier=null) {
        if (val != null && max != null) {
            msg = msg ?? `Val, ${val}, shouldn't be larger than ${max}.`;
        }

        super(msg, val, carryValue, identifier);
        this.Max = max;
    }
}

class CustomTypeError extends CustomCarryError { }

export { CustomError, CustomCarryError, CustomValueError, CustomValueTooSmallError, CustomValueTooLargeError, CustomTypeError }
