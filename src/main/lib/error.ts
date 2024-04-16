import {TwingParsingError, parsingErrorName} from "./error/parsing";
import {TwingRuntimeError, runtimeErrorName} from "./error/runtime";

export type TwingError =
    | TwingRuntimeError
    | TwingParsingError
    ;

export const isATwingError = (candidate: Error): candidate is TwingError => {
    return [
        parsingErrorName,
        runtimeErrorName
    ].includes((candidate as TwingError).name);
};

