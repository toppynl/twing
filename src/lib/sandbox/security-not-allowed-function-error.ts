import {BaseSandboxSecurityError} from "./security-error";
import type {TwingSource} from "../source";

export interface TwingSandboxSecurityNotAllowedFunctionError extends BaseSandboxSecurityError {
    readonly functionName: string;
}

export class TwingSandboxSecurityNotAllowedFunctionError extends BaseSandboxSecurityError {
    constructor(message: string, public readonly functionName: string, line?: number, source?: TwingSource) {
        super(message, line, source);
    }
}
