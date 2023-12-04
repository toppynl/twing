import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import {ErrorLocation} from "../error/base";

export interface TwingSandboxSecurityNotAllowedFunctionError extends BaseSandboxSecurityError {
    readonly functionName: string;
}

export const createSandboxSecurityNotAllowedFunctionError = (message: string, functionName: string, location?: ErrorLocation, source?: string): TwingSandboxSecurityNotAllowedFunctionError => {
    const error = createBaseSandboxSecurityError(message, location, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedFunctionError);

    return Object.assign(error, {
        get functionName() {
            return functionName;
        }
    });
};
