import {TwingTemplate} from "../../../template";

const locutusNumberFormat = require('locutus/php/strings/number_format');

/**
 * Number format filter.
 *
 * All of the formatting options can be left null, in that case the defaults will
 * be used.  Supplying any of the parameters will override the defaults set in the
 * environment object.
 *
 * @param {TwingTemplate} template
 * @param {*} number A float/int/string of the number to format
 * @param {number} decimal the number of decimal points to display
 * @param {string} decimalPoint the character(s) to use for the decimal point
 * @param {string} thousandSep the character(s) to use for the thousands separator
 *
 * @returns {Promise<string>} The formatted number
 */
export const numberFormat = (template: TwingTemplate, number: any, decimal: number | null, decimalPoint: string | null, thousandSep: string | null): Promise<string> => {
    const runtime = template.environment;
    const defaults = runtime.getNumberFormat();

    if (decimal === null) {
        decimal = defaults[0];
    }

    if (decimalPoint === null) {
        decimalPoint = defaults[1];
    }

    if (thousandSep === null) {
        thousandSep = defaults[2];
    }

    return Promise.resolve(locutusNumberFormat(number, decimal, decimalPoint, thousandSep));
}
