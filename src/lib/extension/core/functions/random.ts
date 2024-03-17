import {iconv} from "../../../helpers/iconv";
import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToArray} from "../../../helpers/iterator-to-array";
import {createRuntimeError} from "../../../error/runtime";
import {TwingCallable} from "../../../callable-wrapper";

const runes = require('runes');
const mt_rand = require('locutus/php/math/mt_rand');
const array_rand = require('locutus/php/array/array_rand');

/**
 * Returns a random value depending on the supplied parameter type:
 * - a random item from a Traversable or array
 * - a random character from a string
 * - a random integer between 0 and the integer parameter.
 *
 * @param executionContext
 * @param {*} values The values to pick a random item from
 * @param {number} max Maximum value used when values is an integer
 *
 * @throws TwingErrorRuntime when values is an empty array (does not apply to an empty string which is returned as is)
 *
 * @returns {Promise<any>} A random value from the given sequence
 */
export const random: TwingCallable = (executionContext, values: any | null, max: number | null): any => {
    const {environment} = executionContext;
    const {charset} = environment;

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
            values = Buffer.from(values);
        }

        if (Buffer.isBuffer(values)) {
            if (values.toString() === '') {
                return '';
            }
            
            if (charset !== 'UTF-8') {
                values = iconv(charset, 'UTF-8', values);
            }

            // unicode split
            values = runes(values.toString());

            if (charset !== 'UTF-8') {
                values = values.map((value: string) => {
                    return iconv('UTF-8', charset, Buffer.from(value)).toString();
                });
            }
        } else if (isTraversable(values)) {
            values = iteratorToArray(values);
        }

        if (!Array.isArray(values)) {
            return values;
        }

        if (values.length < 1) {
            throw createRuntimeError('The random function cannot pick from an empty array.');
        }

        return values[array_rand(values, 1)];
    };

    return Promise.resolve(_do());
}
