import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import {TwingSource} from "../source";

export interface TwingSandboxSecurityNotAllowedMethodError extends BaseSandboxSecurityError {
}

export const createSandboxSecurityNotAllowedMethodError = (message: string, line?: number, source?: TwingSource): TwingSandboxSecurityNotAllowedMethodError => {
    const error = createBaseSandboxSecurityError(message, line, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedMethodError);

    return error;
};
