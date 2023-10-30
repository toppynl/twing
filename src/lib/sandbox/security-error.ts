import {TwingError} from "../error";
import {TwingSource} from "../source";

/**
 * Exception thrown when a security error occurs at runtime.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingSandboxSecurityError extends TwingError {
    constructor(message: string, line: number = -1, source: TwingSource = null) {
        super(message, line, source);
        
        this.name = 'TwingSandboxSecurityError';
    }
}
