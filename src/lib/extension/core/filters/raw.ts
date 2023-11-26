import {createMarkup, TwingMarkup} from "../../../markup";

/**
 * Marks a variable as being safe.
 *
 * @param {string | TwingMarkup} value A variable
 *
 * @return {Promise<string>}
 */
export function raw(value: string | TwingMarkup | null): Promise<TwingMarkup> {
    return Promise.resolve(createMarkup(value !== null ? value.toString() : ''));
}
