import {TwingTemplate} from "../../../template";

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
export const numberFormat = (
    template: TwingTemplate,
    number: any,
    numberOfDecimals: number | null, 
    decimalPoint: string | null,
    thousandSeparator: string | null
): Promise<string> => {
    if (numberOfDecimals === null) {
        numberOfDecimals = template.numberFormat.numberOfDecimals;
    }

    if (decimalPoint === null) {
        decimalPoint = template.numberFormat.decimalPoint;
    }

    if (thousandSeparator === null) {
        thousandSeparator = template.numberFormat.thousandSeparator;
    }
    
    return Promise.resolve(phpNumberFormat(number, numberOfDecimals, decimalPoint, thousandSeparator));
};
