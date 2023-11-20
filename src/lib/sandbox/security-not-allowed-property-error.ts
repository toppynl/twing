import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import {TwingSource} from "../source";

/**
 * Exception thrown when a not allowed object property is used in a template.
 */
export interface TwingSandboxSecurityNotAllowedPropertyError extends BaseSandboxSecurityError {
}

export const createSandboxSecurityNotAllowedPropertyError = (message: string, line?: number, source?: TwingSource): TwingSandboxSecurityNotAllowedPropertyError => {
    const error = createBaseSandboxSecurityError(message, line, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedPropertyError);

    return error;
};
