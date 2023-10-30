import {AnEnvironment} from "../../../environment";
import {TwingMarkup} from "../../../markup";

/**
 * Converts a string to lowercase.
 *
 * @param {AnEnvironment} env
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The lowercased string
 */
export function lower(_env: AnEnvironment, string: string | TwingMarkup): Promise<string> {
    return Promise.resolve(string.toString().toLowerCase());
}
