import {TwingCallable} from "../../../callable-wrapper";

const phpRound = require('locutus/php/math/round');
const phpCeil = require('locutus/php/math/ceil');
const phpFloor = require('locutus/php/math/floor');

/**
 * Rounds a number.
 *
 * @param value The value to round
 * @param {number} precision The rounding precision
 * @param {string} method The method to use for rounding
 *
 * @returns {Promise<number>} The rounded number
 */
export const round: TwingCallable = (_executionContext, value: any, precision: number, method: string): Promise<number> => {
    const _do = (): number => {
        if (method === 'common') {
            return phpRound(value, precision);
        }

        if (method !== 'ceil' && method !== 'floor') {
            throw new Error('The round filter only supports the "common", "ceil", and "floor" methods.');
        }

        const intermediateValue = value * Math.pow(10, precision);
        const intermediateDivider = Math.pow(10, precision);

        if (method === 'ceil') {
            return phpCeil(intermediateValue) / intermediateDivider;
        } else {
            return phpFloor(intermediateValue) / intermediateDivider;
        }
    };

    try {
        const result = _do();

        return Promise.resolve(result);
    } catch (error: any) {
        return Promise.reject(error);
    }
};
