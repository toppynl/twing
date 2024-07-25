import {TwingCallable} from "../../../callable-wrapper";

export const isNull: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(value === null);
};
