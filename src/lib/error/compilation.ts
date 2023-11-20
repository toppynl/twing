import type {TwingSource} from "../source";
import {createBaseError, TwingBaseError} from "./base";

export const compilationErrorName = 'TwingCompilationError';

export const isACompilationError = (candidate: Error): candidate is TwingCompilationError => {
    return (candidate as SyntaxError).name === compilationErrorName;
};

export interface TwingCompilationError extends TwingBaseError<typeof compilationErrorName> {

}

export const createCompilationError = (message: string, line?: number, source?: TwingSource, previous?: Error): TwingCompilationError => {
    const error = createBaseError(compilationErrorName, message, line, undefined, source, previous);
    
    Error.captureStackTrace(error, createCompilationError);
    
    return error;
};
