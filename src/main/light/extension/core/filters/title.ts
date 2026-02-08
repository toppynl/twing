import type {TwingMarkup} from "../../../markup";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

import phpUcwords from "locutus/php/strings/ucwords";

/**
 * Returns a title-cased string.
 *
 * @param _executionContext
 * @param string A string
 *
 * @returns The title-cased string
 */
export const title: TwingCallable<[
    string: string | TwingMarkup
], string> = (_executionContext, string) => {
    const result: string = phpUcwords(string.toString().toLowerCase());

    return Promise.resolve(result);
};

export const titleSynchronously: TwingSynchronousCallable<[
    string: string | TwingMarkup
], string> = (_executionContext, string) => {
    const result: string = phpUcwords(string.toString().toLowerCase());

    return result;
};
