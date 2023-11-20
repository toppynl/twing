import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import type {TwingSource} from "../source";

export interface TwingSandboxSecurityNotAllowedFunctionError extends BaseSandboxSecurityError {
    readonly functionName: string;
}

export const createSandboxSecurityNotAllowedFunctionError = (message: string, functionName: string, line?: number, source?: TwingSource): TwingSandboxSecurityNotAllowedFunctionError => {
    const error = createBaseSandboxSecurityError(message, line, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedFunctionError);

    return Object.assign(error, {
        get functionName() {
            return functionName;
        }
    });
};
