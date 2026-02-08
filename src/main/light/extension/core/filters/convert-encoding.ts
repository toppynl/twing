import type {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper.js";

export const convertEncoding: TwingCallable<[
    value: string
], string> = (_executionContext, value) => {
    return Promise.resolve(value);
};

export const convertEncodingSynchronously: TwingSynchronousCallable<[
    value: string
], string> = (_executionContext, value) => {
    return value;
};
