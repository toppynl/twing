import type {Source} from "../source";
import {TwingBaseError} from "./base";

export const runtimeErrorName = 'TwingRuntimeError';

export interface TwingRuntimeError extends TwingBaseError<typeof runtimeErrorName> {

}

export const isARuntimeError = (candidate: Error): candidate is TwingRuntimeError => {
    return (candidate as TwingRuntimeError).name === runtimeErrorName;
};

export class TwingRuntimeError extends TwingBaseError<typeof runtimeErrorName> {
    constructor(message: string, line?: number, source?: Source, previous?: Error) {
        super(runtimeErrorName, message, line, source, previous);
    }
}
