import type {TwingMarkup} from "../../../markup";

const words = require('capitalize');

/**
 * Returns a capitalized string.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The capitalized string
 */
export const capitalize = (string: string | TwingMarkup): Promise<string> => {
    if ((string === null) || (string === undefined) || string === '') {
        return Promise.resolve(string);
    }

    return Promise.resolve(words(string.toString()));
};
