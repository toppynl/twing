import {TwingCallable} from "../../../callable-wrapper";

export const isDefined: TwingCallable<[
    value: any
], boolean> = (
    _executionContext,
    value
) => {
    return Promise.resolve(!!value);
};
