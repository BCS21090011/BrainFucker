import { CustomValueError, CustomValueTooSmallError, CustomValueTooLargeError, CustomTypeError } from "./CustomErrors";

function EnsureInt (val, msg=null) {
    msg = msg ?? `${val} is not an integer.`;

    if (Number.isInteger(val) != true) {
        throw new CustomTypeError(msg);
    }
}

function EnsureMinMax (min, max, msg=null) {
    msg = msg ?? `min, ${min}, shouldn't be bigger than max, ${max}.`;

    if (min > max) {
        throw new CustomValueError(msg);
    }
}

function EnsureInRange(val, min=null, max=null, smallerMsg=null, largerMsg=null) {
    if (min != null && max != null) {
        EnsureMinMax(min, max);
    }

    smallerMsg = smallerMsg ?? `val, ${val}, shouldn't be smaller than min, ${min}.`;
    largerMsg = largerMsg ?? `val, ${val}, shouldn't be larger than max, ${max}.`;

    if (min != null) {
        if (val < min) {
            throw new CustomValueTooSmallError(smallerMsg, val, min);
        }
    }

    if (max != null) {
        if (val > max) {
            throw new CustomValueTooLargeError(largerMsg, val, max);
        }
    }
}

function IsInRange(val, min=null, max=null) {
    if (min != null && max != null) {
        EnsureMinMax(min, max);
    }

    if (min != null) {
        if (val < min) {
            return false;
        }
    }

    if (max != null) {
        if (val > max) {
            return false;
        }
    }

    return true;
}

class WatchedVal {
    #val = undefined;

    constructor (val, valOnChangeCallback=null, valOnSetCallback=null, valChangesCheckerCallback=null) {
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

export { EnsureInt, EnsureMinMax, EnsureInRange, IsInRange, WatchedVal }
