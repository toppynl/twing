import type {TwingMarkup} from "../../../markup";

const phpUcwords = require('locutus/php/strings/ucwords');

/**
 * Returns a title-cased string.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The title-cased string
 */
export const title = (string: string | TwingMarkup): Promise<string> => {
    const result: string = phpUcwords(string.toString().toLowerCase());

    return Promise.resolve(result);
};
