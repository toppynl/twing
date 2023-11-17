import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {sliceMap} from "../../../helpers/slice-map";

/**
 * Slices a variable.
 *
 * @param item A variable
 * @param {number} start Start of the slice
 * @param {number} length Size of the slice
 * @param {boolean} preserveKeys Whether to preserve key or not (when the input is an object)
 *
 * @returns {Promise<string | Map<any, any>>} The sliced variable
 */
export const slice = (item: any, start: number, length: number | null, preserveKeys: boolean): Promise<string | Map<any, any>> => {
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
