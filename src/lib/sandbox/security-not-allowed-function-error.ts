import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import {TwingErrorLocation} from "../error/base";

export interface TwingSandboxSecurityNotAllowedFunctionError extends BaseSandboxSecurityError {
    readonly functionName: string;
}

export const createSandboxSecurityNotAllowedFunctionError = (message: string, functionName: string, location?: TwingErrorLocation, source?: string): TwingSandboxSecurityNotAllowedFunctionError => {
    const error = createBaseSandboxSecurityError(message, location, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedFunctionError);

    return Object.assign(error, {
        get functionName() {
            return functionName;
        }
    });
};
