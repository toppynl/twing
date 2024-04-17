import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingCallable} from "../../../callable-wrapper";

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
