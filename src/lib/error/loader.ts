import {createBaseError, ErrorLocation, TwingBaseError} from "./base";

export const templateLoadingError = 'TwingTemplateLoadingError';

/**
 * Exception thrown when an error occurs during template loading.
 */
export interface TwingTemplateLoadingError extends TwingBaseError<typeof templateLoadingError> {

}

export const createTemplateLoadingError = (names: Array<string | null>, location?: ErrorLocation, source?: string, previous?: any): TwingTemplateLoadingError => {
    let message: string;
    
    if (names.length === 1) {
        const name = names[0];
        
        message = `Unable to find template "${name ? name : ''}".`;
    } else {
        message = `Unable to find one of the following templates: "${names.join('", "')}".`;
    }
    
    const error = createBaseError(templateLoadingError, message, location, source, previous);
    
    Error.captureStackTrace(error, createTemplateLoadingError);
    
    return error;
};

export const isATemplateLoadingError = (candidate: any): candidate is TwingTemplateLoadingError => {
    return (candidate as TwingTemplateLoadingError).name === templateLoadingError;
};
