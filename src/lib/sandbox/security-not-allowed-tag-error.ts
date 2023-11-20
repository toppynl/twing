import {BaseSandboxSecurityError, createBaseSandboxSecurityError} from "./security-error";
import type {TwingSource} from "../source";
import {TwingSandboxSecurityNotAllowedPropertyError} from "./security-not-allowed-property-error";

export interface TwingSandboxSecurityNotAllowedTagError extends BaseSandboxSecurityError {
    readonly tagName: string;
}

export const createSandboxSecurityNotAllowedTagError = (message: string, tagName: string, line?: number, source?: TwingSource): TwingSandboxSecurityNotAllowedPropertyError => {
    const error = createBaseSandboxSecurityError(message, line, source);

    Error.captureStackTrace(error, createSandboxSecurityNotAllowedTagError);

    return Object.assign(error, {
        get tagName() {
            return tagName;
        }
    });
};

