import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Marks a variable as being safe.
 *
 * @param {string | TwingMarkup} value A variable
 *
 * @return {Promise<string>}
 */
export const raw: TwingCallable = (_executionContext, value: string | TwingMarkup | null): Promise<TwingMarkup> => {
    return Promise.resolve(createMarkup(value !== null ? value.toString() : ''));
};

export const rawSynchronously: TwingSynchronousCallable = (_executionContext, value: string | TwingMarkup | null): TwingMarkup => {
    return createMarkup(value !== null ? value.toString() : '');
};
