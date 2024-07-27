import {isEmpty, isEmptySynchronously} from "../tests/is-empty";
import type {TwingCallable} from "../../../callable-wrapper";
import {TwingSynchronousCallable} from "../../../callable-wrapper";

export const defaultFilter: TwingCallable<[
    value: any,
    defaultValue: any | null
]> = (executionContext, value, defaultValue) => {
    return isEmpty(executionContext, value)
        .then((isEmpty) => {
            if (isEmpty) {
                return Promise.resolve(defaultValue);
            }
            else {
                return Promise.resolve(value);
            }
        });
};

export const defaultFilterSynchronously: TwingSynchronousCallable<[
    value: any,
    defaultValue: any | null
]> = (executionContext, value, defaultValue) => {
    if (isEmptySynchronously(executionContext, value)) {
        return defaultValue;
    }

    return value;
};
