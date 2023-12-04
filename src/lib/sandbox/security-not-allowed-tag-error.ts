import {BaseSandboxSecurityError, createBaseSandboxSecurityError, TwingSandboxSecurityError} from "./security-error";
import {TwingSandboxSecurityNotAllowedPropertyError} from "./security-not-allowed-property-error";
import {TwingErrorLocation} from "../error/base";

export interface TwingSandboxSecurityNotAllowedTagError extends BaseSandboxSecurityError {
    readonly tagName: string;
}

export const createSandboxSecurityNotAllowedTagError = (message: string, tagName: string, location?: TwingErrorLocation, source?: string): TwingSandboxSecurityNotAllowedPropertyError => {
    const error = createBaseSandboxSecurityError(message, location, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedTagError);

    return Object.assign(error, {
        get tagName() {
            return tagName;
        }
    });
};

export const isASandboxSecurityNotAllowedTagError = (candidate: TwingSandboxSecurityError): candidate is TwingSandboxSecurityNotAllowedTagError => {
    return (candidate as TwingSandboxSecurityNotAllowedTagError).tagName !== undefined;
};
