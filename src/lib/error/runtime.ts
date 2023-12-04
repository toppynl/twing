import {createBaseError, TwingErrorLocation, TwingBaseError} from "./base";

export const runtimeErrorName = 'TwingRuntimeError';

export interface TwingRuntimeError extends TwingBaseError<typeof runtimeErrorName> {

}

export const isARuntimeError = (candidate: Error): candidate is TwingRuntimeError => {
    return (candidate as TwingRuntimeError).name === runtimeErrorName;
};

export const createRuntimeError = (message: string, location?: TwingErrorLocation, source?: string, previous?: Error): TwingRuntimeError => {
    const error = createBaseError(runtimeErrorName, message, location, source, previous);
    
    Error.captureStackTrace(error, createRuntimeError);
    
    return error;
};
