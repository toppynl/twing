import {TwingSandboxSecurityError} from "./security-error";
import {TwingSource} from "../source";

/**
 * Exception thrown when a not allowed class property is used in a template.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingSandboxSecurityNotAllowedPropertyError extends TwingSandboxSecurityError {
    constructor(message: string, line: number = -1, source: TwingSource = null) {
        super(message, line, source);
    }
}
