import type {TwingSource} from "../source";
import {TwingBaseError} from "./base";

export const compilationErrorName = 'TwingCompilationError';

export const isACompilationError = (candidate: Error): candidate is TwingCompilationError => {
    return (candidate as SyntaxError).name === compilationErrorName;
};

export interface TwingCompilationError extends TwingBaseError<typeof compilationErrorName> {

}

export class TwingCompilationError extends TwingBaseError<typeof compilationErrorName> {
    constructor(message: string, line?: number, source?: TwingSource, previous?: Error) {
        super(compilationErrorName, message, line, undefined, source, previous);
    }
}
