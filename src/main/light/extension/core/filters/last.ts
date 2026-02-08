import {getFirstValue} from "../../../helpers/get-first-value";
import {slice, sliceSynchronously} from "./slice";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Returns the last element of the item.
 *
 * @param executionContext
 * @param item A variable
 *
 * @returns The last element of the item
 */
export const last: TwingCallable<[
    item: any
]> = (executionContext, item) => {
    return slice(executionContext, item, -1, 1, false)
        .then((elements) => {
    return typeof elements === 'string' ? elements : getFirstValue(elements);
        });
};

export const lastSynchronously: TwingSynchronousCallable<[
    item: any
]> = (executionContext, item) => {
    const elements = sliceSynchronously(executionContext, item, -1, 1, false)

    return typeof elements === 'string' ? elements : getFirstValue(elements);
};
