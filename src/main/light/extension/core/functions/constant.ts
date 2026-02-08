import {getConstant as constantHelper} from "../../../helpers/get-constant";
import type {TwingCallable} from "../../../callable-wrapper";
import {TwingSynchronousCallable} from "../../../callable-wrapper";

export const constant: TwingCallable<[
    name: string,
    object: any | null
]> = (
    executionContext,
    name,
    object
): Promise<any> => {
    return Promise.resolve(constantHelper(executionContext.context, name, object));
};

export const constantSynchronously: TwingSynchronousCallable<[
    name: string,
    object: any | null
]> = (
    executionContext,
    name,
    object
): Promise<any> => {
    return constantHelper(executionContext.context, name, object);
};
