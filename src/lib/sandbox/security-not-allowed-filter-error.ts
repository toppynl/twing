import {BaseSandboxSecurityError} from "./security-error";
import type {Source} from "../source";

/**
 * Exception thrown when a not allowed filter is used in a template.
 */
export interface TwingSandboxSecurityNotAllowedFilterError extends BaseSandboxSecurityError {
    readonly filterName: string;
}

export class TwingSandboxSecurityNotAllowedFilterError extends BaseSandboxSecurityError {
    constructor(message: string, public readonly filterName: string, line?: number, source?: Source) {
        super(message, line, source);
    }
}
