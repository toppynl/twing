import {BaseSandboxSecurityError} from "./security-error";

/**
 * Exception thrown when a not allowed object property is used in a template.
 */
export interface TwingSandboxSecurityNotAllowedPropertyError extends BaseSandboxSecurityError {
}

export class TwingSandboxSecurityNotAllowedPropertyError extends BaseSandboxSecurityError {
}
