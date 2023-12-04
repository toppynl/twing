import type {TwingMarkup} from "../../../markup";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Converts a string to lowercase.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The lowercased string
 */
export const lower: TwingCallable = (_executionContext,string: string | TwingMarkup): Promise<string> => {
    return Promise.resolve(string.toString().toLowerCase());
};
