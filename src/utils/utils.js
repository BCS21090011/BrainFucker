import { CustomValueError, CustomValueTooSmallError, CustomValueTooLargeError, CustomTypeError } from "./CustomErrors";

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

export { EnsureString, EnsureInt, EnsureMinMax, EnsureInRange, IsInRange, WatchedVal }
