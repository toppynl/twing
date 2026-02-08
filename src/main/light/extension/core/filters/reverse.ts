import {reverse as reverseHelper} from "../../../helpers/reverse";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";
import esrever from 'esrever';

/**
 * Reverses a variable.
 *
 * @param {string | Map<*, *>} item A traversable instance, or a string
 * @param {boolean} preserveKeys Whether to preserve key or not
 *
 * @returns {Promise<string | Map<any, any>>} The reversed input
 */
export const reverse: TwingCallable = (_executionContext, item: any, preserveKeys: boolean): Promise<string | Map<any, any>> => {
    if (typeof item === 'string') {
        return Promise.resolve(esrever.reverse(item));
    } else {
        return Promise.resolve(reverseHelper(iteratorToMap(item as Map<any, any>), preserveKeys));
    }
};

export const reverseSynchronously: TwingSynchronousCallable = (_executionContext, item: any, preserveKeys: boolean): string | Map<any, any> => {
    if (typeof item === 'string') {
        return esrever.reverse(item);
    } else {
        return reverseHelper(iteratorToMap(item as Map<any, any>), preserveKeys);
    }
};
