import {TwingSandboxSecurityError} from "./security-error";
import {TwingSource} from "../source";

export class TwingSandboxSecurityNotAllowedTagError extends TwingSandboxSecurityError {
    private readonly tagName: string;

    constructor(message: string, tagName: string, line: number = -1, source: TwingSource = null) {
        super(message, line, source);
        
        this.tagName = tagName;
    }

    getTagName() {
        return this.tagName;
    }
}
