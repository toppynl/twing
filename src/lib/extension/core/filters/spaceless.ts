import {createMarkup, TwingMarkup} from "../../../markup";

/**
 * Removes whitespaces between HTML tags.
 *
 * @return {Promise<TwingMarkup>}
 */
export const spaceless = (content: string | TwingMarkup): Promise<TwingMarkup> => {
    return Promise.resolve(createMarkup(content.toString().replace(/>\s+</g, '><').trim()));
};
