import {TwingSource} from "../source";
import {TwingBaseError} from "./base";

export const templateLoadingError = 'TwingTemplateLoadingError';

export interface TwingLoaderError extends TwingBaseError<typeof templateLoadingError> {
    
}

/**
 * Exception thrown when an error occurs during template loading.
 */
export class TwingTemplateLoadingError extends TwingBaseError<typeof templateLoadingError> {
    constructor(name: string | Array<string>, line?: number, source?: TwingSource, previous?: any) {
        let message: string;
        
        if (typeof name === "string") {
            message = `Unable to find template "${name}".`;
        }
        else {
            message = `Unable to find one of the following templates: "${name.join('", "')}".`;
        }
        
        super(templateLoadingError, message, line, undefined, source, previous);
    }
}

export const isATemplateLoadingError = (candidate: any): candidate is TwingTemplateLoadingError => {
    return (candidate as TwingTemplateLoadingError).name === templateLoadingError;
};
