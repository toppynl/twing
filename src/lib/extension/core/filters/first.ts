import {getFirstValue} from "../../../helpers/get-first-value";
import {slice} from "./slice";

/**
 * Returns the first element of the item.
 *
 * @param {any} item
 *
 * @returns {Promise<any>} The first element of the item
 */
export const first = (item: any): Promise<any> => {
    return slice(item, 0, 1, false)
        .then((elements) => {
            return typeof elements === 'string' ? elements : getFirstValue(elements);
        });
}
