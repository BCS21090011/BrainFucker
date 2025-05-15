import { EnsureInt, EnsureMinMax } from "../utils/utils"

class WrappedInt {
    #min = 0;
    #max = 0;
    #value = 0;

    constructor (
        val=0,
        min=0,
        max=0,
        underflowCallback=null,
        overflowCallback=null,
        valOnChangeCallback=null,
        valOnSetCallback=null
    ) {
        /*
        * All val, min, and max should be integer only.
        * min must be smaller or equal to max, or an error will be thrown.
        * val can be any integer, it will be wrapped if not within min and max.
        * Can use Copy() to create another WrappedInt with the states,
            but the callbacks might be copied as references only.

        * underflowCallback(valBeforeWrapped, wrappedIntAfter):
            * will be called when val underflowed.
            * valBeforeWrapped is an integer, which is the out-range val before wrapped.
            * wrappedIntAfter is the WrappedInt object (this) after wrapped.
        * overflowCallback(valBeforeWrapped, wrappedIntAfter):
            * will be called when val overflowed.
            * valBeforeWrapped is an integer, which is the out-range val before wrapped.
            * wrappedIntAfter is the WrappedInt object (this) after wrapped.
        * valOnChangeCallback(oldVal, wrappedIntAfter):
            * will be called whenever val is changed after setted or wrapped (when changing min and max).
            * called from the setters instead of Wrap() due to how Wrap() is called
                (unable to detect changes without wrap if not checked in val's setter;
                will be called twice if checked in both val's setter and Wrap()).
            * oldVal is the original val before changes.
            * wrappedIntAfter is the WrappedInt object (this) after changes.
        * valOnSetCallback(wrappedInt):
            * will be called when val is setted, regardless if val is changed.
            * wrappedInt is the WrappedInt object (this) after it is setted.
        */

        EnsureInt(val);
        EnsureInt(min);
        EnsureInt(max);
        EnsureMinMax(min, max);

        this.#min = min;
        this.#max = max;

        this.UnderflowCallBack = underflowCallback ?? function (valBeforeWrapped, wrappedIntAfter) { };
        this.OverflowCallBack = overflowCallback ?? function (valBeforeWrapped, wrappedIntAfter) { };
        this.ValOnChangeCallback = valOnChangeCallback ?? function (oldVal, wrappedIntAfter) { };
        this.ValOnSetCallback = valOnSetCallback ?? function (wrappedInt) { };

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
                this.ValOnChangeCallback(originalVal, this);
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
                this.ValOnChangeCallback(originalVal, this);
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
            this.ValOnChangeCallback(originalVal, this);
        }
        
        this.ValOnSetCallback(this);
    }

    static Wrap (val, min, max) {
        EnsureInt(val);
        EnsureInt(min);
        EnsureInt(max);

        if (min > max) {
            throw `min, ${min}, can't be bigger than max, ${max}.`;
        }

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
            this.UnderflowCallBack(originalVal, this);
        }

        if (overflowed === true) {
            this.OverflowCallBack(originalVal, this);
        }
    }

    Copy (includeCallbacks=true) {
        return new WrappedInt(
            this.#value,
            this.#min,
            this.#max,
            includeCallbacks ? this.UnderflowCallBack : null,
            includeCallbacks ? this.OverflowCallBack : null,
            includeCallbacks ? this.ValOnChangeCallback : null,
            includeCallbacks ? this.ValOnSetCallback : null
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

export { WrappedInt };
