export const createTemplateLoadingError = (names: Array<string | null>): Error => {
    let message: string;
    
    if (names.length === 1) {
        const name = names[0];
        
        message = `Unable to find template "${name ? name : ''}".`;
    } else {
        message = `Unable to find one of the following templates: "${names.join('", "')}".`;
    }
    
    const error = Error(message);
    
    Error.captureStackTrace(error, createTemplateLoadingError);
    
    return error;
};
