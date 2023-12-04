import {getConstant} from "../../../helpers/get-constant";
import type {TwingCallable} from "../../../callable-wrapper";

export const isConstant: TwingCallable<[
    comparand: any,
    constant: any,
    object: any | null
], boolean> = (
    executionContext,
    comparand,
    constant,
    object
) => {
    return Promise.resolve(comparand === getConstant(executionContext.context, constant, object));
};
