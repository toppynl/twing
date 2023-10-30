import {TwingSandboxSecurityError} from "./security-error";
import {TwingSource} from "../source";

export class TwingSandboxSecurityNotAllowedMethodError extends TwingSandboxSecurityError {
    constructor(message: string, line: number = -1, source: TwingSource = null) {
        super(message, line, source);
    }
}
