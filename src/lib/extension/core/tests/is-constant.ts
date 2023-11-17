import type {TwingContext} from "../../../context";
import {getConstant} from "../../../helpers/get-constant";

export function isConstant(
    context: TwingContext<any, any>,
    comparand: any,
    constant: any,
    object: any | null
): Promise<boolean> {
    return Promise.resolve(comparand === getConstant(context, constant, object));
}
