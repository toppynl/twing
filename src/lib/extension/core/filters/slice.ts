import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {sliceMap} from "../../../helpers/slice-map";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Slices a variable.
 *
 * @param _executionContext
 * @param item A variable
 * @param start Start of the slice
 * @param length Size of the slice
 * @param preserveKeys Whether to preserve key or not (when the input is an object)
 *
 * @returns {Promise<string | Map<any, any>>} The sliced variable
 */
export const slice: TwingCallable<[
    item: any,
    start: number,
    length: number | null,
    preserveKeys: boolean
], string | Map<any, any>> = (_executionContext, item, start, length, preserveKeys) => {
    if (isTraversable(item)) {
        const iterableItem = iteratorToMap(item);

        if (length === null) {
            length = iterableItem.size - start;
        }

        return Promise.resolve(sliceMap(iterableItem, start, length, preserveKeys));
    }

    item = '' + (item ? item : '');

    if (length === null) {
        length = item.length - start;
    }

    return Promise.resolve(item.substr(start, length));
};
