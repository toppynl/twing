import {getConstant} from "../../../helpers/get-constant";
import type {TwingCallable} from "../../../callable-wrapper";
import {TwingSynchronousCallable} from "../../../callable-wrapper";

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

export const isConstantSynchronously: TwingSynchronousCallable<[
    comparand: any,
    constant: any,
    object: any | null
], boolean> = (
    executionContext,
    comparand,
    constant,
    object
) => {
    return comparand === getConstant(executionContext.context, constant, object);
};
