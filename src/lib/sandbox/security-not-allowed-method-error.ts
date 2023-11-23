import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import {ErrorLocation} from "../error/base";

export interface TwingSandboxSecurityNotAllowedMethodError extends BaseSandboxSecurityError {
}

export const createSandboxSecurityNotAllowedMethodError = (message: string, location?: ErrorLocation, source?: string): TwingSandboxSecurityNotAllowedMethodError => {
    const error = createBaseSandboxSecurityError(message, location, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedMethodError);

    return error;
};
