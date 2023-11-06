import {TwingMarkup} from "../../../markup";
import {isNullOrUndefined} from "util";

const words = require('capitalize');

/**
 * Returns a capitalized string.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The capitalized string
 */
export function capitalize(string: string | TwingMarkup): Promise<string> {
    if (isNullOrUndefined(string) || string === '') {
        return Promise.resolve(string);
    }

    return Promise.resolve(words(string.toString()));
}
