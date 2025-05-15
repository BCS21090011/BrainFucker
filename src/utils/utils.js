import { ValueError, ValueTooSmallError, ValueTooLargeError, TypeError } from "./CustomErrors";

function EnsureInt (val, msg=null) {
    msg = msg ?? `${val} is not an integer.`;

    if (Number.isInteger(val) != true) {
        throw new TypeError(msg);
    }
}

function EnsureMinMax (min, max, msg=null) {
    msg = msg ?? `min, ${min}, shouldn't be bigger than max, ${max}.`;

    if (min > max) {
        throw new ValueError(msg);
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
            throw new ValueTooSmallError(smallerMsg, val, min);
        }
    }

    if (max != null) {
        if (val > max) {
            throw new ValueTooLargeError(largerMsg, val, max);
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

    constructor (val, valOnChangeCallback=null, valOnSetCallback=null) {
        /*
        * valOnChangeCallback(valBefore, valAfter):
            * called when val changes.
            * valBefore is the val before changes.
            * valAfter is the val after changes.
        * valOnSetCallback(val):
            * called when val is setted.
            * val is the val after setted.
        */

        this.#val = val;

        this.ValOnChangeCallback = valOnChangeCallback ?? ((valBefore, valAfter) => { });
        this.ValOnSetCallback = valOnSetCallback ?? ((val) => { });
    }

    get Val () {
        return this.#val;
    }

    set Val (newVal) {
        if (this.#val !== newVal) {
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