import {TwingCallable} from "../../../callable-wrapper";

const phpNumberFormat = require('locutus/php/strings/number_format');

/**
 * Number format filter.
 *
 * All of the formatting options can be left null, in that case the defaults will
 * be used.  Supplying any of the parameters will override the defaults set in the
 * environment object.
 *
 * @param {*} number A float/int/string of the number to format
 * @param {number} numberOfDecimals the number of decimal points to display
 * @param {string} decimalPoint the character(s) to use for the decimal point
 * @param {string} thousandSeparator the character(s) to use for the thousands separator
 *
 * @returns {Promise<string>} The formatted number
 */
export const numberFormat: TwingCallable = (
    executionContext,
    number: any,
    numberOfDecimals: number | null,
    decimalPoint: string | null,
    thousandSeparator: string | null
): Promise<string> => {
    const {environment} = executionContext;
    const {numberFormat} = environment;

    if (numberOfDecimals === null) {
        numberOfDecimals = numberFormat.numberOfDecimals;
    }

    if (decimalPoint === null) {
        decimalPoint = numberFormat.decimalPoint;
    }

    if (thousandSeparator === null) {
        thousandSeparator = numberFormat.thousandSeparator;
    }

    return Promise.resolve(phpNumberFormat(number, numberOfDecimals, decimalPoint, thousandSeparator));
};
