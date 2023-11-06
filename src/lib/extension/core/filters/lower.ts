import {TwingMarkup} from "../../../markup";

/**
 * Converts a string to lowercase.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The lowercased string
 */
export function lower(string: string | TwingMarkup): Promise<string> {
    return Promise.resolve(string.toString().toLowerCase());
}
