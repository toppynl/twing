import type {TwingContext} from "../../../context";
import {constant as constantHelper} from "../../../helpers/constant";

export const constant = (
    context: TwingContext<any, any>, 
    name: string, 
    object: any = null
): Promise<any> => {
    return Promise.resolve(constantHelper(context, name, object));
};
