import {TwingError} from "../error";
import {TwingSource} from "../source";

export const createRuntimeError = (
    message: string,
    line: number = -1,
    source: TwingSource = null,
    previous?: Error
): TwingErrorRuntime => {
    return new TwingErrorRuntime(message, line, source, previous);
};

export class TwingErrorRuntime extends TwingError {
    constructor(message: string, lineno: number = -1, source: TwingSource = null, previous?: Error) {
        super(message, lineno, source, previous);

        this.name = 'TwingErrorRuntime';
    }
}
