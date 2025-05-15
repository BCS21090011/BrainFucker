class CustomError extends Error {
    #errorName = "CustomError";

    constructor (msg) {
        this.#errorName = this.constructor.name;

        super(msg);
    }

    get ErrorName () {
        return this.#errorName;
    }
}

class ValueError extends CustomError { }

class ValueTooSmallError extends ValueError { }

class ValueTooLargeError extends ValueError { }

class TypeError extends CustomError { }

export { CustomError, ValueError, ValueTooSmallError, ValueTooLargeError, TypeError }
