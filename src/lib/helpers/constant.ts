/**
 * Provides the ability to get constants from instances as well as class/global constants.
 *
 * Constants makes no sense in JavaScript. To emulate the expected behavior, it is assumed that so-called constants are keys of the environment constructor or the passed object constructor.
 *
 * @param {TwingTemplate} template The template
 * @param {string} name The name of the constant
 * @param {any} object The object to get the constant from
 *
 * @returns {any}
 */
import {TwingContext} from "../context";

export const constant = (context: TwingContext<any, any>, name: string, object: any = null): any => {
    if (object) {
        return object[name];
    } else {
        return context.get(name);
    }
};
