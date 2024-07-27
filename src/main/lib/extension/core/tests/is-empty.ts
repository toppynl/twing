import {iteratorToArray} from "../../../helpers/iterator-to-array";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const isPlainObject = require('is-plain-object');

/**
 * Checks if a variable is empty.
 *
 * <pre>
 * {# evaluates to true if the foo variable is null, false, or the empty string #}
 * {% if foo is empty %}
 *     {# ... #}
 * {% endif %}
 * </pre>
 *
 * @param executionContext
 * @param value A variable
 *
 * @returns {boolean} true if the value is empty, false otherwise
 */
export const isEmpty: TwingCallable<[value: any], boolean> = (executionContext, value) => {
    if (value === null || value === undefined) {
        return Promise.resolve(true);
    }

    if (typeof value === 'string') {
        return Promise.resolve(value.length < 1);
    }

    if (typeof value[Symbol.iterator] === 'function') {
        return Promise.resolve(value[Symbol.iterator]().next().done === true);
    }

    if (isPlainObject(value)) {
        if (value.hasOwnProperty('toString') && typeof value.toString === 'function') {
            return isEmpty(executionContext, value.toString());
        }
        else {
            return Promise.resolve(iteratorToArray(value).length < 1);
        }
    }

    if (typeof value === 'object' && value.toString && typeof value.toString === 'function') {
        return isEmpty(executionContext, value.toString());
    }

    return Promise.resolve(value === false);
};

export const isEmptySynchronously: TwingSynchronousCallable<[value: any], boolean> = (executionContext, value) => {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'string') {
        return value.length < 1;
    }

    if (typeof value[Symbol.iterator] === 'function') {
        return value[Symbol.iterator]().next().done === true;
    }

    if (isPlainObject(value)) {
        if (value.hasOwnProperty('toString') && typeof value.toString === 'function') {
            return isEmptySynchronously(executionContext, value.toString());
        }
        else {
            return iteratorToArray(value).length < 1;
        }
    }

    if (typeof value === 'object' && value.toString && typeof value.toString === 'function') {
        return isEmptySynchronously(executionContext, value.toString());
    }

    return value === false;
};
