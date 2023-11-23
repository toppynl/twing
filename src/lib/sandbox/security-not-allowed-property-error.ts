import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import {ErrorLocation} from "../error/base";

/**
 * Exception thrown when a not allowed object property is used in a template.
 */
export interface TwingSandboxSecurityNotAllowedPropertyError extends BaseSandboxSecurityError {
}

export const createSandboxSecurityNotAllowedPropertyError = (message: string, location?: ErrorLocation, source?: string): TwingSandboxSecurityNotAllowedPropertyError => {
    const error = createBaseSandboxSecurityError(message, location, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedPropertyError);

    return error;
};
