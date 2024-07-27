import {createSynchronousTemplate, createTemplate, TwingSynchronousTemplate, TwingTemplate} from "../../../template";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";
import * as createHash from "create-hash";
import {createSource} from "../../../source";
import {TwingExecutionContext, TwingSynchronousExecutionContext} from "../../../execution-context";

const getAST = (executionContext: TwingExecutionContext | TwingSynchronousExecutionContext, code: string, name: string | null) => {
    const {environment} = executionContext;

    const hash: string = createHash("sha256").update(code).digest("hex").toString();

    if (name !== null) {
        name = `${name} (string template ${hash})`;
    }
    else {
        name = `__string_template__${hash}`;
    }

    return environment.parse(environment.tokenize(createSource(name, code)));
};

/**
 * Loads a template from a string.
 *
 * <pre>
 * {{ include(template_from_string("Hello {{ name }}")) }}
 * </pre>
 *
 * @param executionContext
 * @param code
 * @param name An optional name for the template to be used in error messages
 */
export const templateFromString: TwingCallable = (executionContext, code: string, name: string | null): Promise<TwingTemplate> => {
    const ast = getAST(executionContext, code, name);
    
    return Promise.resolve(createTemplate(ast));
}

export const templateFromStringSynchronously: TwingSynchronousCallable = (executionContext, code: string, name: string | null): TwingSynchronousTemplate => {
    const ast = getAST(executionContext, code, name);
    
    return createSynchronousTemplate(ast);
}
