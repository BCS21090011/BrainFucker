import { EnsureInt, EnsureMinMax } from "../utils/utils"

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

        this.#value = val;
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

            this.Wrap();

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

            this.Wrap();

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
        this.Wrap();

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

    Wrap () {
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

export default WrappedInt;
export { WrappedInt };

// Todo: Change all onchange callbacks to return oldVal, newVal, and the object itself.
