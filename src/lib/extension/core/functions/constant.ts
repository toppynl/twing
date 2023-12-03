import {getConstant as constantHelper} from "../../../helpers/get-constant";
import type {TwingCallable} from "../../../callable-wrapper";

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
