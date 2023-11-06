import {Source} from "../source";
import {TwingBaseError} from "./base";

export const templateLoadingError = 'TwingTemplateLoadingError';

export interface TwingLoaderError extends TwingBaseError<typeof templateLoadingError> {
    
}

/**
 * Exception thrown when an error occurs during template loading.
 */
export class TwingTemplateLoadingError extends TwingBaseError<typeof templateLoadingError> {
    constructor(message: string, line?: number, source?: Source, previous?: any) {
        super(templateLoadingError, message, line, source, previous);
    }
}

export const isATemplateLoadingError = (candidate: any): candidate is TwingTemplateLoadingError => {
    return (candidate as TwingTemplateLoadingError).name === templateLoadingError;
};
