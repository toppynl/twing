import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Removes whitespaces between HTML tags.
 *
 * @return {Promise<TwingMarkup>}
 */
export const spaceless: TwingCallable = (_executionContext, content: string | TwingMarkup): Promise<TwingMarkup> => {
    return Promise.resolve(createMarkup(content.toString().replace(/>\s+</g, '><').trim()));
};
