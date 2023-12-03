import {TwingCallable} from "../../../callable-wrapper";

export const isOdd: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(value % 2 === 1);
};
