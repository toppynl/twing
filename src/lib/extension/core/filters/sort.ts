import {isTraversable} from "../../../helpers/is-traversable";
import {TwingRuntimeError} from "../../../error/runtime";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {asort} from "../../../helpers/asort";

/**
 * Sorts an iterable.
 *
 * @param {any} iterable
 *
 * @returns {Promise<Map<any, any>>}
 */
export const sort = (iterable: any): Promise<Map<any, any>> => {
    if (!isTraversable(iterable)) {
        return Promise.reject(new TwingRuntimeError(`The sort filter only works with iterables, got "${typeof iterable}".`));
    }

    const map = iteratorToMap(iterable);

    asort(map);

    return Promise.resolve(map);
};
