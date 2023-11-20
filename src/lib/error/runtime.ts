import type {TwingSource} from "../source";
import {createBaseError, TwingBaseError} from "./base";

export const runtimeErrorName = 'TwingRuntimeError';

export interface TwingRuntimeError extends TwingBaseError<typeof runtimeErrorName> {

}

export const isARuntimeError = (candidate: Error): candidate is TwingRuntimeError => {
    return (candidate as TwingRuntimeError).name === runtimeErrorName;
};

export const createRuntimeError = (message: string, line?: number, source?: TwingSource, previous?: Error): TwingRuntimeError => {
    const error = createBaseError(runtimeErrorName, message, line, undefined, source, previous);
    
    Error.captureStackTrace(error, createRuntimeError);
    
    return error;
};
