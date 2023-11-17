import {getFirstValue} from "../../../helpers/get-first-value";
import {slice} from "./slice";

/**
 * Returns the last element of the item.
 *
 * @param item A variable
 *
 * @returns The last element of the item
 */
export const last = (item: any): Promise<any> => {
    return slice(item, -1, 1, false)
        .then((elements) => {
            return typeof elements === 'string' ? elements : getFirstValue(elements);
        });
};
