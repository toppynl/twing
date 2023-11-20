import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import type {TwingSource} from "../source";

/**
 * Exception thrown when a not allowed filter is used in a template.
 */
export interface TwingSandboxSecurityNotAllowedFilterError extends BaseSandboxSecurityError {
    readonly filterName: string;
}

export const createSandboxSecurityNotAllowedFilterError = (message: string, filterName: string, line?: number, source?: TwingSource): TwingSandboxSecurityNotAllowedFilterError => {
    const error = createBaseSandboxSecurityError(message, line, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedFilterError);

    return Object.assign(error, {
        get filterName() {
            return filterName;
        }
    });
};
