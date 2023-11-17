import {BaseSandboxSecurityError} from "./security-error";
import type {TwingSource} from "../source";

export interface TwingSandboxSecurityNotAllowedTagError extends BaseSandboxSecurityError {
    readonly tagName: string;
}

export class TwingSandboxSecurityNotAllowedTagError extends BaseSandboxSecurityError {
    constructor(message: string, public readonly tagName: string, line?: number, source?: TwingSource) {
        super(message, line, source);
    }
}
