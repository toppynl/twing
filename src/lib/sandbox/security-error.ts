import type {TwingSandboxSecurityNotAllowedFilterError} from "./security-not-allowed-filter-error";
import type {TwingSandboxSecurityNotAllowedFunctionError} from "./security-not-allowed-function-error";
import type {TwingSandboxSecurityNotAllowedMethodError} from "./security-not-allowed-method-error";
import type {TwingSandboxSecurityNotAllowedPropertyError} from "./security-not-allowed-property-error";
import type {TwingSandboxSecurityNotAllowedTagError} from "./security-not-allowed-tag-error";
import {createBaseError, TwingErrorLocation, TwingBaseError} from "../error/base";

export type TwingSandboxSecurityError =
    | TwingSandboxSecurityNotAllowedFilterError
    | TwingSandboxSecurityNotAllowedFunctionError
    | TwingSandboxSecurityNotAllowedMethodError
    | TwingSandboxSecurityNotAllowedPropertyError
    | TwingSandboxSecurityNotAllowedTagError
    ;

export const sandboxSecurityErrorName = 'TwingSandboxSecurityError';

/**
 * Exception thrown when a security error occurs at runtime.
 */
export interface BaseSandboxSecurityError extends TwingBaseError<typeof sandboxSecurityErrorName> {
}

export const createBaseSandboxSecurityError = (message: string, location?: TwingErrorLocation, source?: string) => {
    const error = createBaseError(sandboxSecurityErrorName, message, location, source);
    
    Error.captureStackTrace(error, createBaseSandboxSecurityError);
    
    return error;
};
