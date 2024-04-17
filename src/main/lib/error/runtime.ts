import {createBaseError, TwingErrorLocation, TwingBaseError} from "./base";
import type {TwingSource} from "../source";

export const runtimeErrorName = 'TwingRuntimeError';

export interface TwingRuntimeError extends TwingBaseError<typeof runtimeErrorName> {

}

export const createRuntimeError = (message: string, location: TwingErrorLocation, source: TwingSource, previous?: Error): TwingRuntimeError => {
    const error = createBaseError(runtimeErrorName, message, location, source, previous);
    
    Error.captureStackTrace(error, createRuntimeError);
    
    return error;
};
