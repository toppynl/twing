import {TwingParsingError, parsingErrorName} from "./error/parsing";
import {TwingRuntimeError, runtimeErrorName} from "./error/runtime";
import {TwingTemplateLoadingError, templateLoadingError} from "./error/loader";
import {TwingSandboxSecurityError, sandboxSecurityErrorName} from "./sandbox/security-error";

export type TwingError =
    | TwingTemplateLoadingError
    | TwingRuntimeError
    | TwingParsingError
    | TwingSandboxSecurityError
    ;

export const isATwingError = (candidate: Error): candidate is TwingError => {
    return [
        templateLoadingError,
        parsingErrorName,
        runtimeErrorName,
        sandboxSecurityErrorName
    ].includes((candidate as TwingError).name);
};

