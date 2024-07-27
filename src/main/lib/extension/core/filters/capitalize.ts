import type {TwingMarkup} from "../../../markup";
import type {TwingCallable} from "../../../callable-wrapper";
import {TwingSynchronousCallable} from "../../../callable-wrapper";

const words: (value: string) => string = require('capitalize');

/**
 * Returns a capitalized string.
 *
 * @param {string | TwingMarkup} string A string
 *
 * @returns {Promise<string>} The capitalized string
 */
export const capitalize: TwingCallable<[
    string: string | TwingMarkup
], string> = (_executionContext, string) => {
    if ((string === null) || (string === undefined) || string === '') {
        return Promise.resolve(string);
    }

    return Promise.resolve(words(string.toString()));
};

export const capitalizeSynchronously: TwingSynchronousCallable<[
    string: string | TwingMarkup
], string> = (_executionContext, string) => {
    if ((string === null) || (string === undefined) || string === '') {
        return string;
    }

    return words(string.toString());
};
