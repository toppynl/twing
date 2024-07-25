import type {TwingContext} from "../context";

export const getContextValue = (
    charset: string,
    templateName: string,
    isStrictVariables: boolean,
    context: TwingContext<any, any>,
    name: string,
    isAlwaysDefined: boolean,
    shouldIgnoreStrictCheck: boolean,
    shouldTestExistence: boolean
): Promise<any> => {
    const specialNames = new Map<string, any>([
        ['_self', templateName],
        ['_context', context],
        ['_charset', charset]
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
        if (shouldIgnoreStrictCheck || !isStrictVariables) {
            result = context.has(name) ? context.get(name) : null;
        } else {
            result = context.get(name);

            if (result === undefined) {
                return Promise.reject(new Error(`Variable "${name}" does not exist.`));
            }
        }
    }

    return Promise.resolve(result);
};
