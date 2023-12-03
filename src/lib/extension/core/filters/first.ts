import {getFirstValue} from "../../../helpers/get-first-value";
import {slice} from "./slice";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Returns the first element of the item.
 *
 * @param executionContext
 * @param item
 *
 * @returns {Promise<any>} The first element of the item
 */
export const first: TwingCallable<[
    item: any
]> = (executionContext, item) => {
    return slice(executionContext, item, 0, 1, false)
        .then((elements) => {
            return typeof elements === 'string' ? elements : getFirstValue(elements);
        });
}
