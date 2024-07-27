import {isAMapLike} from "../../../helpers/map-like";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Cycles over a value.
 *
 * @param _executionContext
 * @param value
 * @param position The cycle position
 *
 * @returns The value at position
 */
export const cycle: TwingCallable<[
    value: Map<any, any> | Array<any> | string | boolean | null,
    position: number
]> = (_executionContext, value, position) => {
    if (!isAMapLike(value) && !Array.isArray(value)) {
        return Promise.resolve(value);
    }

    let values: Array<any>;
    let size: number;

    if (Array.isArray(value)) {
        values = value;
        size = value.length;
    }
    else {
        values = [...value.values()];
        size = value.size;
    }
    
    return Promise.resolve(values[position % size]);
}

export const cycleSynchronously: TwingSynchronousCallable<[
    value: Map<any, any> | Array<any> | string | boolean | null,
    position: number
]> = (_executionContext, value, position) => {
    if (!isAMapLike(value) && !Array.isArray(value)) {
        return value;
    }

    let values: Array<any>;
    let size: number;

    if (Array.isArray(value)) {
        values = value;
        size = value.length;
    }
    else {
        values = [...value.values()];
        size = value.size;
    }

    return values[position % size];
}
