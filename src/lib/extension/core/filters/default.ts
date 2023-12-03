import {isEmpty} from "../tests/is-empty";
import type {TwingCallable} from "../../../callable-wrapper";

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
