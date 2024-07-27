import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const isDefined: TwingCallable<[
    value: any
], boolean> = (
    _executionContext,
    value
) => {
    return Promise.resolve(!!value);
};

export const isDefinedSynchronously: TwingSynchronousCallable<[
    value: any
], boolean> = (
    _executionContext,
    value
) => {
    return !!value;
};
