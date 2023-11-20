import {TwingSource} from "../source";
import {createBaseError, TwingBaseError} from "./base";

export const templateLoadingError = 'TwingTemplateLoadingError';

/**
 * Exception thrown when an error occurs during template loading.
 */
export interface TwingTemplateLoadingError extends TwingBaseError<typeof templateLoadingError> {

}

export const createTemplateLoadingError = (name: string | Array<string>, line?: number, source?: TwingSource, previous?: any): TwingTemplateLoadingError => {
    let message: string;

    if (typeof name === "string") {
        message = `Unable to find template "${name}".`;
    } else {
        message = `Unable to find one of the following templates: "${name.join('", "')}".`;
    }
    
    const error = createBaseError(templateLoadingError, message, line, undefined, source, previous);
    
    Error.captureStackTrace(error, createTemplateLoadingError);
    
    return error;
};

export const isATemplateLoadingError = (candidate: any): candidate is TwingTemplateLoadingError => {
    return (candidate as TwingTemplateLoadingError).name === templateLoadingError;
};
