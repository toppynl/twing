import {
    BaseSandboxSecurityError,
    createBaseSandboxSecurityError,
    TwingSandboxSecurityError
} from "./security-error";
import {ErrorLocation} from "../error/base";

/**
 * Exception thrown when a not allowed filter is used in a template.
 */
export interface TwingSandboxSecurityNotAllowedFilterError extends BaseSandboxSecurityError {
    readonly filterName: string;
}

export const createSandboxSecurityNotAllowedFilterError = (message: string, filterName: string, location?: ErrorLocation, source?: string): TwingSandboxSecurityNotAllowedFilterError => {
    const error = createBaseSandboxSecurityError(message, location, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedFilterError);

    return Object.assign(error, {
        get filterName() {
            return filterName;
        }
    });
};

export const isASandboxSecurityNotAllowedFilterError = (candidate: TwingSandboxSecurityError): candidate is TwingSandboxSecurityNotAllowedFilterError => {
    return (candidate as TwingSandboxSecurityNotAllowedFilterError).filterName !== undefined;
};
