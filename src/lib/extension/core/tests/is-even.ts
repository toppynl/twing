import {TwingCallable} from "../../../callable-wrapper";

export const isEven: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(value % 2 === 0);
};
