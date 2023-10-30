import {TwingSandboxSecurityError} from "./security-error";
import {TwingSource} from "../source";

export class TwingSandboxSecurityNotAllowedFunctionError extends TwingSandboxSecurityError {
    private readonly functionName: string;

    constructor(message: string, functionName: string, line: number = -1, source: TwingSource = null) {
        super(message, line, source);
        
        this.functionName = functionName;
    }

    getFunctionName() {
        return this.functionName;
    }
}
