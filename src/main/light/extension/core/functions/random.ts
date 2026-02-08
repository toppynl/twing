import type {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper.js";
import {isTraversable} from "../../../helpers/is-traversable.js";
import {iteratorToArray} from "../../../helpers/iterator-to-array.js";
import runes from 'runes';
import mt_rand from "locutus/php/math/mt_rand";
import array_rand from "locutus/php/array/array_rand";

/**
 * Returns a random value depending on the supplied parameter type:
 * - a random item from a Traversable or array
 * - a random character from a string
 * - a random integer between 0 and the integer parameter.
 *
 * @param _executionContext
 * @param {*} values The values to pick a random item from
 * @param {number} max Maximum value used when values is an integer
 *
 * @throws TwingErrorRuntime when values is an empty array (does not apply to an empty string which is returned as is)
 *
 * @returns {Promise<any>} A random value from the given sequence
 */
export const random: TwingCallable = (_executionContext, values: any | null, max: number | null): any => {
    let _do = (): any => {
        if (values === null) {
            return max === null ? mt_rand() : mt_rand(0, max);
        }

        if (typeof values === 'number') {
            let min: number;

            if (max === null) {
                if (values < 0) {
                    max = 0;
                    min = values;
                } else {
                    max = values;
                    min = 0;
                }
            } else {
                min = values;
            }

            return mt_rand(min, max);
        }

        if (typeof values === 'string') {
            if (values === '') {
                return '';
            }
            
            // unicode split
            values = runes(values.toString());
        } else if (isTraversable(values)) {
            values = iteratorToArray(values);
        }

        if (!Array.isArray(values)) {
            return values;
        }

        if (values.length < 1) {
            return Promise.reject(new Error('The random function cannot pick from an empty array.'));
        }

        return values[array_rand(values, 1)];
    };

    return Promise.resolve(_do());
}

export const randomSynchronously: TwingSynchronousCallable = (_executionContext, values: any | null, max: number | null): any => {
    if (values === null) {
        return max === null ? mt_rand() : mt_rand(0, max);
    }

    if (typeof values === 'number') {
        let min: number;

        if (max === null) {
            if (values < 0) {
                max = 0;
                min = values;
            }
            else {
                max = values;
                min = 0;
            }
        }
        else {
            min = values;
        }

        return mt_rand(min, max);
    }
    
    if (typeof values === 'string') {
        if (values === '') {
            return '';
        }
        
        // unicode split
        values = runes(values.toString());
    }
    else if (isTraversable(values)) {
        values = iteratorToArray(values);
    }

    if (!Array.isArray(values)) {
        return values;
    }

    if (values.length < 1) {
        throw new Error('The random function cannot pick from an empty array.');
    }

    return values[array_rand(values, 1)];
}
