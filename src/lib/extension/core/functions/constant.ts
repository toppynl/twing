import type {TwingContext} from "../../../context";
import {getConstant as constantHelper} from "../../../helpers/get-constant";

export const constant = (
    context: TwingContext<any, any>, 
    name: string, 
    object: any | null
): Promise<any> => {
    return Promise.resolve(constantHelper(context, name, object));
};
