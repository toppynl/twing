import type {TwingContext} from "../context";
import {createRuntimeError} from "../error/runtime";
import {TwingTemplate} from "../template";

export const getContextValue = (
    template: TwingTemplate,
    context: TwingContext<any, any>,
    name: string,
    isAlwaysDefined: boolean,
    shouldIgnoreStrictCheck: boolean,
    shouldTestExistence: boolean
): Promise<any> => {
    const {environment} = template;
    
    const specialNames = new Map<string, any>([
        ['_self', template.templateName],
        ['_context', context],
        ['_charset', environment.charset]
    ]);

    const isSpecial = () => {
        return specialNames.has(name);
    };

    let result: any;

    if (shouldTestExistence) {
        if (isSpecial()) {
            result = true;
        } else {
            result = context.has(name);
        }
    } else if (isSpecial()) {
        result = specialNames.get(name);
    } else if (isAlwaysDefined) {
        result = context.get(name);
    } else {
        if (shouldIgnoreStrictCheck || !environment.isStrictVariables) {
            result = context.has(name) ? context.get(name) : null;
        } else {
            result = context.get(name);

            if (result === undefined) {
                return Promise.reject(createRuntimeError(`Variable "${name}" does not exist.`));
            }
        }
    }

    return Promise.resolve(result);
};
