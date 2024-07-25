import {createTemplate, TwingTemplate} from "../../../template";
import {TwingCallable} from "../../../callable-wrapper";
import * as createHash from "create-hash";
import {createSource} from "../../../source";

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
 *
 * @returns {Promise<TwingTemplate>}
 */
export const templateFromString: TwingCallable = (executionContext, code: string, name: string | null): Promise<TwingTemplate> => {
    const {environment} = executionContext;

    const hash: string = createHash("sha256").update(code).digest("hex").toString();

    if (name !== null) {
        name = `${name} (string template ${hash})`;
    }
    else {
        name = `__string_template__${hash}`;
    }

    const ast = environment.parse(environment.tokenize(createSource(name, code)));
    const template = createTemplate(ast);

    return Promise.resolve(template);
}
