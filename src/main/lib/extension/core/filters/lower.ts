import type {TwingMarkup} from "../../../markup";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Converts a string to lowercase.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns The lowercased string
 */
export const lower: TwingCallable = (_executionContext,string: string | TwingMarkup): Promise<string> => {
    return Promise.resolve(string.toString().toLowerCase());
};

export const lowerSynchronously: TwingSynchronousCallable = (_executionContext,string: string | TwingMarkup): string => {
    return string.toString().toLowerCase();
};
