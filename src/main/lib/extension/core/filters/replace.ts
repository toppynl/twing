import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToHash} from "../../../helpers/iterator-to-hash";
import {TwingCallable} from "../../../callable-wrapper";

const phpStrtr = require('locutus/php/strings/strtr');

/**
 * Replaces strings within a string.
 *
 * @param {string} value String to replace in
 * @param {Array<string>|Map<string, string>} from Replace values
 *
 * @returns {Promise<string>}
 */
export const replace: TwingCallable = (_executionContext,value: string | null, from: any): Promise<string> => {
    const _do = (): string => {
        if (isTraversable(from)) {
            from = iteratorToHash(from);
        } else if (typeof from !== 'object') {
            throw new Error(`The "replace" filter expects an hash or "Iterable" as replace values, got "${typeof from}".`);
        }

        if (value === null) {
            value = '';
        }

        return phpStrtr(value, from);
    };

    try {
        return Promise.resolve(_do());
    } catch (error) {
        return Promise.reject(error);
    }
};
