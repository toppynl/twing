import {TwingTemplate} from "../../../template";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Loads a template from a string.
 *
 * <pre>
 * {{ include(template_from_string("Hello {{ name }}")) }}
 * </pre>
 *
 * @param executionContext A TwingTemplate instance
 * @param string A template as a string or object implementing toString()
 * @param name An optional name for the template to be used in error messages
 *
 * @returns {Promise<TwingTemplate>}
 */
export const templateFromString: TwingCallable = (executionContext, string: string, name: string | null): Promise<TwingTemplate> => {
    const {template} = executionContext;
    
    return template.createTemplateFromString(string, name);
}
