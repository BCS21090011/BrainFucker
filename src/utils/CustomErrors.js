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

export { CustomError, CustomCarryError, CustomValueError, CustomValueTooSmallError, CustomValueTooLargeError, CustomTypeError, CustomMissingArgumentError }
