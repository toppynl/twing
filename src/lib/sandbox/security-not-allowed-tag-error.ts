import {BaseSandboxSecurityError} from "./security-error";
import type {Source} from "../source";

export interface TwingSandboxSecurityNotAllowedTagError extends BaseSandboxSecurityError {
    readonly tagName: string;
}

export class TwingSandboxSecurityNotAllowedTagError extends BaseSandboxSecurityError {
    constructor(message: string, public readonly tagName: string, line?: number, source?: Source) {
        super(message, line, source);
    }
}
