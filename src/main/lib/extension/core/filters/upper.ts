import type {TwingMarkup} from "../../../markup";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Converts a string to uppercase.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The uppercased string
 */
export const upper: TwingCallable = (_executionContext, string: string | TwingMarkup): Promise<string> => {
    return Promise.resolve(string.toString().toUpperCase());
};

export const upperSynchronously: TwingSynchronousCallable = (_executionContext, string: string | TwingMarkup): string => {
    return string.toString().toUpperCase();
};
